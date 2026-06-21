import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  USERS, CLIENTS, PROJECTS, AUDIENCE_SEGMENTS, PHASES, PILLARS, CAMPAIGNS,
  CONTENT_ITEMS, APPROVALS, ASSETS, COMMENTS, REPORT_SNAPSHOTS,
  INDUSTRY_TEMPLATES, ASSET_REQUESTS, REMINDER_LOGS, CONTRACTS,
} from "./seed.js";
import { CLIENT_VISIBLE } from "./lib/status.js";
import { defaultClauses, defaultContractNumber } from "./lib/contractI18n.js";

const now = () => new Date().toISOString();
const today0 = () => new Date().toISOString().slice(0, 10);
const uid = (p) => `${p}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

/* ── Persistence — the whole editable dataset is saved to this browser so
      changes survive a refresh (single-device, no backend). ───────────── */
const STORE_KEY = "bodega-store-v2";
const loadSnapshot = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch { return {}; }
};
const SNAP = loadSnapshot();
const seeded = (key, fallback) => (SNAP[key] !== undefined ? SNAP[key] : fallback);

/* ── Theme ─────────────────────────────────────────────── */
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("bodega-theme") || "dark");
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
  // Backbone entities — now editable + persisted (hydrate from localStorage, else seed).
  const [clients, setClients] = useState(() => seeded("clients", CLIENTS));
  const [projects, setProjects] = useState(() => seeded("projects", PROJECTS));
  const [phases, setPhases] = useState(() => seeded("phases", PHASES));
  const [pillars, setPillars] = useState(() => seeded("pillars", PILLARS));
  const [audienceSegments, setAudienceSegments] = useState(() => seeded("audienceSegments", AUDIENCE_SEGMENTS));
  const [campaigns, setCampaigns] = useState(() => seeded("campaigns", CAMPAIGNS));
  const [contentItems, setContentItems] = useState(() => seeded("contentItems", CONTENT_ITEMS));
  const [approvals, setApprovals] = useState(() => seeded("approvals", APPROVALS));
  const [comments, setComments] = useState(() => seeded("comments", COMMENTS));
  const [assets, setAssets] = useState(() => seeded("assets", ASSETS));
  const [assetRequests, setAssetRequests] = useState(() => seeded("assetRequests", ASSET_REQUESTS));
  const [reminders, setReminders] = useState(() => seeded("reminders", REMINDER_LOGS));
  const [reportSnapshots, setReportSnapshots] = useState(() => seeded("reportSnapshots", REPORT_SNAPSHOTS));
  const [contracts, setContracts] = useState(() => seeded("contracts", CONTRACTS));
  const [reportExports, setReportExports] = useState([]);
  const [audit, setAudit] = useState([]);
  const [selectedClientId, setSelectedClientIdState] = useState("c1");
  const [selectedProjectId, setSelectedProjectIdState] = useState(() => localStorage.getItem("bodega-pid") || "p1");

  // Save the whole editable dataset whenever any of it changes.
  useEffect(() => {
    const data = { clients, projects, phases, pillars, audienceSegments, campaigns, contentItems, approvals, comments, assets, assetRequests, reminders, reportSnapshots, contracts };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch { /* quota — ignore */ }
  }, [clients, projects, phases, pillars, audienceSegments, campaigns, contentItems, approvals, comments, assets, assetRequests, reminders, reportSnapshots, contracts]);

  // admin → all clients; team/client → only assigned (clientIds)
  const permittedClients = useMemo(() => {
    if (user.clientIds) return clients.filter((c) => user.clientIds.includes(c.id));
    return clients;
  }, [user, clients]);

  useEffect(() => {
    if (!permittedClients.some((c) => c.id === selectedClientId)) {
      setSelectedClientIdState(permittedClients[0]?.id || "");
    }
  }, [permittedClients, selectedClientId]);

  const setSelectedClientId = (id) => { if (permittedClients.some((c) => c.id === id)) setSelectedClientIdState(id); };

  // keep the active project valid for the current client
  const clientProjects = useMemo(() => projects.filter((p) => p.clientId === selectedClientId), [projects, selectedClientId]);
  useEffect(() => {
    localStorage.setItem("bodega-pid", selectedProjectId);
    if (clientProjects.length && !clientProjects.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectIdState(clientProjects[0].id);
    }
  }, [clientProjects, selectedProjectId]);
  const setSelectedProjectId = (id) => setSelectedProjectIdState(id);

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

  /* ── Backbone CRUD — clients, projects, phases, pillars, audience ─────── */
  // Clients
  const addClient = (input) => {
    const c = { id: uid("c"), projectIds: [], brandPersonality: [], competitors: [], stakeholders: [], industry: "", description: "", market: "", positioning: "", toneOfVoice: "", ...input };
    setClients((a) => [...a, c]);
    logAudit("create", c.id, { to: "client" });
    return c;
  };
  const updateClient = (id, patch) => { setClients((a) => a.map((c) => (c.id === id ? { ...c, ...patch } : c))); logAudit("update", id, { to: "client" }); };
  const deleteClient = (id) => {
    const projIds = projects.filter((p) => p.clientId === id).map((p) => p.id);
    const inProj = (x) => projIds.includes(x.projectId);
    setProjects((a) => a.filter((p) => p.clientId !== id));
    setPhases((a) => a.filter((x) => !inProj(x)));
    setPillars((a) => a.filter((x) => !inProj(x)));
    setAudienceSegments((a) => a.filter((x) => !inProj(x)));
    setCampaigns((a) => a.filter((x) => !inProj(x)));
    setContentItems((a) => a.filter((x) => !inProj(x)));
    setClients((a) => a.filter((c) => c.id !== id));
    logAudit("delete", id, { to: "client" });
  };

  // Projects (a new project gets three starter phases so the framework isn't blank)
  const addProject = (clientId, input = {}) => {
    const id = uid("p");
    const proj = {
      id, clientId, name: input.name || "New project", industry: input.industry || "",
      status: input.status || "Planning", health: input.health ?? 60,
      platforms: input.platforms || [], cadence: input.cadence || "",
      startDate: input.startDate || today0(), endDate: input.endDate || "", budget: input.budget || "",
      goalBusiness: "", goalMarketing: "", goalCampaign: "", successMetrics: [], painPoints: [],
      audienceSegmentIds: [], phaseIds: [], pillarIds: [], ...input,
    };
    setProjects((a) => [...a, proj]);
    const defPhases = ["Foundation", "Growth", "Authority"].map((n, i) => ({ id: uid("ph"), projectId: id, name: n, order: i + 1, objective: "" }));
    setPhases((a) => [...a, ...defPhases]);
    setClients((a) => a.map((c) => (c.id === clientId ? { ...c, projectIds: [...(c.projectIds || []), id] } : c)));
    logAudit("create", id, { to: "project" });
    return proj;
  };
  const updateProject = (id, patch) => { setProjects((a) => a.map((p) => (p.id === id ? { ...p, ...patch } : p))); logAudit("update", id, { to: "project" }); };
  const deleteProject = (id) => {
    setProjects((a) => a.filter((p) => p.id !== id));
    setPhases((a) => a.filter((x) => x.projectId !== id));
    setPillars((a) => a.filter((x) => x.projectId !== id));
    setAudienceSegments((a) => a.filter((x) => x.projectId !== id));
    setCampaigns((a) => a.filter((x) => x.projectId !== id));
    setContentItems((a) => a.filter((x) => x.projectId !== id));
    setClients((a) => a.map((c) => ({ ...c, projectIds: (c.projectIds || []).filter((pid) => pid !== id) })));
    logAudit("delete", id, { to: "project" });
  };

  // Phases
  const addPhase = (projectId, input = {}) => {
    const order = phases.filter((x) => x.projectId === projectId).length + 1;
    const ph = { id: uid("ph"), projectId, name: input.name || "New phase", objective: input.objective || "", order };
    setPhases((a) => [...a, ph]);
    return ph;
  };
  const updatePhase = (id, patch) => setPhases((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const deletePhase = (id) => setPhases((a) => a.filter((x) => x.id !== id));

  // Pillars
  const addPillar = (projectId, input = {}) => {
    const pl = { id: uid("pil"), projectId, name: input.name || "New pillar", description: input.description || "", weight: Number(input.weight) || 0 };
    setPillars((a) => [...a, pl]);
    return pl;
  };
  const updatePillar = (id, patch) => setPillars((a) => a.map((x) => (x.id === id ? { ...x, ...patch, weight: patch.weight !== undefined ? Number(patch.weight) || 0 : x.weight } : x)));
  const deletePillar = (id) => setPillars((a) => a.filter((x) => x.id !== id));

  // Audience segments
  const addSegment = (projectId, input = {}) => {
    const s = { id: uid("as"), projectId, name: input.name || "New segment", description: input.description || "" };
    setAudienceSegments((a) => [...a, s]);
    return s;
  };
  const updateSegment = (id, patch) => setAudienceSegments((a) => a.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const deleteSegment = (id) => setAudienceSegments((a) => a.filter((x) => x.id !== id));

  /* ── Contracts — one editable, e-signable agreement per client ────────── */
  const createContract = (clientId, input = {}) => {
    const client = clients.find((c) => c.id === clientId);
    const firstProject = projects.find((p) => p.clientId === clientId);
    const id = uid("ct");
    const lang = input.lang || "en";
    const contract = {
      id, clientId, projectId: input.projectId ?? firstProject?.id ?? null, lang,
      title: input.title || "Creative Services Agreement", number: input.number || defaultContractNumber(input.effectiveDate),
      status: "Draft",
      effectiveDate: input.effectiveDate || today0(), termMonths: input.termMonths ?? 6,
      studio: { name: "Bodega Creative Studio", signatory: "", title: "", email: "creativestudiolabodega@gmail.com", address: "Jl. Otista Raya No.80, RT.2/RW.5, Jakarta Timur, DKI Jakarta 13330", ...input.studio },
      client: { company: client?.name || "", signatory: "", title: "", email: "", address: "", ...input.client },
      fee: input.fee || "", paymentTerms: input.paymentTerms || "Net 14 days from invoice date",
      cadence: input.cadence || "", scope: input.scope || (client ? `Brand-first social media strategy and daily execution for ${client.name}.` : ""),
      deliverables: input.deliverables || ["Monthly content calendar", "Content production", "Community management", "Monthly performance report"],
      clauses: (input.clauses || defaultClauses(lang)).map((c, i) => ({ id: `${id}-cl${i + 1}`, heading: c.heading, body: c.body })),
      clientSignature: null, studioSignature: null, createdAt: now(),
    };
    setContracts((a) => [...a, contract]);
    logAudit("create", id, { to: "contract" });
    return contract;
  };
  const updateContract = (id, patch) => { setContracts((a) => a.map((c) => (c.id === id ? { ...c, ...patch } : c))); logAudit("update", id, { to: "contract" }); };
  const deleteContract = (id) => { setContracts((a) => a.filter((c) => c.id !== id)); logAudit("delete", id, { to: "contract" }); };
  // party: "client" | "studio"; signature: { name, title, typed, drawnDataUrl }
  const signContract = (id, party, signature) => {
    setContracts((a) => a.map((c) => {
      if (c.id !== id) return c;
      const sig = { ...signature, date: now() };
      const next = { ...c };
      if (party === "client") {
        next.clientSignature = sig;
        next.client = { ...c.client, signatory: signature.name || c.client.signatory, title: signature.title || c.client.title };
        next.status = "Signed";
      } else {
        next.studioSignature = sig;
        next.studio = { ...c.studio, signatory: signature.name || c.studio.signatory, title: signature.title || c.studio.title };
      }
      return next;
    }));
    logAudit("sign", id, { to: party });
  };
  // clear an applied signature (re-sign); clearing the client's reverts status to "Sent"
  const clearSignature = (id, party) => {
    setContracts((a) => a.map((c) => {
      if (c.id !== id) return c;
      const next = { ...c };
      if (party === "client") { next.clientSignature = null; if (c.status === "Signed") next.status = "Sent"; }
      else next.studioSignature = null;
      return next;
    }));
    logAudit("unsign", id, { to: party });
  };
  // attach / remove an official e-Meterai (image + serial) on a party's block
  const setMeterai = (id, party, data) => {
    setContracts((a) => a.map((c) => (c.id !== id ? c : { ...c, [party === "client" ? "clientMeterai" : "studioMeterai"]: data })));
    logAudit("meterai", id, { to: party });
  };
  const clearMeterai = (id, party) => {
    setContracts((a) => a.map((c) => (c.id !== id ? c : { ...c, [party === "client" ? "clientMeterai" : "studioMeterai"]: null })));
  };

  const value = {
    users: USERS, clients, selectedClientId, setSelectedClientId, selectedProjectId, setSelectedProjectId,
    projects, audienceSegments, phases, pillars,
    campaigns, contentItems, setContentItems, approvals, setApprovals,
    comments, setComments, assets, setAssets, reportSnapshots, reportExports, audit,
    industryTemplates: INDUSTRY_TEMPLATES, assetRequests, setAssetRequests, reminders,
    updateContentStatus, updateContentItem, scheduleContent, addComment, addApproval,
    requestClientReview, addAssetRequest, updateAssetRequest, uploadAsset, sendReminder,
    addReportExport, generateSnapshot, addContentItem, logAudit,
    // backbone CRUD
    addClient, updateClient, deleteClient,
    addProject, updateProject, deleteProject,
    addPhase, updatePhase, deletePhase,
    addPillar, updatePillar, deletePillar,
    addSegment, updateSegment, deleteSegment,
    // contracts
    contracts, createContract, updateContract, deleteContract, signContract, clearSignature, setMeterai, clearMeterai,
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
// the active project (sticky context, scoped to the active client)
export function useActiveProject() {
  const visible = useVisibleProjects();
  const { selectedProjectId } = useData();
  return visible.find((p) => p.id === selectedProjectId) || visible[0] || null;
}
// content for the ACTIVE project (clients still only see public-facing statuses)
export function useProjectContent() {
  const { contentItems } = useData();
  const active = useActiveProject();
  const user = useCurrentUser();
  let list = contentItems.filter((c) => active && c.projectId === active.id);
  if (user.role === "client") list = list.filter((c) => CLIENT_VISIBLE.includes(c.status));
  return list;
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
