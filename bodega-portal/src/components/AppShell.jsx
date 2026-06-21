import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, LayoutList, FolderKanban, Columns3, ClipboardCheck, CalendarDays,
  BarChart3, Megaphone, ClipboardList, Image as ImageIcon, Settings as SettingsIcon,
  ChevronDown, Sun, Moon, Menu, X, LogOut, Check,
} from "lucide-react";
import { useAuth, useCurrentUser, useData, useSelectedClient, useVisibleClients, useVisibleProjects, useActiveProject, useTheme } from "../store.jsx";
import { ROLE_META, PROJECT_STATUS_C } from "../lib/status.js";
import { Avatar, cx } from "../lib/ui.jsx";

const NAV_GROUPS = [
  { title: null, items: [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "team", "client"] },
    { href: "/app/queue", label: "My Queue", icon: LayoutList, roles: ["admin", "team"] },
  ] },
  { title: "Plan", items: [
    { href: "/app/projects", label: "Project", icon: FolderKanban, roles: ["admin", "team"] },
    { href: "/app/campaigns", label: "Campaigns", icon: Megaphone, roles: ["admin", "team"] },
    { href: "/app/assessment", label: "Assessment", icon: ClipboardList, roles: ["admin", "team"] },
  ] },
  { title: "Produce", items: [
    { href: "/app/content", label: "Content", icon: Columns3, roles: ["admin", "team"] },
    { href: "/app/assets", label: "Assets", icon: ImageIcon, roles: ["admin", "team", "client"] },
  ] },
  { title: "Review", items: [{ href: "/app/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["admin", "team", "client"] }] },
  { title: "Publish", items: [{ href: "/app/calendar", label: "Calendar", icon: CalendarDays, roles: ["admin", "team", "client"] }] },
  { title: "Measure", items: [{ href: "/app/reports", label: "Reports", icon: BarChart3, roles: ["admin", "team", "client"] }] },
  { title: "Account", items: [{ href: "/app/settings", label: "Settings", icon: SettingsIcon, roles: ["admin", "team", "client"] }] },
];

function Brand() {
  return (
    <Link href="/app" className="flex items-center gap-2 px-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg,#2562e7,#01dcb4)" }} />
      <span className="display text-xl font-extrabold">bodega</span>
      <span className="chip ml-1 !py-0.5 !px-2 text-[10px]" style={{ color: "var(--muted)" }}>portal</span>
    </Link>
  );
}

function NavLinks({ onNavigate }) {
  const [loc] = useLocation();
  const me = useCurrentUser();
  return (
    <nav className="flex flex-col gap-4">
      {NAV_GROUPS.map((group, gi) => {
        const items = group.items.filter((n) => n.roles.includes(me.role));
        if (!items.length) return null;
        return (
          <div key={gi} className="flex flex-col gap-1">
            {group.title && <p className="text-[10px] uppercase tracking-[0.14em] text-faint px-3 mb-0.5">{group.title}</p>}
            {items.map(({ href, label, icon: Icon }) => {
              const active = href === "/app" ? loc === "/app" : loc.startsWith(href);
              return (
                <Link key={href} href={href} onClick={onNavigate}
                  className={cx("flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                    active ? "text-[color:var(--text)]" : "text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]")}
                  style={active ? { background: "var(--card-2)", border: "1px solid var(--line)" } : undefined}>
                  <Icon size={18} style={active ? { color: "#2562e7" } : undefined} />
                  {label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function Switcher({ label, items, activeId, onPick, render }) {
  const [open, setOpen] = useState(false);
  const active = items.find((i) => i.id === activeId) || items[0];
  if (!active) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="glass-2 hairline border flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold">
        {render(active, true)}
        <ChevronDown size={15} className="text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="glass absolute left-0 mt-2 w-60 p-1.5 z-50">
              <p className="text-[11px] uppercase tracking-wider text-faint px-3 py-1.5">{label}</p>
              {items.map((it) => (
                <button key={it.id} onClick={() => { onPick(it.id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-[color:var(--card-2)] text-left">
                  <span className="flex-1 min-w-0">{render(it, false)}</span>
                  {it.id === active.id && <Check size={15} className="text-accent" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AppShell({ children }) {
  const { theme, toggle } = useTheme();
  const { logout } = useAuth();
  const me = useCurrentUser();
  const clients = useVisibleClients();
  const selectedClient = useSelectedClient();
  const projects = useVisibleProjects();
  const activeProject = useActiveProject();
  const { setSelectedClientId, setSelectedProjectId } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarInner = (
    <div className="flex flex-col h-full gap-6 p-4 overflow-y-auto no-scrollbar">
      <div className="pt-2"><Brand /></div>
      <NavLinks onNavigate={() => setMobileOpen(false)} />
      <div className="mt-auto glass-2 hairline border rounded-2xl p-3 flex items-center gap-3">
        <Avatar name={me.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{me.name}</p>
          <p className="text-xs text-muted">{ROLE_META[me.role]?.label}</p>
        </div>
        <button onClick={logout} className="p-1.5 rounded-lg text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]" title="Sign out"><LogOut size={16} /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-[252px] shrink-0 sticky top-0 h-screen">
        <div className="m-3 mr-0 glass w-full">{SidebarInner}</div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 320, damping: 32 }} className="absolute left-0 top-0 h-full w-[260px] glass rounded-r-2xl">
              {SidebarInner}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 px-4 md:px-6 py-3 border-b hairline" style={{ background: "var(--bg)" }}>
          <button className="lg:hidden p-2 -ml-2 text-muted" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          {clients.length > 1 ? (
            <Switcher label="Switch client" items={clients} activeId={selectedClient?.id} onPick={setSelectedClientId}
              render={(c) => (<span className="flex items-center gap-2"><Avatar name={c.name} size={20} /><span className="max-w-[110px] truncate">{c.name}</span></span>)} />
          ) : selectedClient ? (
            <span className="chip" style={{ color: "var(--muted)" }}><Avatar name={selectedClient.name} size={18} /> {selectedClient.name}</span>
          ) : null}
          {activeProject && <ChevronDown size={14} className="text-faint -rotate-90 hidden sm:block" />}
          {projects.length > 1 ? (
            <Switcher label="Switch project" items={projects} activeId={activeProject?.id} onPick={setSelectedProjectId}
              render={(p) => (<span className="flex items-center gap-2"><i className="w-2 h-2 rounded-full" style={{ background: PROJECT_STATUS_C[p.status] }} /><span className="max-w-[130px] truncate">{p.name}</span></span>)} />
          ) : activeProject ? (
            <span className="chip" style={{ color: "var(--muted)" }}><i className="w-2 h-2 rounded-full" style={{ background: PROJECT_STATUS_C[activeProject.status] }} /> {activeProject.name}</span>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} className="p-2 rounded-full glass-2 hairline border text-muted hover:text-[color:var(--text)]" title="Toggle theme">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Avatar name={me.name} size={34} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
