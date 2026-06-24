# BODEGA — "Find the door"

A scroll-activated 3D web experience, **inspired by** `bodega-website-vert.vercel.app` and
the Bodega brand story (a curated boutique hidden behind a fake corner-store cooler door).
Built with **React + Vite + Three.js + GSAP/ScrollTrigger + Lenis + Framer Motion**.

One fixed full-viewport Three.js canvas sits behind the DOM. A single GSAP ScrollTrigger maps
page scroll (0→1) to `scene.setProgress()`, which **adjusts the whole scene**: the camera
dollies off the street, the cooler door swings open on its hinge, the camera passes through the
threshold, and the palette grades from sodium-amber night to clean gallery white.

## Run

```sh
npm install
npm run dev       # http://localhost:4199
npm run build     # production build (primary CI gate)
npm run preview   # serve the build
npm run smoke     # headless logic checks (no browser)
```

## Section → motion map

| Scroll | Section | Three.js (GSAP-scrubbed) | DOM (Framer / CSS) |
|---|---|---|---|
| 0.00–0.15 | **Hero / Street** | facade framed, neon "BODEGA" flicker | per-word headline stagger; CSS scroll cue |
| 0.15–0.35 | **The Door** | camera dolly to cooler; hinge swings open; interior glow leaks | word-stagger reveal |
| 0.35–0.55 | **Threshold** | camera crosses doorway; fog clears; palette grades amber→white | centered reveal |
| 0.55–0.75 | **The Drop** | product spins/rises on a spotlit pedestal | glass spec cards stagger; sticky "pin" |
| 0.75–0.92 | **Collabs** | interior depth | horizontal collab row |
| 0.92–1.00 | **Find the door** | camera pulls back to resolve | CTA (Animista-style CSS hover), socials |

## Verification (no live browser needed for the first pass)

The build ships an **inspection harness** so the scene can be checked without Chrome DevTools:

- `?cap=<0..1>` — freeze the scene at a progress value (e.g. `?cap=0.3`).
- `?cap=<section-id>` — freeze at a named beat: `hero`, `door`, `threshold`, `drop`, `collabs`, `footer`.
- `?cap=grid` — a **contact sheet**: every key frame rendered as stacked rows in one screenshot.
- `?debug` — live overlay (progress · active section · fps · viewport).
- Console handle: `window.__bodega.snap(0.0 … 1.0)`, `.play()`, `.pause()`, `.progress()`.

Recommended checks: open `?cap=grid` and screenshot; scrub `window.__bodega.snap()` at
`0 / 0.25 / 0.5 / 0.75 / 1`; toggle OS "reduce motion" (renders a static, readable version);
resize to 1440 / 768 / 390 (no overflow, non-black canvas).

## Notes / tradeoffs

- **Procedural by design.** All geometry + textures are generated at runtime (no external 3D
  binaries) → tiny asset payload, but a stylized neon-noir look rather than photoreal.
- **Performance.** `setPixelRatio(min(dpr,2))`, single rAF, on-demand rendering (renders only on
  progress change, plus a hero-only neon flicker), `dispose()` on teardown, low-power path < 768px.
- **Accessibility.** Semantic landmarks, one `h1`, focus states, `prefers-reduced-motion` static
  render, and a CSS fallback hero if WebGL fails.
- **Honest gap:** this was authored in a sandbox without a browser/Chrome-DevTools MCP, so live
  FPS / LCP / CLS / INP traces were not captured here — run the §10 trace locally with the handles
  above. `npm run build` (0 errors) and `npm run smoke` are the automated gates that *were* run.
