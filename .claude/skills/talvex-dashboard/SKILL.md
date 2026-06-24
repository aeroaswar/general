---
name: talvex-dashboard
description: >-
  Scaffold a polished, fully-responsive analytics dashboard from the Talvex
  template (React + TypeScript + Vite + Tailwind + Recharts + lucide-react):
  frosted-glass cards over a blurred warm-glow background, a tight neutral +
  yellow palette, oversized KPI numbers, a bar chart, a radial progress ring, a
  task/checklist panel, an accordion, and a calendar. Use this whenever the user
  wants to build a dashboard, admin panel, or analytics / metrics / KPI view —
  HR/people, sales, finance, ops, health, whatever — or asks for a "modern",
  "clean", or "glassmorphic" dashboard UI, mentions Talvex, or wants a dashboard
  starting point or template, even if they don't name the stack. Also use it to
  restyle or extend an existing dashboard to match this look.
---

# Talvex Dashboard Template

A production-quality, fully-responsive dashboard you can drop in and customize.
It ships as a complete, **verified-working** Vite project in this skill's
`assets/template/`, plus a design-system reference for adapting the look to any
domain.

The visual signature: frosted translucent cards floating over a soft yellow glow,
a single bright accent (`#FFD85F`) against warm grays, oversized tight numerals,
and a layout tuned per breakpoint so it reads as a screen-filling poster on
desktop and a calm scroll on mobile.

## What you get

A working dashboard with: a pill navbar (brand, nav links, configs/bell/avatar,
mobile menu), a greeting + composition segment-bar + stat blocks, and six cards —
a hero photo card, a KPI+bar-chart card, a radial progress-ring card, an
induction/task-list column, a collapsible accordion, and a week calendar with
events. Stack: React 18, TypeScript, Vite, Tailwind 3.4, Recharts 3.x,
lucide-react. (`@supabase/supabase-js` is preinstalled as a data hook but unused.)

## How to use it

There are two ways to use this template, and **both start from the same files**:

- **Clone & customize** — the user wants *this* dashboard as a starting point.
  Scaffold it, then edit copy/data/images.
- **Adapt to another domain** — the user wants a *different* dashboard (sales,
  finance, ops…) in this style. Scaffold it, then remap the card slots and
  re-skin per the design system.

### Step 1 — Scaffold from the template

Copy everything in this skill's `assets/template/` into a new project directory
(ask the user for the name/location if unclear; default to a `talvex-dashboard/`
or domain-named folder in the current working directory).

```bash
# from the skill's assets/template, into the new project dir
rsync -a "<this-skill>/assets/template/" "<target-dir>/"
# then make it the project's own identity
# edit <target-dir>/package.json -> "name": "<project-name>"
```

The template has no `node_modules` (you'll install fresh) and includes a
`package-lock.json` pinning the exact tested dependency versions.

### Step 2 — Install and run

```bash
cd "<target-dir>"
npm install
npm run dev      # Vite dev server, default http://localhost:5173
```

### Step 3 — Verify it renders

Open the dev server and confirm it works **across all three breakpoints** —
mobile, tablet, desktop — since responsiveness is a core feature. Use whatever
browser-preview tooling is available; check that the chart renders bars, the
progress ring draws, and the layout reflows (single column → 2-col → 4-col grid).
A clean console matters — the template is tuned to avoid Recharts warnings.

### Step 4 — Customize

Read `references/design-system.md` before making changes — it has the palette,
typography, card recipes, the responsive architecture, a card-slot inventory, and
(critically) the Recharts gotchas. Then:

- **Clone & customize:** each card under `src/components/cards/` is self-contained
  with inline data — edit the brand name, greeting, stats, and per-card content.
  Swap the Pexels image URLs for the user's assets.
- **Adapt to another domain:** follow §9 of the reference. Keep the look (palette,
  font, glow, frosted cards, breakpoints); change the content. Map each piece of
  the user's data to the **closest existing card archetype** (§7 of the reference)
  rather than inventing new card types — e.g. a trend → the bar-chart card, a
  single % KPI → the ring card, a checklist/pipeline → the task column, a schedule
  → the calendar. Replace inline data with props or a real source.

## Critical: don't break the chart

If you edit or add a Recharts chart, preserve the three things that make it render
correctly in this multi-layout dashboard (full explanation in §8 of the reference):

1. A **hidden `YAxis` with an explicit `domain`** (`<YAxis hide domain={[0, max]} />`)
   — without it, bars collapse to ~1px.
2. Render `<BarChart>` at an **explicit measured size** (the `useSize` ResizeObserver
   hook), only when the wrapper has size — not bare `ResponsiveContainer`, which
   spams `width(0)` warnings from the hidden breakpoint copies.
3. `isAnimationActive={false}` on the bars so they render immediately instead of
   getting stuck in Recharts' empty pre-animation state.

## Notes

- Keep the restraint that defines the look: one accent color, one diffuse glow,
  frosted cards, oversized numbers, lots of whitespace. Adding a second accent or
  opaque cards usually cheapens it.
- To recolor globally, find-and-replace the three palette hexes (`#FFD85F`,
  `#303030`, `#898989`) and reconsider the blob fill in `Background.tsx`.
- When adding a card, add it to **all three** layouts in `DashboardGrid.tsx`.
