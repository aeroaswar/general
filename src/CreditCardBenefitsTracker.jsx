import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Check,
  X,
  Share2,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Trash2,
  Pencil,
  Calendar,
  Users,
  ArrowRightLeft,
  Wallet,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  RefreshCw,
} from "lucide-react";

/* =====================================================================================
 * Card Perks — a premium, shareable credit-card benefits tracker
 * -------------------------------------------------------------------------------------
 * Single self-contained React artifact. Default-exported component below.
 *
 * Persistence uses the artifact `window.storage` key-value API (NOT localStorage):
 *   - space data (cards + check-offs)  -> shared: true, keyed by space code
 *   - active space code + user name    -> shared: false (personal)
 * Every read is wrapped in try/catch AND raced against a ~1.5s timeout so a missing or
 * slow storage bridge can never hang first render. When `window.storage` is unavailable
 * (e.g. local dev) it transparently falls back to localStorage / in-memory.
 *
 * Tailwind: ONLY core utility classes are used (the artifact env has no compiler).
 * Exact values (overlay opacity, gradients, accent fills, custom heights) use inline
 * `style`. lucide-react supplies the icons.
 * ===================================================================================== */

/* ----------------------------------- constants ------------------------------------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CADENCES = [
  { id: "monthly", label: "Monthly", per: 12 },
  { id: "quarterly", label: "Quarterly", per: 4 },
  { id: "semiannual", label: "Semi-annual", per: 2 },
  { id: "annual", label: "Annual", per: 1 },
  { id: "custom", label: "Custom — N / year", per: 0 },
  { id: "perk", label: "Perk (info only)", per: 0 },
];
const CADENCE_PER = { monthly: 12, quarterly: 4, semiannual: 2, annual: 1, perk: 0 };
const CADENCE_LABEL = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  semiannual: "Semi-annual",
  annual: "Annual",
  custom: "Custom",
  perk: "Perk",
};

const CURRENCIES = ["IDR", "USD", "SGD", "EUR", "GBP", "AUD", "JPY", "MYR"];

const APP_ACCENT = "#1f2430"; // graphite chrome accent (FAB, etc.)

// Built-in templates (researched, current-ish — VERIFY amounts; card terms change).
const CARD_TEMPLATES = [
  {
    tid: "mandiri-prioritas",
    name: "Mandiri Prioritas",
    network: "Mastercard World Elite",
    issuer: "Mandiri",
    accent: "#1E3A5F",
    currency: "IDR",
    annualFee: 3500000,
    resetType: "anniversary",
    benefits: [
      { name: "Airport Lounge Access", value: 0, cadence: "perk", note: "Priority Pass / DragonPass — domestic & international" },
      { name: "Complimentary Golf", value: 4000000, cadence: "quarterly", note: "Green fees at select courses — verify rounds" },
      { name: "Dedicated Relationship Manager", value: 0, cadence: "perk", note: "Banking & lifestyle concierge" },
      { name: "Preferential FX Rates", value: 0, cadence: "perk", note: "Competitive foreign-exchange rates" },
    ],
  },
  {
    tid: "mandiri-marriott",
    name: "Mandiri Marriott Bonvoy",
    network: "Mastercard",
    issuer: "Mandiri",
    accent: "#7A1F2B",
    currency: "IDR",
    annualFee: 750000,
    resetType: "anniversary",
    benefits: [
      { name: "Annual Free Night Award", value: 3000000, cadence: "annual", note: "Redemption ≤ 35,000 points — after spend milestone" },
      { name: "15 Elite Night Credits", value: 0, cadence: "perk", note: "Toward Marriott Bonvoy status each year" },
      { name: "Silver / Gold Elite Status", value: 0, cadence: "perk", note: "Auto Silver; fast-track Gold" },
      { name: "Welcome 5,000 Points", value: 0, cadence: "perk", note: "On first transaction (one-time)" },
    ],
  },
  {
    tid: "ocbc-voyage",
    name: "OCBC VOYAGE",
    network: "Visa Infinite (Metal)",
    issuer: "OCBC",
    accent: "#C8102E",
    currency: "IDR",
    annualFee: 8000000,
    resetType: "anniversary",
    benefits: [
      { name: "Unlimited Lounge Access", value: 0, cadence: "perk", note: "Plaza Premium / Sapphire & partners" },
      { name: "Airport Limousine Transfer", value: 2400000, cadence: "semiannual", note: "Subject to min. spend — verify entitlement" },
      { name: "24/7 Personal Concierge", value: 0, cadence: "perk", note: "Travel & lifestyle concierge" },
      { name: "Voyage Miles Never Expire", value: 0, cadence: "perk", note: "1:1 transfer to KrisFlyer / GarudaMiles" },
    ],
  },
  {
    tid: "bca-krisflyer",
    name: "BCA KrisFlyer",
    network: "Visa Infinite",
    issuer: "BCA",
    accent: "#0A5BA6",
    currency: "IDR",
    annualFee: 750000,
    resetType: "anniversary",
    benefits: [
      { name: "Airport Starbucks Treat", value: 720000, cadence: "monthly", note: "Complimentary beverage at airport outlets — verify terms" },
      { name: '"Pay 1 For 2" Dining', value: 0, cadence: "perk", note: "5-star hotel & restaurant promos" },
      { name: "Lounge / SilverKris Access", value: 0, cadence: "perk", note: "Via Visa Infinite — verify" },
    ],
  },
  {
    tid: "uob-prvi",
    name: "UOB PRVI Miles",
    network: "Visa Signature",
    issuer: "UOB",
    accent: "#0F4C81",
    currency: "IDR",
    annualFee: 1000000,
    resetType: "anniversary",
    benefits: [
      { name: "Airport Lounge Access", value: 1500000, cadence: "custom", count: 2, note: "2 visits / year via Priority Pass" },
      { name: "Travel Insurance", value: 0, cadence: "perk", note: "Coverage up to IDR 25B" },
      { name: "Flexible Miles Transfer", value: 0, cadence: "perk", note: "KrisFlyer / GarudaMiles / Asia Miles / AirAsia" },
    ],
  },
];

const DEFAULT_ACCENTS = ["#1E3A5F", "#7A1F2B", "#C8102E", "#0A5BA6", "#0F4C81", "#2F6B4F", "#6B3FA0", "#B45309"];

/* ------------------------------------- utils --------------------------------------- */

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function genCode() {
  const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let s = "";
  for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}

function clampCadence(c) {
  return c === "custom" || CADENCE_PER[c] !== undefined ? c : "perk";
}

function clampCount(n) {
  const v = Math.round(Number(n) || 0);
  return Math.max(1, Math.min(60, v || 1));
}

// uses-per-year for a benefit (custom benefits carry an explicit count)
function benefitPer(b) {
  if (b.cadence === "custom") return clampCount(b.count);
  return CADENCE_PER[b.cadence] || 0;
}

function fmtMoney(amount, currency) {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency || ""} ${Math.round(n).toLocaleString()}`.trim();
  }
}

function fmtDate(d) {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (isNaN(dt)) return "";
  return dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function fmtWhen(at) {
  if (!at) return "";
  const d = new Date(at);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return "today";
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return "yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function range(n) {
  return Array.from({ length: n }, (_, i) => i);
}

/* ------------------------------- storage (safe) ------------------------------------ */

const MEM = {};
const STORE_TIMEOUT = 1500;

function hasWinStorage() {
  return typeof window !== "undefined" && window.storage && typeof window.storage.getItem === "function";
}

function withTimeout(promise, ms) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => setTimeout(() => reject(new Error("storage-timeout")), ms)),
  ]);
}

function scopedKey(shared, key) {
  return `${shared ? "shared" : "self"}::${key}`;
}

async function storageGet(key, shared) {
  // 1) artifact bridge (raced against timeout, fully guarded)
  if (hasWinStorage()) {
    try {
      const v = await withTimeout(window.storage.getItem(key, { shared }), STORE_TIMEOUT);
      if (v !== undefined && v !== null) return v;
    } catch {
      /* fall through to local fallbacks */
    }
  }
  // 2) localStorage fallback (local dev)
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(scopedKey(shared, key));
      if (raw != null) return JSON.parse(raw);
    }
  } catch {
    /* ignore */
  }
  // 3) in-memory
  return key in MEM ? MEM[key] : null;
}

async function storageSet(key, value, shared) {
  MEM[key] = value;
  if (hasWinStorage()) {
    try {
      await withTimeout(window.storage.setItem(key, value, { shared }), STORE_TIMEOUT);
    } catch {
      /* fall through to also persist locally */
    }
  }
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(scopedKey(shared, key), JSON.stringify(value));
    }
  } catch {
    /* ignore */
  }
}

const _timers = {};
function scheduleWrite(key, value, shared) {
  clearTimeout(_timers[key]);
  _timers[key] = setTimeout(() => storageSet(key, value, shared), 250);
}

const K = {
  user: "ccbt:v1:user",
  active: "ccbt:v1:active",
  cards: (code) => `ccbt:v1:sp:${code}:cards`,
  checks: (code) => `ccbt:v1:sp:${code}:checks`,
};

/* ---------------------------- domain / period helpers ------------------------------ */

function seedCards() {
  return CARD_TEMPLATES.map(cardFromTemplate);
}

function cardFromTemplate(t) {
  return {
    id: uid(),
    name: t.name,
    network: t.network || "",
    issuer: t.issuer || "",
    accent: t.accent || DEFAULT_ACCENTS[0],
    currency: t.currency || "USD",
    annualFee: Number(t.annualFee) || 0,
    resetType: t.resetType === "anniversary" ? "anniversary" : "calendar",
    resetDate: t.resetDate || null,
    verifyAI: !!t.verifyAI,
    benefits: (t.benefits || []).map((b) => ({
      id: uid(),
      name: b.name || "Benefit",
      value: Number(b.value) || 0,
      cadence: clampCadence(b.cadence),
      count: clampCount(b.count),
      note: b.note || "",
    })),
  };
}

// Resolve the active annual cycle for a card (anchored to its reset date).
function getAnnualCycle(card, now) {
  if (card.resetType === "anniversary" && card.resetDate) {
    const d = new Date(card.resetDate);
    if (!isNaN(d)) {
      const m = d.getMonth();
      const day = d.getDate();
      let start = new Date(now.getFullYear(), m, day);
      if (start > now) start = new Date(now.getFullYear() - 1, m, day);
      const renews = new Date(start.getFullYear() + 1, m, day);
      return { key: `cyc:${start.getFullYear()}-${m + 1}-${day}`, start, renews, hasDate: true };
    }
  }
  const year = now.getFullYear();
  return {
    key: `${year}`,
    start: new Date(year, 0, 1),
    renews: new Date(year + 1, 0, 1),
    hasDate: card.resetType !== "anniversary", // calendar always "has" a date; anniversary w/o date does not
  };
}

// All check-off periods for a benefit in its CURRENT cycle, plus the current one.
// Each cell carries `now: true` when it is claimable right now.
function periodsFor(card, benefit, now) {
  const y = now.getFullYear();
  const cad = benefit.cadence;
  if (cad === "monthly") {
    const m = now.getMonth();
    return {
      per: 12,
      current: { key: `${y}-M${m + 1}`, label: MONTHS[m] },
      all: range(12).map((i) => ({ key: `${y}-M${i + 1}`, label: MONTHS[i], current: i === m, now: i === m })),
    };
  }
  if (cad === "quarterly") {
    const q = Math.floor(now.getMonth() / 3);
    return {
      per: 4,
      current: { key: `${y}-Q${q + 1}`, label: `Q${q + 1}` },
      all: range(4).map((i) => ({ key: `${y}-Q${i + 1}`, label: `Q${i + 1}`, current: i === q, now: i === q })),
    };
  }
  if (cad === "semiannual") {
    const h = now.getMonth() < 6 ? 0 : 1;
    return {
      per: 2,
      current: { key: `${y}-H${h + 1}`, label: h === 0 ? "H1" : "H2" },
      all: range(2).map((i) => ({ key: `${y}-H${i + 1}`, label: i === 0 ? "Jan–Jun" : "Jul–Dec", current: i === h, now: i === h })),
    };
  }
  if (cad === "annual") {
    const c = getAnnualCycle(card, now);
    const cell = { key: c.key, label: "Annual", current: true, now: true, renews: c.renews, hasDate: c.hasDate };
    return { per: 1, current: { ...cell, label: "This cycle" }, all: [cell] };
  }
  if (cad === "custom") {
    // N independent uses across the annual cycle — all claimable now.
    const c = getAnnualCycle(card, now);
    const n = benefitPer(benefit);
    const all = range(n).map((i) => ({ key: `${c.key}-U${i + 1}`, label: `#${i + 1}`, current: false, now: true, renews: c.renews, hasDate: c.hasDate }));
    return { per: n, current: { key: c.key, label: "This cycle", renews: c.renews, hasDate: c.hasDate }, all, custom: true };
  }
  return { per: 0, current: null, all: [] }; // perk
}

// When the current claim window closes (used for "expiring soon").
function periodEnd(card, benefit, now) {
  const cad = benefit.cadence;
  const y = now.getFullYear();
  if (cad === "monthly") return new Date(y, now.getMonth() + 1, 0, 23, 59, 59);
  if (cad === "quarterly") {
    const q = Math.floor(now.getMonth() / 3);
    return new Date(y, q * 3 + 3, 0, 23, 59, 59);
  }
  if (cad === "semiannual") {
    const h = now.getMonth() < 6 ? 0 : 1;
    return new Date(y, h * 6 + 6, 0, 23, 59, 59);
  }
  if (cad === "annual" || cad === "custom") {
    const c = getAnnualCycle(card, now);
    return new Date(c.renews.getTime() - 1000);
  }
  return null;
}

function daysUntil(end, now) {
  if (!end) return null;
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

function instanceKey(cardId, benefitId, periodKey) {
  return `${cardId}::${benefitId}::${periodKey}`;
}

function isChecked(checks, key) {
  const e = checks[key];
  return !!e && !e.removed;
}

function perPeriodValue(benefit) {
  const per = benefitPer(benefit);
  return per > 0 ? (Number(benefit.value) || 0) / per : 0;
}

function mergeChecks(local, remote) {
  const out = { ...local };
  let changed = false;
  for (const key of Object.keys(remote || {})) {
    const r = remote[key];
    const l = out[key];
    if (!l || (r && (r.at || 0) > (l.at || 0))) {
      out[key] = r;
      changed = true;
    }
  }
  return changed ? out : local;
}

/* ----------------------------- derived: to-do + stats ------------------------------ */

function buildTodo(cards, checks, now) {
  const active = [];
  const done = [];
  for (const card of cards) {
    for (const b of card.benefits) {
      if (b.cadence === "perk") continue;
      const p = periodsFor(card, b, now);
      const nowCells = p.all.filter((c) => c.now);
      if (nowCells.length === 0) continue;
      const unclaimed = nowCells.filter((c) => !isChecked(checks, instanceKey(card.id, b.id, c.key)));
      const claimedN = nowCells.length - unclaimed.length;
      const multi = !!p.custom && nowCells.length > 1;
      const dleft = daysUntil(periodEnd(card, b, now), now);

      if (unclaimed.length > 0) {
        active.push({
          card,
          benefit: b,
          key: instanceKey(card.id, b.id, unclaimed[0].key),
          label: multi ? `${claimedN}/${nowCells.length} used` : p.current?.label || nowCells[0].label,
          daysLeft: dleft,
          multi,
          total: nowCells.length,
        });
      } else {
        // every "now" use claimed -> done; attribute to the most recent
        let last = null;
        let lastKey = null;
        for (const c of nowCells) {
          const k = instanceKey(card.id, b.id, c.key);
          const e = checks[k];
          if (e && (!last || (e.at || 0) > (last.at || 0))) {
            last = e;
            lastKey = k;
          }
        }
        done.push({
          card,
          benefit: b,
          key: lastKey,
          label: multi ? `${nowCells.length}/${nowCells.length} used` : p.current?.label || nowCells[0].label,
          multi,
          total: nowCells.length,
          entry: last,
        });
      }
    }
  }
  active.sort((x, z) => {
    const dx = x.daysLeft == null ? 9999 : x.daysLeft;
    const dz = z.daysLeft == null ? 9999 : z.daysLeft;
    if (dx !== dz) return dx - dz;
    return perPeriodValue(z.benefit) - perPeriodValue(x.benefit);
  });
  done.sort((x, z) => (z.entry?.at || 0) - (x.entry?.at || 0));
  return { active, done };
}

function buildStats(cards, checks, now) {
  // grouped by currency
  const map = {};
  const ensure = (cur) =>
    (map[cur] = map[cur] || { currency: cur, available: 0, captured: 0, potential: 0, fees: 0, atRisk: 0 });
  for (const card of cards) {
    const cur = card.currency || "USD";
    const g = ensure(cur);
    g.fees += Number(card.annualFee) || 0;
    for (const b of card.benefits) {
      if (b.cadence === "perk") continue;
      g.potential += Number(b.value) || 0;
      const ppv = perPeriodValue(b);
      const p = periodsFor(card, b, now);
      const dleft = daysUntil(periodEnd(card, b, now), now);
      for (const cell of p.all) {
        const checked = isChecked(checks, instanceKey(card.id, b.id, cell.key));
        if (checked) g.captured += ppv; // captured this cycle
        if (cell.now && !checked) {
          g.available += ppv; // claimable right now
          if (dleft != null && dleft <= 30) g.atRisk += ppv; // closing within 30 days
        }
      }
    }
  }
  const groups = Object.values(map);
  for (const g of groups) g.net = g.captured - g.fees;
  groups.sort((a, b) => b.potential - a.potential || b.fees - a.fees);
  return groups;
}

function cardEconomics(card, checks, now) {
  let captured = 0;
  let potential = 0;
  for (const b of card.benefits) {
    if (b.cadence === "perk") continue;
    potential += Number(b.value) || 0;
    const ppv = perPeriodValue(b);
    for (const cell of periodsFor(card, b, now).all) {
      if (isChecked(checks, instanceKey(card.id, b.id, cell.key))) captured += ppv;
    }
  }
  const fee = Number(card.annualFee) || 0;
  const net = captured - fee;
  let verdict;
  if (fee <= 0) verdict = { label: "No fee", color: "#15803d", bg: "#dcfce7" };
  else if (captured >= fee) verdict = { label: "Worth it", color: "#15803d", bg: "#dcfce7" };
  else if (potential >= fee) verdict = { label: "On track", color: "#b45309", bg: "#fef3c7" };
  else verdict = { label: "Below fee", color: "#b91c1c", bg: "#fee2e2" };
  return { captured, potential, fee, net, verdict };
}

/* ===================================== UI bits ===================================== */

function TapCircle({ checked, accent, onClick, size = 28 }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex items-center justify-center rounded-full"
      style={{
        width: 44,
        height: 44,
        WebkitTapHighlightColor: "transparent",
        background: "transparent",
        border: "none",
        cursor: "pointer",
      }}
      aria-pressed={checked}
    >
      <span
        className="flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          border: checked ? `2px solid ${accent}` : "2px solid #d1d5db",
          background: checked ? accent : "transparent",
          transition: "all 140ms ease",
        }}
      >
        {checked && <Check size={size - 12} color="#fff" strokeWidth={3} />}
      </span>
    </button>
  );
}

function Badge({ children, color = "#6b7280", bg = "#f3f4f6" }) {
  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{ color, background: bg, fontSize: 11, padding: "2px 8px", lineHeight: 1.4 }}
    >
      {children}
    </span>
  );
}

function VerifyBadge() {
  return <Badge color="#92400e" bg="#fef3c7">verify</Badge>;
}

function Segmented({ value, onChange, options }) {
  return (
    <div
      className="flex rounded-full"
      style={{ background: "#e9eaee", padding: 4 }}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="flex-1 flex items-center justify-center gap-2 rounded-full font-semibold"
            style={{
              padding: "9px 12px",
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              color: active ? "#111827" : "#6b7280",
              background: active ? "#ffffff" : "transparent",
              boxShadow: active ? "0 1px 2px rgba(0,0,0,0.10)" : "none",
              transition: "all 140ms ease",
            }}
          >
            {o.icon}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Cell({ children, className = "", style }) {
  return (
    <div
      className={`bg-white rounded-2xl ${className}`}
      style={{ boxShadow: "0 1px 3px rgba(16,24,40,0.06), 0 1px 2px rgba(16,24,40,0.04)", ...style }}
    >
      {children}
    </div>
  );
}

function Modal({ open, onClose, children, title, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center sm:items-center" style={{ padding: 0 }}>
      <div
        className="absolute inset-0"
        onClick={onClose}
        style={{ background: "rgba(17,24,39,0.45)", backdropFilter: "blur(2px)" }}
      />
      <div
        className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl"
        style={{ maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 50px rgba(0,0,0,0.30)" }}
      >
        <div className="flex items-center justify-between" style={{ padding: "16px 18px", borderBottom: "1px solid #f0f1f3" }}>
          <h2 className="font-bold text-gray-900" style={{ fontSize: 17 }}>{title}</h2>
          <button onClick={onClose} className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, border: "none", background: "#f3f4f6", cursor: "pointer" }}>
            <X size={18} color="#6b7280" />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: 18 }}>{children}</div>
        {footer && (
          <div style={{ padding: "12px 18px", borderTop: "1px solid #f0f1f3" }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="flex flex-col" style={{ gap: 6, marginBottom: 14 }}>
      <span className="font-semibold text-gray-700" style={{ fontSize: 13 }}>{label}</span>
      {children}
      {hint && <span className="text-gray-400" style={{ fontSize: 12 }}>{hint}</span>}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #e3e5e9",
  borderRadius: 12,
  padding: "10px 12px",
  fontSize: 15,
  outline: "none",
  background: "#fff",
  color: "#111827",
};

function TextInput(props) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange} style={{ ...inputStyle, appearance: "auto" }}>
      {children}
    </select>
  );
}

function PrimaryBtn({ children, onClick, disabled, full, bg = APP_ACCENT }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-full font-semibold ${full ? "w-full" : ""}`}
      style={{
        background: disabled ? "#c7c9cf" : bg,
        color: "#fff",
        border: "none",
        padding: "12px 18px",
        fontSize: 15,
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, onClick, color = "#374151" }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-full font-semibold"
      style={{ background: "#f3f4f6", color, border: "none", padding: "11px 16px", fontSize: 14, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}

/* ===================================== Hero ======================================== */

function Hero({ stats }) {
  const [showAll, setShowAll] = useState(false);
  const primary = stats[0] || { currency: "USD", available: 0, captured: 0, potential: 0, fees: 0, net: 0 };
  const others = stats.slice(1);
  const pct = primary.potential > 0 ? Math.min(100, Math.round((primary.captured / primary.potential) * 100)) : 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(150deg, #30343c 0%, #232730 45%, #14161b 100%)",
        boxShadow: "0 10px 30px rgba(10,12,18,0.35)",
        padding: 20,
        color: "#fff",
      }}
    >
      {/* metal sheen */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0) 62%, rgba(255,255,255,0.05) 100%)",
          pointerEvents: "none",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="font-medium" style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Available to claim now
          </span>
          <Wallet size={16} color="rgba(255,255,255,0.55)" />
        </div>

        <div className="font-bold tracking-tight" style={{ fontSize: 34, marginTop: 6, lineHeight: 1.05 }}>
          {fmtMoney(primary.available, primary.currency)}
        </div>
        {others.length > 0 && (
          <div className="flex flex-wrap gap-2" style={{ marginTop: 8 }}>
            {others.map((g) => (
              <span key={g.currency} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                + {fmtMoney(g.available, g.currency)}
              </span>
            ))}
          </div>
        )}

        {primary.atRisk > 0 && (
          <div
            className="inline-flex items-center gap-1 rounded-full"
            style={{ marginTop: 12, background: "rgba(245,158,11,0.18)", color: "#fcd34d", padding: "5px 11px", fontSize: 12, fontWeight: 600 }}
          >
            <AlertCircle size={13} /> {fmtMoney(primary.atRisk, primary.currency)} expires within 30 days
          </div>
        )}

        {/* progress */}
        <div style={{ marginTop: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              Captured {fmtMoney(primary.captured, primary.currency)} of {fmtMoney(primary.potential, primary.currency)}
            </span>
            <span className="font-semibold" style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{pct}%</span>
          </div>
          <div className="rounded-full" style={{ height: 8, background: "rgba(255,255,255,0.14)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: "linear-gradient(90deg, #5eead4, #34d399)",
                borderRadius: 999,
                transition: "width 360ms ease",
              }}
            />
          </div>
        </div>

        {/* stat tiles */}
        <div className="grid grid-cols-3 gap-2" style={{ marginTop: 16 }}>
          <Stat label="Captured / yr" value={fmtMoney(primary.captured, primary.currency)} />
          <Stat label="Annual potential" value={fmtMoney(primary.potential, primary.currency)} />
          <Stat label="Annual fees" value={fmtMoney(primary.fees, primary.currency)} />
        </div>
        <div className="grid grid-cols-1 gap-2" style={{ marginTop: 8 }}>
          <div
            className="rounded-xl flex items-center justify-between"
            style={{ background: "rgba(255,255,255,0.06)", padding: "10px 12px" }}
          >
            <span style={{ color: "rgba(255,255,255,0.62)", fontSize: 12 }}>Net (captured − fees)</span>
            <span className="font-bold" style={{ fontSize: 15, color: primary.net >= 0 ? "#5eead4" : "#fca5a5" }}>
              {primary.net >= 0 ? "+" : "−"} {fmtMoney(Math.abs(primary.net), primary.currency)}
            </span>
          </div>
        </div>

        {others.length > 0 && (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => setShowAll((s) => !s)}
              className="flex items-center gap-1 font-medium"
              style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", padding: 0 }}
            >
              {showAll ? "Hide" : "Show"} other currencies ({others.length})
              <ChevronDown size={14} style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
            </button>
            {showAll &&
              others.map((g) => (
                <div key={g.currency} className="flex items-center justify-between" style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                  <span className="font-semibold">{g.currency}</span>
                  <span>
                    captured {fmtMoney(g.captured, g.currency)} · fees {fmtMoney(g.fees, g.currency)} · net{" "}
                    <span style={{ color: g.net >= 0 ? "#5eead4" : "#fca5a5" }}>{fmtMoney(g.net, g.currency)}</span>
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl" style={{ background: "rgba(255,255,255,0.06)", padding: "10px 10px" }}>
      <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{label}</div>
      <div className="font-bold" style={{ fontSize: 14, marginTop: 2 }}>{value}</div>
    </div>
  );
}

/* =================================== To-Do view ==================================== */

function TodoView({ cards, todo, onToggle }) {
  if (cards.length === 0) {
    return <EmptyState text="No cards yet — add your first card to start tracking." />;
  }
  const { active, done } = todo;
  return (
    <div className="flex flex-col" style={{ gap: 14 }}>
      <Cell>
        <div className="flex items-center justify-between" style={{ padding: "12px 16px 4px" }}>
          <span className="font-bold text-gray-900" style={{ fontSize: 15 }}>To-Do this period</span>
          <Badge>{active.length} open</Badge>
        </div>
        {active.length === 0 ? (
          <div className="flex items-center gap-2" style={{ padding: "10px 16px 16px", color: "#16a34a" }}>
            <CheckCircle2 size={18} />
            <span className="font-medium" style={{ fontSize: 14 }}>All caught up — nothing to claim right now.</span>
          </div>
        ) : (
          <div>
            {active.map((row, i) => (
              <TodoRow key={row.key} row={row} onToggle={onToggle} last={i === active.length - 1} />
            ))}
          </div>
        )}
      </Cell>

      {done.length > 0 && (
        <Cell>
          <div className="flex items-center justify-between" style={{ padding: "12px 16px 4px" }}>
            <span className="font-bold text-gray-900" style={{ fontSize: 15 }}>Done this period</span>
            <Badge color="#15803d" bg="#dcfce7">{done.length} claimed</Badge>
          </div>
          <div>
            {done.map((row, i) => (
              <TodoRow key={row.key} row={row} onToggle={onToggle} done last={i === done.length - 1} />
            ))}
          </div>
        </Cell>
      )}
    </div>
  );
}

function TodoRow({ row, onToggle, done, last }) {
  const { card, benefit, entry, label, daysLeft } = row;
  const checked = !!done;
  const showDays = !checked && daysLeft != null && daysLeft <= 45;
  const urgent = daysLeft != null && daysLeft <= 7;
  const soon = daysLeft != null && daysLeft <= 30;
  const dColor = urgent ? "#b91c1c" : soon ? "#92400e" : "#6b7280";
  const dBg = urgent ? "#fee2e2" : soon ? "#fef3c7" : "#f3f4f6";
  const daysText = daysLeft === 0 ? "ends today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
  return (
    <div
      className="flex items-center"
      style={{ padding: "8px 10px 8px 6px", borderBottom: last ? "none" : "1px solid #f3f4f6" }}
    >
      <TapCircle checked={checked} accent={card.accent} onClick={() => onToggle(row)} />
      <div className="flex-1 min-w-0" style={{ marginLeft: 2 }}>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="font-semibold truncate"
            style={{ fontSize: 15, textDecoration: checked ? "line-through" : "none", color: checked ? "#9ca3af" : "#111827" }}
          >
            {benefit.name}
          </span>
          {card.verifyAI && <VerifyBadge />}
          {showDays && (
            <span className="inline-flex items-center rounded-full shrink-0" style={{ color: dColor, background: dBg, fontSize: 11, fontWeight: 600, padding: "1px 8px" }}>
              {daysText}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0" style={{ marginTop: 2 }}>
          <span className="inline-flex items-center gap-1 min-w-0">
            <span style={{ width: 8, height: 8, borderRadius: 999, background: card.accent, display: "inline-block", flexShrink: 0 }} />
            <span className="text-gray-500 truncate" style={{ fontSize: 12 }}>{card.name}</span>
          </span>
          <span className="text-gray-300" style={{ fontSize: 12 }}>·</span>
          <span className="text-gray-500" style={{ fontSize: 12 }}>{label}</span>
          {checked && entry?.by && (
            <>
              <span className="text-gray-300" style={{ fontSize: 12 }}>·</span>
              <span className="text-gray-400 truncate" style={{ fontSize: 12 }}>{entry.by} {fmtWhen(entry.at)}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right shrink-0" style={{ marginLeft: 8 }}>
        {perPeriodValue(benefit) > 0 && (
          <span className="font-bold" style={{ fontSize: 14, color: checked ? "#9ca3af" : "#111827" }}>
            {fmtMoney(perPeriodValue(benefit), card.currency)}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================== All Cards view ================================= */

function CardsView({ cards, checks, now, expanded, onToggleExpand, onToggleCheck, onEdit, onAdd }) {
  if (cards.length === 0) {
    return <EmptyState text="No cards yet — add your first card to start tracking." />;
  }
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {cards.map((card) => (
        <CardRow
          key={card.id}
          card={card}
          checks={checks}
          now={now}
          open={!!expanded[card.id]}
          onToggleOpen={() => onToggleExpand(card.id)}
          onToggleCheck={onToggleCheck}
          onEdit={() => onEdit(card)}
        />
      ))}
      <button
        onClick={onAdd}
        className="flex items-center justify-center gap-2 rounded-2xl font-semibold"
        style={{ border: "1.5px dashed #cfd3da", color: "#6b7280", background: "transparent", padding: "14px", cursor: "pointer", fontSize: 14 }}
      >
        <Plus size={18} /> Add another card
      </button>
    </div>
  );
}

function CardRow({ card, checks, now, open, onToggleOpen, onToggleCheck, onEdit }) {
  const cycleBenefit = card.benefits.find((b) => b.cadence === "annual" || b.cadence === "custom");
  const cycle = cycleBenefit ? getAnnualCycle(card, now) : null;
  const needsDate = card.resetType === "anniversary" && !card.resetDate;
  const econ = cardEconomics(card, checks, now);

  // current-period claimable summary
  let openCount = 0;
  let total = 0;
  for (const b of card.benefits) {
    if (b.cadence === "perk") continue;
    const nowCells = periodsFor(card, b, now).all.filter((c) => c.now);
    if (nowCells.length === 0) continue;
    total += 1;
    if (nowCells.some((c) => !isChecked(checks, instanceKey(card.id, b.id, c.key)))) openCount += 1;
  }

  return (
    <Cell style={{ overflow: "hidden" }}>
      {/* accent edge */}
      <div style={{ height: 4, background: card.accent }} />
      <div className="flex items-center" style={{ padding: "12px 14px" }}>
        <button
          onClick={onToggleOpen}
          className="flex-1 flex items-center min-w-0 gap-3"
          style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
        >
          <span
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 40, height: 40, background: card.accent, color: "#fff" }}
          >
            <CreditCard size={18} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-gray-900 truncate" style={{ fontSize: 15 }}>{card.name}</span>
              {card.verifyAI && <VerifyBadge />}
            </span>
            <span className="flex items-center gap-2 min-w-0" style={{ marginTop: 2 }}>
              <span className="text-gray-500 truncate" style={{ fontSize: 12 }}>
                {card.network ? `${card.network} · ` : ""}Fee {fmtMoney(card.annualFee, card.currency)}
              </span>
            </span>
            <span className="flex flex-wrap items-center gap-2" style={{ marginTop: 6 }}>
              <Badge color={econ.verdict.color} bg={econ.verdict.bg}>{econ.verdict.label}</Badge>
              {total > 0 && (
                <Badge color={openCount === 0 ? "#15803d" : "#374151"} bg={openCount === 0 ? "#dcfce7" : "#f3f4f6"}>
                  {openCount === 0 ? "all claimed" : `${openCount} open`}
                </Badge>
              )}
            </span>
          </span>
          <span className="shrink-0 flex items-center">
            {open ? <ChevronDown size={18} color="#9ca3af" /> : <ChevronRight size={18} color="#9ca3af" />}
          </span>
        </button>
      </div>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          {/* worth-it summary */}
          <div className="rounded-xl flex items-center justify-between" style={{ background: "#f8f9fb", padding: "10px 12px", marginBottom: 12 }}>
            <div className="min-w-0">
              <div className="text-gray-500" style={{ fontSize: 11 }}>This card so far</div>
              <div className="font-semibold text-gray-900" style={{ fontSize: 13, marginTop: 2 }}>
                Captured {fmtMoney(econ.captured, card.currency)} · Fee {fmtMoney(econ.fee, card.currency)}
              </div>
            </div>
            <div className="text-right shrink-0" style={{ marginLeft: 10 }}>
              <Badge color={econ.verdict.color} bg={econ.verdict.bg}>{econ.verdict.label}</Badge>
              <div className="font-bold" style={{ fontSize: 13, marginTop: 4, color: econ.net >= 0 ? "#15803d" : "#b91c1c" }}>
                {econ.net >= 0 ? "+" : "−"} {fmtMoney(Math.abs(econ.net), card.currency)} net
              </div>
            </div>
          </div>

          {/* reset / renews summary */}
          <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 12 }}>
            <span className="inline-flex items-center gap-1 rounded-full" style={{ background: "#f3f4f6", padding: "4px 10px", fontSize: 12, color: "#4b5563" }}>
              <Calendar size={13} />
              {card.resetType === "calendar" ? "Resets: Calendar year (Jan 1)" : card.resetDate ? `Anniversary ${fmtDate(card.resetDate)}` : "Anniversary — date not set"}
            </span>
            {cycle && cycle.hasDate && (
              <span className="inline-flex items-center gap-1 rounded-full" style={{ background: "#eef2ff", padding: "4px 10px", fontSize: 12, color: "#4338ca" }}>
                Annual renews {fmtDate(cycle.renews)}
              </span>
            )}
            {needsDate && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1 rounded-full font-medium"
                style={{ background: "#fff7ed", color: "#9a3412", padding: "4px 10px", fontSize: 12, border: "1px solid #fed7aa", cursor: "pointer" }}
              >
                <AlertCircle size={13} /> Set reset date
              </button>
            )}
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 rounded-full font-medium"
              style={{ background: "#f3f4f6", color: "#374151", padding: "4px 10px", fontSize: 12, border: "none", cursor: "pointer", marginLeft: "auto" }}
            >
              <Pencil size={13} /> Edit
            </button>
          </div>

          {/* benefits grid */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            {card.benefits.map((b) => (
              <BenefitPunchCard key={b.id} card={card} benefit={b} checks={checks} now={now} onToggleCheck={onToggleCheck} />
            ))}
          </div>
        </div>
      )}
    </Cell>
  );
}

function BenefitPunchCard({ card, benefit, checks, now, onToggleCheck }) {
  const isPerk = benefit.cadence === "perk";
  const p = periodsFor(card, benefit, now);
  const used = p.all.filter((cell) => isChecked(checks, instanceKey(card.id, benefit.id, cell.key))).length;

  return (
    <div className="rounded-xl" style={{ background: "#fafafa", border: "1px solid #f0f1f3", padding: "12px" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-gray-900 truncate" style={{ fontSize: 14 }}>{benefit.name}</span>
            <Badge>{benefit.cadence === "custom" ? `${benefitPer(benefit)}× / yr` : CADENCE_LABEL[benefit.cadence]}</Badge>
          </div>
          {benefit.note && <div className="text-gray-500" style={{ fontSize: 12, marginTop: 3 }}>{benefit.note}</div>}
        </div>
        <div className="text-right shrink-0">
          {Number(benefit.value) > 0 && (
            <div className="font-bold text-gray-900" style={{ fontSize: 14 }}>{fmtMoney(benefit.value, card.currency)}</div>
          )}
          {!isPerk && (
            <div className="text-gray-400" style={{ fontSize: 11 }}>used {used}/{p.per}</div>
          )}
        </div>
      </div>

      {isPerk ? (
        <div className="inline-flex items-center gap-1" style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
          <Sparkles size={13} /> Ongoing perk — no check-off
        </div>
      ) : (
        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 10 }}>
          {p.all.map((cell) => {
            const key = instanceKey(card.id, benefit.id, cell.key);
            const checked = isChecked(checks, key);
            const annual = benefit.cadence === "annual";
            return (
              <button
                key={cell.key}
                onClick={() => onToggleCheck(card, benefit, cell)}
                title={cell.renews ? `Renews ${fmtDate(cell.renews)}` : cell.label}
                className="flex items-center justify-center rounded-lg font-semibold"
                style={{
                  minWidth: annual ? 96 : 40,
                  height: 36,
                  padding: annual ? "0 12px" : 0,
                  fontSize: 12,
                  cursor: "pointer",
                  color: checked ? "#fff" : cell.current ? card.accent : "#6b7280",
                  background: checked ? card.accent : "#fff",
                  border: cell.current ? `2px solid ${card.accent}` : "1px solid #e3e5e9",
                  boxShadow: cell.current && !checked ? `0 0 0 3px ${hexA(card.accent, 0.12)}` : "none",
                  transition: "all 120ms ease",
                }}
              >
                {checked ? <Check size={16} strokeWidth={3} /> : annual ? (cell.hasDate && cell.renews ? `→ ${fmtDate(cell.renews)}` : "Claim") : cell.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function hexA(hex, a) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function EmptyState({ text }) {
  return (
    <Cell>
      <div className="flex flex-col items-center text-center" style={{ padding: "32px 24px", gap: 8 }}>
        <span className="flex items-center justify-center rounded-2xl" style={{ width: 48, height: 48, background: "#f3f4f6" }}>
          <CreditCard size={22} color="#9ca3af" />
        </span>
        <span className="text-gray-500" style={{ fontSize: 14, maxWidth: 260 }}>{text}</span>
      </div>
    </Cell>
  );
}

/* ============================ Add / Edit Card form ================================= */

function emptyBenefit() {
  return { id: uid(), name: "", value: "", cadence: "monthly", count: "", note: "" };
}

function CardForm({ open, onClose, initial, onSave, onDelete, defaultCurrency }) {
  const editing = !!initial;
  const [mode, setMode] = useState(editing ? "custom" : "template");
  const [templateId, setTemplateId] = useState(CARD_TEMPLATES[0].tid);
  const [quantity, setQuantity] = useState(1);

  const [form, setForm] = useState(() => initToForm(initial, defaultCurrency));
  const [aiState, setAiState] = useState({ loading: false, error: "" });

  // reset form whenever the modal (re)opens
  useEffect(() => {
    if (open) {
      setMode(editing ? "custom" : "template");
      setTemplateId(CARD_TEMPLATES[0].tid);
      setQuantity(1);
      setForm(initToForm(initial, defaultCurrency));
      setAiState({ loading: false, error: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function applyTemplate(tid) {
    const t = CARD_TEMPLATES.find((x) => x.tid === tid) || CARD_TEMPLATES[0];
    setForm(initToForm(t, defaultCurrency, true));
  }

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }
  function updateBenefit(id, patch) {
    setForm((f) => ({ ...f, benefits: f.benefits.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  }
  function addBenefit() {
    setForm((f) => ({ ...f, benefits: [...f.benefits, emptyBenefit()] }));
  }
  function removeBenefit(id) {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((b) => b.id !== id) }));
  }

  async function runAI() {
    const name = (form.name || "").trim();
    if (!name) {
      setAiState({ loading: false, error: "Enter the card name first." });
      return;
    }
    setAiState({ loading: true, error: "" });
    try {
      const found = await researchBenefits(name, form.currency);
      if (found.length === 0) {
        setAiState({ loading: false, error: "No benefits returned — try a more specific card name." });
        return;
      }
      setForm((f) => ({
        ...f,
        verifyAI: true,
        benefits: found.map((b) => ({
          id: uid(),
          name: b.name || "Benefit",
          value: Number(b.value) || 0,
          cadence: clampCadence(b.cadence),
          note: b.note || "",
        })),
      }));
      setAiState({ loading: false, error: "" });
    } catch (e) {
      setAiState({ loading: false, error: "Couldn't reach the AI. Add benefits manually for now." });
    }
  }

  function handleSave() {
    const base = formToCard(form);
    if (editing) {
      onSave([{ ...base, id: initial.id }], true);
    } else {
      const n = Math.max(1, Math.min(20, Number(quantity) || 1));
      const cards = range(n).map(() => ({ ...formToCard(form), id: uid() }));
      onSave(cards, false);
    }
    onClose();
  }

  const canSave = (form.name || "").trim().length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit card" : "Add a card"}
      footer={
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={() => {
                onDelete(initial.id);
                onClose();
              }}
              className="flex items-center justify-center gap-1 rounded-full font-semibold"
              style={{ background: "#fef2f2", color: "#dc2626", border: "none", padding: "11px 14px", fontSize: 14, cursor: "pointer" }}
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <PrimaryBtn onClick={handleSave} disabled={!canSave}>
            {editing ? "Save changes" : quantity > 1 ? `Add ${quantity} cards` : "Add card"}
          </PrimaryBtn>
        </div>
      }
    >
      {!editing && (
        <div style={{ marginBottom: 14 }}>
          <Segmented
            value={mode}
            onChange={(m) => {
              setMode(m);
              if (m === "template") applyTemplate(templateId);
              if (m === "custom") setForm(initToForm(null, defaultCurrency));
            }}
            options={[
              { id: "template", label: "From template", icon: <CreditCard size={15} /> },
              { id: "custom", label: "Custom", icon: <Sparkles size={15} /> },
            ]}
          />
        </div>
      )}

      {!editing && mode === "template" && (
        <Field label="Template">
          <Select
            value={templateId}
            onChange={(e) => {
              setTemplateId(e.target.value);
              applyTemplate(e.target.value);
            }}
          >
            {CARD_TEMPLATES.map((t) => (
              <option key={t.tid} value={t.tid}>{t.name} — {t.network}</option>
            ))}
          </Select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Card name">
            <TextInput value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Amex Platinum" />
          </Field>
        </div>
        <Field label="Network / tier">
          <TextInput value={form.network} onChange={(e) => update({ network: e.target.value })} placeholder="Visa Infinite" />
        </Field>
        <Field label="Issuer">
          <TextInput value={form.issuer} onChange={(e) => update({ issuer: e.target.value })} placeholder="Bank" />
        </Field>
        <Field label="Currency">
          <Select value={form.currency} onChange={(e) => update({ currency: e.target.value })}>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Annual fee">
          <TextInput type="number" inputMode="numeric" value={form.annualFee} onChange={(e) => update({ annualFee: e.target.value })} placeholder="0" />
        </Field>
      </div>

      {/* accent */}
      <Field label="Accent color">
        <div className="flex flex-wrap" style={{ gap: 8 }}>
          {DEFAULT_ACCENTS.map((c) => (
            <button
              key={c}
              onClick={() => update({ accent: c })}
              className="rounded-full"
              style={{
                width: 28,
                height: 28,
                background: c,
                border: form.accent === c ? "3px solid #111827" : "2px solid #fff",
                boxShadow: "0 0 0 1px #e5e7eb",
                cursor: "pointer",
              }}
              aria-label={`accent ${c}`}
            />
          ))}
        </div>
      </Field>

      {/* reset */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Resets on">
          <Select value={form.resetType} onChange={(e) => update({ resetType: e.target.value })}>
            <option value="calendar">Calendar year (Jan 1)</option>
            <option value="anniversary">Card anniversary</option>
          </Select>
        </Field>
        {form.resetType === "anniversary" && (
          <Field label="Reset date" hint="Annual benefits anchor to this date">
            <TextInput type="date" value={form.resetDate || ""} onChange={(e) => update({ resetDate: e.target.value })} />
          </Field>
        )}
      </div>

      {/* benefits */}
      <div className="flex items-center justify-between" style={{ marginTop: 6, marginBottom: 8 }}>
        <span className="font-bold text-gray-900" style={{ fontSize: 14 }}>Benefits</span>
        {mode === "custom" && (
          <button
            onClick={runAI}
            disabled={aiState.loading}
            className="flex items-center gap-1 rounded-full font-semibold"
            style={{
              background: aiState.loading ? "#e5e7eb" : "#111827",
              color: aiState.loading ? "#6b7280" : "#fff",
              border: "none",
              padding: "7px 12px",
              fontSize: 12,
              cursor: aiState.loading ? "default" : "pointer",
            }}
          >
            {aiState.loading ? <RefreshCw size={13} className="" style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={13} />}
            {aiState.loading ? "Researching…" : "Research with AI"}
          </button>
        )}
      </div>
      {aiState.error && (
        <div className="rounded-xl" style={{ background: "#fef2f2", color: "#b91c1c", padding: "8px 10px", fontSize: 12, marginBottom: 10 }}>
          {aiState.error}
        </div>
      )}
      {form.verifyAI && (
        <div className="flex items-center gap-2 rounded-xl" style={{ background: "#fffbeb", color: "#92400e", padding: "8px 10px", fontSize: 12, marginBottom: 10 }}>
          <AlertCircle size={14} /> AI-suggested — please verify amounts & terms.
        </div>
      )}

      <div className="flex flex-col" style={{ gap: 10 }}>
        {form.benefits.map((b) => (
          <div key={b.id} className="rounded-xl" style={{ border: "1px solid #eceef1", padding: 10 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <TextInput value={b.name} onChange={(e) => updateBenefit(b.id, { name: e.target.value })} placeholder="Benefit name" style={{ flex: 1 }} />
              <button onClick={() => removeBenefit(b.id)} className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 36, height: 36, background: "#f3f4f6", border: "none", cursor: "pointer" }}>
                <Trash2 size={15} color="#9ca3af" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={b.cadence} onChange={(e) => updateBenefit(b.id, { cadence: e.target.value })}>
                {CADENCES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </Select>
              <TextInput
                type="number"
                inputMode="numeric"
                value={b.value}
                onChange={(e) => updateBenefit(b.id, { value: e.target.value })}
                placeholder="Annual value"
                disabled={b.cadence === "perk"}
                style={b.cadence === "perk" ? { opacity: 0.5 } : undefined}
              />
            </div>
            {b.cadence === "custom" && (
              <TextInput
                type="number"
                inputMode="numeric"
                value={b.count}
                onChange={(e) => updateBenefit(b.id, { count: e.target.value })}
                placeholder="Times per year (e.g. 4 lounge visits)"
                style={{ marginTop: 8 }}
              />
            )}
            <TextInput value={b.note} onChange={(e) => updateBenefit(b.id, { note: e.target.value })} placeholder="Note (optional)" style={{ marginTop: 8 }} />
          </div>
        ))}
        <button
          onClick={addBenefit}
          className="flex items-center justify-center gap-2 rounded-xl font-semibold"
          style={{ border: "1.5px dashed #d1d5db", color: "#6b7280", background: "transparent", padding: "11px", cursor: "pointer", fontSize: 13 }}
        >
          <Plus size={16} /> Add benefit
        </button>
      </div>

      {!editing && (
        <Field label="Quantity">
          <div className="flex items-center gap-3">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex items-center justify-center rounded-full" style={{ width: 38, height: 38, border: "1px solid #e3e5e9", background: "#fff", cursor: "pointer", fontSize: 18 }}>−</button>
            <span className="font-bold text-gray-900" style={{ fontSize: 18, minWidth: 28, textAlign: "center" }}>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(20, q + 1))} className="flex items-center justify-center rounded-full" style={{ width: 38, height: 38, border: "1px solid #e3e5e9", background: "#fff", cursor: "pointer", fontSize: 18 }}>+</button>
            <span className="text-gray-400" style={{ fontSize: 12, marginLeft: 4 }}>Track several of the same card separately</span>
          </div>
        </Field>
      )}
    </Modal>
  );
}

function initToForm(src, defaultCurrency, fromTemplate) {
  if (!src) {
    return {
      name: "",
      network: "",
      issuer: "",
      accent: DEFAULT_ACCENTS[Math.floor(Math.random() * DEFAULT_ACCENTS.length)],
      currency: defaultCurrency || "USD",
      annualFee: "",
      resetType: "calendar",
      resetDate: "",
      verifyAI: false,
      benefits: [emptyBenefit()],
    };
  }
  return {
    name: src.name || "",
    network: src.network || "",
    issuer: src.issuer || "",
    accent: src.accent || DEFAULT_ACCENTS[0],
    currency: src.currency || defaultCurrency || "USD",
    annualFee: src.annualFee != null ? String(src.annualFee) : "",
    resetType: src.resetType === "anniversary" ? "anniversary" : "calendar",
    resetDate: src.resetDate || "",
    verifyAI: !!src.verifyAI && !fromTemplate,
    benefits: (src.benefits || []).map((b) => ({
      id: uid(),
      name: b.name || "",
      value: b.value != null && b.value !== 0 ? String(b.value) : b.value === 0 ? "0" : "",
      cadence: clampCadence(b.cadence),
      count: b.count != null ? String(b.count) : "",
      note: b.note || "",
    })),
  };
}

function formToCard(form) {
  return {
    id: uid(),
    name: (form.name || "").trim() || "Untitled card",
    network: (form.network || "").trim(),
    issuer: (form.issuer || "").trim(),
    accent: form.accent || DEFAULT_ACCENTS[0],
    currency: form.currency || "USD",
    annualFee: Number(form.annualFee) || 0,
    resetType: form.resetType === "anniversary" ? "anniversary" : "calendar",
    resetDate: form.resetType === "anniversary" ? form.resetDate || null : null,
    verifyAI: !!form.verifyAI,
    benefits: (form.benefits || [])
      .filter((b) => (b.name || "").trim())
      .map((b) => ({
        id: uid(),
        name: b.name.trim(),
        value: Number(b.value) || 0,
        cadence: clampCadence(b.cadence),
        count: clampCount(b.count),
        note: (b.note || "").trim(),
      })),
  };
}

/* --------------------------------- AI research ------------------------------------ */

async function researchBenefits(cardName, currency) {
  const prompt =
    `For the credit card "${cardName}", return ONLY a JSON array (no prose, no markdown fences) ` +
    `of its recurring benefits and statement credits. Each element must be an object with keys: ` +
    `"name" (string), "value" (number — the ANNUAL value in ${currency}, use 0 if none/unknown), ` +
    `"cadence" (one of "monthly","quarterly","semiannual","annual","perk"), and "note" (a short string). ` +
    `Use "perk" with value 0 for qualitative benefits like lounge access, elite status, or concierge. ` +
    `Return at most 8 of the most important recurring benefits. Output JUST the JSON array.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  const data = await res.json();
  const text = Array.isArray(data?.content) ? data.content.map((b) => b?.text || "").join("") : "";
  return parseBenefitArray(text);
}

function parseBenefitArray(text) {
  if (!text) return [];
  let s = text.trim();
  // strip markdown fences if present
  s = s.replace(/```json/gi, "```").replace(/```/g, "").trim();
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  let arr;
  try {
    arr = JSON.parse(s.slice(start, end + 1));
  } catch {
    return [];
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((x) => x && typeof x === "object")
    .map((x) => ({
      name: String(x.name || "Benefit").slice(0, 80),
      value: Number(x.value) || 0,
      cadence: clampCadence(String(x.cadence || "perk")),
      note: String(x.note || "").slice(0, 140),
    }))
    .slice(0, 12);
}

/* ================================ Share panel ===================================== */

function SharePanel({ open, onClose, code, onSwitch }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    try {
      navigator.clipboard?.writeText(code);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }
  return (
    <Modal open={open} onClose={onClose} title="Share this space">
      <p className="text-gray-500" style={{ fontSize: 14, marginBottom: 14 }}>
        Your cards and check-offs live in a private space. Share the code with your partner so you both see the same checklist.
      </p>

      <div
        className="rounded-2xl flex items-center justify-between"
        style={{ background: "#0f1115", color: "#fff", padding: "16px 18px" }}
      >
        <div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>Space code</div>
          <div className="font-bold tracking-tight" style={{ fontSize: 30, letterSpacing: 4, marginTop: 2 }}>{code}</div>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-2 rounded-full font-semibold"
          style={{ background: copied ? "#10b981" : "#ffffff", color: copied ? "#fff" : "#111827", border: "none", padding: "10px 14px", fontSize: 13, cursor: "pointer" }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="rounded-2xl" style={{ background: "#f8f9fb", padding: 16, marginTop: 14 }}>
        <div className="font-semibold text-gray-800" style={{ fontSize: 13, marginBottom: 8 }}>How your partner joins</div>
        <ol className="text-gray-600" style={{ fontSize: 13, paddingLeft: 18, lineHeight: 1.8 }}>
          <li>Open this same app.</li>
          <li>Tap <span className="font-semibold">Join a space</span>.</li>
          <li>Enter the code <span className="font-bold" style={{ letterSpacing: 1 }}>{code}</span>.</li>
        </ol>
      </div>

      <button
        onClick={onSwitch}
        className="flex items-center justify-center gap-2 rounded-full font-semibold w-full"
        style={{ background: "#f3f4f6", color: "#374151", border: "none", padding: "12px", fontSize: 14, cursor: "pointer", marginTop: 14 }}
      >
        <ArrowRightLeft size={16} /> Switch / leave space
      </button>
    </Modal>
  );
}

/* ================================= Onboarding ===================================== */

function Onboarding({ initialName, onCreate, onJoin }) {
  const [name, setName] = useState(initialName || "");
  const [tab, setTab] = useState("create");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    const nm = name.trim();
    if (!nm) {
      setErr("Please add your name so check-offs are attributed.");
      return;
    }
    if (tab === "create") {
      onCreate(nm);
    } else {
      const c = code.trim().toUpperCase();
      if (c.length < 4) {
        setErr("Enter the space code your partner shared.");
        return;
      }
      onJoin(nm, c);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ padding: 20 }}>
      <div className="w-full" style={{ maxWidth: 420 }}>
        <div className="text-center" style={{ marginBottom: 22 }}>
          <div
            className="inline-flex items-center justify-center rounded-2xl"
            style={{ width: 56, height: 56, background: "linear-gradient(150deg,#30343c,#14161b)", color: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}
          >
            <Wallet size={26} />
          </div>
          <h1 className="font-bold tracking-tight text-gray-900" style={{ fontSize: 26, marginTop: 14 }}>Card Perks</h1>
          <p className="text-gray-500" style={{ fontSize: 14, marginTop: 4 }}>
            A shared checklist of every card benefit you can still claim.
          </p>
        </div>

        <Cell>
          <div style={{ padding: 18 }}>
            <Field label="Your name">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex" />
            </Field>

            <div style={{ margin: "6px 0 16px" }}>
              <Segmented
                value={tab}
                onChange={setTab}
                options={[
                  { id: "create", label: "New space", icon: <Plus size={15} /> },
                  { id: "join", label: "Join a space", icon: <Users size={15} /> },
                ]}
              />
            </div>

            {tab === "create" ? (
              <p className="text-gray-500" style={{ fontSize: 13, marginBottom: 14 }}>
                We'll create a private space pre-loaded with card templates and a fresh, shareable code.
              </p>
            ) : (
              <Field label="Space code">
                <TextInput
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. K7P2QX"
                  style={{ letterSpacing: 3, fontWeight: 700 }}
                />
              </Field>
            )}

            {err && <div className="text-red-600" style={{ fontSize: 12, marginBottom: 10 }}>{err}</div>}

            <PrimaryBtn full onClick={submit}>
              {tab === "create" ? "Create my space" : "Join space"}
            </PrimaryBtn>
          </div>
        </Cell>
        <p className="text-center text-gray-400" style={{ fontSize: 11, marginTop: 14 }}>
          Amounts are illustrative — verify current card terms before relying on them.
        </p>
      </div>
    </div>
  );
}

/* ================================ Main component =================================== */

export default function CreditCardBenefitsTracker() {
  const [booted, setBooted] = useState(false);
  const [userName, setUserName] = useState("");
  const userIdRef = useRef(uid());
  const [spaceCode, setSpaceCode] = useState(null);
  const spaceCodeRef = useRef(null);
  const cardsUpdatedAtRef = useRef(0);

  const [cards, setCards] = useState([]);
  const [checks, setChecks] = useState({});
  const [view, setView] = useState("todo");
  const [expanded, setExpanded] = useState({});
  const [now, setNow] = useState(() => Date.now());

  const [formOpen, setFormOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const nowDate = useMemo(() => new Date(now), [now]);

  /* ---- hydrate (never blocks first render) ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await storageGet(K.user, false);
        if (!cancelled && u && u.name) {
          setUserName(u.name);
          if (u.id) userIdRef.current = u.id;
        } else if (u && u.id) {
          userIdRef.current = u.id;
        }
        const a = await storageGet(K.active, false);
        if (!cancelled && a && a.code && u && u.name) {
          await enterSpace(a.code, false);
        }
      } catch {
        /* render proceeds regardless */
      } finally {
        if (!cancelled) setBooted(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- keep "now" fresh (period boundaries) ---- */
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    const onFocus = () => {
      setNow(Date.now());
      pullRemote();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- gentle background sync from shared storage ---- */
  useEffect(() => {
    if (!spaceCode) return;
    const t = setInterval(() => pullRemote(), 12000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceCode]);

  async function pullRemote() {
    const code = spaceCodeRef.current;
    if (!code) return;
    try {
      setSyncing(true);
      const [rc, rk] = await Promise.all([storageGet(K.cards(code), true), storageGet(K.checks(code), true)]);
      if (rc && Array.isArray(rc.items) && (rc.updatedAt || 0) > cardsUpdatedAtRef.current) {
        cardsUpdatedAtRef.current = rc.updatedAt;
        setCards(rc.items);
      }
      if (rk && rk.map) {
        setChecks((prev) => mergeChecks(prev, rk.map));
      }
    } catch {
      /* ignore */
    } finally {
      setSyncing(false);
    }
  }

  async function enterSpace(code, persistActive = true) {
    spaceCodeRef.current = code;
    setSpaceCode(code);
    if (persistActive) await storageSet(K.active, { code }, false);
    let rc = await storageGet(K.cards(code), true);
    if (!rc || !Array.isArray(rc.items) || rc.items.length === 0) {
      const seeded = seedCards();
      rc = { v: 1, updatedAt: Date.now(), items: seeded };
      await storageSet(K.cards(code), rc, true);
    }
    cardsUpdatedAtRef.current = rc.updatedAt || Date.now();
    setCards(rc.items);
    const rk = await storageGet(K.checks(code), true);
    setChecks(rk && rk.map ? rk.map : {});
  }

  /* ---- persistence (explicit on mutation, debounced) ---- */
  function persistCards(items) {
    const code = spaceCodeRef.current;
    if (!code) return;
    cardsUpdatedAtRef.current = Date.now();
    scheduleWrite(K.cards(code), { v: 1, updatedAt: cardsUpdatedAtRef.current, items }, true);
  }
  function persistChecks(map) {
    const code = spaceCodeRef.current;
    if (!code) return;
    scheduleWrite(K.checks(code), { v: 1, updatedAt: Date.now(), map }, true);
  }

  /* ---- mutations ---- */
  function saveName(nm) {
    setUserName(nm);
    storageSet(K.user, { name: nm, id: userIdRef.current }, false);
  }
  function handleCreate(nm) {
    saveName(nm);
    enterSpace(genCode(), true);
  }
  function handleJoin(nm, code) {
    saveName(nm);
    enterSpace(code, true);
  }
  function switchSpace() {
    setShareOpen(false);
    spaceCodeRef.current = null;
    setSpaceCode(null);
    setCards([]);
    setChecks({});
    storageSet(K.active, { code: null }, false);
  }

  function setKey(key, on) {
    setChecks((prev) => {
      const next = { ...prev, [key]: { by: userName || "Someone", at: Date.now(), removed: !on, w: userIdRef.current } };
      persistChecks(next);
      return next;
    });
  }
  function toggleByKey(key) {
    setKey(key, !isChecked(checks, key));
  }
  function toggleTodo(row) {
    setKey(row.key, !isChecked(checks, row.key));
  }
  function toggleCell(card, benefit, cell) {
    const key = instanceKey(card.id, benefit.id, cell.key);
    setKey(key, !isChecked(checks, key));
  }

  function saveCards(newOnesOrEdited, isEdit) {
    setCards((prev) => {
      let next;
      if (isEdit) {
        const ed = newOnesOrEdited[0];
        next = prev.map((c) => (c.id === ed.id ? ed : c));
      } else {
        next = [...prev, ...newOnesOrEdited];
      }
      persistCards(next);
      return next;
    });
  }
  function deleteCard(id) {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      persistCards(next);
      return next;
    });
  }

  function openAdd() {
    setEditCard(null);
    setFormOpen(true);
  }
  function openEdit(card) {
    setEditCard(card);
    setFormOpen(true);
  }
  function toggleExpand(id) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  const todo = useMemo(() => buildTodo(cards, checks, nowDate), [cards, checks, nowDate]);
  const stats = useMemo(() => buildStats(cards, checks, nowDate), [cards, checks, nowDate]);
  const defaultCurrency = useMemo(() => {
    const counts = {};
    cards.forEach((c) => (counts[c.currency] = (counts[c.currency] || 0) + 1));
    const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return top || "IDR";
  }, [cards]);

  /* ---- render ---- */
  if (!spaceCode) {
    // onboarding renders instantly; once booted we have the saved name (if any)
    return (
      <div style={{ minHeight: "100vh", background: rootBg() }}>
        <style>{spinCss}</style>
        <Onboarding initialName={userName} onCreate={handleCreate} onJoin={handleJoin} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: rootBg() }}>
      <style>{spinCss}</style>

      {/* top bar */}
      <div
        className="sticky top-0 z-10"
        style={{ background: "rgba(244,245,247,0.82)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(0,0,0,0.05)" }}
      >
        <div className="mx-auto flex items-center justify-between" style={{ maxWidth: 680, padding: "12px 16px" }}>
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 32, height: 32, background: APP_ACCENT, color: "#fff" }}>
              <Wallet size={17} />
            </span>
            <span className="font-bold text-gray-900 truncate" style={{ fontSize: 17 }}>Card Perks</span>
            {syncing && <RefreshCw size={13} color="#9ca3af" style={{ animation: "spin 1s linear infinite" }} />}
          </div>
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 rounded-full font-semibold"
            style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb", padding: "7px 12px", fontSize: 13, cursor: "pointer" }}
          >
            <Share2 size={15} /> <span style={{ letterSpacing: 1 }}>{spaceCode}</span>
          </button>
        </div>
      </div>

      <div className="mx-auto" style={{ maxWidth: 680, padding: "16px 16px 120px" }}>
        <Hero stats={stats.length ? stats : [{ currency: defaultCurrency, available: 0, captured: 0, potential: 0, fees: 0, net: 0, atRisk: 0 }]} />

        <div style={{ marginTop: 16, marginBottom: 16 }}>
          <Segmented
            value={view}
            onChange={setView}
            options={[
              { id: "todo", label: "To-Do", icon: <CheckCircle2 size={15} /> },
              { id: "cards", label: "All Cards", icon: <CreditCard size={15} /> },
            ]}
          />
        </div>

        {view === "todo" ? (
          <TodoView cards={cards} todo={todo} onToggle={toggleTodo} />
        ) : (
          <CardsView
            cards={cards}
            checks={checks}
            now={nowDate}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            onToggleCheck={toggleCell}
            onEdit={openEdit}
            onAdd={openAdd}
          />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed flex items-center justify-center rounded-full"
        style={{
          right: 20,
          bottom: 24,
          width: 58,
          height: 58,
          background: APP_ACCENT,
          color: "#fff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 24px rgba(0,0,0,0.28)",
        }}
        aria-label="Add card"
      >
        <Plus size={26} />
      </button>

      <CardForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editCard}
        onSave={saveCards}
        onDelete={deleteCard}
        defaultCurrency={defaultCurrency}
      />
      <SharePanel open={shareOpen} onClose={() => setShareOpen(false)} code={spaceCode} onSwitch={switchSpace} />
    </div>
  );
}

function rootBg() {
  return "radial-gradient(120% 60% at 50% 0%, #f7f8fa 0%, #eef0f3 55%, #e7e9ed 100%)";
}

const spinCss = `@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`;
