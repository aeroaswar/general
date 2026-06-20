import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

// Content workflow — mirrors the real app's ContentStatus state machine.
export const STATUSES = [
  "Idea", "Briefing", "Draft", "Internal Review", "Client Review",
  "Revision Requested", "Approved", "Scheduled", "Posted", "Archived",
];

// Columns shown on the content board (Archived hidden by default).
export const BOARD_COLUMNS = STATUSES.filter((s) => s !== "Archived");

export const STATUS_META = {
  Idea: { c: "#9aa7bd", label: "Idea" },
  Briefing: { c: "#8ab4d8", label: "Briefing" },
  Draft: { c: "#37b9ff", label: "Draft" },
  "Internal Review": { c: "#6d8cff", label: "Internal Review" },
  "Client Review": { c: "#f5b14a", label: "Client Review" },
  "Revision Requested": { c: "#f2708b", label: "Revision Requested" },
  Approved: { c: "#34e0c4", label: "Approved" },
  Scheduled: { c: "#8a76ff", label: "Scheduled" },
  Posted: { c: "#2bd49a", label: "Posted" },
  Archived: { c: "#7c879b", label: "Archived" },
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
  Instagram: "#e1306c", TikTok: "#25f4ee", LinkedIn: "#0a66c2",
  YouTube: "#ff0033", X: "#9aa7bd", Newsletter: "#34e0c4", Web: "#8a76ff",
};

export const ROLE_META = {
  admin: { label: "Admin", c: "#34e0c4", desc: "Full studio access" },
  team: { label: "Team Member", c: "#37b9ff", desc: "Assigned projects" },
  client: { label: "Client", c: "#8a76ff", desc: "Review & approve" },
};

export const PROJECT_STATUS_C = {
  Planning: "#f5b14a", Active: "#34e0c4", Paused: "#9aa7bd", Closed: "#7c879b",
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
