# MASTER PROMPT — Cinematic 3D Web Experience
**React · Three.js · GSAP + Framer Motion · Self-Verifying**

---

## 0 · HOW TO USE
Fill the « » fields if you have opinions; leave them blank and I use the stated
defaults. Everything outside « » is a **hard requirement, not a suggestion**.

---

## 1 · OPERATING PROTOCOL (follow in order — do not skip steps)
1. **Analyze & Adapt.** If a reference site or template is provided, analyze its
   layout, scroll behavior, and scene transitions first. **State your findings.**
2. **Clarify-or-Assume.** If product, sections, or brand are unclear, ask at most
   **3 sharp questions**. If unanswered or told "you decide," adopt §2 defaults,
   **state the assumptions**, and proceed. Never stall.
3. **Plan.** Post a 5–8 bullet build plan **plus a section→motion map** showing how
   GSAP, Framer Motion, and Three.js interact per section. Pause only for
   irreversible decisions; otherwise build.
4. **Build** to the spec below.
5. **Verify** against §10 in a real browser. Iterate until every §3 gate passes.
   Never report "done" on unverified work.
6. **Self-Critique** (§11) and fix what you find.
7. **Report** with proof artifacts (trace numbers + screenshots).

---

## 2 · MISSION + DEFAULTS
Build **one long-scroll cinematic product page** for «PRODUCT» — «one-line pitch».
**Feel:** «premium, kinetic, restrained, glassmorphic».
A fixed full-viewport Three.js canvas sits behind DOM content; **both react to a
single scroll timeline.**

**Defaults if unspecified:**
- Product: *"Aeterna — a premium longevity & performance sanctuary."*
- Visuals: dark editorial palette, biophilic-modernism elements, Geist/Inter type.
- Copy: English. Sections: 5 scroll-linked.

---

## 3 · DEFINITION OF DONE (measurable gates — ALL must pass)
- **0** console errors / unhandled rejections; **0** failed network requests.
- **Smooth scroll:** sustained **≥55fps**, no single long task **>50ms** on a full
  top→bottom scroll (default desktop profile).
- **Web Vitals:** LCP **< 2.5s**, CLS **< 0.05** (target 0), INP **< 200ms**.
- **Throttled (4× CPU + Slow 4G):** interactive, error-free, **degrades gracefully**
  (fewer effects OK; broken layout not OK).
- **prefers-reduced-motion:** a complete, readable **static** version renders.
- **Responsive:** correct at **1440 / 768 / 390px** — no overflow, clipped text, or
  black canvas.
- **Asset budget:** lean initial JS payload; 3D assets compressed.

---

## 4 · STACK
- **3D & Scroll:** Three.js (latest stable) · GSAP + ScrollTrigger · Lenis
  (smooth scroll, synced to ScrollTrigger).
- **UI & DOM Motion:** React / Next.js · Framer Motion (DOM micro-interactions,
  layout/route transitions) · Animista (lightweight CSS keyframes) · Iconify (SVG).
- **Architecture:** small named functions, modular components
  (`Scene.jsx`, `Canvas.jsx`, `MotionWrapper.jsx`). **Comment the *why*.**

---

## 5 · PAGE NARRATIVE (default — replace if you have your own)
1. **Hero** — 3D element floats/rotates; headline reveals per word/line via Framer Motion.
2. **Feature A** — GSAP camera push-in; spec callouts pin in with glassmorphism.
3. **Feature B** — exploded 3D view OR material/shader swap on scroll scrub.
4. **Proof / Gallery** — horizontal-scroll or parallax grid (Framer Motion).
5. **CTA / Footer** — scene resolves to a calm hero shot; primary button with
   Animista hover. **Realistic placeholder copy — never lorem ipsum.**

---

## 6 · MOTION SYSTEM — Integration Protocol
- **GSAP:** ONE master timeline, labeled segments per section, drives the 3D scene.
  Scene-tied moves use `scrub: true` (or `1` for smoothing).
  Use `ScrollTrigger.matchMedia()` for responsive timelines.
- **Framer Motion:** DOM entrances (`initial`/`animate`/`viewport={{ once: true }}`),
  layout shifts, route transitions. Physically accurate springs
  (e.g. `stiffness: 100, damping: 20`).
- **Animista / Iconify:** Animista for CSS-only repeating loops (e.g. pulsing scroll
  cue) to spare the JS thread; Iconify for crisp scalable vectors.
- Call **`ScrollTrigger.refresh()`** after fonts/images/models finish loading.
- **No FOUC:** hide animated elements before paint, reveal on init; account for `pinSpacing`.

---

## 7 · 3D SYSTEM (Three.js) — Performance is a Requirement
- Drive camera position and material `uniforms.uProgress.value` **FROM the GSAP
  timeline** — never from raw scroll listeners.
- `setPixelRatio(Math.min(devicePixelRatio, 2))`. **Single rAF loop.**
- **On-demand rendering:** render only when something changed (scroll, drag, active tween).
- **Budget:** low draw calls (instancing for repeats), frustum culling, compressed
  textures (KTX2/Basis) and meshes (Draco/meshopt for glTF), lazy-load heavy models.
- `dispose()` geometries/materials/textures on teardown; resize without leaking;
  pause rendering when canvas is fully offscreen.
- **Debug handle:** `window.__scene = { snap(p /*0..1*/), play(), pause() }`.

---

## 8 · ACCESSIBILITY · FALLBACK · SEO
- Semantic landmarks (`header/main/section/footer`), one `h1`, logical heading order,
  visible focus states, keyboard-operable CTAs, alt text.
- **WebGL fallback:** if context fails, render a styled static hero — page stays usable.
- **Metadata:** `<title>`, meta description, Open Graph tags, favicon.

---

## 9 · ANTI-PATTERNS (never do these)
- ❌ Animating `top/left/width/height` — animate `transform`/`opacity` instead.
- ❌ Mutating Three.js scene state inside the React render path — use refs + central loop.
- ❌ Loading uncompressed multi-MB textures/models.
- ❌ Mixing GSAP and Framer Motion on the **same** element (GSAP = canvas/scroll;
  Framer = isolated DOM).
- ❌ Claiming 60fps without a trace and a throttled run.
- ❌ Lorem ipsum or invented product specs.

---

## 10 · VERIFICATION LOOP
Serve locally, then verify in a real browser (Chrome DevTools MCP, Playwright, or the
project's `?cap=` static-capture + `window.__scene` snap handle):
1. Load → read console → fix until **0 errors/warnings**.
2. Network → no 4xx/5xx; note total transfer.
3. Performance trace, scroll top→bottom, stop → report **FPS, dropped frames,
   longest task, LCP, CLS, INP**. Any §3 gate fails → read source, fix, re-run from step 1.
4. Re-run trace with **4× CPU + Slow 4G** → must stay interactive & clean.
5. Screenshot at scroll **0 / 0.25 / 0.5 / 0.75 / 1.0** and at **1440 / 768 / 390px** →
   verify layout, UI, and **non-black canvas**.

---

## 11 · SELF-CRITIQUE (before reporting)
List the **3 weakest things** about what you built and whether each violates §3/§9.
Fix anything that does. Then deliver.

---

## 12 · DELIVERABLES
- Runnable source + README (how to run, section→motion map).
- Trace numbers (FPS + LCP/CLS/INP — default **and** throttled).
- Screenshot set.
- Honest list of tradeoffs / TODOs.

---

**Restate your plan (§1), then build.**
