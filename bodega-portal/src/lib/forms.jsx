// Small form primitives shared by the editor modals — styled to match the
// portal's editorial UI (input-glass, eyebrow labels).
import { cx } from "./ui.jsx";

export function Field({ label, hint, className, children }) {
  return (
    <label className={cx("flex flex-col gap-1.5", className)}>
      {label && <span className="eyebrow !text-[10px]">{label}</span>}
      {children}
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }) {
  return <input {...props} className={cx("input-glass", className)} />;
}

export function Textarea({ className, rows = 3, ...props }) {
  return <textarea rows={rows} {...props} className={cx("input-glass resize-none", className)} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select {...props} className={cx("input-glass appearance-none cursor-pointer", className)}>
      {children}
    </select>
  );
}

// Array <-> comma-separated string helpers for tag-like fields.
export const toList = (s) => (s || "").split(",").map((x) => x.trim()).filter(Boolean);
export const fromList = (a) => (Array.isArray(a) ? a.join(", ") : a || "");
