# Bodega — Aurora-Glass Portal Site

A scroll-activated **Three.js + GSAP** single-page experience for **Bodega Creative
Studio**, and the marketing gateway to its client portal at `bodega.pplx.app`.
Rebuilt in the **aurora-glass** design language: a deep-ink canvas, a live GLSL
aurora that the scroll timeline re-tunes section by section, and frosted-glass
content panels.

## Run it

```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # static production build → dist/
npm run preview  # serve the production build
```

The build is fully self-contained — **no runtime CDN**. Fonts (Bricolage
Grotesque + Inter) are bundled via `@fontsource`, and icons are inlined SVG. It
deploys as static files to Vercel, Netlify, GitHub Pages, or any host.

## What drives the scene

- **`src/aurora.js`** — a full-screen fragment-shader aurora (domain-warped fbm
  curtains). The scroll timeline lerps its palette, intensity, and motion per
  section; Lenis scroll **velocity stretches** the curtains, and the pointer adds
  parallax. Falls back to a static field under `prefers-reduced-motion`.
- **`src/main.js`** — Lenis smooth-scroll + GSAP ScrollTrigger. Builds every
  section from data, runs the reveal stagger, the **pinned 7-step portal spine**
  (`Client → Project → Framework → Content → Approval → Schedule → Report`) whose
  progress sweeps the aurora hue, and the animated proof counters.
- **`src/content.js`** — all copy, sourced from the Bodega 2026 credentials deck
  and the client-portal architecture spec (services, process, proof, team, roles).
- **`src/styles.css`** — the aurora-glass design system (tokens, glass surfaces,
  gradient display type, all section layouts, full responsive + reduced-motion).

## Debug handle

`window.__bodega` exposes `{ aurora, lenis, setMood(name), moods, goTo(sel),
snap(t) }` — e.g. `__bodega.setMood('portal')` or `__bodega.snap(1.4)` to render a
deterministic aurora frame.

## Sections

Hero → Industry marquee → Selected Work → Services → **The Portal** (pinned spine
+ roles) → Why Bodega → Proof → Process → Contact / Brief → Footer.

## Provenance

Recreated from the prior `bodega-scroll` seed and the Bodega Drive material
(credentials deck + portal spec). Content is real (contact, Maktour results,
team, Jakarta studio); work-card visuals are generated gradients — drop real
imagery into `public/` and swap the `.work-media` block to use it.
