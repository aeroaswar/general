# Bodega Portfolio — "New Era"

A single self-contained `index.html` recreating the **New Era** scroll experience: a
full-viewport WebGL particle cloud (~120k additively-blended points) that morphs through
seven phases as the page scrolls — sphere → funnel → DNA double-helix → rolling ocean wave →
cylindrical tunnel → black-hole singularity → spiral galaxy — with an aurora background,
UnrealBloom glow, and four frosted-glass text overlays synced to fixed scroll windows.

- **File:** [`index.html`](./index.html)
- **Stack:** pure HTML/CSS/JS, no build step — Three.js r0.169 and Lenis loaded via ES module
  importmap from unpkg.
- **Run it:** serve the folder with any static server, e.g. `python3 -m http.server 8080`, then
  open `http://localhost:8080`.
