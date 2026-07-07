// ============================================================
// CampusConnect API Client
// All requests go through this file — no Supabase anywhere
// ============================================================

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// ── Token management ─────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem("cc_access_token");
export const getRefreshToken = () => localStorage.getItem("cc_refresh_token");

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem("cc_access_token", access);
  localStorage.setItem("cc_refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("cc_access_token");
  localStorage.removeItem("cc_refresh_token");
  localStorage.removeItem("cc_user");
};

export const setUser = (user: object) => {
  localStorage.setItem("cc_user", JSON.stringify(user));
};

export const getUser = () => {
  const u = localStorage.getItem("cc_user");
  return u ? JSON.parse(u) : null;
};

// ── Core fetch wrapper ────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      });
      if (!retry.ok) throw new Error("Session expired. Please log in again.");
      return retry.json();
    } else {
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired.");
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Something went wrong.");
  }

  if (res.status === 204) return null as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ── Auth API ──────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
    registration_number?: string;
    branch?: string;
    year_of_study?: string;
  }) => request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: (refresh_token: string) =>
    request<null>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }, true),

  me: () => request<UserProfile>("/auth/me", {}, true),
};

// ── Events API ────────────────────────────────────────────────
export const eventsApi = {
  getAll: (params?: { category?: string; status?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).join("&")
      : "";
    return request<Event[]>(`/events/${qs}`, {}, true);
  },

  getBySlug: (slug: string) =>
    request<Event>(`/events/${slug}`, {}, true),

  create: (data: CreateEventPayload) =>
    request<Event>("/events/", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  register: (slug: string, data: RegisterEventPayload) =>
    request<{ message: string }>(`/events/${slug}/register`, {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  getRegistrations: (slug: string) =>
    request<Registration[]>(`/events/${slug}/registrations`, {}, true),

  getProposals: () =>
    request<Proposal[]>("/events/admin/proposals", {}, true),

  reviewProposal: (proposalId: string, data: { status: string; admin_notes?: string }) =>
    request<{ message: string }>(`/events/admin/proposals/${proposalId}/review`, {
      method: "POST",
      body: JSON.stringify(data),
    }, true),
};

// ── Clubs API ─────────────────────────────────────────────────
export const clubsApi = {
  getAll: (params?: { faculty?: string; department?: string; category?: string }) => {
    const qs = params
      ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v)).join("&")
      : "";
    return request<Club[]>(`/clubs/${qs}`);
  },

  getBySlug: (slug: string) =>
    request<Club>(`/clubs/${slug}`),

  getMembers: (slug: string) =>
    request<ClubMember[]>(`/clubs/${slug}/members`),

  getEvents: (slug: string) =>
    request<Event[]>(`/clubs/${slug}/events`),

  update: (slug: string, data: Partial<Club>) =>
    request<Club>(`/clubs/${slug}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }, true),
};

// ── Types ─────────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  role: string;
  user_id: string;
  full_name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
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
  time: string | null;
  venue: string | null;
  category: string;
  organizer_name: string | null;
  organizer_club: string | null;
  max_capacity: number;
  is_paid: boolean;
  ticket_price: number | null;
  color: string | null;
  status: string;
  approval_status: string;
  certificate_uploaded: boolean;
  created_at: string;
  registration_count: number;
  is_registered: boolean;
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

export interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  year_of_study: string | null;
  branch: string | null;
  registered_at: string;
}

export interface Proposal {
  proposal_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  venue: string;
  category: string;
  submitted_by: string;
  submitted_at: string;
  status: string;
}

export interface CreateEventPayload {
  title: string;
  tagline?: string;
  description?: string;
  banner_url?: string;
  display_date?: string;
  event_date?: string;
  time?: string;
  venue?: string;
  category: string;
  organizer_name?: string;
  organizer_club?: string;
  max_capacity: number;
  is_paid: boolean;
  ticket_price?: number;
  color?: string;
  club_id?: string;
}

export interface RegisterEventPayload {
  full_name: string;
  email: string;
  phone?: string;
  year_of_study?: string;
  branch?: string;
}