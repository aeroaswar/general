# CLAUDE.md — AI Workspace

Personal design + creative-coding workspace (iCloud-synced, not a git repo). A collection of standalone projects, reference libraries, and downloaded repos — each sub-project is independent.

## This git repo (`aeroaswar/general`) — live experience + deploy

> Memory from the Jun 2026 build session. The Drive-imported copy of this workspace lives in the git repo `aeroaswar/general`; that repo also ships a live site.

- **`index.html` (repo root) is the live deliverable** — *"Composites — Architecture of New Possibilities"*, a scroll-driven WebGL homage to [composites.archi](https://www.composites.archi) (JEC). No-build single file: Three.js **r160** + GSAP ScrollTrigger + Lenis via CDN import map; one scrubbed master timeline drives camera waypoints + shader uniforms; procedural composite canopy + instanced louver façade; custom `MeshStandardMaterial` shader (assembly reveal / carbon weave / fresnel rim). Debug: `window.__composites` (`.snap(p)`, `.pause()`/`.play()`, `.three`, `.uniforms`), `?debug=1` (camera HUD + logs), `?cap=<id|0..1>`, `?model=<glb>` (GLTF+DRACO drop-in). Full docs + Phase-3 DevTools protocol in `COMPOSITES-EXPERIENCE.md`.
- **Deploy = push to `main`.** Repo is git-connected to Vercel project **`general`** (account `aeroaswar-7255`, Hobby), **production branch `main`**, live at **https://general-chi-sandy.vercel.app**. `.vercelignore` is `/*` then `!/index.html` (ships only `index.html`). Pushing `main` auto-redeploys prod. A `404: NOT_FOUND` means `index.html` is absent from the *deployed* branch (don't deploy a branch that lacks it).
- **Remote sandbox limits (important for future web sessions):** the network policy blocks most external hosts — `composites.archi`, `vercel.com` **and** `api.vercel.com` all return `403`. So: the **Vercel CLI cannot deploy from here** (`VERCEL_TOKEN`/`ORG_ID`/`PROJECT_ID` are stripped from most shells *and* the hosts are blocked) → **deploy only via `git push` to `main`** (git integration on Vercel's side). To verify the page in headless Chromium, CDN ESM imports fail CORS (the proxy strips `Access-Control-Allow-Origin`), so **vendor deps locally**: `npm i three@0.160.0 gsap@3.12.5 lenis@1`, rewrite the import map to `./node_modules/...`, serve same-origin, and launch Chromium with `--ignore-certificate-errors --use-gl=swiftshader --enable-unsafe-swiftshader`.

## Environment quirks (important)

- **Preview server cannot read this iCloud folder** — `preview_start` gets PermissionError here and its ports are unreachable from the browser. Workflow: `rsync` the project to `/tmp`, serve from there; add `?v=N` cache-busters after edits; use plain `python3 -m http.server <port>` (Bash) when sharing a link.
- Black screenshots = hidden window: screenshot twice → stop/start server → fall back to Playwright MCP (also use Playwright for resized screenshots).
- For RAF-driven animations, expose a `window.__<name>` snap/frame debug handle so paused frames can be captured deterministically.

## House style — use these skills

- `precision-bento` — premium web sections (airy canvas, Geist, mint glass, video bento, Phosphor icons, no purple). Default for hero/features/proof/contact sections.
- `framer-motion` — React animation (expo-out easing, low-bounce springs, gentle stagger, reduced-motion safe). Default for React motion work.
- `talvex-dashboard` — analytics dashboards (React/Vite/Tailwind/Recharts, frosted cards, `#FFD85F` yellow accent, 6 card archetypes). Default for dashboard/admin/KPI builds.
- Design subagents in `~/.claude/agents/`: `brand-designer`, `dashboard-builder`, `web-section-builder`, `reference-scout`, plus read-only `design-critic`. Dispatch the matching one for design work.
- Apply saved industry references (sports, dashboards, trends) automatically by project type — adapt their structure/motion to the user's bold sports identity, don't clone visuals.

## Projects (workspace root)

No-build Three.js + GSAP scroll experiences — serve via `python3 -m http.server <port>` from the project folder (after rsync to /tmp for preview):

| Project | Port | Notes |
|---|---|---|
| `terminal-yard` | 4195 | terminal-industries.com recreation; Three.js pinned hero (sunset truck silhouette → night wireframe digital-twin yard → typewriter on dark grid), notch dividers, word-fill reveals, sticky telemetry card, green dot-grid sticky, 3 canvas dock scenes, `window.__yard` snap handle |
| `celeste-marais` | 4198 | Fashion-photographer landing; pacomepertant-style helix spiral gallery hero (22 planes, drag + scroll-scrub), Italiana type w/ difference blend, `window.__celeste` snap handle, `?cap=<0..1|section-id>` static-capture mode |
| `aeroaswar-site` | 4194 | aeroaswar.com redesign "Born on Water" (DARK); ocean-shader master scrub, chapter palette grading, red wake uHead tube, sticky velocity pin, `window.__aero` snap handle |
| `aeroaswar-light` | 4196 | aeroaswar.com "Daylight Wake" (LIGHT/sporty rebuild, Jun 2026); daylight turquoise ocean shader (sun-glint sparkle + sky-reflection fresnel, light fog), warm-white canvas + navy ink + Merah-Putih red, frosted-glass content sheets, cinematic camera glide-in reveal (no countdown), sun-flare velocity, pure-jetski narrative (hero→origin→palmarès→velocity→gallery→contact, no ventures), palmarès category filter, real race-photo gallery w/ parallax, red wake on bright water, `window.__aero` snap + `?cap=<id|0..1>` mode |
| `fable-five` | 4197 | Fable 5 model explainer; gold uHead thread, effort-dial + API-playground interactives, `?cap=<section-id>` static-capture debug mode |
| `evolveify-scroll` | 4193 | "Intelligence terminal" editorial; decrypt-path tube shader, DOM reticle, scramble text |
| `editions-winter26` | 4189 | Stacked-scene vertical journey; DOM-measured anchor dwells, gold uHead thread |
| `horizons` | 4180 | Synthwave scroll flythrough; master-scrub palette grading, canvas-generated textures |
| `vectr-scroll` | 4188 | Iso world; camera keyframes w/ station dwells, red→cyan path handoff |
| `phantom-sphere` | 4173 | Inside-a-sphere WebGL gallery; damped drag, FLIP card→detail transition |
| `mara-voss-portfolio` | 4181 | Awwwards-style portfolio; GSAP + Lenis + shader hero |

Build-step projects (Vite/React/Tailwind + framer-motion):

- `automation-hero` (port 4192) — 100vh transparent hero over fixed CloudFront video, per-word FadeUp stagger; configs cloned from `stay-section`
- `bank-card-carousel` — 3D cylinder carousel (Tailwind v4); canonical user-supplied `App.tsx`, vanilla-rAF magnetic dwell easing

## Folder map

- `Projects & Portfolio/` — personal project work (invoice-tracker, ptmmi-brand, bodega-portfolio have their own CLAUDE.md)
- `Business & Finance/`, `Skills & Learning/` (downloaded repos: superpowers, agent-skills, ui-ux-pro-max), `Reference & Documentation/`, `Tools & Software/` (notebooklm-py)
- `*.skill` files at root are sources for the house-style skills above
