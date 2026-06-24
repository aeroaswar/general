# Framer Motion — House Style

The opinionated layer: the timing, easing, and physics defaults that make animations feel like
one calm, premium system instead of a grab-bag of effects. These mirror the precision-bento
sensibility — *physical, intentional, quiet, expensive* — translated into motion. Importable
values live in `assets/motion-tokens.ts`; this file explains the **why** so you can extend the
system without breaking it.

## Table of contents

1. Principles
2. Duration scale
3. Easing curves
4. Spring presets
5. Movement & distance
6. Stagger & orchestration
7. Reduced motion
8. Do / Don't

---

## 1. Principles

- **Motion communicates, it doesn't perform.** Every animation should explain a relationship
  (this came from there, that responds to you, these belong together). If it's purely
  decorative, it should be ambient and ignorable — or cut.
- **Decelerate into rest.** Things should arrive softly (ease-out / spring settle), not stop
  abruptly. Fast-in, soft-out is the premium signature.
- **Short and confident.** Long animations feel sluggish and draw attention to themselves.
  When unsure, make it faster.
- **Physical, not cartoonish.** Springs are felt as weight and responsiveness, not as bouncy
  overshoot. Keep bounce low on serious/professional UIs.
- **Consistency over novelty.** A few reused timings across the whole app read as craft. A
  different easing on every component reads as noise.

## 2. Duration scale

| Token        | Value   | Use for                                                        |
|--------------|---------|----------------------------------------------------------------|
| `instant`    | `0.1s`  | Color/opacity nudges, tiny state flips                         |
| `micro`      | `0.15s` | Hover/tap feedback, icon state, tooltips                       |
| `fast`       | `0.25s` | Small UI moves, dropdown items                                 |
| `base`       | `0.35s` | **Default** for most transitions                               |
| `entrance`   | `0.55s` | Section/content reveals on scroll or mount                     |
| `slow`       | `0.7s`  | Large hero/feature entrances, page transitions                 |
| `ambient`    | `20–28s`| Continuous loops (marquees, drifting backgrounds)              |

Rule of thumb: **if a non-ambient transition exceeds ~0.8s, it's probably too slow.** Bigger
elements can run slightly longer than small ones, but not double.

## 3. Easing curves

Easing is the personality. The house defaults, as cubic-bezier arrays (Framer Motion accepts
`ease: [x1, y1, x2, y2]` directly):

| Token        | Bezier                  | Feel / use                                          |
|--------------|-------------------------|-----------------------------------------------------|
| `easeOut`    | `[0.4, 0, 0.2, 1]`      | General-purpose move (Material standard). Safe default for anything not entrance-specific. |
| `expoOut`    | `[0.16, 1, 0.3, 1]`     | **Signature entrance.** Fast start, long soft landing — the "expensive" curve. Use for reveals. |
| `expoIn`     | `[0.7, 0, 0.84, 0]`     | Exits — accelerate away. Pair with `expoOut` for asymmetric enter/leave. |
| `easeInOut`  | `[0.65, 0, 0.35, 1]`    | Symmetric moves, loops that aren't strictly linear. |
| `linear`     | `linear`                | **Only** for continuous loops (marquee/spinner). Never for UI state changes — it feels robotic. |

Default pairing: enter with `expoOut`, leave with `expoIn` (or a quick `easeOut`). Reserve
overshoot for springs, not bezier easing.

## 4. Spring presets

Prefer springs for anything **interactive or layout-driven** — they respond to interruption
naturally (a re-targeted spring keeps its velocity; a tween restarts). Two ways to specify:

**Physical (classic):** `{ type: "spring", stiffness, damping, mass }`
**Ergonomic (modern):** `{ type: "spring", bounce, duration }` — easier to reason about; `bounce`
0 = no overshoot, ~0.25 = subtle, 0.5+ = playful. **Don't combine `duration` with `stiffness`.**

| Token     | Config                                          | Use for                                  |
|-----------|-------------------------------------------------|------------------------------------------|
| `soft`    | `{ type:"spring", stiffness:120, damping:20 }`  | Entrances, layout, drawers — calm settle |
| `snappy`  | `{ type:"spring", stiffness:400, damping:30 }`  | Hover/tap/press feedback — quick & tight |
| `gentle`  | `{ type:"spring", bounce:0.2, duration:0.6 }`   | Friendly emphasis with a hint of life    |
| `stiff`   | `{ type:"spring", stiffness:550, damping:34 }`  | Draggable elements snapping back         |

Keep `bounce ≤ 0.25` on professional/data/premium UIs. Save higher bounce for playful consumer
moments, and even then use it sparingly.

## 5. Movement & distance

- **Entrances translate small:** 8–24px (`y: 16` is a good default), combined with `opacity 0→1`.
  Distance scales loosely with element size — a hero can travel 24–32px, a list item 8–12px.
- **Prefer `y`/`x`/`scale`/`opacity`** (composited, cheap). Avoid animating `top/left/width/height`
  directly — use `layout` for size/position changes.
- **Scale ranges stay tight:** `0.96 → 1` for appear, `1 → 1.02–1.04` for hover lift, `0.97` for
  tap press. Big scale jumps look like zooming, not responding.
- **No gratuitous rotation/skew** on content. Rotation is for spinners, chevrons, and playful
  accents — not paragraphs and cards.

## 6. Stagger & orchestration

- **Stagger children `0.06–0.1s`** via parent `variants` + `transition.staggerChildren`. Below
  0.05 it reads as simultaneous; above ~0.12 it drags.
- **Delay the group, not each item.** Use `delayChildren` on the parent for an initial pause
  before the sequence, rather than hand-delaying items.
- **`when: "beforeChildren"`** when a container must finish (e.g. fade/expand) before its contents
  animate in; `"afterChildren"` for the reverse on exit.
- For long lists, stagger only the **visible** first ~8–12 items, or use `whileInView` per item —
  staggering 100 rows by 0.08s each takes 8 seconds and feels broken.

## 7. Reduced motion

Non-negotiable. Two complementary mechanisms:

- **Global:** wrap the app once: `<MotionConfig reducedMotion="user">`. With `"user"`, Framer
  Motion auto-disables **transform and layout** animations when the OS requests reduced motion,
  while still allowing opacity/color — so content can fade in without moving. This handles most
  cases for free.
- **Bespoke:** `const reduce = useReducedMotion()` and branch — e.g. set entrance `y` to `0`,
  swap a spring for a short fade, or skip a parallax entirely.

The goal: **information and affordances survive with motion off**; only the movement is removed.
Never gate functionality (a menu opening, content appearing) behind an animation that reduced
motion disables.

## 8. Do / Don't

**Do**
- Import timings from `motion-tokens.ts` so the app stays coherent.
- Enter fast-out-soft, leave quick. Asymmetric enter/exit is fine and usually better.
- Use `layout`/`layoutId` for anything that changes size, position, or swaps places.
- Let springs handle interruption; let `AnimatePresence` handle exits.
- Test the reduced-motion path as a first-class state.

**Don't**
- Don't run UI transitions longer than ~0.8s, or use `linear` easing for state changes.
- Don't animate `width/height/top/left/margin` directly — that's what `layout` is for.
- Don't pile on bounce/overshoot, big slides, or rotation on serious content — it reads cheap.
- Don't drive scroll/gesture effects through `useState` — use motion values.
- Don't define `variants`/`transition` objects inline (new identity each render restarts them) —
  hoist them out of the component.
