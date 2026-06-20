import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Users, Lock } from "lucide-react";
import { useAuth } from "../store.jsx";
import { ROLE_META } from "../lib/status.js";
import { Button, cx } from "../lib/ui.jsx";

const ROLE_ICON = { admin: Shield, team: Users, client: Lock };
const ROLE_HINT = {
  admin: "Aero Aswar · every client, project & report",
  team: "Rizky Ananda · assigned projects & content",
  client: "Maya Putri · review & approve Maktour",
};

export default function Login() {
  const { loginAs } = useAuth();
  const [, navigate] = useLocation();
  const [role, setRole] = useState("admin");

  const signIn = () => { loginAs(role); navigate("/app"); };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: "linear-gradient(135deg,#45e6c6,#37b9ff)", boxShadow: "0 0 16px 2px rgba(52,224,196,.7)" }} />
          <span className="display text-2xl font-extrabold">bodega</span>
        </div>
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="display text-5xl font-extrabold leading-[1.02]">
            The client <span className="grad-text">portal.</span>
          </motion.h1>
          <p className="text-muted mt-4 max-w-md text-lg">
            One workflow, end to end — Client → Project → Framework → Content → Approval → Schedule → Report.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Content pipeline", "Client approvals", "Live reports"].map((t) => (
              <span key={t} className="chip" style={{ color: "var(--muted)" }}>{t}</span>
            ))}
          </div>
        </div>
        <p className="text-faint text-sm">© 2026 Bodega Creative Studio · Jakarta</p>
      </div>

      {/* right login card */}
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="glass w-full max-w-md p-7">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: "linear-gradient(135deg,#45e6c6,#37b9ff)" }} />
            <span className="display text-xl font-extrabold">bodega</span>
          </div>
          <h2 className="display text-2xl font-bold">Sign in</h2>
          <p className="text-muted text-sm mt-1">Pick a role to explore the demo portal.</p>

          <div className="flex flex-col gap-2.5 mt-6">
            {Object.entries(ROLE_META).map(([key, m]) => {
              const Icon = ROLE_ICON[key];
              const active = role === key;
              return (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={cx("flex items-center gap-3 p-3 rounded-2xl border text-left transition-all", active ? "border-transparent" : "hairline hover:border-[color:var(--line-2)]")}
                  style={active ? { background: m.c + "1f", borderColor: m.c + "88" } : { background: "var(--glass-2)" }}
                >
                  <span className="w-10 h-10 grid place-items-center rounded-xl shrink-0" style={{ background: m.c + "22", color: m.c }}><Icon size={18} /></span>
                  <span className="flex-1 min-w-0">
                    <span className="block font-semibold">{m.label}</span>
                    <span className="block text-xs text-muted truncate">{ROLE_HINT[key]}</span>
                  </span>
                  <span className={cx("w-4 h-4 rounded-full border-2", active ? "" : "border-[color:var(--line-2)]")} style={active ? { background: m.c, borderColor: m.c } : undefined} />
                </button>
              );
            })}
          </div>

          <Button size="lg" className="w-full mt-6" onClick={signIn}>
            Enter portal <ArrowRight size={18} />
          </Button>
          <p className="text-center text-xs text-faint mt-4">Demo only · no password required · data is in-memory</p>
        </motion.div>
      </div>
    </div>
  );
}
