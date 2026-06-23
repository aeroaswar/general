# AXIOM — Human Performance · Research Peptides Catalogue

A premium, single-page static website for a research-peptide catalogue.
**For research use only.**

## Brand & Design — Swiss / Neutral / Timeless
- **Palette:** Onyx `#050505` · Bone `#ECE9E3` · Titanium `#9A958B` — strictly monochrome,
  no other hue.
- **Typography:** Jost (geometric display, light/tracked) · Inter (neutral body) ·
  IBM Plex Mono (specs, lot numbers, prices, labels).
- **Layout:** Swiss modular grid — hairline rules instead of cards/shadows, asymmetric
  left-aligned hero, prominent numerals, generous negative space.
- **Hero:** real-time **Three.js** glass peptide vial with a titanium crimp cap and an
  `AXIOM` label, lit by a built-in studio environment (no external HDRI). Scroll/pointer
  parallax. `prefers-reduced-motion` → single static frame; WebGL-unavailable → logo poster.
- **Motion:** **GSAP** + ScrollTrigger for hero line reveals, section reveals and the
  count-up — all gated on reduced-motion.
- Live search + category filter + sort + price range across all 49 compounds; quote cart
  with WhatsApp checkout; per-compound research drawer; research-use acknowledgement gate.
- Fully responsive; prominent "Research Use Only" disclaimer; IDR pricing.

## Debug handle
`window.__axiom` — `snap(0..1)` set scroll progress · `frame()` render once · `spin(rad)`.

## Run
No build step. Serve statically from the project root:
```sh
python3 -m http.server 4321
# open http://localhost:4321
```
Three.js, GSAP, Phosphor (light) and Google Fonts load from CDN.

## Files
- `index.html` — markup, styles, interactivity, Three.js hero + GSAP motion (self-contained)
- `data.js` — catalogue data (6 categories, 49 compounds, IDR prices) + neutral research reference
- `assets/axiom-logo.svg` — geometric wordmark · `og.svg` — social card
