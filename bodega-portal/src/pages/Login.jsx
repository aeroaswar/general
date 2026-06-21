import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, ArrowUpRight, Shield, Users, Lock } from "lucide-react";
import { useAuth } from "../store.jsx";
import { ROLE_META } from "../lib/status.js";
import { Button, cx } from "../lib/ui.jsx";

const ROLE_ICON = { admin: Shield, team: Users, client: Lock };
const ROLE_HINT = {
  admin: "Aero Aswar · every client, project & report",
  team: "Rizky Ananda · assigned projects & content",
  client: "Maya Putri · review & approve Maktour",
};

const EASE = [0.16, 1, 0.3, 1];
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function Login() {
  const { loginAs } = useAuth();
  const [, navigate] = useLocation();
  const [role, setRole] = useState("admin");

  const signIn = () => { loginAs(role); navigate("/app"); };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* ── left: signature dark brand panel — mirrors the marketing site's closing panel ── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden" style={{ background: "#100d09", color: "#efe8dc" }}>
        {/* grid paper */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.16, backgroundImage: "linear-gradient(to right,rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
        {/* film grain */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.06, mixBlendMode: "overlay", backgroundImage: NOISE }} />
        {/* warm ember glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(60% 50% at 86% -10%, rgba(232,116,59,.22), transparent 60%)" }} />

        <a href="/" className="relative z-10 inline-flex items-center gap-1.5 text-sm w-fit transition-colors" style={{ color: "rgba(239,232,220,.6)" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#efe8dc")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(239,232,220,.6)")}>
          <ArrowLeft size={14} /> Back to bodega.com
        </a>

        <div className="relative z-10">
          <span className="brand-logo" style={{ height: 56, width: 200, filter: "invert(1)" }} role="img" aria-label="bodega" />
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="display mt-8 max-w-md" style={{ fontSize: 44, lineHeight: 1.04 }}>
            The workspace your<br />brand actually opens.
          </motion.h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: "rgba(239,232,220,.65)" }}>
            One workflow, end to end — Client → Project → Framework → Content → Approval → Schedule → Report.
          </p>
          <div className="flex flex-wrap gap-2 mt-6">
            {["Content pipeline", "Client approvals", "Live reports"].map((t) => (
              <span key={t} className="mono text-[11px] px-2.5 py-1 rounded-full" style={{ color: "rgba(239,232,220,.7)", border: "1px solid rgba(239,232,220,.18)" }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <p className="text-sm" style={{ color: "rgba(239,232,220,.45)" }}>© 2026 Bodega Creative Studio · Jakarta</p>
          <span className="mono text-[10px]" style={{ color: "rgba(239,232,220,.5)" }}>bodega® · client portal</span>
        </div>
      </div>

      {/* ── right: editorial sign-in ── */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="w-full max-w-md">
          {/* mobile brand + back */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <a href="/" aria-label="bodega — home"><span className="brand-logo" style={{ height: 22, width: 84 }} /></a>
            <a href="/" className="inline-flex items-center gap-1.5 text-xs text-faint hover:text-[color:var(--text)] transition-colors"><ArrowLeft size={13} /> Main site</a>
          </div>

          <p className="eyebrow flex items-center gap-2">
            <span className="inline-block w-5 h-px" style={{ background: "var(--accent)" }} /> Client access
          </p>
          <h2 className="display mt-3" style={{ fontSize: 40, lineHeight: 1.0 }}>
            Sign in to your <span className="italic" style={{ color: "var(--accent)" }}>studio.</span>
          </h2>
          <p className="text-muted text-[15px] mt-3">Choose how you'd like to enter the demo portal.</p>

          <div className="flex flex-col gap-2.5 mt-7">
            {Object.entries(ROLE_META).map(([key, m]) => {
              const Icon = ROLE_ICON[key];
              const active = role === key;
              return (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={cx("flex items-center gap-3 p-3 rounded-2xl border text-left transition-all", active ? "border-transparent" : "hairline hover:border-[color:var(--line-2)]")}
                  style={active ? { background: m.c + "1f", borderColor: m.c + "88" } : { background: "var(--card)" }}
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
          <p className="text-center text-xs text-faint mt-3">Demo only · no password required · data is in-memory</p>

          {/* sign-up path → marketing contact (the portal has no self-serve registration) */}
          <div className="flex items-center gap-3 mt-8 mb-4">
            <span className="h-px flex-1" style={{ background: "var(--line)" }} />
            <span className="eyebrow !text-[10px]">New to Bodega?</span>
            <span className="h-px flex-1" style={{ background: "var(--line)" }} />
          </div>
          <a href="/#contact" className="group flex items-center justify-between gap-3 p-4 rounded-2xl hairline border transition-all hover:border-[color:var(--line-2)]" style={{ background: "var(--card)" }}>
            <span className="min-w-0">
              <span className="block font-semibold">Start a project with us</span>
              <span className="block text-xs text-muted">Tell us about your brand — we'll set you up with a portal.</span>
            </span>
            <ArrowUpRight size={18} className="text-muted group-hover:text-[color:var(--text)] transition-colors shrink-0" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}
