import { useState } from "react";
import { Link, useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, FolderKanban, Columns3, ClipboardCheck, CalendarDays,
  BarChart3, ChevronDown, Sun, Moon, Menu, X, LogOut, Check,
  Compass, Megaphone, Image as ImageIcon, ClipboardList, Settings as SettingsIcon,
} from "lucide-react";
import { useAuth, useCurrentUser, useData, useSelectedClient, useVisibleClients, useTheme } from "../store.jsx";
import { ROLE_META } from "../lib/status.js";
import { Avatar, cx } from "../lib/ui.jsx";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "team", "client"] },
  { href: "/app/projects", label: "Projects", icon: FolderKanban, roles: ["admin", "team"] },
  { href: "/app/strategy", label: "Strategy", icon: Compass, roles: ["admin", "team"] },
  { href: "/app/content", label: "Content Board", icon: Columns3, roles: ["admin", "team"] },
  { href: "/app/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["admin", "team", "client"] },
  { href: "/app/calendar", label: "Calendar", icon: CalendarDays, roles: ["admin", "team", "client"] },
  { href: "/app/campaigns", label: "Campaigns", icon: Megaphone, roles: ["admin", "team"] },
  { href: "/app/assets", label: "Assets", icon: ImageIcon, roles: ["admin", "team", "client"] },
  { href: "/app/reports", label: "Reports", icon: BarChart3, roles: ["admin", "team", "client"] },
  { href: "/app/assessment", label: "Assessment", icon: ClipboardList, roles: ["admin", "team"] },
  { href: "/app/settings", label: "Settings", icon: SettingsIcon, roles: ["admin", "team", "client"] },
];

function Brand() {
  return (
    <Link href="/app" className="flex items-center gap-2 px-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg,#2562e7,#01dcb4)", boxShadow: "0 0 14px 2px rgba(37,98,231,.7)" }} />
      <span className="display text-xl font-extrabold">bodega</span>
      <span className="chip ml-1 !py-0.5 !px-2 text-[10px]" style={{ color: "var(--muted)" }}>portal</span>
    </Link>
  );
}

function NavLinks({ onNavigate }) {
  const [loc] = useLocation();
  const me = useCurrentUser();
  const items = NAV.filter((n) => n.roles.includes(me.role));
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/app" ? loc === "/app" : loc.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
              active ? "text-[color:var(--text)]" : "text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]"
            )}
            style={active ? { background: "var(--card)", border: "1px solid var(--line)" } : undefined}
          >
            <Icon size={18} style={active ? { color: "#2562e7" } : undefined} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function ClientSwitcher() {
  const clients = useVisibleClients();
  const selected = useSelectedClient();
  const { setSelectedClientId } = useData();
  const [open, setOpen] = useState(false);
  if (!selected) return null;
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="glass-2 hairline border flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold">
        <Avatar name={selected.name} size={20} />
        <span className="max-w-[120px] truncate">{selected.name}</span>
        <ChevronDown size={15} className="text-muted" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="glass absolute right-0 mt-2 w-60 p-1.5 z-50"
            >
              <p className="text-[11px] uppercase tracking-wider text-faint px-3 py-1.5">Switch client</p>
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedClientId(c.id); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm hover:bg-[color:var(--card-2)] text-left"
                >
                  <Avatar name={c.name} size={22} />
                  <span className="flex-1 truncate">{c.name}</span>
                  {c.id === selected.id && <Check size={15} className="text-accent" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RoleSwitcher() {
  const { role, setRole } = useAuth();
  return (
    <div className="hidden md:flex items-center gap-1 glass-2 hairline border rounded-full p-1">
      {Object.entries(ROLE_META).map(([key, m]) => (
        <button
          key={key}
          onClick={() => setRole(key)}
          className={cx("px-2.5 py-1 rounded-full text-xs font-semibold transition-colors", role === key ? "text-white" : "text-muted hover:text-[color:var(--text)]")}
          style={role === key ? { background: m.c } : undefined}
          title={m.desc}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export default function AppShell({ children }) {
  const { theme, toggle } = useTheme();
  const { logout } = useAuth();
  const user = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarInner = (
    <div className="flex flex-col h-full gap-6 p-4">
      <div className="pt-2"><Brand /></div>
      <NavLinks onNavigate={() => setMobileOpen(false)} />
      <div className="mt-auto glass-2 hairline border rounded-2xl p-3 flex items-center gap-3">
        <Avatar name={user.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{user.name}</p>
          <p className="text-xs text-muted capitalize">{ROLE_META[user.role]?.label}</p>
        </div>
        <button onClick={logout} className="p-1.5 rounded-lg text-muted hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]" title="Sign out"><LogOut size={16} /></button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* desktop sidebar */}
      <aside className="hidden lg:flex w-[252px] shrink-0 sticky top-0 h-screen">
        <div className="m-3 mr-0 glass w-full">{SidebarInner}</div>
      </aside>

      {/* mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute left-0 top-0 h-full w-[260px] glass rounded-r-2xl"
            >
              {SidebarInner}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-6 py-3 border-b hairline" style={{ background: "var(--bg)" }}>
          <button className="lg:hidden p-2 -ml-2 text-muted" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
          <ClientSwitcher />
          <div className="ml-auto flex items-center gap-2">
            <RoleSwitcher />
            <button onClick={toggle} className="p-2 rounded-full glass-2 hairline border text-muted hover:text-[color:var(--text)]" title="Toggle theme">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Avatar name={user.name} size={34} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 max-w-[1280px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
