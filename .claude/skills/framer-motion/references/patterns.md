# Framer Motion — Patterns

Copy-paste recipes for the interactions people actually build. Each uses the shared tokens from
`assets/motion-tokens.ts` (assumed imported as `@/lib/motion`) so timing stays coherent — adapt
the markup, keep the timing. Imports are from `"motion/react"`; switch to `"framer-motion"` only to
match an existing codebase.

## Table of contents

1. Scroll-reveal (fade-up on view)
2. Staggered list / grid
3. Hover & tap card
4. Modal / dialog (AnimatePresence)
5. Dropdown / menu
6. Page / route transition
7. Shared-element (animated tab underline)
8. Scroll-progress bar
9. Parallax on scroll
10. Animated number (count-up)
11. Edge-masked marquee
12. Accordion (layout)

---

## 1. Scroll-reveal (fade-up on view)

```tsx
import { motion } from "motion/react";
import { fadeUp } from "@/lib/motion";

<motion.section
  variants={fadeUp()}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
>
  …
</motion.section>
```

`fadeUp()` returns `{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: SPRING.soft } }`.
`once: true` keeps it a one-shot; `amount: 0.3` triggers when 30% is visible.

## 2. Staggered list / grid

Parent holds the stagger; children inherit. Define variants outside the component.

```tsx
import { motion } from "motion/react";
import { stagger, fadeUp } from "@/lib/motion";

const container = stagger(0.08, 0.1);   // staggerChildren, delayChildren
const item = fadeUp(12);

export function Grid({ items }) {
  return (
    <motion.ul variants={container} initial="hidden" whileInView="visible"
               viewport={{ once: true, amount: 0.2 }}>
      {items.map((it) => (
        <motion.li key={it.id} variants={item}>{it.label}</motion.li>
      ))}
    </motion.ul>
  );
}
```

For very long lists, prefer `whileInView` per item (or stagger only the first ~10) so the sequence
doesn't take seconds.

## 3. Hover & tap card

```tsx
import { motion } from "motion/react";
import { SPRING } from "@/lib/motion";

<motion.button
  whileHover={{ y: -3, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={SPRING.snappy}
  className="card"
>
  …
</motion.button>
```

Keep lift small (`y: -2…-4`, `scale ≤ 1.04`). A snappy spring makes it feel responsive, not floaty.

## 4. Modal / dialog (AnimatePresence)

The wrapper stays mounted; the dialog toggles. Includes backdrop, reduced-motion, body-scroll lock,
and focus.

```tsx
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";

export function Modal({ open, onClose, children }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="backdrop"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: DURATION.fast }}
          onClick={onClose}
        >
          <motion.div
            role="dialog" aria-modal="true"
            className="dialog"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: DURATION.base, ease: EASE.expoOut }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Still wire up focus trap + `Escape` to close + restore focus on close — animation doesn't replace
a11y. Use `mode="wait"` if swapping between two dialogs by `key`.

## 5. Dropdown / menu

```tsx
import { AnimatePresence, motion } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";

<AnimatePresence>
  {open && (
    <motion.ul
      key="menu"
      initial={{ opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: DURATION.fast, ease: EASE.easeOut }}
      style={{ transformOrigin: "top" }}
    >
      …
    </motion.ul>
  )}
</AnimatePresence>
```

Set `transformOrigin` toward the trigger so it scales *from* the button.

## 6. Page / route transition

**Next.js App Router** — `app/template.tsx` re-mounts on navigation, so it animates each route:

```tsx
"use client";
import { motion } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";

export default function Template({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.entrance, ease: EASE.expoOut }}
    >
      {children}
    </motion.main>
  );
}
```

**React Router** — key an `AnimatePresence mode="wait"` by `location.pathname`:

```tsx
const location = useLocation();
<AnimatePresence mode="wait">
  <motion.div key={location.pathname}
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: DURATION.fast }}>
    <Routes location={location}>…</Routes>
  </motion.div>
</AnimatePresence>
```

## 7. Shared-element (animated tab underline)

Give the indicator the same `layoutId` across tabs; Framer Motion slides it to the active one.

```tsx
import { motion } from "motion/react";
import { SPRING } from "@/lib/motion";

{tabs.map((t) => (
  <button key={t.id} onClick={() => setActive(t.id)} className="tab">
    {t.label}
    {active === t.id && (
      <motion.span layoutId="tab-underline" className="underline" transition={SPRING.soft} />
    )}
  </button>
))}
```

Same trick scales to card→detail "magic move": render the source and destination with the same
`layoutId` and toggle which is mounted.

## 8. Scroll-progress bar

```tsx
import { motion, useScroll } from "motion/react";

export function ScrollBar() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="progress" style={{ scaleX: scrollYProgress, transformOrigin: "left" }} />;
}
```

`scaleX` from a motion value is render-free. Add `useSpring(scrollYProgress, { stiffness: 120,
damping: 30 })` for a smoothed bar.

## 9. Parallax on scroll

```tsx
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export function Parallax({ src }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <div ref={ref} className="frame">
      <motion.img src={src} style={{ y }} />
    </div>
  );
}
```

Keep parallax travel subtle (≤ ~15%). Disable under reduced motion (branch on `useReducedMotion()`).

## 10. Animated number (count-up)

Render the motion value as the element's child — it updates without re-rendering.

```tsx
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

export function Counter({ to }: { to: number }) {
  const reduce = useReducedMotion();
  const count = useMotionValue(0);
  const text = useTransform(count, (v) => Math.round(v).toLocaleString());
  useEffect(() => {
    if (reduce) { count.set(to); return; }
    const controls = animate(count, to, { duration: 1.2, ease: EASE.expoOut });
    return () => controls.stop();
  }, [to, reduce]);
  return <motion.span>{text}</motion.span>;
}
```

## 11. Edge-masked marquee

A continuously scrolling row that fades at both edges (the precision-bento marquee, in JS). Two
copies of the content make the loop seamless.

```tsx
import { motion } from "motion/react";

export function Marquee({ children, duration = 26 }) {
  return (
    <div
      className="marquee"
      style={{ overflow: "hidden", WebkitMaskImage:
        "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
    >
      <motion.div
        style={{ display: "flex", gap: 24, width: "max-content" }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {children}
        {children /* duplicate for seamless wrap */}
      </motion.div>
    </div>
  );
}
```

Pause under reduced motion (render a static row when `useReducedMotion()` is true). `linear` is the
one place it belongs — continuous motion shouldn't ease.

## 12. Accordion (layout)

Let `layout` animate the height change instead of animating `height` by hand.

```tsx
import { AnimatePresence, motion } from "motion/react";
import { EASE, DURATION } from "@/lib/motion";

<motion.div layout className="row">
  <button onClick={() => setOpen(!open)}>{title}</button>
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        key="content"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: DURATION.base, ease: EASE.easeOut }}
        style={{ overflow: "hidden" }}
      >
        {body}
      </motion.div>
    )}
  </AnimatePresence>
</motion.div>
```

`height: "auto"` is one of the few cases Framer Motion measures and animates for you; keep
`overflow: hidden` so content clips during the collapse.
