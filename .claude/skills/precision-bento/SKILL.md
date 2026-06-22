---
name: precision-bento
description: >-
  Build or restyle premium web sections and landing-page blocks in the 'precision-bento' design
  language — an engineered-editorial look: airy near-white canvas, ultra-light oversized
  headlines, desaturated teal-gray text, soft mint gradients, frosted-glass pills, looping-video
  bento cards, and slow edge-masked marquees. Reach for this whenever the user wants a hero,
  capabilities, features, proof-grid, metrics, testimonial, pricing, or contact/CTA section
  built or made to look high-end, modern, or 'expensive' — or asks for a bento-grid layout,
  glassmorphic UI, or video-background cards — and hasn't named a different design system. It is
  the user's house style for web sections; prefer it for new section and page mockups unless
  told otherwise. Not for: data dashboards or charts, full app/site scaffolding, logos / brand
  identity / brandbooks, copy-only requests, SEO or performance audits, or when an existing
  theme (Tailwind, shadcn, Material) is specified.
---

# Precision-Bento

A reusable web **design language** — not a single template. It captures a coherent
"engineered editorial" aesthetic so any section you build (hero, capabilities, features,
metrics, testimonials, contact/CTA) feels like it came from the same premium system.

## The aesthetic in one breath

A calm, expensive, aerospace/industrial-grade web look: an **airy near-white canvas**
carrying **ultra-light oversized headlines**, **desaturated teal-gray** body copy, and a
**bento grid** of mixed-proportion cards — some filled with **looping muted video** under a
dark gradient "foot," some made of **soft mint glass**, accented with **frosted-glass pills**
and **slow edge-masked marquees**. Quiet, confident, never loud.

## Signatures (what makes it cohesive — internalize these)

Understanding *why* each rule exists lets you extend the language to new sections without
breaking it:

- **Never pure black or white.** Canvas is `#f7f8f8`, ink is `#111111`. Pure `#fff`/`#000`
  read as cheap/unfinished. Light cards use a mint gradient, not flat white.
- **Ultra-light display type, tight leading.** Headlines are weight **300** (or lighter) at
  large fluid sizes with `line-height: 1.08`. The lightness + tightness is what reads as
  "premium." Body copy is desaturated teal-gray (`#677070`), never neutral gray.
- **Off-grid variable weights are a fingerprint.** The system uses weights like **220, 300,
  360, 650, 760** — not just 400/700. This *requires* loading **Geist as a variable font
  (100..900)**. Standard weights flatten the look.
- **Bento composition.** A wide canvas (up to **1820px**) of cards in mixed proportions, each
  a self-contained "proof." Aim for contrast: at least one media card and one light/glass
  card per section. Corners follow a deliberate scale (**18px** cards, **14px** pills,
  **999px** buttons) — never one uniform radius (that's the "AI slop" tell).
- **Media-forward cards.** Looping muted video fills a card (`object-fit: cover; transform:
  scale(1.02)`), anchored by a **dark bottom-up gradient foot** so overlaid white text stays
  legible. Always provide a solid/gradient fallback background behind the video.
- **Frosted glass accents.** Pills/tags float over media with low-opacity white fill, a
  hairline white border, a **top inset highlight**, and `backdrop-filter: blur(10px)` — they
  read as physical, lit surfaces.
- **Subtle continuous motion.** Slow horizontal marquees (24–28s), **edge-masked** so tags
  fade rather than clip. Motion should be ambient, never attention-grabbing.
- **Fluid everything.** Spacing, type, and min-heights use `clamp()` so layouts scale
  gracefully from phone to ultrawide. Three signature breakpoints: **1080px** (3→2 col) and
  **760px** (→1 col, header stacks).
- **Depth without heaviness.** Hairline borders (`rgb(18 35 35 / 0.09)`) plus a single soft
  ambient shadow (`0 22px 60px rgb(21 34 34 / 0.08)`). No hard drop shadows.
- **Hard rule: no purple/violet, ever.** The palette is teal-gray + mint. Re-skinning shifts
  the accent hue but keeps the value relationships.

## Files in this skill

- **`assets/starter-template.html`** — a ready-to-fill scaffold: `<head>` with Geist + Inter +
  Phosphor links, a CSS reset, and the full `:root` design-token block. **Start here** for any
  new build — copy it, then drop in components.
- **`references/design-system.md`** — the complete token reference (every color, type step,
  space, radius, shadow, gradient, motion timing, icon usage). Read it when you need an exact
  value or are choosing/adapting tokens.
- **`references/components.md`** — the component catalog: copy-paste HTML + CSS for every
  building block (section shell, header, CTA pills, bento grid, video panel, eyebrow label,
  timeline overlay, metric overlay, quote card, contact card, glass marquee) plus the
  responsive rules. Read it when assembling a section.
- **`assets/enginetech-capabilities.html`** — a complete, working reference implementation (an
  aerospace "Capabilities" proof grid). Read it to see how the blocks compose into a finished,
  verified section, then adapt copy/media/palette.

## Workflow

1. **Scaffold.** Copy `assets/starter-template.html` to your target file. It already wires up
   the fonts, Phosphor icons, reset, and `:root` tokens — don't re-derive these.
2. **Pick the section type and blocks.** Decide what you're building (see *Section recipes*
   below) and pull the relevant components from `references/components.md`.
3. **Compose the bento.** Lay cards into the grid with intentional variety in size and role.
   Keep the media/light contrast. Use the token variables — never hardcode off-palette values.
4. **Write real content.** Use specific, plausible copy (real-sounding names, numbers, program
   titles) — placeholder lorem kills the premium feel. For media use working CDN video
   (e.g. `https://assets.mixkit.co/videos/<id>/<id>-720.mp4`) with a gradient fallback bg.
5. **Honor accessibility & motion** (see below) — these are part of the language, not extras.
6. **Verify in the browser before declaring done.** Render it, watch the videos autoplay, the
   marquee scroll, and the layout reflow at 1080px and 760px. See *Previewing*.

## Section recipes (compose from the same blocks)

- **Hero** — oversized light headline + short teal-gray lede + one CTA pill; pair with one tall
  media card or a full-bleed video panel with a gradient foot.
- **Capabilities / proof grid** — the reference impl: header + CTA pill + 3-col bento mixing a
  tall media card (with timeline overlay), a quote card, a metric card, a marquee card, and a
  contact card.
- **Features** — repeated light/glass cards each with an eyebrow label, a Phosphor icon, a
  short title, and a line of teal-gray copy.
- **Metrics band** — a row of metric overlays (giant weight-220 numerals + captions), some over
  video, some on mint cards.
- **Testimonial wall** — multiple quote cards on mint gradient with attributions.
- **Contact / CTA footer** — a contact card (email + phone + circular icon button) beside a
  short headline and a CTA pill.

## Adaptation guidance

- **Re-skin within the family.** To fit another brand, shift the accent hue but keep the value
  relationships: near-white canvas, near-black ink, one desaturated mid for body copy, dark
  gradient feet on media, mint→white glass on light cards. Keep radii/shadows/type weights.
- **Dark variant.** Invert the canvas to a near-black teal (`#0e1414`–`#0b1212`) and lift text
  to off-white; the mint glass and gradient feet still work. Same philosophy, inverted value.
- **Don't** introduce purple/violet, pure black/white, uniform radii, heavy drop shadows, or
  standard-only font weights — those break the language.

## Accessibility & motion (part of the language)

- Keep overlaid text legible: that's the job of the gradient feet and the metric `text-shadow`.
  Verify contrast on glass/media.
- Respect motion preferences — wrap marquee/scale animation so it stops under
  `@media (prefers-reduced-motion: reduce)`. The starter template includes this guard.
- Icon-only controls (the circular arrow button, etc.) get an `aria-label`; purely decorative
  Phosphor icons get `aria-hidden="true"`.
- Autoplaying video must be `muted playsinline loop`; cap videos per section (≈3) for perf.

## Previewing

Render the file in a real browser and confirm: videos autoplay/loop, the marquee scrolls and
fades at the edges, and the grid reflows at 1080px and 760px. Use the preview tooling or a
local static server (`python3 -m http.server`). Note: if the file lives in a sandboxed or
iCloud-synced folder and the server returns "No permission to list directory," copy the file
to `/tmp/<name>/` and serve from there — the page is fully self-contained, so it renders
identically.
