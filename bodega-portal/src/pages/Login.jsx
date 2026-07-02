import { motion } from "framer-motion";
import { ShieldCheck, Users, Eye } from "lucide-react";
import { ROLE_META } from "../status.js";
import { useAuth } from "../store.jsx";

const ICONS = { admin: ShieldCheck, team: Users, client: Eye };

export default function Login() {
  const { loginAs } = useAuth();
  return (
    <div className="min-h-full grid place-items-center p-6">
      <div className="brand-bg" />
      <div className="brand-grain" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass p-8 w-full max-w-md"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="display text-2xl font-semibold tracking-tight">bodega</span>
          <span className="eyebrow mt-1.5">Studio OS</span>
        </div>
        <p className="text-sm text-muted mb-7">
          One pipeline for every client engagement — brief, content, approval, schedule, report, billing.
        </p>
        <p className="eyebrow mb-3">Sign in as</p>
        <div className="flex flex-col gap-2.5">
          {Object.entries(ROLE_META).map(([role, m]) => {
            const Icon = ICONS[role];
            return (
              <button
                key={role}
                onClick={() => loginAs(role)}
                className="glass-2 hairline border rounded-brand flex items-center gap-3 px-4 py-3 text-left transition-colors hover:border-[color:var(--line-2)]"
              >
                <span className="w-9 h-9 rounded-lg grid place-items-center" style={{ background: m.c + "22", color: m.c }}>
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block font-semibold text-sm">{m.label}</span>
                  <span className="block text-xs text-muted">{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-faint mt-6">Demo build — data lives in your browser (localStorage), no backend.</p>
      </motion.div>
    </div>
  );
}
