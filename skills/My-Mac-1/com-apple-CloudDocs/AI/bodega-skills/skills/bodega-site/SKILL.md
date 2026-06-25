\---  
name: bodega-site  
description: \>-  
 Use when building, extending, recreating, debugging, or restyling the Bodega Creative Studio  
 scroll website (AI/bodega-scroll/) — the no-build Three.js + GSAP one-pager whose particle  
 "ecosystem" morphs through six formations and grades the palette as you scroll. Triggers:  
 "work on bodega-scroll", "add a section to the bodega site", "the bodega particle scene",  
 "window.\_\_bodega", "bodega ?cap mode", or cloning this creative-studio site structure for a  
 similar agency client. Captures the section IA, the exact particle-scene config, the  
 data-driven DOM build, the scroll interactions, and the serve/verify workflow. Pair with  
 bodega-brand (facts, palette, copy) and cinematic-3d (the underlying scroll-3D engine). NOT  
 for the stale Next.js bodega-portfolio repo, and NOT a generic Three.js tutorial.  
\---  
  
\# Bodega Site — Build Recipe  
  
How to build and extend \*\*\`AI/bodega-scroll/\`\*\*: a \*\*no-build\*\* (CDN imports, no bundler)  
single-page scroll experience for Bodega Creative Studio. A fixed full-viewport Three.js  
particle field sits behind DOM content; one scroll value drives both.  
  
\*\*REQUIRED PAIRING:\*\* facts, palette, type, and copy come from the \*\*bodega-brand\*\* skill. The  
general scroll-3D engine pattern, performance gates, and self-verify loop come from the  
\*\*cinematic-3d\*\* skill. This skill is the \*bodega-specific instance\* on top of those.  
  
\#\# Files (flat, no build step)  
  
\`\`\`  
bodega-scroll/  
 index.html \# section markup + CDN imports (three importmap, GSAP, ScrollTrigger, iconify)  
 styles.css \# :root tokens + all section styles  
 main.js \# particle scene + data arrays + DOM builders + interactions  
 assets/ \# real work imagery (hero, work\_panasonic, work\_padel, work\_travel\_maktour, work\_roblox)  
\`\`\`  
  
CDN deps: \`three@0.160\` (importmap), \`gsap@3.12.5\` + \`ScrollTrigger\`, \`iconify-icon@2.1.0\`.  
  
\#\# Section IA (scroll order)  
  
\`nav\` → \*\*hero\*\* → \*\*client marquee\*\* → \*\*selected work\*\* (3-col card grid) → \*\*services\*\*  
(accordion) → \*\*why bodega\*\* (4-card bento) → \*\*process\*\* (5 numbered steps) → \*\*Roblox\*\*  
(inverted ink panel) → \*\*proof\*\* (6-col metric bento) → \*\*contact\*\* (info + brief form) →  
footer. A fixed top \*\*progress rail\*\* uses the 4-accent gradient.  
  
\#\# The particle ecosystem (signature)  
  
One \`THREE.Points\` cloud (\`N\` = \*\*7200\*\* desktop / \*\*4200\*\* mobile) morphs through \*\*six  
formations\*\*, one per chapter, as scroll progress \`p\` goes 0→1:  
  
| p region | Formation | Chapter |  
|---|---|---|  
| 0.0 | sphere | hero |  
| 0.2 | wave / river field | work |  
| 0.4 | grid lattice | services / why |  
| 0.6 | helix (double strand) | process |  
| 0.8 | galaxy (spiral arms) | roblox / proof |  
| 1.0 | orb (calm tight sphere) | contact |  
  
Mechanics to preserve:  
\- \*\*Morph:\*\* precompute all 6 \`Float32Array\` position sets once; per frame lerp between the two  
 bracketing formations with a \*\*smoothstep\*\* ease (\`t\*t\*(3-2\*t)\`). Skip work if \`p\` barely  
 moved (\`\<0.0008\`).  
\- \*\*Palette grade:\*\* cycle \*\*blue → mint → pink → yellow → blue\*\* via smoothstep; mix per-point  
 base color toward the chapter color in the vertex shader (\`uChapterMix ≈ 0.34\`). Push the live  
 hex to \`--glow\` and the brand dots each frame.  
\- \*\*Custom shader points:\*\* round soft sprites (\`smoothstep\` alpha, discard \`d\>0.5\`),  
 \`transparent\`, \`depthWrite:false\`, \*\*NormalBlending\*\* (not additive — keeps it readable on  
 light paper), per-point \`aScale/aPhase/aWobble\`, gentle time wobble gated by \`uWob\` (0 under  
 reduced motion).  
\- \*\*Camera:\*\* dolly \`z = 7.4 - sin(p·π)·1.1\` (pushes in mid-journey), plus damped mouse  
 parallax; cloud slow-rotates with \`p\`.  
\- \*\*Scroll smoothing:\*\* \`curP += (targetP - curP) \* 0.08\` (snap to 1.0 under reduced motion).  
 No Lenis here — raw \`scrollY\` is smoothed in the RAF loop.  
  
\#\# Data-driven DOM  
  
Content lives in arrays in \`main.js\` (\`CLIENTS\`, \`WORK\`, \`SERVICES\`, \`WHY\`, \`PROCESS\`, \`PROOF\`)  
and is injected by \`build\*()\` functions into empty section containers in \`index.html\`. \*\*To edit  
copy or add work, edit the array — not the markup.\*\* Keep array values aligned with the  
\*\*bodega-brand\*\* facts.  
  
\#\# Interactions  
  
\- \*\*Reveals:\*\* elements get class \`.reveal\`; ScrollTrigger adds \`.in\` at \`top 88%\` (CSS does the  
 fade-up). Hero title reveals immediately.  
\- \*\*Count-ups:\*\* \`.proof-num\` animate from 0 with \`power2.out\`, 1.6s, \`once:true\`; respect  
 decimals/suffix from data attrs; jump straight to final under reduced motion.  
\- \*\*Accordion:\*\* single-open; animate \`height\` from measured \`inner.offsetHeight\`; toggle  
 \`ph:plus\`↔\`ph:minus\`; re-measure on resize.  
\- \*\*Marquee:\*\* pure CSS, two rows opposite directions, edge-masked, pause on hover.  
\- \*\*Nav:\*\* \`.scrolled\` glass after 40px; full-screen mobile menu panel.  
\- \*\*Brief form:\*\* validates name+brand; posts to \`FORM\_ENDPOINT\` (Formspree) if set, else  
 \*\*mailto fallback\*\* to \`creativestudiolabodega@gmail.com\` — works with no backend.  
  
\#\# Debug handles (house convention)  
  
\- \`window.\_\_bodega\` → \`goto(p)\`, \`get progress\`, \`pause()\`, \`play()\`, \`scene()\` (returns  
 \`{scene,camera,points}\`).  
\- \`?cap=\<0..1 | section-id\>\` → adds \`.cap-mode\`, jumps to a scroll fraction or scrolls a section  
 into view for \*\*deterministic screenshots\*\*.  
  
\#\# Accessibility & performance  
  
\- Honor \`prefers-reduced-motion\`: no wobble/parallax, instant reveals, snap scroll progress,  
 static marquee.  
\- Halve particle count on mobile; clamp DPR to 2; \`powerPreference:'high-performance'\`.  
\- WebGL guarded in \`try/catch\` — hide the canvas and degrade to DOM if it throws.  
\- Target ≥55fps (the \*\*cinematic-3d\*\* Definition of Done applies).  
  
\#\# Serve & verify (iCloud quirk)  
  
The preview server can't read the iCloud folder. Workflow: \`rsync\` \`bodega-scroll/\` to \`/tmp\`,  
serve with \`python3 -m http.server 4xxx\`, add \`?v=N\` cache-busters after edits, use \`?cap=\` +  
\`window.\_\_bodega.goto()\` for deterministic frames. See the workspace memory note on the iCloud  
preview workaround.  
  
\#\# Common mistakes  
  
\- Re-teaching Three.js from scratch instead of editing the existing scene — extend, don't rebuild.  
\- Editing section HTML to change copy when the content lives in \`main.js\` data arrays.  
\- Switching to \*\*additive\*\* blending — it blows out on the light paper canvas; keep NormalBlending.  
\- A single accent — the scene and rail must cycle all four (see bodega-brand).  
\- Forgetting the reduced-motion and WebGL-failure fallbacks.  
\- Confusing this with the stale Next.js \`bodega-portfolio\` repo.  