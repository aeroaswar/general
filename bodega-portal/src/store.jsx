import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SEED } from "./seed.js";
import { CLIENT_VISIBLE } from "./status.js";

const STORE_KEY = "bodega-store-v2"; // bump suffix when the shape changes

export const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

function seeded(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted store → reseed */ }
  return fallback;
}

/* ── Theme ─────────────────────────────────────────────── */
const ThemeCtx = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => seeded("bodega-theme", "dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("bodega-theme", JSON.stringify(theme));
  }, [theme]);
  const value = useMemo(() => ({ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }), [theme]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}
export const useTheme = () => useContext(ThemeCtx);

/* ── Auth ──────────────────────────────────────────────── */
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [me, setMe] = useState(() => seeded("bodega-auth", null));
  useEffect(() => { localStorage.setItem("bodega-auth", JSON.stringify(me)); }, [me]);
  const loginAs = (role) => {
    const user = SEED.users.find((u) => u.role === role);
    setMe(user || null);
  };
  const logout = () => setMe(null);
  return <AuthCtx.Provider value={{ me, loginAs, logout }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

/* ── Data ──────────────────────────────────────────────── */
const DataCtx = createContext(null);
export function DataProvider({ children }) {
  const [store, setStore] = useState(() => seeded(STORE_KEY, SEED));
  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(store)); }, [store]);

  const [selectedClientId, setSelectedClientId] = useState(() => seeded("bodega-sel-client", "c_panasonic"));
  const [activeProjectId, setActiveProjectId] = useState(() => seeded("bodega-sel-project", "p_pana_social"));
  useEffect(() => { localStorage.setItem("bodega-sel-client", JSON.stringify(selectedClientId)); }, [selectedClientId]);
  useEffect(() => { localStorage.setItem("bodega-sel-project", JSON.stringify(activeProjectId)); }, [activeProjectId]);

  const logAudit = (action, meta = {}) =>
    setStore((s) => ({ ...s, audit: [{ id: uid("aud"), action, meta, at: new Date().toISOString() }, ...s.audit].slice(0, 200) }));

  const update = (collection, id, patch) =>
    setStore((s) => ({ ...s, [collection]: s[collection].map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  const add = (collection, item) =>
    setStore((s) => ({ ...s, [collection]: [item, ...s[collection]] }));

  const value = { store, setStore, update, add, logAudit, selectedClientId, setSelectedClientId, activeProjectId, setActiveProjectId };
  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>;
}
export const useData = () => useContext(DataCtx);

/* ── Role-scoped selectors ─────────────────────────────── */
export function useVisibleClients() {
  const { store } = useData();
  const { me } = useAuth();
  if (!me) return [];
  if (me.role === "client") return store.clients.filter((c) => c.id === me.clientId);
  return store.clients;
}
export function useSelectedClient() {
  const clients = useVisibleClients();
  const { selectedClientId } = useData();
  const { me } = useAuth();
  if (me?.role === "client") return clients[0] || null;
  return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
}
export function useVisibleProjects() {
  const { store } = useData();
  const client = useSelectedClient();
  return client ? store.projects.filter((p) => p.clientId === client.id) : [];
}
export function useActiveProject() {
  const projects = useVisibleProjects();
  const { activeProjectId } = useData();
  return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
}
export function useProjectContent() {
  const { store } = useData();
  const { me } = useAuth();
  const project = useActiveProject();
  if (!project) return [];
  let items = store.content.filter((c) => c.projectId === project.id);
  if (me?.role === "client") items = items.filter((c) => CLIENT_VISIBLE.includes(c.status));
  return items;
}
