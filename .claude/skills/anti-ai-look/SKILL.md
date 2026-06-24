---
name: anti-ai-look
description: >-
  Steer any web build away from the "AI-generated" look. Use when generating or
  reviewing a landing page, marketing section, portfolio, or dashboard — on top of
  precision-bento / talvex-dashboard / framer-motion, as a guardrail pass. Triggers:
  "make it not look AI", "looks generic/templated", "de-AI this", hero/features/
  pricing builds, or any first-pass design that came out safe.
---

# anti-ai-look

A guardrail skill. It does not design from scratch — it sits **on top of** the
house skills and removes the signatures that make output read as machine-averaged.
Full rationale: `anti-ai-design/FIELD-GUIDE.md`. Token base: `anti-ai-design/de-ai-tokens.css`.
(Paths are relative to the repo root.)

## Operating protocol

1. **Identify the build type** and load the matching house skill first
   (`precision-bento` for sections, `talvex-dashboard` for dashboards,
   `framer-motion` for React motion). This skill runs as a pass over that output.
2. **Make decisions, don't accept defaults.** Every tell below is a default the
   model reaches for by reflex. For each, make a specific, brand-anchored choice.
3. **Run the gate** (below) before reporting done. Treat it like the §10 verify
   gate in `cinematic-3d-master-prompt.md` — never report "done" on an ungated build.

## Hard rules (non-negotiable)

- **No `indigo` / `violet` / `purple`** unless the brand is literally purple. The
  blue→purple gradient is the #1 AI tell *and* a standing `CLAUDE.md` house rule.
- **Palette from content, not framework.** Derive 2–3 colors from the brand / a real
  photo / the subject. Never ship Tailwind/shadcn stock hues unedited.
- **One accent at ~5% coverage.** A saturated accent as a thin rule/chip/CTA — never
  a gradient flooding the hero.
- **A defined type ramp.** Pick sizes from one ladder (see `de-ai-tokens.css`), with
  big jumps for hierarchy. Never improvise 15 ad-hoc px sizes.
- **Tabular numerals on all data.** Always.
- **Real icons (Phosphor), never emoji as UI.** Consistent weight.
- **Small shadow + radius system.** Hairline 1px border + one ambient shadow. Never
  `shadow-lg` + `rounded-xl` on everything.
- **One signature motion move**, expo-out / low-bounce, `prefers-reduced-motion` safe.
  Not fade-up-on-scroll on every element.
- **Real or purpose-built imagery.** No stock blobs, gradient mesh, or undraw art.
- **Order sections by the argument, not the template skeleton.** Cut what you don't
  need.

## The decision pass (apply in order)

| # | Default the model reaches for | Decision to make instead |
|---|---|---|
| 1 | purple/blue-violet gradient | content-derived palette, no purple, accent ~5% |
| 2 | centered hero, two buttons | left-align, one intentional asymmetry / grid-break |
| 3 | identical 3-emoji feature row | Phosphor icons, varied bento cell sizes |
| 4 | one safe sans, flat | type ramp + weight/tracking contrast, tabular nums |
| 5 | even `gap-4` everywhere | spacing scale with range; vary section rhythm |
| 6 | "seamless / elevate / unlock" copy | real domain nouns; cut competitor-pasteable lines |
| 7 | stock blobs / gradient mesh | real photo or purpose-built 3D, or honest restraint |
| 8 | `shadow-lg` + `rounded-xl` everywhere | 2-step shadow + 3-step radius, used deliberately |
| 9 | template section order | order by your argument; delete unneeded sections |
| 10| fade-up on everything / no motion | one signature move, expo-out, reduced-motion safe |

## Verify gate (must pass before "done")

- [ ] Grep the output for `indigo|violet|purple|#6366F1|#8B5CF6|#4F46E5` → zero hits
- [ ] Grep copy for `seamless|elevate|unlock|empower|leverage|next level` → zero hits
- [ ] No emoji used as a UI icon (real icon set only)
- [ ] Type sizes all come from the defined ramp (no orphan px values)
- [ ] Accent coverage ≈5%, not a full-bleed gradient
- [ ] At least one intentional asymmetry in the hero
- [ ] Vertical rhythm varies between sections
- [ ] `prefers-reduced-motion` block present
- [ ] **Final test:** the strongest section could NOT be pasted onto a competitor's
      site and still make sense. If it could, it's averaged — rewrite it.

## Report format

State, per the decision pass, what default you replaced and with what choice
(e.g. "palette: dropped indigo, pulled red+turquoise+navy from the brand"). End with
the gate as a checked list so the human can see it was actually run.
