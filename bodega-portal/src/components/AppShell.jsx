import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, LayoutList, FolderKanban, Columns3, ClipboardCheck, CalendarDays,
  BarChart3, Megaphone, ClipboardList, Image as ImageIcon, Settings as SettingsIcon,
  ChevronDown, Sun, Moon, Menu, LogOut, Check, Bell, ArrowUpRight,
} from "lucide-react";
import {
  useAuth, useCurrentUser, useData, useSelectedClient, useVisibleClients,
  useVisibleProjects, useActiveProject, useProjectContent, useTheme,
} from "../store.jsx";
import { ROLE_META, PROJECT_STATUS_C } from "../lib/status.js";
import { Avatar, cx } from "../lib/ui.jsx";

const NAV_GROUPS = [
  { title: "Start", items: [
    { href: "/app", label: "Cockpit", icon: LayoutDashboard, roles: ["admin", "team", "client"] },
    { href: "/app/queue", label: "My Queue", icon: LayoutList, roles: ["admin", "team"] },
  ] },
  { title: "Set up", items: [
    { href: "/app/assessment", label: "Assessment", icon: ClipboardList, roles: ["admin", "team"] },
  ] },
  { title: "Plan", items: [
    { href: "/app/projects", label: "Project", icon: FolderKanban, roles: ["admin", "team"] },
    { href: "/app/campaigns", label: "Campaigns", icon: Megaphone, roles: ["admin", "team"] },
    { href: "/app/content", label: "Content", icon: Columns3, roles: ["admin", "team"] },
    { href: "/app/calendar", label: "Calendar", icon: CalendarDays, roles: ["admin", "team", "client"] },
  ] },
  { title: "Approve", items: [
    { href: "/app/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["admin", "team", "client"] },
    { href: "/app/assets", label: "Assets", icon: ImageIcon, roles: ["admin", "team", "client"] },
  ] },
  { title: "Report", items: [
    { href: "/app/reports", label: "Reports", icon: BarChart3, roles: ["admin", "team", "client"] },
  ] },
  { title: "System", items: [
    { href: "/app/settings", label: "Settings", icon: SettingsIcon, roles: ["admin", "team", "client"] },
  ] },
];

function Brand() {
  return (
    <Link href="/app" className="flex items-center px-2" aria-label="bodega — dashboard">
      <span className="brand-logo" style={{ height: 20, width: 76 }} />
    </Link>
  );
}

function NavLinks({ onNavigate }) {
  const [loc] = useLocation();
  const me = useCurrentUser();
  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group, gi) => {
        const items = group.items.filter((n) => n.roles.includes(me.role));
        if (!items.length) return null;
        return (
          <div key={gi} className="flex flex-col gap-1">
            <p className="mono uppercase tracking-[0.16em] text-[10px] text-faint px-3 mb-1">{group.title}</p>
            {items.map(({ href, label, icon: Icon }) => {
              const active = href === "/app" ? loc === "/app" : loc.startsWith(href);
              return (
                <Link key={href} href={href} onClick={onNavigate}
                  className={cx("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    active ? "" : "text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]")}
                  style={active ? { background: "var(--text)", color: "var(--bg)" } : undefined}>
                  <Icon size={17} />
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
      <button onClick={() => setOpen((o) => !o)} className="glass-2 hairline border flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium">
        {render(active)}
        <ChevronDown size={15} className="text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="glass absolute left-0 mt-2 w-60 p-1.5 z-50">
              <p className="eyebrow px-3 py-1.5">{label}</p>
              {items.map((it) => (
                <button key={it.id} onClick={() => { onPick(it.id); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-[color:var(--card-2)] text-left">
                  <span className="flex-1 min-w-0">{render(it)}</span>
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
  const projectContent = useProjectContent();
  const { setSelectedClientId, setSelectedProjectId } = useData();
  const [mobileOpen, setMobileOpen] = useState(false);
  const awaiting = projectContent.filter((c) => c.status === "Client Review").length;

  const SidebarInner = (
    <div className="flex flex-col h-full gap-6 p-4 overflow-y-auto no-scrollbar">
      <div className="pt-2"><Brand /></div>
      <NavLinks onNavigate={() => setMobileOpen(false)} />
      <div className="mt-auto flex flex-col gap-3">
        <div className="glass-2 hairline border rounded-xl p-3 flex items-center gap-3">
          <Avatar name={me.name} size={36} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{me.name}</p>
            <p className="eyebrow">{ROLE_META[me.role]?.label}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]" title="Sign out"><LogOut size={16} /></button>
        </div>
        <a href="/" className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)] transition-colors" title="Back to bodega.com">
          <ArrowUpRight size={14} /> Back to bodega.com
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-[244px] shrink-0 sticky top-0 h-screen">
        <div className="m-3 mr-0 glass w-full">{SidebarInner}</div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
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

          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={toggle} className="p-2 rounded-lg text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]" title="Toggle theme">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link href="/app/approvals" className="relative p-2 rounded-lg text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]" title="Approvals waiting">
              <Bell size={17} />
              {awaiting > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 grid place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: "#e8743b" }}>{awaiting}</span>}
            </Link>
            <Link href="/app/settings" className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-[color:var(--card-2)]">
              <Avatar name={me.name} size={28} />
              <span className="hidden md:flex flex-col leading-tight">
                <span className="text-xs font-semibold">{me.name}</span>
                <span className="eyebrow !text-[9px]">{ROLE_META[me.role]?.label}</span>
              </span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
