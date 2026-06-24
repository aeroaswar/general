# Framer Motion — API Reference

Concise but complete reference for the React API (`motion/react`, v12). For *which* timing/easing
to choose, see `house-style.md`; for full recipes, see `patterns.md`. All imports below are from
`"motion/react"` (swap to `"framer-motion"` only to match an existing codebase).

## Table of contents

1. The `motion` component
2. `transition` — tween, spring, keyframes, repeat, orchestration
3. `variants`
4. Gestures — hover / tap / focus / inView / drag
5. `AnimatePresence`
6. Layout animations — `layout`, `layoutId`, `LayoutGroup`
7. Motion values & hooks
8. `useScroll` & scroll-linked animation
9. `useAnimate` — imperative animation
10. `MotionConfig`
11. `LazyMotion` & `m` (bundle size)
12. Next.js / RSC / SSR

---

## 1. The `motion` component

`motion.<tag>` (e.g. `motion.div`, `motion.button`, `motion.a`, `motion.svg`, `motion.path`)
renders the element with animation superpowers. Core props:

| Prop          | Meaning                                                                 |
|---------------|-------------------------------------------------------------------------|
| `initial`     | Starting state (on mount). `initial={false}` skips the mount animation. |
| `animate`     | Target state. Animates whenever this value changes.                     |
| `exit`        | State to animate to when removed — **requires `AnimatePresence`**.       |
| `transition`  | How to animate (see §2). Can also be nested per-property.               |
| `variants`    | Named state map (see §3).                                               |
| `style`       | Standard styles; bind **motion values** here for render-free updates.   |
| `whileHover` / `whileTap` / `whileFocus` / `whileInView` / `whileDrag` | Gesture states (see §4). |
| `custom`      | Arbitrary data passed to dynamic variants (functions).                  |
| `layout` / `layoutId` | Auto layout animation (see §6).                                 |
| `drag`        | Enable dragging (see §4).                                               |
| `onAnimationStart` / `onAnimationComplete` / `onUpdate` | Lifecycle callbacks.          |

```tsx
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
/>
```

You can animate transforms (`x`, `y`, `scale`, `rotate`, `skew`), `opacity`, colors, `backgroundColor`,
`borderRadius`, CSS variables (`"--foo"`), `pathLength` (SVG draw), and more. Transforms are
individual props (`x`, not `translateX`) and are GPU-composited — prefer them.

## 2. `transition`

Attach to a `motion` element (applies to all animating props) or nest per property.

**Tween** (time-based):
```tsx
transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
// ease: named ("easeOut","easeInOut","circIn","backOut",...) | cubic-bezier array | fn
```

**Spring (classic, physical):**
```tsx
transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
```
**Spring (ergonomic):** — easier to tune; **do not combine with `stiffness`/`damping`**:
```tsx
transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
```

**Per-property transitions** (e.g. spring the position, tween the opacity):
```tsx
animate={{ x: 100, opacity: 1 }}
transition={{ default: { type: "spring" }, opacity: { duration: 0.2, ease: "linear" } }}
```

**Keyframes** — arrays animate through each value; control stops with `times` (0→1):
```tsx
animate={{ scale: [1, 1.1, 1], rotate: [0, 0, -8, 8, 0] }}
transition={{ duration: 0.6, times: [0, 0.4, 1] }}
```

**Repeat:** `repeat: Infinity`, `repeatType: "loop" | "reverse" | "mirror"`, `repeatDelay`.

**Orchestration** (on a parent driving variants): `delay`, `delayChildren`, `staggerChildren`,
`staggerDirection` (1 | -1), `when: "beforeChildren" | "afterChildren"`.

## 3. `variants`

Named states defined once, referenced by string, and **propagated to motion children**. Define
**outside the component** so identity is stable.

```tsx
const list = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 20 } },
};

<motion.ul variants={list} initial="hidden" animate="visible">
  {rows.map((r) => <motion.li key={r.id} variants={item}>{r.label}</motion.li>)}
</motion.ul>
```

Children inherit the parent's active state name — you don't set `animate` on each child. **Dynamic
variants** are functions receiving `custom`:
```tsx
const item = { hidden: { opacity: 0 }, visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.05 } }) };
<motion.li custom={index} variants={item} />
```

## 4. Gestures

- **`whileHover={{ scale: 1.03 }}`** — pointer over. `onHoverStart/End`.
- **`whileTap={{ scale: 0.97 }}`** — pressed. `onTap/onTapStart/onTapCancel`.
- **`whileFocus`** — keyboard/focus state (use for accessible focus styling).
- **`whileInView`** + `viewport` — animate when scrolled into view:
  ```tsx
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
  />
  ```
  `once` = animate a single time; `amount` = `"some" | "all" | 0–1` visible threshold;
  `margin` = grow/shrink the trigger box (like IntersectionObserver rootMargin).
- **Drag:** `drag` (`true | "x" | "y"`), `dragConstraints={{ left, right, top, bottom }}` or a ref,
  `dragElastic` (0–1), `dragMomentum`, `dragControls` (manual start via `useDragControls`),
  `whileDrag`, `onDragEnd`.

## 5. `AnimatePresence`

The mechanism for **exit** animations. Wrap conditionally-rendered motion elements; the wrapper
stays mounted, the child toggles.

```tsx
<AnimatePresence mode="wait">
  {open && (
    <motion.div key="panel"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
    />
  )}
</AnimatePresence>
```

- **Every child needs a stable, unique `key`.** Swapping the key triggers exit+enter.
- **`mode`:** `"sync"` (default, overlap), `"wait"` (finish exit before enter — page/tab swaps),
  `"popLayout"` (exiting element is popped from flow so siblings animate via `layout`).
- **`initial={false}`** on the wrapper → no animation for items present on first render.
- **`onExitComplete`** fires after all exits finish (e.g. reset scroll, unlock body).
- For a list, give each entry its own `key`; AnimatePresence diffs by key to know what's leaving.

## 6. Layout animations

Animate layout changes (size, position, reordering) that you normally *can't* tween:

- **`layout`** — animate this element when its layout changes between renders (flex/grid reflow,
  size change). `layout="position"` (only position) or `"size"` (only size) to scope it.
- **`layoutId="hero"`** — **shared-element transitions**: when an element with a given `layoutId`
  unmounts and another with the same id mounts, Framer Motion animates between them (e.g. a
  thumbnail expanding into a detail view, an active-tab underline sliding).
- **`LayoutGroup`** — wrap sibling components so their `layout`/`layoutId` animations coordinate
  (e.g. an accordion list where opening one resizes others). `LayoutGroup id="..."` namespaces ids.
- **`layoutScroll`** on a scrollable ancestor, and **`layoutRoot`**, help measure correctly.
- **`layoutDependency={x}`** limits re-measure to when `x` changes (perf).

Layout animations use transforms under the hood (cheap) and auto-correct child distortion and
`border-radius`/`box-shadow`. **Don't** hand-animate `width/height/top/left` — use `layout`.
Caveat: a `display: contents` or transformed ancestor can break measurement.

## 7. Motion values & hooks

A **motion value** holds an animating number/string and updates the DOM **without re-rendering**.

```tsx
const x = useMotionValue(0);
const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);   // map one range to another
return <motion.div drag="x" style={{ x, opacity }} />;
```

- **`useMotionValue(initial)`** — create one. `.get()`, `.set()`, `.on("change", cb)`.
- **`useTransform(source, inputRange, outputRange, opts?)`** or `useTransform(() => …)` — derive a
  value. Outputs can be numbers, colors, or strings.
- **`useSpring(source | value, config)`** — a spring-smoothed motion value (great for lag-following
  cursors, smoothed scroll).
- **`useMotionTemplate`** — interpolate motion values into a string:
  `` const filter = useMotionTemplate`blur(${blurPx}px)` ``.
- **`useMotionValueEvent(value, "change", cb)`** — subscribe inside a component safely.
- **`useVelocity(value)`**, **`useTime()`** (ever-increasing ms), **`useAnimationFrame(cb)`**.
- **`useInView(ref, { once, amount, margin })`** — boolean visibility (no styling attached).
- **`useReducedMotion()`** — boolean; branch your animation on it.

Bind motion values via `style={{ x, opacity }}` — **not** `animate` — so updates skip React.

## 8. `useScroll` & scroll-linked animation

```tsx
const ref = useRef(null);
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);   // parallax
return <motion.div ref={ref} style={{ y }} />;
```

- `useScroll()` with no args → whole-page `scrollX/Y` and `scrollXProgress/scrollYProgress` (0→1).
- `target` + `offset` → progress of an element through the viewport. `offset` is `[targetEdge
  viewportEdge, …]`, e.g. `["start end", "end start"]` = from "element top hits viewport bottom" to
  "element bottom hits viewport top".
- Pipe `scrollYProgress` through `useTransform` (and optionally `useSpring` to smooth) into `style`.
  Don't read it into `useState` — that defeats the render-free design.

## 9. `useAnimate` — imperative animation

For sequences, event-driven, or orchestrated animations beyond declarative props. Returns a
`scope` ref and an `animate` function; selectors are scoped to the ref's subtree.

```tsx
const [scope, animate] = useAnimate();
async function run() {
  await animate(scope.current, { opacity: 1 }, { duration: 0.3 });
  await animate("li", { x: 0, opacity: 1 }, { delay: stagger(0.06) });  // stagger from "motion/react"
}
return <ul ref={scope}>…</ul>;
```

`animate(target, keyframes, options)` also works standalone (imported from `motion/react`) on
motion values or elements. `stagger()` is imported from `motion/react`. This supersedes the older
`useAnimation()` controls for new code (controls still exist if you prefer `controls.start(...)`).

## 10. `MotionConfig`

App- or subtree-level defaults:

```tsx
<MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}>
  <App />
</MotionConfig>
```

- **`reducedMotion`:** `"user"` (respect OS setting — disables transform/layout, keeps opacity),
  `"always"`, `"never"`. Set `"user"` once at the root and most a11y is handled.
- **`transition`:** default transition for all descendants (override per element as needed).
- **`nonce`:** CSP nonce for injected styles.

## 11. `LazyMotion` & `m` (bundle size)

`motion.*` bundles all features. For size-sensitive pages, load features lazily and use the
lightweight **`m`** component:

```tsx
import { LazyMotion, domAnimation, m } from "motion/react";

<LazyMotion features={domAnimation}>      {/* or domMax for layout + drag */}
  <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
</LazyMotion>
```

- `domAnimation` ≈ animations + gestures (small). `domMax` adds layout + drag (larger).
- Use `m`, **not** `motion`, inside — `motion` re-pulls the full bundle. `features={() => import(...)}`
  can code-split them.

## 12. Next.js / RSC / SSR

- **Client only.** `motion.*`, `AnimatePresence`, and hooks need the browser. In the App Router,
  add **`"use client"`** at the top of any file using them, or import pre-marked components from
  **`motion/react-client`** (lets you use `<motion.div>` directly inside a Server Component).
- **Keep Server Components server-side** by isolating animation into small client leaf components,
  rather than marking a whole page `"use client"`.
- **SSR/hydration:** motion components render their `initial` state on the server, so first paint
  matches and there's no flash. Avoid reading `window`/`matchMedia` during render — use
  `useReducedMotion()` / effects instead.
