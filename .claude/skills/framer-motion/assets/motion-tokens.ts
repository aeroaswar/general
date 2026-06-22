/**
 * motion-tokens.ts — shared animation tokens (house style)
 * ---------------------------------------------------------
 * Drop this into a project (e.g. `src/lib/motion.ts`) and import from it everywhere instead of
 * hardcoding durations/easings. Keeping every component on the same handful of values is what
 * makes a UI's motion feel like one coherent, premium system.
 *
 * Works with both `motion/react` (modern) and `framer-motion` (legacy) — these are plain objects,
 * no package import required. For typed variants, uncomment the import below to match your install:
 *
 *   // import type { Variants, Transition } from "motion/react";   // or "framer-motion"
 *
 * Rationale and the full table live in the skill's references/house-style.md.
 */

/** A cubic-bezier easing tuple — typed as a 4-tuple so it satisfies Framer Motion's `ease`. */
export type Bezier = [number, number, number, number];

/** Easing curves as cubic-bezier tuples (Framer Motion accepts `ease: [...]`). */
export const EASE = {
  /** General-purpose move (Material standard). Safe default. */
  easeOut: [0.4, 0, 0.2, 1] as Bezier,
  /** Signature entrance: fast start, long soft landing — the "expensive" curve. */
  expoOut: [0.16, 1, 0.3, 1] as Bezier,
  /** Exits: accelerate away. Pair with expoOut for asymmetric enter/leave. */
  expoIn: [0.7, 0, 0.84, 0] as Bezier,
  /** Symmetric moves / non-linear loops. */
  easeInOut: [0.65, 0, 0.35, 1] as Bezier,
};

/** Duration scale in seconds. If a non-ambient transition exceeds ~0.8s, question it. */
export const DURATION = {
  instant: 0.1,
  micro: 0.15,
  fast: 0.25,
  base: 0.35,
  entrance: 0.55,
  slow: 0.7,
} as const;

/** Spring presets. Prefer springs for interactive/layout motion; keep bounce ≤ 0.25 on premium UIs. */
export const SPRING = {
  /** Entrances, layout, drawers — calm settle. */
  soft: { type: "spring", stiffness: 120, damping: 20 },
  /** Hover/tap/press feedback — quick & tight. */
  snappy: { type: "spring", stiffness: 400, damping: 30 },
  /** Friendly emphasis with a hint of life (ergonomic spring API). */
  gentle: { type: "spring", bounce: 0.2, duration: 0.6 },
  /** Draggable elements snapping back. */
  stiff: { type: "spring", stiffness: 550, damping: 34 },
} as const;

/**
 * fadeUp — the default entrance: fade in while rising a few pixels.
 * @param distance px to travel up from (default 16). Use ~8–12 for list items, ~24–32 for heroes.
 */
export function fadeUp(distance = 16) /*: Variants */ {
  return {
    hidden: { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0, transition: SPRING.soft },
  };
}

/**
 * stagger — a container variant that sequences its motion children.
 * Pair with child variants (e.g. fadeUp()). Children inherit the active state name automatically.
 * @param each   seconds between each child (default 0.08; 0.06–0.1 reads as a sequence)
 * @param delay  seconds to wait before the first child (default 0)
 */
export function stagger(each = 0.08, delay = 0) /*: Variants */ {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: each, delayChildren: delay } },
  };
}

/** Default transition for `<MotionConfig transition={...}>` — set once at the app root. */
export const DEFAULT_TRANSITION = { duration: DURATION.base, ease: EASE.easeOut } as const;
