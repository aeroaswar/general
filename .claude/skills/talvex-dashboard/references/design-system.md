# Talvex Dashboard — Design System & Template Reference

This is the visual language and architecture behind the Talvex template in
`assets/template/`. Read it when scaffolding a new dashboard, restyling the
template, or adapting it to a different domain (sales, finance, ops, health…).

## Table of contents
1. [Stack & template layout](#1-stack--template-layout)
2. [Color palette](#2-color-palette)
3. [Typography & font loading](#3-typography--font-loading)
4. [Background — the blurred blob](#4-background--the-blurred-blob)
5. [Card system (glassmorphism)](#5-card-system-glassmorphism)
6. [Responsive layout architecture](#6-responsive-layout-architecture)
7. [Component inventory — the six cards](#7-component-inventory--the-six-cards)
8. [Recharts integration & gotchas](#8-recharts-integration--gotchas)
9. [Adapting the template to other dashboards](#9-adapting-the-template-to-other-dashboards)

---

## 1. Stack & template layout

- **React 18 + TypeScript + Vite** (dev server `npm run dev`, build `npm run build`).
- **Tailwind CSS 3.4** for styling, **Recharts 3.x** for charts, **lucide-react** for icons.
- `@supabase/supabase-js` is in `package.json` but not wired up — it's there as a
  ready hook for real data. Remove it if the dashboard stays static.

```
template/
├── index.html              # loads the Sofia Pro font + mounts #root
├── package.json            # pinned deps (recharts 3.8.1, lucide 0.344.0, tailwind 3.4.1)
├── tailwind.config.js      # 3xl/4xl radii, custom color tokens
├── postcss.config.js
├── tsconfig*.json
├── vite.config.ts
└── src/
    ├── main.tsx            # React entry
    ├── index.css           # @tailwind layers + global font + scrollbar
    ├── App.tsx             # background + two responsive shells
    └── components/
        ├── Background.tsx        # fixed full-screen SVG (base fill + blurred blob)
        ├── Navbar.tsx            # brand pill, nav links, configs/bell/avatar, mobile menu
        ├── WelcomeRow.tsx        # greeting + segment bar + stat blocks
        ├── DashboardGrid.tsx     # the three breakpoint layouts
        └── cards/                # six self-contained cards (see §7)
```

Each card is **self-contained** with its own hardcoded data. That's deliberate:
it makes a card trivial to lift out, restyle, or swap. Replace the inline data
with props or a fetch when wiring real data.

---

## 2. Color palette

The whole look rides on a tight, warm-neutral palette with a single bright accent.

| Role | Hex | Used for |
|---|---|---|
| Accent (yellow) | `#FFD85F` | highlight bar/segment, active chart bar, progress ring, checks, notification dot |
| Dark gray | `#303030` | primary text, dark fills, dark task panel, active nav pill |
| Light gray | `#898989` | secondary text, borders (at low opacity), icon badges |
| Background base | `#E3E5E6` | the flat base behind the blurred blob |
| Card fill | `white/60` + `backdrop-blur-3xl` | every glass card |

Opacity modifiers do the heavy lifting — e.g. `border-[#898989]/20`,
`bg-[#898989]/15`, `text-white/30`, `hover:bg-[#898989]/8`. This keeps one base
hue reading as many tones without adding colors.

**Tailwind tokens** (in `tailwind.config.js`) mirror these as `yellow.DEFAULT`,
`dark-gray`, `light-gray`, but the components mostly use arbitrary values
(`bg-[#303030]`) so the palette is explicit at every call site. When restyling,
the fastest global change is find-and-replace on the three hexes.

**Shadows** are soft and low: `shadow-[0_2px_20px_rgba(0,0,0,0.06)]` for cards,
`0.10` alpha for the photo card.

---

## 3. Typography & font loading

- Font is **Sofia Pro**, loaded as an external stylesheet in `index.html`:
  `https://db.onlinewebfonts.com/c/060e116a70e3096c52db16f61aaab194?family=Sofia+Pro+Regular`
- `src/index.css` forces it globally with `* { font-family: "Sofia Pro Medium", sans-serif; -webkit-font-smoothing: antialiased; }` and the root `<div>` inline style uses `"Sofia Pro Regular", sans-serif`.
- Tailwind's `sans` is set to Century Gothic as a *fallback only* — real rendering uses Sofia Pro.
- **Type scale is large and tight**: greeting/stat numbers at `text-3xl sm:text-4xl lg:text-5xl` with `leading-none`/`leading-tight` and `tracking-tight`. Headings are `text-lg`, labels `text-xs`. The big-number-over-tiny-label pattern is core to the look.

To swap fonts: change the `<link>` in `index.html` and the `*` rule + root style. Keep the large/tight numeric treatment — it's what makes the dashboard feel premium rather than dense.

---

## 4. Background — the blurred blob

`Background.tsx` is a `fixed inset-0` full-screen SVG (`viewBox="0 0 1280 832"`,
`preserveAspectRatio="xMidYMid slice"`) sitting behind everything; the layout
shells are `relative z-10` on top.

- A base `<rect>` fills the viewport with `#E3E5E6`.
- A large accent-colored blob path is heavily Gaussian-blurred (`stdDeviation="250"`)
  via a filter (`feFlood → feBlend → feGaussianBlur`) with an oversized filter
  region so the blur isn't clipped. The result is a soft warm glow low in the view.

This single diffuse glow + flat base + frosted cards is the entire "environment."
To recolor the mood, change the blob `fill` and the base `rect` fill. Keep the
huge blur — a crisp blob looks cheap; the diffusion is the point.

---

## 5. Card system (glassmorphism)

Every card shares one wrapper recipe:

```
bg-white/60 backdrop-blur-3xl rounded-3xl p-5 shadow-[0_2px_20px_rgba(0,0,0,0.06)]
```

- `rounded-3xl` = 24px (custom token). The photo card and dark task panel use it too.
- Frosted translucency (`white/60` + `backdrop-blur-3xl`) over the glow is what
  gives depth. Don't make cards opaque — they're meant to let the background bleed.
- Cards opt into filling their grid cell on desktop with `lg:h-full`, but size to
  content on mobile/tablet. This one modifier is how the same card works in a
  fixed-height desktop grid and a free-flowing mobile stack.
- A **dark inset panel** (`bg-[#303030] rounded-3xl p-5`) is used inside a light
  card (the Pending Actions list) for contrast — a reusable motif for "focus" content.

Inner controls are small white circles (`w-8/w-10 h-8/h-10 rounded-full bg-white
shadow-sm`) holding a 14–16px lucide icon; the primary action inverts to a dark
circle (`bg-[#303030]` + white icon). Pills everywhere: `rounded-full` with a
thin `border-[#898989]/…` and translucent fill.

---

## 6. Responsive layout architecture

The dashboard is **fully responsive across three breakpoints**, and the structure
is worth understanding before you move things around.

**Two layout shells in `App.tsx`** (both `relative z-10 max-w-[1400px] mx-auto`):
- **Desktop (`hidden lg:flex`)** — `h-screen … flex-col overflow-hidden`; the grid
  area is `flex-1 min-h-0` so everything fits one screen with no page scroll.
- **Mobile/Tablet (`lg:hidden`)** — `min-h-screen … overflow-y-auto`; a normal
  scrolling column.

Both render `Navbar`, `WelcomeRow`, `DashboardGrid` in that order.

**Three layouts inside `DashboardGrid.tsx`** (only one visible at a time via Tailwind
`hidden`/`md:`/`lg:` toggles):
- **Mobile `<md`** — `flex flex-col gap-3`, single column. Order: Profile, Activity,
  Timer, Onboarding, Accordion, Calendar.
- **Tablet `md–lg`** — 2-col CSS grid; Profile/Activity/Timer/Accordion form a 2×2,
  then Calendar and Onboarding each `col-span-2`.
- **Desktop `lg+`** — 4-col × 2-row CSS grid with explicit placement: Onboarding
  spans both rows in col 4; Calendar spans cols 2–3 in row 2; the rest are single
  cells. `gridTemplateRows: '1fr 1fr'` + per-cell `h-full min-h-0` makes cards
  stretch to fill.

**Why this shape:** desktop wants a dense, screen-filling poster; mobile wants a
calm scroll. Rather than force one grid to do both, each breakpoint gets a layout
tuned to it, and the cards adapt via `lg:h-full`. When adding a card, place it in
all three layouts.

> Note: because both shells mount and each holds all three layouts, a given card
> can be instantiated several times (only one visible). That's fine for static
> content but matters for charts — see §8.

---

## 7. Component inventory — the six cards

Treat these as **slots**. Each is a recognizable dashboard archetype; to repurpose
the dashboard, keep the archetype and swap the content/data.

| File | Archetype | Reuse it for… |
|---|---|---|
| `ProfilePhotoCard` | Hero image w/ frosted info bar | featured person/product/property, "now playing", spotlight |
| `ProgressCard` | KPI number + bar chart (one highlighted bar) | any weekly/temporal metric (revenue, signups, usage) |
| `TimeTrackerCard` | Radial progress ring + transport controls | any single 0–100% KPI (goal completion, capacity, score) |
| `OnboardingColumn` | % header + stacked segments + dark task/list panel | checklists, pipelines, to-dos, approvals, agenda |
| `AccordionCard` | Collapsible rows, one expanded w/ rich content | settings, FAQ, line items, nested detail |
| `CalendarCard` | Day columns + absolutely-positioned event blocks | schedules, timelines, bookings, Gantt-lite |

Shared sub-patterns you can lift:
- **Stat block** (`WelcomeRow`): icon badge → big number → tiny label.
- **Segment bar** (`WelcomeRow`): flex segments with proportional `flex` weights +
  labels above; mixes solid, accent, hatched (`repeating-linear-gradient`), and
  outlined fills to show composition.
- **Avatar group** (`CalendarCard`): overlapping `w-6 h-6 rounded-full border-2
  border-white` images with negative `marginLeft`.
- **Task row** (`OnboardingColumn`): icon circle → title/time → done-state check
  (accent circle + `Check`) vs. empty bordered circle; done rows get
  `line-through text-white/30`.

---

## 8. Recharts integration & gotchas

`ProgressCard` is the only chart. Three non-obvious things make it render correctly
in this multi-layout dashboard — keep them when adding charts:

1. **Anchor the scale with a hidden `YAxis`.** Without an explicit domain, Recharts
   3.x auto-inflates the Y axis and bars render ~1px tall. Use
   `<YAxis hide domain={[0, max]} />` (here `max` is a little above the data max,
   e.g. data peaks at 7.2 → domain `[0, 8]`).

2. **Render at an explicit measured size, not `ResponsiveContainer`.** Because each
   card mounts across several breakpoint copies, the hidden (`display:none`) copies
   give `ResponsiveContainer` a 0×0 box and it logs a `width(0)/height(0)` warning on
   every render — hundreds of them. The template measures the wrapper with a
   `ResizeObserver` (`useSize` hook) and only renders `<BarChart width={w} height={h}>`
   when the wrapper actually has size. Hidden copies render nothing; the visible one
   resizes fluidly. (Equivalent alternative: keep `ResponsiveContainer` but gate it
   behind a visibility check so it never mounts at 0×0.)

3. **Disable bar animation: `isAnimationActive={false}`.** In some mount conditions
   Recharts 3.x leaves bars stuck in their empty pre-animation state (a
   `recharts-inactive-bar` group with no path). Disabling the entrance animation
   forces the bar paths to render immediately, and a static dashboard doesn't need
   the animation anyway.

Styling notes: XAxis is label-only (`axisLine={false} tickLine={false}`, small
`#898989` ticks); bars use `radius={[6,6,6,6]}` and per-bar `<Cell>` fills so one bar
can be the accent color; the tooltip is a custom accent pill shown for the single
highlighted bar.

---

## 9. Adapting the template to other dashboards

The user chose a template that's **both** a ready-to-edit Talvex clone *and* a
reusable style system. To adapt it to a different domain:

**Keep (this IS the Talvex look):**
- The palette (§2), Sofia Pro + large/tight numerals (§3), the blurred-blob
  background (§4), the frosted card recipe + soft shadows (§5), and the
  three-breakpoint architecture (§6).

**Change (the content):**
1. **Re-skin the navbar & greeting** — brand name, nav items, greeting copy, the
   three header stats, and the segment bar's categories/weights.
2. **Remap the six card slots** using the table in §7. Pick the closest archetype
   for each piece of content rather than building new card types — e.g. a finance
   dashboard might make ProgressCard show monthly revenue, TimeTrackerCard show
   budget-used %, OnboardingColumn show an approvals queue, CalendarCard show a
   close calendar.
3. **Swap the data** — replace each card's inline constants with props or a data
   source (Supabase is pre-installed; or fetch/REST).
4. **Recolor if needed** — to change the accent, find-and-replace `#FFD85F`
   (and reconsider the blob fill). Keep a *single* bright accent against the warm
   neutrals; adding a second accent usually cheapens it.
5. **Swap imagery** — the template uses Pexels URLs; replace with the user's assets.

**Guiding principle:** the magic is restraint — one accent, one diffuse glow,
frosted cards, oversized numbers, generous whitespace. When in doubt, simplify and
let the background show through rather than adding chrome.
