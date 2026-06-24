# Bodega — combined site

Two previously separate Bodega deployments, now one site with a logical flow
between them:

| Path | What | Audience | Source |
|---|---|---|---|
| `/` | Cinematic marketing landing (Three.js + GSAP credentials site) | **Prospective** clients | `index.html` (self-contained, no build) |
| `/portal` | Client portal SPA (React + Vite, hash-routed) | **Existing** clients | `bodega-portal/` |

## Flow between the two

**Marketing → Portal** (returning clients find the way in):
- Header — **Client login** button (always visible, top-right)
- Closing section — *"Already working with us? Open the client portal →"*
- Footer — **Client portal** link under Contact

**Portal → Marketing** (get back to the public site):
- Login page — **Back to main site** link + clickable `bodega` wordmark
- App sidebar — **Back to bodega.com** link beneath the user card

New-client CTAs (`Start a project`, `Start a conversation`) still point at the
landing's contact form, so the two journeys never cross.

## Deploy (Vercel)

One build produces one static output (`dist/`):

```
vercel.json → installCommand: npm --prefix bodega-portal install
              buildCommand:   npm --prefix bodega-portal run build && node scripts/assemble.mjs
              outputDirectory: dist
```

`scripts/assemble.mjs` lays out the final tree:

```
dist/
  index.html   → marketing landing      (served at /)
  og.png
  portal/      → portal build            (served at /portal/)
```

The portal builds with Vite `base: "/portal/"` and hash routing, so its assets
resolve at `/portal/assets/...` and its routes live under `/portal/#/...` — no
server rewrites needed beyond `/portal → /portal/index.html`.

### Local check

```bash
npm --prefix bodega-portal install
npm --prefix bodega-portal run build && node scripts/assemble.mjs
cd dist && python3 -m http.server 8099   # / and /portal/ both serve
```
