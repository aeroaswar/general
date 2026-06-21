import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { STATUS_META, PLATFORM_META, initials } from "./status.js";

export const cx = clsx;

export function Button({ variant = "accent", size = "md", className, children, ...rest }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none";
  const sizes = { sm: "text-xs px-3 py-1.5", md: "text-sm px-4 py-2", lg: "text-[15px] px-5 py-2.5" };
  const variants = {
    accent: "text-[color:var(--bg)] bg-[color:var(--text)] border-transparent hover:opacity-90",
    orange: "text-white bg-[#e8743b] border-transparent hover:opacity-90",
    ghost: "glass-2 hairline border text-[color:var(--text)] hover:border-[color:var(--line-2)]",
    subtle: "text-[color:var(--muted)] hover:text-[color:var(--text)] hover:bg-[color:var(--card-2)]",
    danger: "text-white bg-[#d6336c] border-transparent hover:opacity-90",
  };
  return (
    <button className={cx(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function Card({ className, children, hover = false, ...rest }) {
  return (
    <div className={cx("glass p-5", hover && "transition-colors hover:border-[color:var(--line-2)]", className)} {...rest}>
      {children}
    </div>
  );
}

export function Badge({ color = "#9aa7bd", children, dot = true, className }) {
  return (
    <span className={cx("chip", className)} style={{ color }}>
      {dot && <i className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      <span style={{ color: "var(--text)" }}>{children}</span>
    </span>
  );
}

export function StatusBadge({ status }) {
  const m = STATUS_META[status] || { c: "#9aa7bd", label: status };
  return (
    <span className="chip" style={{ color: m.c, borderColor: m.c + "55", background: m.c + "1a" }}>
      <i className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: m.c }} />
      {m.label}
    </span>
  );
}

export function PlatformTag({ platform }) {
  const c = PLATFORM_META[platform] || "#9aa7bd";
  return <span className="chip" style={{ color: c }}><i className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: c }} />{platform}</span>;
}

// neutral monogram (rounded square) — understated on the dark editorial UI
export function Avatar({ name = "", size = 32 }) {
  return (
    <span
      className="inline-grid place-items-center rounded-md font-mono font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36, background: "var(--card-2)", border: "1px solid var(--line)", color: "var(--text)" }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

export function Progress({ value = 0, color = "linear-gradient(90deg,#e8743b,#f0a35e)" }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}

export function Stat({ label, value, sub, icon: Icon, accent = "#e8743b" }) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        {Icon && <Icon size={18} style={{ color: accent }} />}
      </div>
      <div className="display text-4xl font-semibold grad-text">{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </Card>
  );
}

export function PageTitle({ kicker, title, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        {kicker && <p className="eyebrow mb-2">{kicker}</p>}
        <h1 className="display text-3xl md:text-4xl font-semibold tracking-[-0.01em]">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="glass p-10 text-center flex flex-col items-center gap-3">
      {Icon && <Icon size={26} className="text-faint" />}
      <p className="display text-lg font-semibold">{title}</p>
      {sub && <p className="text-sm text-muted max-w-sm">{sub}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, width = 560 }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            className="glass relative w-full max-h-[88vh] overflow-auto no-scrollbar"
            style={{ maxWidth: width }}
            initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <div className="flex items-center justify-between p-5 border-b hairline sticky top-0 glass z-10">
              <h3 className="display font-semibold text-xl">{title}</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[color:var(--card-2)] text-muted"><X size={18} /></button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};
