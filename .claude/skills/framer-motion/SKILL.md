---
name: framer-motion
description: >-
  Add, design, or debug animations and interactions in React with Framer Motion (the `motion`
  library — import from `motion/react`, formerly `framer-motion`). Reach for this whenever the
  user wants to animate a component; add entrance, scroll-reveal, hover, tap, or drag
  interactions; build page/route transitions; animate a modal, dropdown, toast, or accordion
  enter/exit (AnimatePresence); do shared-element or layout (auto) animations; wire scroll-linked
  or parallax effects; stagger a list; or just wants UI to feel "smooth", "polished", "alive", or
  "animated" — even if they don't say "Framer Motion". Also use when integrating motion into
  Next.js / React Server Components ("use client" / `motion/react-client`), fixing exit
  animations that don't fire, debugging layout-animation jank, or deciding spring vs tween vs
  easing. Defaults to a calm, premium house style: restrained durations, tasteful easing curves,
  spring physics, and reduced-motion safety. Not for: CSS-only/Tailwind keyframes when the user
  explicitly wants no JS dependency; GSAP, React Spring, Anime.js, or Motion One vanilla (other
  libraries); Canvas / WebGL / Three.js / React Three Fiber; Lottie playback; or non-React
  animation.
---

# Framer Motion

A house style and working guide for animating React UIs with **Framer Motion** — now shipped as
the **`motion`** package and imported from **`motion/react`** (the package formerly named
`framer-motion`, still published under that name at the same version). This is not a single
template; it's a set of opinionated defaults plus copy-paste patterns so every animation you add
feels like it came from the same calm, premium system.

## The philosophy in one breath

Motion should make an interface feel **physical and intentional, never decorative**. Things enter
by **fading up a few pixels**, respond to touch with a **quick, confident spring**, and rearrange
themselves with **smooth layout transitions** — restrained durations, decelerating easings, and
real spring physics. Quiet and expensive, never bouncy-for-the-sake-of-it. Always honor
`prefers-reduced-motion`. (This is the motion counterpart to the precision-bento look: *calm,
confident, never loud.*)

## Install & import

```bash
npm i motion          # modern package — import from "motion/react"
# or, in an existing codebase already on the old name:
npm i framer-motion   # same code, same version; import from "framer-motion"
```

```tsx
import { motion, AnimatePresence } from "motion/react"   // modern (preferred for new code)
// import { motion, AnimatePresence } from "framer-motion"  // legacy name — identical API
```

- **Both names track the same version** (currently v12.x, peer-deps `react ^18 || ^19`). Prefer
  `motion/react` for new code; **match the existing import in a codebase** rather than mixing the
  two (this repo's `stay-section` uses `framer-motion` — keep it consistent there).
- **Vanilla / non-React** DOM animation lives at the package root: `import { animate, scroll,
  inView, stagger } from "motion"`. In React, you almost always want `motion/react` instead.
- **React Server Components (Next.js App Router):** `motion` components are client-only. Either
  add `"use client"` at the top of the file, or import from **`motion/react-client`** (pre-marked
  client components you can drop straight into a Server Component). See `references/api.md`.

## Mental model (the five things that matter)

Internalize these and most of the API falls out naturally:

1. **`motion.<tag>` is a supercharged element.** `<motion.div>` takes everything a `<div>` takes,
   plus animation props. You animate by declaring **target state**, not by writing keyframes:
   `initial` (where it starts) → `animate` (where it goes) → `exit` (where it leaves to).
2. **`transition` describes the *how*, separately from the *what*.** Duration, easing, spring
   stiffness, delay, stagger — all live in `transition`. The default for transforms/layout is a
   **spring**; for opacity/color it's a tween. Set it explicitly when it matters.
3. **`variants` are named states that cascade to children.** Define `hidden`/`visible` once on a
   parent, and children inherit them — this is how you stagger lists cleanly (`staggerChildren`)
   without hand-delaying each item.
4. **`AnimatePresence` is the only way to animate elements *leaving* the tree.** React removes a
   node instantly; wrap it so `exit` can run first. Every child needs a **stable, unique `key`**.
5. **Motion values (`useMotionValue`, `useScroll`, …) animate *outside* React render.** They
   update the DOM directly without re-rendering the component — this is what makes scroll and
   gesture effects smooth. Reach for them when `useState` would cause re-render thrash.

## House-style defaults (use these, don't reinvent)

The opinionated layer. Full rationale and the token table live in
**`references/house-style.md`**; the importable values live in **`assets/motion-tokens.ts`**.
The short version:

- **Durations are short.** Micro-feedback `0.15s`, standard UI `0.3–0.4s`, entrances `0.5–0.7s`.
  Ambient loops (marquees) `20–28s`. If a UI transition runs longer than `~0.8s`, question it.
- **Easings decelerate.** Default entrance curve is an **expo-out** cubic-bezier
  `[0.16, 1, 0.3, 1]` — fast start, soft landing, reads as premium. Use `[0.4, 0, 0.2, 1]` for
  general moves and an **expo-in** `[0.7, 0, 0.84, 0]` for exits. Avoid `"linear"` except for
  continuous loops.
- **Springs over long tweens for anything interactive.** A calm spring
  (`{ type: "spring", stiffness: 120, damping: 20 }`) for entrances/layout; a snappy one
  (`{ stiffness: 400, damping: 30 }`) for hover/tap. Keep `bounce` low (`0–0.25`) — overshoot
  should be felt, not seen.
- **Move small.** Entrances translate **8–24px** and fade in. Big flashy slides cheapen it.
- **Stagger gently.** `staggerChildren: 0.06–0.1`. Enough to read as a sequence, not a parade.
- **Reduced motion is non-negotiable.** Wrap the app in `<MotionConfig reducedMotion="user">`,
  and/or branch on `useReducedMotion()` to collapse movement to opacity-only or instant. See
  *Accessibility* below.

## Files in this skill

- **`assets/motion-tokens.ts`** — ready-to-import constants: `EASE` curves, `DURATION` scale,
  `SPRING` presets, and small `variants` factories (`fadeUp`, `stagger`). **Start here** so every
  component shares the same timing. Drop it into the project (e.g. `src/lib/motion.ts`) and import
  from it instead of hardcoding numbers.
- **`references/house-style.md`** — the opinionated token reference and the do/don't list, with
  the *why* behind each choice. Read it when picking or adapting timings, or when an animation
  feels "off."
- **`references/api.md`** — concise but complete API reference: `motion` props, `transition`
  shapes (tween vs spring, the modern `bounce`+`duration` spring), `variants`, gestures
  (`whileHover/Tap/Focus/InView/Drag`), `AnimatePresence` modes, layout & `layoutId`, the hooks
  (`useScroll`, `useTransform`, `useSpring`, `useAnimate`, `useReducedMotion`, …), `MotionConfig`,
  and `LazyMotion`/`m` for bundle size. Read it when you need an exact prop or signature, or hit
  RSC/SSR issues.
- **`references/patterns.md`** — copy-paste recipes for the things people actually build:
  scroll-reveal, staggered grid, hover/tap card, modal & dropdown (AnimatePresence), page/route
  transition, shared-element (`layoutId`), scroll-progress bar, parallax, animated number, and an
  edge-masked marquee. Read it when assembling a specific interaction.

## Workflow

1. **Drop in the tokens.** Copy `assets/motion-tokens.ts` into the project's lib folder and import
   `EASE`, `DURATION`, `SPRING`, `fadeUp`, `stagger` from it. This keeps the whole app coherent.
2. **Match the existing import.** New project → `motion/react`. Existing one → use whatever it
   already imports (`framer-motion` vs `motion/react`); don't introduce a second copy.
3. **Pick the pattern** from `references/patterns.md` closest to what you're building and adapt it,
   using the tokens for timing rather than inline magic numbers.
4. **Prefer declarative.** Reach for `initial/animate/exit` + `variants` first. Only use the
   imperative `useAnimate` / motion values when you need orchestration, scroll-linking, or to
   avoid re-render thrash.
5. **Wire accessibility in as you go** (reduced motion, focus, `aria` for anything that
   appears/disappears) — it's part of the work, not a cleanup pass.
6. **Verify in the browser.** Watch entrances, exits (toggle the element off!), reflow, and the
   reduced-motion path. See *Previewing*.

## Common footguns (check these first when something's broken)

These cause the large majority of "my Framer Motion animation isn't working" bugs:

- **Exit animation never runs** → the element isn't a direct child of `<AnimatePresence>`, or it's
  missing a stable `key`, or you unmounted the `AnimatePresence` itself. The *presence* wrapper
  must stay mounted; the *child* is what conditionally renders.
- **`"use client"` missing (Next.js App Router)** → `motion.*` throws or silently no-ops in a
  Server Component. Add the directive or import from `motion/react-client`.
- **Layout animation jumps / distorts text** → animating `width`/`height`/`top`/`left` directly.
  Use the `layout` prop (it animates via transforms and corrects children) instead of animating
  layout properties by hand. Don't put `layout` on an element whose parent is `display: contents`.
- **`whileInView` fires once and never again, or never fires** → check `viewport={{ once, amount,
  margin }}`. `once: true` is intentional one-shot; `amount: "some" | "all" | 0–1` controls how
  much must be visible; a zero-height target never triggers.
- **`whileInView` reveals while still off-screen, or a stagger gets stuck hidden (dev only)** → two
  dev-mode traps, both absent in production: (1) if layout shifts *after* mount — Vite injects CSS
  post-paint in dev, or an image/video above loads late — an element briefly sits inside the
  viewport, the IntersectionObserver fires, and `once: true` locks it "revealed" before it's really
  scrolled to. (2) React **StrictMode** double-mounts in dev, which can strand a *parent-orchestrated*
  stagger (children that only inherit the parent's `visible` state) at their initial hidden state.
  If you need dev-accurate reveals or bulletproof SSR, give each child its own `whileInView` rather
  than relying solely on parent→child variant propagation. (Also: headless browsers often don't
  deliver IntersectionObserver updates for *programmatic* scrolls — verify reveals with a real
  scroll, or by mounting with the element already in view.)
- **Janky scroll / gesture effects** → you're driving them through `useState`. Use a **motion
  value** (`useScroll` → `useTransform` → bind to `style`) so updates skip React render.
- **Animation restarts on every render** → you're passing a **new object/array literal** to
  `animate`/`variants`/`transition` inline each render. Hoist constants or `useMemo` them; define
  `variants` outside the component.
- **Spring with `duration` ignored** → the classic spring uses `stiffness`/`damping`/`mass`; the
  newer ergonomic spring uses `bounce` + `duration`. Don't mix `stiffness` with `duration`.

## Accessibility & performance (part of the house style)

- **Honor reduced motion.** Wrap the tree once: `<MotionConfig reducedMotion="user">…`. For
  bespoke cases, `const reduce = useReducedMotion()` and collapse movement to opacity or skip it.
  Never ship motion that can't be turned down — vestibular safety is not optional.
- **Animate the cheap properties.** `transform` (x/y/scale/rotate) and `opacity` are
  GPU-friendly; animating `width`, `height`, `top`, `left`, `margin`, `box-shadow`, `filter`
  triggers layout/paint. Use `layout` for size/position changes; use transforms for movement.
- **Keep focus and semantics correct.** Elements that appear (modals, menus) still need focus
  management, `role`, and `aria-*`; decorative motion elements get `aria-hidden`. Animation never
  replaces accessible structure.
- **Trim the bundle when it matters.** `motion` is tree-shakeable; for size-sensitive surfaces use
  **`LazyMotion`** with `domAnimation` (or `domMax`) and the lightweight **`m`** component instead
  of `motion`. See `references/api.md`.
- **Cap continuous motion.** Looping/animated-forever effects are ambient accents, not the main
  event — a few per view at most, and they must stop under reduced motion.

## Previewing

Render in a real browser and confirm the full lifecycle, not just the entrance: the element
**enters**, **exits** when toggled off (this is where AnimatePresence bugs hide), the layout
**reflows** smoothly, and the **reduced-motion** path degrades gracefully (toggle it in the OS or
DevTools rendering panel). Use the project's dev server / preview tooling. For scroll effects,
scrub the page; for gestures, actually hover/tap/drag.
