import type { Event } from "./api";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const parse = (iso?: string | null) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "Sat, 14 Nov" — falls back to the event's free-text display_date. */
export function eventDateLabel(e: Pick<Event, "event_date" | "display_date">) {
  const d = parse(e.event_date);
  if (!d) return e.display_date || "Date TBA";
  const year = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : "";
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}${year}`;
}

/** Day + month parts for the calendar tile on event cards. */
export function dateTile(e: Pick<Event, "event_date" | "display_date">) {
  const d = parse(e.event_date);
  if (d) {
    const yy = d.getFullYear() !== new Date().getFullYear() ? ` '${String(d.getFullYear()).slice(2)}` : "";
    return { day: String(d.getDate()), month: MONTHS[d.getMonth()].toUpperCase() + yy };
  }
  const m = e.display_date?.match(/(\d{1,2})\D+([A-Za-z]{3})/);
  return m ? { day: m[1], month: m[2].toUpperCase() } : { day: "–", month: "TBA" };
}

export function shortDate(iso?: string | null) {
  const d = parse(iso);
  return d ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}` : "";
}

export function seatsLeft(e: Pick<Event, "max_capacity" | "registration_count">) {
  if (!e.max_capacity) return null;
  return Math.max(0, e.max_capacity - (e.registration_count ?? 0));
}

export function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/** Upcoming events first (soonest first), then everything else. */
export function sortEvents(list: Event[]) {
  const rank = (e: Event) => (e.status === "upcoming" ? 0 : e.status === "completed" ? 1 : 2);
  return [...list].sort((a, b) => {
    const r = rank(a) - rank(b);
    if (r) return r;
    const ta = parse(a.event_date)?.getTime() ?? Infinity;
    const tb = parse(b.event_date)?.getTime() ?? Infinity;
    return a.status === "upcoming" ? ta - tb : tb - ta;
  });
}
