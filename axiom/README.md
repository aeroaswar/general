# AXIOM — one site, dedicated pages

The four AXIOM artifacts, consolidated into a single static site that shares one
design system, logo, navigation, spacing and motion. Each source link keeps its
own dedicated page.

| Page | Source link | What it is |
|---|---|---|
| `index.html` | — | Home hub: hero + the five pillars + a chapter grid linking to the four pages |
| `performance.html` | Human Performance & Longevity | The live shop — gate, catalogue (54 SKUs), cart drawer, WhatsApp quote, CoA (hash-routed home/shop/proof/contact) |
| `plan.html` | Business Model, Plan & Launch Proposal | Full launch plan and P&L |
| `brand.html` | Brand Guidelines v1.0 | Full 13-section brand system (logo, palette, type, motion, voice, RUO standard) |
| `gtm.html` | Go-to-Market Strategy | Full 8-part go-to-market |

## Shared system (`assets/`)

- `axiom.css` — tokens, chrome (nav / footer / gate / cart), section anatomy, buttons, motion primitives.
- `axiom-chrome.js` — injects the unified nav, footer, SVG defs (and, on the shop page only, the gate, cart drawer and product modal). Active nav comes from `<body data-page="…">`.
- `axiom-field.js` — the bronze particle field (Three.js r169): a hero canvas on landing pages, a fixed ambient background on document pages.
- `axiom-motion.js` — GSAP + ScrollTrigger interaction layer: reveals, stagger, count-ups, magnetic hover, nav hide-on-scroll. **Normal cursor only** — the original dot/ring cursor was removed by request.
- `axiom-shop.js` — catalogue + cart (performance page only).
- `axiom-router.js` — in-page hash router for the shop's four views.
- `vendor/` — GSAP 3.12.5, ScrollTrigger 3.12.5, Three.js r169 (self-hosted).
- `fonts/` — Jost + Inter (self-hosted `.woff2`). The site is fully self-contained — no external requests.

## View it

Serve the folder over HTTP (module scripts + fonts need it):

```sh
cd axiom && python3 -m http.server 4321
# open http://localhost:4321/index.html
```

> Note: the repository's root `index.html` (the Wonderful Indonesia KOL dashboard)
> and its Vercel config are untouched. To also serve this site from Vercel, allow
> the `axiom/` folder in `.vercelignore`.
