# Composites — Architecture of New Possibilities

A scroll-driven, real-time **WebGL architectural showcase**, built as an independent
homage to [composites.archi](https://www.composites.archi) (JEC Group — design by
SPARKK + Antigel). It replicates the *mechanics and feel* of that award-winning site:
a fixed full-viewport 3D stage whose camera, materials and a synchronized layer of DOM
typography are all driven by a single scroll timeline.

Everything lives in one self-contained **`index.html`** — no build step, no external 3D
assets. The hero form (a doubly-curved composite canopy with an instanced louver
façade) is generated procedurally in Three.js, so the page loads instantly and runs
offline. A production-grade GLTF + DRACO loader is wired in behind a drop-in slot for
when you want to swap in a real model.

---

## Run it

No bundler. Serve the folder over HTTP (ES-module import maps need `http(s)://`, not
`file://`):

```sh
# from the repo root
python3 -m http.server 4321
# → open http://localhost:4321
```

Runtime dependencies load from CDN via an `<script type="importmap">`
(Three.js r160, GSAP + ScrollTrigger, Lenis). On Vercel, `.vercelignore` ships only
`index.html`, which is all this experience needs.

---

## Tech stack

| Concern | Library | Notes |
|---|---|---|
| 3D rendering | **Three.js r160** | `WebGLRenderer` (sRGB + ACES filmic), `PMREMGenerator` + `RoomEnvironment` IBL, soft shadows |
| Scroll engine | **GSAP + ScrollTrigger** | one scrubbed master timeline = the single source of motion truth |
| Smooth scroll | **Lenis** | wheel smoothing, fed by `gsap.ticker`, emits to `ScrollTrigger.update` |
| Post | UnrealBloom (optional) | subtle rim bloom; auto-disabled on mobile / reduced-motion |

---

## Section → motion map

The whole page is one scrubbed timeline; progress `p ∈ [0,1]` maps linearly to scroll.

| `p` | Section | Camera | Scene reaction | DOM |
|----:|---------|--------|----------------|-----|
| 0.00 | **Hero** | high, far, slow drift | structure self-assembles on load (`uReveal` 0→1) | headline line-mask reveal |
| 0.20 | **Strength & lightness** | push in, low, raking light | — | stat cards stagger in |
| 0.40 | **Façade** | close orbit into the louvers | carbon-fibre weave fades onto the shell (`uWeave`), bronze rim swells | "A skin that performs" |
| 0.62 | **Form** | rise above the canopy | shell flexes — animated morph pulse (`uMorph`) | "Double-curved, single-piece" |
| 0.82 | **Endurance** | wide establishing | calm | proof copy |
| 1.00 | **CTA / Credits** | resolve to a calm hero shot | settle, rim glow peak | buttons + honest credits |

Camera waypoints live in the `WAYPOINTS` array; `camPos`/`camLook` are tweened through
them and the live camera `= camPos (+ tiny handheld float)` looking at `camLook` every
frame. Shader uniforms (`uReveal`, `uWeave`, `uMorph`, `uRim`) are tweened on the same
timeline.

---

## Debug & authoring handles

| URL / API | Effect |
|---|---|
| `?debug=1` | On-screen HUD + throttled console logs of `camera.position / rotation / lookAt / progress` — use these to dial `WAYPOINTS` to the reference. |
| `?cap=facade` or `?cap=0.4` | Jump to a deterministic frame (section id **or** progress) for static screenshots. |
| `?model=/pavilion.glb` | Load a real GLB (Draco/KTX2 supported) instead of the procedural form. |
| `window.__composites.snap(p)` | Jump to scroll progress `p` (0–1). |
| `window.__composites.pause()` / `.play()` | Freeze / resume animation time for clean coordinate reading. |
| `window.__composites.three` | `{ scene, camera, renderer, hero }`. |
| `window.__composites.uniforms` | Live shader uniform refs. |

**Fine-tuning to match the reference:** open with `?debug=1`, scroll to a moment that
should match composites.archi, read the logged `cam=(x,y,z) look=(x,y,z)`, and paste
those numbers into the matching `WAYPOINTS` entry. Repeat per section.

---

## Phase 3 — Chrome DevTools verification protocol

### 1 · Performance (frame rate, dropped frames, leaks)
1. DevTools → **Performance** → ⏺ record, then scroll top→bottom steadily over ~6 s, ⏹ stop.
2. **FPS:** the frames track should sit at/near 60 (gate ≥ 55). Tall **red** bars = dropped/long frames — investigate.
3. **Long tasks:** look for `Task` blocks with a red corner (> 50 ms). The scrubbed timeline should yield steady ~16 ms frames; init work is allowed to spike once.
4. **Throttle:** rerun with **CPU 4×** + **Network: Slow 4G** (gear/▾). Must stay interactive and error-free; effects may thin out, layout must not break.
5. **Leaks:** ⌘/Ctrl-Shift-P → *Show Performance Monitor*. Scroll up/down repeatedly — **JS heap** and **GPU memory** should plateau, not climb. Optionally take two **Memory → Heap snapshots** several scroll-cycles apart; node counts should be stable.

### 2 · Network (payloads, Draco)
1. **Network** tab → reload with **Disable cache** on. Filter **JS**.
2. Confirm `three.module.js`, `gsap/index.js`, `ScrollTrigger.js`, `lenis.mjs` all return **200**; note transfer sizes (Three is the largest single payload).
3. With `?model=…`: confirm the **`.glb`** downloads, and that `draco_decoder.wasm` (+ `draco_wasm_wrapper.js`) is fetched from `gstatic.com` — that proves **Draco decoding is active**. A Draco mesh transfers far smaller than the equivalent raw glTF.
4. No **4xx/5xx**. Note total transferred + `DOMContentLoaded`/`Load`.

### 3 · Elements / Layers (compositing, scroll height)
1. **Elements:** `#stage` is `position: fixed`; its `<canvas>` fills the viewport; copy sits in `<main class="content">` above it with `pointer-events` managed (`section` none, links/buttons auto).
2. **Layers** panel (⋮ → More tools → Layers): `#stage`/canvas should be **its own compositor layer** (forced via `transform: translateZ(0)` + `contain: strict`).
3. **Rendering** panel → enable **Paint flashing** + **Layer borders**: scrolling should **not** repaint the canvas layer (GPU-composited); only DOM text updates flash.
4. Confirm `document.documentElement.scrollHeight` ≈ Σ section heights — the master ScrollTrigger uses `end: 'max'`.

### 4 · Console (coordinates, cleanliness)
1. Load with **no** query string → console must be **0 errors / 0 warnings**.
2. Add `?debug=1` → watch the live `cam` / `look` / `progress` logs; pair with `__composites.snap()` + `.pause()` to read exact coordinates while authoring waypoints.

---

## Verification performed for this build

Driven headless via Playwright (Chromium) against a locally-vendored copy of the
dependencies (the sandbox proxy strips CORS headers, so deps were served same-origin
for the test — production uses the CDN import map unchanged):

- ✅ **Boots with 0 console errors / 0 failed requests** (desktop 1440², mobile 390², reduced-motion).
- ✅ Scene composes correctly at scroll `0.0 / 0.4 / 1.0` — non-black canvas, correct camera choreography (hero → inside the façade → wide resolve).
- ✅ **Mobile:** no horizontal overflow (`scrollWidth − innerWidth = 0`), WebGL active.
- ✅ **Reduced-motion:** static, fully readable (hero heading + lede `opacity: 1`).
- ✅ WebGL boots even under **software (SwiftShader)** rendering — confirms the capability gate + fallback path.

> The above ran on software GL inside the sandbox, so it proves **correctness, not
> frame rate**. Run the Phase 3 Performance protocol above on real hardware to confirm
> the 60 fps / Web-Vitals gates.

---

## Tradeoffs & TODOs (honest)

- **Procedural hero, not the reference's GLB.** composites.archi's models are
  proprietary and can't be extracted, so the canopy is generated in-code. It captures
  the *category* (freeform composite façade) rather than a specific building. Drop a
  real model in via `?model=` / `HERO_MODEL_URL` to go 1:1.
- **Stat figures are illustrative** (labelled as such in-page) — composites genuinely
  are far lighter than steel and corrosion-free, but exact numbers vary by system.
- **Bloom is gated off on mobile/reduced-motion** to protect fill-rate — desktop gets
  the full rim glow.
- **Exact camera coordinates** are an interpretation; use `?debug=1` to match specific
  moments of the reference precisely.
