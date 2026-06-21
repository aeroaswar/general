import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

// Content workflow — mirrors the real app's ContentStatus state machine.
export const STATUSES = [
  "Idea", "Briefing", "Draft", "Internal Review", "Client Review",
  "Revision Requested", "Approved", "Scheduled", "Posted", "Archived",
];

// Columns shown on the content board (Archived hidden by default).
export const BOARD_COLUMNS = STATUSES.filter((s) => s !== "Archived");

// The board's columns = the flow's content-bearing stages. Each stage groups
// the granular statuses, so the board reads like the FLOW bar (Brief → Content
// → Approval → Schedule → Live) while cards keep their exact sub-status.
export const STAGES = [
  { key: "Brief", label: "Brief", statuses: ["Idea", "Briefing"], c: "#8ab4d8" },
  { key: "Content", label: "Content", statuses: ["Draft", "Internal Review"], c: "#2562e7" },
  { key: "Approval", label: "Approval", statuses: ["Client Review", "Revision Requested"], c: "#c97a0a" },
  { key: "Schedule", label: "Schedule", statuses: ["Approved", "Scheduled"], c: "#6d4fe0" },
  { key: "Live", label: "Live", statuses: ["Posted"], c: "#0f9d58" },
];

// Statuses a Client is allowed to see (no internal setup / drafts / reviews).
export const CLIENT_VISIBLE = ["Client Review", "Approved", "Scheduled", "Posted"];

// Readiness gates for forward transitions (from the architecture spec's
// "required before moving forward" rules). Returns { ok, missing[] }.
export function checkMove(item, to, ctx = {}) {
  const miss = [];
  const need = (cond, label) => { if (!cond) miss.push(label); };
  if (to === "Internal Review") {
    need(item.hook, "hook"); need(item.brief, "brief"); need(item.cta, "CTA");
    need(item.ownerId, "owner"); need(item.deadline, "deadline");
  }
  if (to === "Client Review") {
    need(item.brief, "brief"); need(item.cta, "CTA"); need(item.ownerId, "owner");
  }
  if (to === "Scheduled") {
    need(item.publishDate, "publish date"); need(item.platform, "platform");
    need(item.ownerId, "owner"); need(ctx.hasAssets, "an asset");
  }
  return { ok: miss.length === 0, missing: miss };
}

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
