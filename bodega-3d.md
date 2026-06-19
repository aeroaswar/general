# bodega® — cinematic scroll experience

A scroll-activated **Three.js + GSAP** reinterpretation of the Bodega marketing site
([bodega-website-vert.vercel.app](https://bodega-website-vert.vercel.app)). A single
self-contained `index.html` (no build step) — required because `.vercelignore` ships
only `/index.html`.

The whole experience is one fixed WebGL canvas behind editorial DOM. A single GSAP
ScrollTrigger master timeline (smoothed with Lenis) maps page scroll `0→1` to a scene
progress `0→3` that drives the camera, a morphing particle "operating surface", the
ember thread, and a paper→ink palette grade.

## Brand fidelity
Pulled from the original source: Fraunces (display) · Instrument Sans (body) ·
JetBrains Mono (labels); warm paper `#f5f2ec`, near-black ink, a single burnt-amber
ember accent; film-grain + grid-paper + hairline rules; the real `bodega®` wordmark
(embedded, inverted to white on dark). Copy is verbatim from the live homepage.

## Section → motion map
| # | Scroll section | DOM (editorial) | 3D scene |
|---|---|---|---|
| 0 | **Hero** — "Publish on calendar, not on vibes." | line-mask reveal, client stripe | loose drifting ink field on paper; wide camera; ember thread starts drawing |
| 1 | **Three loops, one surface** | 3 pillar cards fade up | particles reform into **3 rotating loops**; ember marks the "approved-out" loop |
| 2 | **Phases & pillars are never universal** | data-spec cards + `has_many` line | field reshapes into a **structured pillar lattice**; camera lifts |
| 3 | **A workspace clients actually open** | dark panel + white logo | collapses to **one ordered surface**; bg grades to ink; ember glows |

## Motion system
- **GSAP master scrub** → camera position/target + shader `uProg` + palette + ember mix (one source of truth, `setProgress`).
- **GSAP ScrollTrigger batch** → DOM entrances (hero line mask, fade-ups), run once.
- **CSS keyframes** → the scroll cue (Animista-style; spares the JS thread).
- **Inline SVG** → icons (Iconify/Phosphor-style).
- **Lenis** → smooth scroll, synced to ScrollTrigger (disabled under reduced-motion / capture).

## Run it
```sh
python3 -m http.server 4321      # then open http://localhost:4321
```
Libraries load from CDN (three 0.160, GSAP 3.12, Lenis 1.0) — needs network in the browser.

## Debug handles
- `window.__bodega.snap(p)` — jump to scroll progress `p∈[0..1]` (e.g. `__bodega.snap(0.66)`).
- `window.__bodega.prog()` / `.play()` / `.pause()` / `.scene` / `.camera`.
- `?cap=<0..1|id>` — static capture mode (no smooth scroll, content forced visible).
  Ids: `hero` `loops` `pillars` `close`. e.g. `?cap=close`.

## Resilience
- **WebGL fallback** — no context → clean static document on a grid-paper ground.
- **prefers-reduced-motion** — no autoplay/drift, entrances shown immediately, scene still scroll-readable.
- **GSAP/CDN miss** — `html.anim` is dropped so content can never get stuck hidden.
- **Responsive** — particle budget scales (2.6k → 6.4k) by viewport; pixel ratio capped at 2.

## Known tradeoffs / TODO
- In-container browser verification wasn't possible (the runtime CDNs are blocked by this
  environment's egress allowlist), so FPS/Web-Vitals traces still need a real browser pass —
  use `?cap=` + `__bodega.snap()` for that.
- No light/dark **toggle** (the original's product feature): this landing commits to one
  art-directed paper→ink journey instead. Easy to add back if wanted.
- No mobile hamburger menu; small screens navigate by scrolling (nav rail hidden < 700px).
