import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  USERS, CLIENTS, PROJECTS, AUDIENCE_SEGMENTS, PHASES, PILLARS, CAMPAIGNS,
  CONTENT_ITEMS, APPROVALS, ASSETS, COMMENTS, REPORT_SNAPSHOTS,
  INDUSTRY_TEMPLATES, ASSET_REQUESTS, REMINDER_LOGS,
} from "./seed.js";

const now = () => new Date().toISOString();
const uid = (p) => `${p}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/* ── Theme ─────────────────────────────────────────────── */
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("bodega-theme") || "dark");
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
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
  const loginAs = (r) => {
    const u = USERS.find((x) => x.role === r) || USERS[0];
    setCurrentUserId(u.id);
    setAuthed(true);
  };
  const setRole = (r) => { const u = USERS.find((x) => x.role === r); if (u) setCurrentUserId(u.id); };
  const logout = () => setAuthed(false);

  const value = { currentUserId, setCurrentUserId, role, setRole, authed, loginAs, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
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
  const [reportExports, setReportExports] = useState([]);
  const [selectedClientId, setSelectedClientIdState] = useState("c1");

  const permittedClients = useMemo(() => {
    if (user.role === "client" && user.clientIds) return CLIENTS.filter((c) => user.clientIds.includes(c.id));
    return CLIENTS;
  }, [user]);

  useEffect(() => {
    if (!permittedClients.some((c) => c.id === selectedClientId)) {
      setSelectedClientIdState(permittedClients[0]?.id || "");
    }
  }, [permittedClients, selectedClientId]);

  const setSelectedClientId = (id) => { if (permittedClients.some((c) => c.id === id)) setSelectedClientIdState(id); };

  const updateContentStatus = (id, status) =>
    setContentItems((arr) => arr.map((c) => (c.id === id ? { ...c, status } : c)));
  const updateContentItem = (id, patch) =>
    setContentItems((arr) => arr.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addComment = (contentItemId, authorId, body) =>
    setComments((arr) => [...arr, { id: uid("cm"), contentItemId, authorId, body, timestamp: now() }]);

  const addApproval = (contentItemId, actorId, action, note) => {
    setApprovals((arr) => [...arr, { id: uid("a"), contentItemId, actorId, action, note, timestamp: now() }]);
    if (action === "approved") updateContentStatus(contentItemId, "Approved");
    if (action === "revision_requested") updateContentStatus(contentItemId, "Revision Requested");
  };

  const requestClientReview = (contentItemId, actorId, opts = {}) => {
    setContentItems((arr) => arr.map((c) => (c.id === contentItemId ? {
      ...c, status: "Client Review",
      clientReviewDue: opts.dueDate || c.clientReviewDue,
      clientReviewMessage: opts.message ?? c.clientReviewMessage,
      clientReviewRequestedAt: now(), clientReviewRequestedBy: actorId,
    } : c)));
  };

  const uploadAsset = (input) => {
    const asset = { id: uid("as"), uploadedAt: now(), size: input.size || "—", source: input.source || "demo", ...input };
    setAssets((arr) => [asset, ...arr]);
    return asset;
  };
  const addAssetRequest = (input) => {
    const req = { id: uid("ar"), requestedAt: now(), status: input.status || "Requested", ...input };
    setAssetRequests((arr) => [req, ...arr]);
    return req;
  };
  const updateAssetRequest = (id, patch) =>
    setAssetRequests((arr) => arr.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const sendReminder = (input) => {
    const log = { id: uid("rl"), sentAt: now(), ...input };
    setReminders((arr) => [log, ...arr]);
    return log;
  };
  const addReportExport = (input) => {
    const log = { id: uid("re"), exportedAt: now(), ...input };
    setReportExports((arr) => [log, ...arr]);
    return log;
  };

  const addContentItem = (projectId, input) => {
    const item = {
      id: uid("ci"), projectId, status: "Idea", cta: "Learn more",
      deadline: input.deadline || "", publishDate: input.publishDate || "",
      ...input,
    };
    setContentItems((arr) => [...arr, item]);
    return item;
  };

  const value = {
    users: USERS, clients: CLIENTS, selectedClientId, setSelectedClientId,
    projects, audienceSegments: AUDIENCE_SEGMENTS, phases: PHASES, pillars: PILLARS,
    campaigns: CAMPAIGNS, contentItems, setContentItems, approvals, setApprovals,
    comments, setComments, assets, setAssets, reportSnapshots: REPORT_SNAPSHOTS,
    reportExports, industryTemplates: INDUSTRY_TEMPLATES, assetRequests, setAssetRequests, reminders,
    updateContentStatus, updateContentItem, addComment, addApproval, requestClientReview,
    addAssetRequest, updateAssetRequest, uploadAsset, sendReminder, addReportExport, addContentItem,
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
  if (user.role === "client" && user.clientIds) scoped = scoped.filter((p) => user.clientIds.includes(p.clientId));
  return scoped;
}
export function useVisibleClients() {
  const { clients } = useData();
  const user = useCurrentUser();
  if (user.role === "client" && user.clientIds) return clients.filter((c) => user.clientIds.includes(c.id));
  return clients;
}
export function useSelectedClient() {
  const { clients, selectedClientId } = useData();
  return clients.find((c) => c.id === selectedClientId) || clients[0];
}
// content items for the active client's projects
export function useVisibleContent() {
  const { contentItems } = useData();
  const projects = useVisibleProjects();
  const ids = new Set(projects.map((p) => p.id));
  return contentItems.filter((c) => ids.has(c.projectId));
}
export const userById = (id) => USERS.find((u) => u.id === id);
