import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

// Content workflow — mirrors the real app's ContentStatus state machine.
export const STATUSES = [
  "Idea", "Briefing", "Draft", "Internal Review", "Client Review",
  "Revision Requested", "Approved", "Scheduled", "Posted", "Archived",
];

// Columns shown on the content board (Archived hidden by default).
export const BOARD_COLUMNS = STATUSES.filter((s) => s !== "Archived");

// Palette tuned for legibility on the warm paper canvas.
export const STATUS_META = {
  Idea: { c: "#6b7280", label: "Idea" },
  Briefing: { c: "#5a7a9a", label: "Briefing" },
  Draft: { c: "#2562e7", label: "Draft" },
  "Internal Review": { c: "#5b54d6", label: "Internal Review" },
  "Client Review": { c: "#c97a0a", label: "Client Review" },
  "Revision Requested": { c: "#d6336c", label: "Revision Requested" },
  Approved: { c: "#0e9f8e", label: "Approved" },
  Scheduled: { c: "#6d4fe0", label: "Scheduled" },
  Posted: { c: "#0f9d58", label: "Posted" },
  Archived: { c: "#8a8f98", label: "Archived" },
};

// Allowed forward transitions (from the architecture spec).
export const NEXT_STATUS = {
  Idea: ["Briefing", "Draft"],
  Briefing: ["Draft"],
  Draft: ["Internal Review"],
  "Internal Review": ["Client Review", "Draft"],
  "Client Review": ["Approved", "Revision Requested"],
  "Revision Requested": ["Draft"],
  Approved: ["Scheduled"],
  Scheduled: ["Posted"],
  Posted: ["Archived"],
  Archived: [],
};

export const PLATFORM_META = {
  Instagram: "#d6336c", TikTok: "#0aa396", LinkedIn: "#0a66c2",
  YouTube: "#e03131", X: "#181718", Newsletter: "#0e9f8e", Web: "#2562e7",
};

export const ROLE_META = {
  admin: { label: "Admin", c: "#2562e7", desc: "Full studio access" },
  team: { label: "Team Member", c: "#0e9f8e", desc: "Assigned projects" },
  client: { label: "Client", c: "#d6336c", desc: "Review & approve" },
};

export const PROJECT_STATUS_C = {
  Planning: "#c97a0a", Active: "#0e9f8e", Paused: "#8a8f98", Closed: "#6b7280",
};

export function fmtDate(iso, f = "MMM d") {
  if (!iso) return "—";
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return isValid(d) ? format(d, f) : "—";
}
export function fromNow(iso) {
  if (!iso) return "";
  const d = typeof iso === "string" ? parseISO(iso) : iso;
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "";
}
export const initials = (name = "") =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
