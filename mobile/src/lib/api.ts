// CampusConnect API client for the mobile app.
// Talks to the same FastAPI backend as the web app (backend/app/api/v1).
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; webUrl?: string };

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || extra.apiUrl || "http://localhost:8000/api/v1").replace(/\/$/, "");
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || extra.webUrl || "").replace(/\/$/, "");

// ── Token storage (Keychain / Keystore; localStorage on web) ──────────────
const ACCESS = "cc_access_token";
const REFRESH = "cc_refresh_token";

const store = {
  get: async (k: string) =>
    Platform.OS === "web" ? globalThis.localStorage?.getItem(k) ?? null : SecureStore.getItemAsync(k),
  set: async (k: string, v: string) =>
    Platform.OS === "web" ? globalThis.localStorage?.setItem(k, v) : SecureStore.setItemAsync(k, v),
  del: async (k: string) =>
    Platform.OS === "web" ? globalThis.localStorage?.removeItem(k) : SecureStore.deleteItemAsync(k),
};

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onSessionExpired: (() => void) | null = null;

export const tokens = {
  async load() {
    accessToken = await store.get(ACCESS);
    refreshToken = await store.get(REFRESH);
    return { accessToken, refreshToken };
  },
  async save(access: string, refresh: string) {
    accessToken = access;
    refreshToken = refresh;
    await Promise.all([store.set(ACCESS, access), store.set(REFRESH, refresh)]);
  },
  async clear() {
    accessToken = null;
    refreshToken = null;
    await Promise.all([store.del(ACCESS), store.del(REFRESH)]);
  },
  get refresh() {
    return refreshToken;
  },
  get hasSession() {
    return !!accessToken;
  },
};

export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  // FastAPI validation errors: [{ loc, msg }]
  if (Array.isArray(detail) && detail[0]?.msg) {
    const d = detail[0] as { loc?: (string | number)[]; msg: string };
    const field = d.loc?.[d.loc.length - 1];
    return field ? `${String(field).replace(/_/g, " ")}: ${d.msg}` : d.msg;
  }
  return fallback;
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  // Share one in-flight refresh between parallel requests.
  refreshing ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as AuthResponse;
      await tokens.save(data.access_token, data.refresh_token);
      return true;
    } catch {
      return false;
    } finally {
      setTimeout(() => (refreshing = null), 0);
    }
  })();
  return refreshing;
}

const TIMEOUT_MS = 60_000; // Render free tier can take ~50s to wake up.

async function request<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(init.headers as Record<string, string>),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers, signal: controller.signal });
  } catch (e) {
    const aborted = (e as Error)?.name === "AbortError";
    throw new ApiError(
      aborted ? "The server is taking too long to respond. Try again in a moment." : "Can't reach CampusConnect. Check your connection.",
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 401 && accessToken && !retried) {
    if (await tryRefresh()) return request<T>(path, init, true);
    await tokens.clear();
    onSessionExpired?.();
    throw new ApiError("Your session expired. Please sign in again.", 401);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(errorMessage(body, `Something went wrong (${res.status}).`), res.status);
  }
  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

const qs = (params?: Record<string, string | undefined>) => {
  const entries = Object.entries(params ?? {}).filter(([, v]) => v) as [string, string][];
  return entries.length ? "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&") : "";
};

const post = (body: unknown): RequestInit => ({ method: "POST", body: JSON.stringify(body) });

// ── Endpoints ─────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) => request<AuthResponse>("/auth/login", post({ email, password })),
  register: (data: RegisterPayload) => request<AuthResponse>("/auth/register", post(data)),
  logout: (refresh_token: string) => request<null>("/auth/logout", post({ refresh_token })),
  me: () => request<UserProfile>("/auth/me"),
};

export const eventsApi = {
  list: (params?: { category?: string; status?: string }) => request<Event[]>(`/events/${qs(params)}`),
  get: (slug: string) => request<Event>(`/events/${encodeURIComponent(slug)}`),
  register: (slug: string, data: RegisterEventPayload) =>
    request<{ message: string; event: string }>(`/events/${encodeURIComponent(slug)}/register`, post(data)),
};

export const clubsApi = {
  list: (params?: { category?: string; faculty?: string }) => request<Club[]>(`/clubs/${qs(params)}`),
  get: (slug: string) => request<Club>(`/clubs/${encodeURIComponent(slug)}`),
  members: (slug: string) => request<ClubMember[]>(`/clubs/${encodeURIComponent(slug)}/members`),
  events: (slug: string) => request<ClubEvent[]>(`/clubs/${encodeURIComponent(slug)}/events`),
};

export const paymentsApi = {
  createClubOrder: (club_slug: string) => request<ClubMembershipOrder>("/payments/club-membership/order", post({ club_slug })),
  verify: (data: RazorpayResult & { year?: string; branch?: string }) =>
    request<PaymentVerification>("/payments/verify", post(data)),
};

export const clubAdminRequestsApi = {
  positions: () => request<string[]>("/club-admin-requests/positions"),
  mine: () => request<ClubAdminRequest[]>("/club-admin-requests/mine"),
  create: (data: { club_slug: string; position: string; message?: string }) =>
    request<ClubAdminRequest>("/club-admin-requests", post(data)),
};

export const clubAdminApi = {
  myClub: () => request<ClubAdminProfile>("/club-admin/my-club"),
  stats: () => request<ClubStats>("/club-admin/stats"),
  events: () => request<ClubAdminEvent[]>("/club-admin/events"),
  members: () => request<ClubAdminMember[]>("/club-admin/members"),
};

// ── Types (match backend/app/schemas) ─────────────────────────────────────
export type Role = "student" | "club_admin" | "university_admin";

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: Role;
  user_id: string;
  full_name: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  registration_number?: string;
  branch?: string;
  year_of_study?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  is_verified: boolean;
  full_name: string;
  registration_number: string | null;
  branch: string | null;
  year_of_study: string | null;
  avatar_url: string | null;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  banner_url: string | null;
  display_date: string | null;
  event_date: string | null;
  end_date: string | null;
  time: string | null;
  venue: string | null;
  category: string;
  organizer_name: string | null;
  organizer_club: string | null;
  max_capacity: number;
  is_paid: boolean;
  ticket_price: number | null;
  color: string | null;
  status: "upcoming" | "completed" | "cancelled";
  approval_status: string;
  certificate_uploaded: boolean;
  created_at: string;
  registration_count: number | null;
  is_registered: boolean | null;
}

export interface RegisterEventPayload {
  full_name: string;
  email: string;
  phone?: string;
  year_of_study?: string;
  branch?: string;
}

export interface Club {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  faculty: string;
  department: string;
  category: string;
  description: string | null;
  long_description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  members_count: number;
  fee: number;
  faculty_advisor: string | null;
  faculty_email: string | null;
  founded_year: number | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  is_active: boolean;
}

export interface ClubMember {
  id: string;
  user_id: string;
  club_id: string;
  role: string;
  department: string | null;
  year: string | null;
  joined_at: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  display_date: string | null;
  venue: string | null;
  category: string;
  status: string;
  max_capacity: number;
}

export interface ClubMembershipOrder {
  order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
  club_slug: string;
  club_name: string;
  prefill_name: string;
  prefill_email: string;
}

export interface RazorpayResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentVerification {
  status: "paid";
  club_slug: string;
  club_name: string;
  payment_id: string;
}

export interface ClubAdminRequest {
  id: string;
  club_slug: string;
  club_name: string;
  position: string;
  message: string | null;
  status: "pending" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface ClubAdminProfile {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  description: string | null;
  faculty: string;
  department: string;
  category: string;
  members_count: number;
  fee: number;
  faculty_advisor: string | null;
  founded_year: number | null;
  logo_url: string | null;
  admin_name: string;
  admin_email: string;
  admin_reg_no: string | null;
}

export interface ClubStats {
  total_events: number;
  completed_events: number;
  approved_events: number;
  pending_approval: number;
  total_registrations: number;
  member_registrations: number;
  event_registrations: number;
  club_members: number;
  certificates_issued: number;
  certificates_pending: number;
}

export interface ClubAdminEvent {
  id: string;
  slug: string;
  title: string;
  display_date: string | null;
  event_date: string | null;
  venue: string | null;
  category: string;
  status: string;
  approval_status: string;
  max_capacity: number;
  registration_count: number;
  certificate_uploaded: boolean;
}

export interface ClubAdminMember {
  id: string;
  user_id: string;
  role: string;
  department: string | null;
  year: string | null;
  joined_at: string;
  full_name: string;
  email: string;
  registration_number: string | null;
}
