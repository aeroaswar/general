---
type: area
status: active
tags: [area, threejs, gsap, web, creative-coding]
---
# Creative Coding & Web

_Cinematic, scroll-driven web experiences and premium product sites._

## Standards
- **No-build Three.js + GSAP** for scroll experiences; serve via `python3 -m http.server`
  (rsync to /tmp first — the iCloud workspace folder isn't directly serveable).
- Master-scrub timelines, palette grading, pinned heroes, `window.__<name>` snap
  handles for deterministic paused-frame capture; `?cap=` static-capture modes.
- Build-step projects: Vite/React/Tailwind + framer-motion (expo-out, low-bounce).

## Recurring techniques
- Ocean/decrypt/tube shaders, DOM-measured anchor dwells, FLIP card→detail transitions,
  camera keyframes with station dwells, scramble/word-fill text reveals.

## Projects in this area
```dataview
TABLE status, due
FROM #project
WHERE area = this.file.name
SORT status ASC
```

## Notes
- Portfolio index: [[Creative-Coding Scroll Experiences]].
