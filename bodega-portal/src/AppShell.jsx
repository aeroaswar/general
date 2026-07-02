import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, ListTodo, Users, FolderKanban, Megaphone, FileText,
  CalendarDays, CheckCircle2, BarChart3, Receipt, Settings, Sun, Moon,
  Bell, LogOut, Menu, X,
} from "lucide-react";
import { cx, Avatar } from "./ui.jsx";
import { ROLE_META } from "./status.js";
import {
  useAuth, useTheme, useData, useVisibleClients, useSelectedClient,
  useVisibleProjects, useActiveProject,
} from "./store.jsx";

// Grouped nav — each item declares which roles may see it.
const NAV = [
  { group: "Start", items: [
    { href: "/", label: "Cockpit", icon: LayoutDashboard, roles: ["admin", "team", "client"] },
    { href: "/queue", label: "My Queue", icon: ListTodo, roles: ["admin", "team"] },
  ]},
  { group: "Set up", items: [
    { href: "/clients", label: "Clients", icon: Users, roles: ["admin"] },
  ]},
  { group: "Plan", items: [
    { href: "/project", label: "Project", icon: FolderKanban, roles: ["admin", "team", "client"] },
    { href: "/content", label: "Content", icon: FileText, roles: ["admin", "team", "client"] },
    { href: "/calendar", label: "Calendar", icon: CalendarDays, roles: ["admin", "team", "client"] },
  ]},
  { group: "Approve", items: [
    { href: "/approvals", label: "Approvals", icon: CheckCircle2, roles: ["admin", "team", "client"] },
  ]},
  { group: "Report", items: [
    { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "team", "client"] },
  ]},
  { group: "Billing", items: [
    { href: "/invoices", label: "Invoices", icon: Receipt, roles: ["admin", "client"] },
  ]},
  { group: "System", items: [
    { href: "/settings", label: "Settings", icon: Settings, roles: ["admin", "team", "client"] },
  ]},
];

function Switcher({ label, options, value, onChange }) {
  return (
    <label className="flex items-center gap-2 min-w-0">
      <span className="eyebrow hidden md:block">{label}</span>
      <select
        className="input-glass !w-auto max-w-[180px] truncate !py-1.5 text-sm"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  );
}

export default function AppShell({ children }) {
  const [location] = useLocation();
  const { me, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { store, selectedClientId, setSelectedClientId, activeProjectId, setActiveProjectId } = useData();
  const clients = useVisibleClients();
  const client = useSelectedClient();
  const projects = useVisibleProjects();
  const project = useActiveProject();
  const [drawer, setDrawer] = useState(false);

  const pendingApprovals = store.approvals.filter((a) => !a.decision).length;
  const role = ROLE_META[me.role];

  const navGroups = NAV
    .map((g) => ({ ...g, items: g.items.filter((i) => i.roles.includes(me.role)) }))
    .filter((g) => g.items.length > 0);

  const sidebar = (
    <nav className="flex flex-col gap-5 p-4 w-56">
      <Link href="/" className="flex items-center gap-2 px-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }} />
        <span className="display text-xl font-semibold tracking-tight">bodega</span>
        <span className="eyebrow mt-1">OS</span>
      </Link>
      {navGroups.map((g) => (
        <div key={g.group}>
          <p className="eyebrow px-2 mb-1.5">{g.group}</p>
          <div className="flex flex-col gap-0.5">
            {g.items.map(({ href, label, icon: Icon }) => {
              const active = location === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setDrawer(false)}
                  className={cx(
                    "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "glass-2 font-semibold"
                      : "text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]"
                  )}
                >
                  <Icon size={16} style={active ? { color: "var(--accent)" } : undefined} />
                  {label}
                  {label === "Approvals" && pendingApprovals > 0 && (
                    <span className="ml-auto chip !py-0 !px-1.5" style={{ color: "var(--accent)" }}>{pendingApprovals}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-full flex">
      <div className="brand-bg" />
      <div className="brand-grain" />

      {/* sidebar — sticky glass on desktop, drawer on mobile */}
      <aside className="hidden lg:block sticky top-0 h-screen overflow-y-auto no-scrollbar border-r hairline" style={{ background: "color-mix(in srgb, var(--card) 55%, transparent)", backdropFilter: "blur(14px)" }}>
        {sidebar}
      </aside>
      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 bottom-0 overflow-y-auto glass !rounded-none">{sidebar}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* header — switchers filter the whole app; no overflow-hidden (it clips dropdowns) */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 border-b hairline" style={{ background: "color-mix(in srgb, var(--bg) 78%, transparent)", backdropFilter: "blur(14px)" }}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-[color:var(--card-2)]" onClick={() => setDrawer(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          {me.role !== "client" && (
            <Switcher label="Client" options={clients} value={client?.id} onChange={setSelectedClientId} />
          )}
          <Switcher label="Project" options={projects} value={project?.id} onChange={setActiveProjectId} />
          <div className="ml-auto flex items-center gap-2">
            <Link href="/approvals" className="relative p-2 rounded-lg hover:bg-[color:var(--card-2)]" aria-label="Approvals">
              <Bell size={17} />
              {pendingApprovals > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold grid place-items-center text-white" style={{ background: "var(--accent)" }}>
                  {pendingApprovals}
                </span>
              )}
            </Link>
            <button onClick={toggle} className="p-2 rounded-lg hover:bg-[color:var(--card-2)]" aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l hairline">
              <Avatar name={me.name} size={30} />
              <div className="leading-tight">
                <p className="text-sm font-semibold truncate max-w-[140px]">{me.name}</p>
                <p className="text-[11px]" style={{ color: role.c }}>{role.label}</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-[color:var(--card-2)] text-muted" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <motion.main
          key={location}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
