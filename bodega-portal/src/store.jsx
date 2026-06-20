import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  USERS, CLIENTS, PROJECTS, AUDIENCE_SEGMENTS, PHASES, PILLARS, CAMPAIGNS,
  CONTENT_ITEMS, APPROVALS, ASSETS, COMMENTS, REPORT_SNAPSHOTS,
  INDUSTRY_TEMPLATES, ASSET_REQUESTS, REMINDER_LOGS,
} from "./seed.js";
import { CLIENT_VISIBLE } from "./lib/status.js";

const now = () => new Date().toISOString();
const uid = (p) => `${p}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/* ── Theme ─────────────────────────────────────────────── */
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("bodega-theme") || "light");
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("bodega-theme", theme);
  }, [theme]);
  const value = useMemo(() => ({ theme, set: setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);

/* ── Auth / session ────────────────────────────────────── */
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem("bodega-uid") || "u1");
  const [authed, setAuthed] = useState(() => localStorage.getItem("bodega-authed") === "1");
  useEffect(() => { localStorage.setItem("bodega-uid", currentUserId); }, [currentUserId]);
  useEffect(() => { localStorage.setItem("bodega-authed", authed ? "1" : "0"); }, [authed]);

  const role = USERS.find((u) => u.id === currentUserId)?.role ?? "admin";
  const loginAs = (r) => { const u = USERS.find((x) => x.role === r) || USERS[0]; setCurrentUserId(u.id); setAuthed(true); };
  const setRole = (r) => { const u = USERS.find((x) => x.role === r); if (u) setCurrentUserId(u.id); };
  const logout = () => setAuthed(false);

  return <AuthContext.Provider value={{ currentUserId, setCurrentUserId, role, setRole, authed, loginAs, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export const useCurrentUser = () => {
  const { currentUserId } = useAuth();
  return USERS.find((u) => u.id === currentUserId) || USERS[0];
};

/* ── Data (in-memory, mutable) ─────────────────────────── */
const DataContext = createContext(null);
export function DataProvider({ children }) {
  const user = useCurrentUser();
  const [projects, setProjects] = useState(PROJECTS);
  const [contentItems, setContentItems] = useState(CONTENT_ITEMS);
  const [approvals, setApprovals] = useState(APPROVALS);
  const [comments, setComments] = useState(COMMENTS);
  const [assets, setAssets] = useState(ASSETS);
  const [assetRequests, setAssetRequests] = useState(ASSET_REQUESTS);
  const [reminders, setReminders] = useState(REMINDER_LOGS);
  const [reportSnapshots, setReportSnapshots] = useState(REPORT_SNAPSHOTS);
  const [reportExports, setReportExports] = useState([]);
  const [audit, setAudit] = useState([]);
  const [selectedClientId, setSelectedClientIdState] = useState("c1");

  // admin → all clients; team/client → only assigned (clientIds)
  const permittedClients = useMemo(() => {
    if (user.clientIds) return CLIENTS.filter((c) => user.clientIds.includes(c.id));
    return CLIENTS;
  }, [user]);

  useEffect(() => {
    if (!permittedClients.some((c) => c.id === selectedClientId)) {
      setSelectedClientIdState(permittedClients[0]?.id || "");
    }
  }, [permittedClients, selectedClientId]);

  const setSelectedClientId = (id) => { if (permittedClients.some((c) => c.id === id)) setSelectedClientIdState(id); };

  const logAudit = (action, entityId, extra = {}) =>
    setAudit((arr) => [{ id: uid("au"), action, entityId, actorId: user.id, ts: now(), ...extra }, ...arr]);

  const updateContentStatus = (id, status, meta = {}) => {
    const prev = contentItems.find((c) => c.id === id);
    setContentItems((arr) => arr.map((c) => (c.id === id ? { ...c, status } : c)));
    if (prev && prev.status !== status) logAudit("status", id, { from: prev.status, to: status, reason: meta.reason });
  };
  const updateContentItem = (id, patch) =>
    setContentItems((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  // Schedule (or reschedule) — sets publish date and moves Approved → Scheduled.
  const scheduleContent = (id, dateISO) => {
    const prev = contentItems.find((c) => c.id === id);
    setContentItems((arr) => arr.map((c) => (c.id === id
      ? { ...c, publishDate: dateISO, status: c.status === "Approved" ? "Scheduled" : c.status }
      : c)));
    logAudit("schedule", id, { from: prev?.publishDate, to: dateISO });
  };

  const addComment = (contentItemId, authorId, body) =>
    setComments((arr) => [...arr, { id: uid("cm"), contentItemId, authorId, body, timestamp: now() }]);

  const addApproval = (contentItemId, actorId, action, note) => {
    setApprovals((arr) => [...arr, { id: uid("a"), contentItemId, actorId, action, note, timestamp: now() }]);
    if (action === "approved") updateContentStatus(contentItemId, "Approved", { reason: "Client approved" });
    if (action === "revision_requested") updateContentStatus(contentItemId, "Revision Requested", { reason: note });
  };

  const requestClientReview = (contentItemId, actorId, opts = {}) => {
    const prev = contentItems.find((c) => c.id === contentItemId);
    setContentItems((arr) => arr.map((c) => (c.id === contentItemId ? {
      ...c, status: "Client Review",
      clientReviewDue: opts.dueDate || c.clientReviewDue,
      clientReviewMessage: opts.message ?? c.clientReviewMessage,
      clientReviewRequestedAt: now(), clientReviewRequestedBy: actorId,
    } : c)));
    if (prev) logAudit("status", contentItemId, { from: prev.status, to: "Client Review", reason: "Sent for review" });
  };

  const uploadAsset = (input) => {
    const asset = { id: uid("as"), uploadedAt: now(), size: input.size || "—", source: input.source || "demo", ...input };
    setAssets((arr) => [asset, ...arr]);
    if (input.assetRequestId) setAssetRequests((arr) => arr.map((r) => (r.id === input.assetRequestId ? { ...r, status: "Uploaded" } : r)));
    return asset;
  };
  const addAssetRequest = (input) => {
    const req = { id: uid("ar"), requestedAt: now(), status: input.status || "Requested", ...input };
    setAssetRequests((arr) => [req, ...arr]);
    return req;
  };
  const updateAssetRequest = (id, patch) => setAssetRequests((arr) => arr.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const sendReminder = (input) => { const log = { id: uid("rl"), sentAt: now(), ...input }; setReminders((arr) => [log, ...arr]); return log; };
  const addReportExport = (input) => { const log = { id: uid("re"), exportedAt: now(), ...input }; setReportExports((arr) => [log, ...arr]); logAudit("export", input.snapshotId || "report", { to: input.fileName }); return log; };

  // Freeze a report snapshot from the current state.
  const generateSnapshot = (projectId, label) => {
    const items = contentItems.filter((c) => c.projectId === projectId);
    const planned = items.filter((c) => c.status !== "Archived").length;
    const posted = items.filter((c) => c.status === "Posted").length;
    const hrs = [];
    approvals.filter((a) => a.action === "approved").forEach((a) => {
      const it = items.find((c) => c.id === a.contentItemId);
      if (it?.clientReviewRequestedAt) { const h = (new Date(a.timestamp) - new Date(it.clientReviewRequestedAt)) / 3.6e6; if (h > 0 && h < 1000) hrs.push(h); }
    });
    const prevSnap = reportSnapshots.filter((s) => s.projectId === projectId).slice(-1)[0];
    const approvalAvgHours = hrs.length ? Math.round(hrs.reduce((s, x) => s + x, 0) / hrs.length) : (prevSnap?.approvalAvgHours || 12);
    const snap = { id: uid("snap"), projectId, label: label || new Date().toLocaleDateString(), date: now().slice(0, 10), planned, posted, approvalAvgHours, frozen: true };
    setReportSnapshots((arr) => [...arr, snap]);
    logAudit("report", projectId, { to: snap.label });
    return snap;
  };

  const addContentItem = (projectId, input) => {
    const item = { id: uid("ci"), projectId, status: "Idea", cta: "Learn more", deadline: input.deadline || "", publishDate: input.publishDate || "", ...input };
    setContentItems((arr) => [...arr, item]);
    logAudit("create", item.id, { to: "Idea" });
    return item;
  };

  const value = {
    users: USERS, clients: CLIENTS, selectedClientId, setSelectedClientId,
    projects, audienceSegments: AUDIENCE_SEGMENTS, phases: PHASES, pillars: PILLARS,
    campaigns: CAMPAIGNS, contentItems, setContentItems, approvals, setApprovals,
    comments, setComments, assets, setAssets, reportSnapshots, reportExports, audit,
    industryTemplates: INDUSTRY_TEMPLATES, assetRequests, setAssetRequests, reminders,
    updateContentStatus, updateContentItem, scheduleContent, addComment, addApproval,
    requestClientReview, addAssetRequest, updateAssetRequest, uploadAsset, sendReminder,
    addReportExport, generateSnapshot, addContentItem, logAudit,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
export const useData = () => {
  const v = useContext(DataContext);
  if (!v) throw new Error("useData outside provider");
  return v;
};

/* ── selectors ─────────────────────────────────────────── */
export function useVisibleProjects() {
  const { projects, selectedClientId } = useData();
  const user = useCurrentUser();
  let scoped = projects.filter((p) => p.clientId === selectedClientId);
  if (user.clientIds) scoped = scoped.filter((p) => user.clientIds.includes(p.clientId));
  return scoped;
}
export function useVisibleClients() {
  const { clients } = useData();
  const user = useCurrentUser();
  if (user.clientIds) return clients.filter((c) => user.clientIds.includes(c.id));
  return clients;
}
export function useSelectedClient() {
  const { clients, selectedClientId } = useData();
  return clients.find((c) => c.id === selectedClientId) || clients[0];
}
// content for the active client's projects — clients only see public-facing statuses
export function useVisibleContent() {
  const { contentItems } = useData();
  const projects = useVisibleProjects();
  const user = useCurrentUser();
  const ids = new Set(projects.map((p) => p.id));
  let list = contentItems.filter((c) => ids.has(c.projectId));
  if (user.role === "client") list = list.filter((c) => CLIENT_VISIBLE.includes(c.status));
  return list;
}
export const userById = (id) => USERS.find((u) => u.id === id);
