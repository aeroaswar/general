import { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, LogOut, RotateCcw, Bell } from "lucide-react";
import { useAuth, useCurrentUser, useData, useTheme } from "../store.jsx";
import { ROLE_META } from "../lib/status.js";
import { Card, Button, Avatar, Badge, PageTitle, cx, fadeUp } from "../lib/ui.jsx";

export default function Settings() {
  const me = useCurrentUser();
  const { logout } = useAuth();
  const { theme, set } = useTheme();
  const { users } = useData();
  const [notif, setNotif] = useState({ approvals: true, comments: true, schedule: false, reports: true });

  const resetDemo = () => { localStorage.clear(); location.reload(); };

  return (
    <motion.div {...fadeUp}>
      <PageTitle kicker="Workspace" title="Settings" />

      <div className="grid lg:grid-cols-2 gap-4">
        {/* profile */}
        <Card>
          <h3 className="display font-bold mb-4">Profile</h3>
          <div className="flex items-center gap-4">
            <Avatar name={me.name} size={56} />
            <div>
              <p className="font-semibold text-lg">{me.name}</p>
              <p className="text-sm text-muted">{me.email}</p>
              <Badge color={ROLE_META[me.role]?.c} className="mt-1.5">{ROLE_META[me.role]?.label}</Badge>
            </div>
          </div>
        </Card>

        {/* appearance */}
        <Card>
          <h3 className="display font-bold mb-4">Appearance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ k: "light", icon: Sun, label: "Light" }, { k: "dark", icon: Moon, label: "Dark" }].map(({ k, icon: Icon, label }) => (
              <button key={k} onClick={() => set(k)} className={cx("flex items-center gap-3 p-4 rounded-2xl border transition-all", theme === k ? "border-transparent" : "hairline hover:border-[color:var(--line-2)]")} style={theme === k ? { background: "#2562e71a", borderColor: "#2562e788" } : { background: "var(--card-2)" }}>
                <Icon size={20} style={theme === k ? { color: "#2562e7" } : undefined} />
                <span className="font-semibold">{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-faint mt-3">Bodega's brand runs light — dark is available for late nights.</p>
        </Card>

        {/* notifications */}
        <Card>
          <h3 className="display font-bold mb-4 flex items-center gap-2"><Bell size={17} className="text-accent" /> Notifications</h3>
          <div className="flex flex-col">
            {[["approvals", "Approval requests & decisions"], ["comments", "New comments"], ["schedule", "Schedule changes"], ["reports", "Report exports"]].map(([k, label]) => (
              <label key={k} className="flex items-center justify-between py-3 border-b hairline last:border-0 cursor-pointer">
                <span className="text-sm">{label}</span>
                <Toggle on={notif[k]} onClick={() => setNotif((n) => ({ ...n, [k]: !n[k] }))} />
              </label>
            ))}
          </div>
        </Card>

        {/* members */}
        <Card>
          <h3 className="display font-bold mb-4">Workspace members</h3>
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <Avatar name={u.name} size={34} />
                <div className="min-w-0 flex-1"><p className="text-sm font-medium truncate">{u.name}</p><p className="text-xs text-muted truncate">{u.email}</p></div>
                <Badge color={ROLE_META[u.role]?.c}>{ROLE_META[u.role]?.label}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* danger / session */}
      <Card className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Session & demo data</p>
          <p className="text-sm text-muted">Reset clears local changes and returns to a fresh demo.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={resetDemo}><RotateCcw size={16} /> Reset demo</Button>
          <Button variant="danger" onClick={logout}><LogOut size={16} /> Sign out</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function Toggle({ on, onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-11 h-6 rounded-full p-0.5 transition-colors shrink-0" style={{ background: on ? "#2562e7" : "var(--line-2)" }}>
      <span className="block w-5 h-5 rounded-full bg-white transition-transform" style={{ transform: on ? "translateX(20px)" : "none" }} />
    </button>
  );
}
