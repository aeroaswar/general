---
type: skill
origin: made
what: Full SKILL.md — Talvex analytics-dashboard scaffold (React/Vite/Tailwind/Recharts)
tags: [skill, dashboard, react, design]
---
# talvex-dashboard (full)

> Full source of my **talvex-dashboard** skill (catalog: [[talvex-dashboard]] · project [[talvex]]).
> The `.skill` bundle also ships a verified-working Vite template (`assets/template/`) +
> `references/design-system.md` (not inlined here).

**name:** talvex-dashboard
**description:** Scaffold a polished, fully-responsive analytics dashboard from the Talvex
template (React + TypeScript + Vite + Tailwind + Recharts + lucide-react): frosted-glass
cards over a blurred warm-glow background, a tight neutral + yellow palette, oversized KPI
numbers, a bar chart, a radial progress ring, a task/checklist panel, an accordion, and a
calendar. Use whenever the user wants a dashboard / admin panel / analytics / KPI view
(HR, sales, finance, ops, health…), or a "modern"/"clean"/"glassmorphic" dashboard, mentions
Talvex, or wants a dashboard starting point — even if they don't name the stack. Also to
restyle/extend an existing dashboard to match this look.

---

# Talvex Dashboard Template

A production-quality, fully-responsive dashboard you can drop in and customize. Ships as a
complete, **verified-working** Vite project in the skill's `assets/template/`, plus a
design-system reference for adapting the look to any domain.

Visual signature: frosted translucent cards floating over a soft yellow glow, a single
bright accent (`#FFD85F`) against warm grays, oversized tight numerals, layout tuned per
breakpoint (screen-filling poster on desktop, calm scroll on mobile).

## What you get
A pill navbar (brand, nav links, configs/bell/avatar, mobile menu); a greeting + composition
segment-bar + stat blocks; and **six cards** — hero photo, KPI+bar-chart, radial
progress-ring, induction/task-list column, collapsible accordion, week calendar with events.
Stack: React 18, TypeScript, Vite, Tailwind 3.4, Recharts 3.x, lucide-react
(`@supabase/supabase-js` preinstalled as an unused data hook).

## How to use it (both paths start from the same files)
- **Clone & customize** — use *this* dashboard as a starting point; edit copy/data/images.
- **Adapt to another domain** — a different dashboard (sales/finance/ops…) in this style;
  remap card slots and re-skin per the design system.

**Step 1 — Scaffold:** copy `assets/template/` into a new project dir (default
`talvex-dashboard/` or domain-named); `rsync -a "<skill>/assets/template/" "<target>/"`,
then set `package.json` "name". No `node_modules`; `package-lock.json` pins tested versions.
**Step 2 — Install & run:** `npm install` → `npm run dev` (Vite, http://localhost:5173).
**Step 3 — Verify** across all three breakpoints (mobile/tablet/desktop): chart renders bars,
ring draws, grid reflows (1-col → 2-col → 4-col), clean console (no Recharts warnings).
**Step 4 — Customize:** read `references/design-system.md` first (palette, typography, card
recipes, responsive architecture, card-slot inventory, Recharts gotchas). Cards under
`src/components/cards/` are self-contained with inline data. To adapt a domain, map data to
the **closest existing card archetype** (trend → bar-chart, single % → ring, checklist →
task column, schedule → calendar) rather than inventing new card types.

## Critical: don't break the chart
1. Hidden `YAxis` with explicit `domain` (`<YAxis hide domain={[0, max]} />`) — else bars collapse to ~1px.
2. Render `<BarChart>` at an **explicit measured size** (a `useSize` ResizeObserver hook), not bare `ResponsiveContainer` (which spams `width(0)` warnings from hidden breakpoint copies).
3. `isAnimationActive={false}` on bars so they render immediately.

## Notes
- Keep the restraint: one accent, one diffuse glow, frosted cards, oversized numbers, whitespace. A second accent or opaque cards cheapens it.
- Recolor globally: find-replace `#FFD85F`, `#303030`, `#898989` + reconsider the blob fill in `Background.tsx`.
- When adding a card, add it to **all three** layouts in `DashboardGrid.tsx`.
