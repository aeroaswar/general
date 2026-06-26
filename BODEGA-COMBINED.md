# Bodega — combined site

The two previously separate Bodega deployments — the marketing credentials site and
the client portal — now ship as **one Vercel site** with a logical flow between them.
This is the live production deliverable of the `aeroaswar/general` repo.

| Path | What | Audience | Source |
|---|---|---|---|
| `/` | Cinematic marketing landing (Three.js + GSAP credentials site) | **Prospective** clients | `index.html` (self-contained, no build) |
| `/portal/` | Client portal SPA (React + Vite, hash-routed) | **Existing** clients | `bodega-portal/` |

## Flow between the two

**Marketing → Portal** (returning clients find the way in):
- Header — **Client login** button (always visible, top-right)
- Closing section — *"Already working with us? Open the client portal →"*
- Footer — **Client portal** link under Contact

**Portal → Marketing** (get back to the public site):
- Login page — **Back to main site** link + clickable `bodega` wordmark
- App sidebar — **Back to bodega.com** link beneath the user card

New-client CTAs (`Start a project`, `Start a conversation`) still point at the
landing's contact form, so the prospect and existing-client journeys never cross.

## The portal is the backbone

Every client engagement runs through one pipeline; clients log in to review & approve.

```
Client → Project → Framework (Phases · Content Pillars · Audience Segments)
                 → Campaigns → Content → Approvals → Schedule (Calendar) → Reports
                 → Contract → Invoices (Billing)
```

- **Editable + persisted.** Clients, projects, phases, pillars, audience segments,
  contracts and invoices are all user-editable and saved to the browser
  (`localStorage`, key `bodega-store-v2`) — they survive refresh, no backend.
- **Content workflow state machine** (`src/lib/status.js`): granular statuses grouped
  into the flow stages the board reads as — `Brief → Content → Approval → Schedule →
  Live`. Forward moves are gated by readiness checks (`checkMove`), and a role's
  visibility is whitelisted (`CLIENT_VISIBLE`).
- **Roles:** `admin` (full studio) · `team` (assigned projects) · `client` (review &
  approve). Nav and data are role-gated everywhere.
- **My Queue** surfaces each user's owned items that need action, grouped by next step.

## Contracts & invoices (print-perfect documents)

Both render on the Bodega letterhead and print as real A4 PDFs.

- **Engagement contract** (`src/pages/Contract.jsx`) — editable per client; covers scope,
  deliverables, fee, terms, plus the engagement **phases / pillars / audience** (editable
  inline). **Bilingual EN / Bahasa Indonesia**, with the Indonesian variant in authentic
  legal form (PASAL clauses, PIHAK PERTAMA/KEDUA, preamble/penutup). **E-signature**
  (canvas pad, resettable) and **e-Meterai** (upload the official PERURI stamp + serial).
- **Invoice** (`src/pages/Invoices.jsx`) — same letterhead. Totals cascade
  **Subtotal → + Agency fee (default 10%) → + VAT (default 2%) → Total**, both rates
  editable per invoice. IDR money formatting; `INV/001/BCS/<roman-month>/<year>` numbering.
- **Print system** (`src/index.css`) — a letterhead that repeats on every page (table
  header/footer groups), theme-proof light "paper" tokens, reliable page breaks, and
  identical output on phone and desktop. The hard-won details are captured in the
  `bodega-documents` skill.

## Design system & house-style skills

Distilled into three reusable Claude Code skills under `.claude/skills/`:

| Skill | Surface |
|---|---|
| `bodega-brand` | Public marketing — editorial "paper → ink", Fraunces/Instrument Sans/JetBrains Mono, brand-colour spectrum, blobs/grain, the bodega® wordmark |
| `bodega-portal` | "Studio OS" portal UI + architecture — warm glass tokens, UI primitive kit, the workflow state machine, the localStorage store pattern |
| `bodega-documents` | Print-perfect bilingual contracts & invoices — repeating letterhead, theme-proof print CSS, e-signature pad, e-Meterai, agency-fee + VAT math |

## Deploy (Vercel)

**Production = push to `main`.** The `general` Vercel project is git-connected; merging to
`main` auto-deploys production. One build produces one static output (`dist/`):

```
vercel.json → installCommand: npm --prefix bodega-portal install
              buildCommand:   npm --prefix bodega-portal run build && node scripts/assemble.mjs
              outputDirectory: dist
```

`scripts/assemble.mjs` (run from the **repo root**) lays out the final tree:

```
dist/
  index.html   → marketing landing      (served at /)
  og.png
  portal/      → portal build            (served at /portal/)
```

The portal builds with Vite `base: "/portal/"` and hash routing, so its assets resolve at
`/portal/assets/...` and its routes live under `/portal/#/...` — no server rewrites needed
beyond `/portal → /portal/index.html`.

> **Sharing with a team:** Vercel **Deployment Protection (Vercel Authentication)** gates
> both preview *and* production `*.vercel.app` URLs. To let others in: Vercel → project
> **general** → **Settings → Deployment Protection → Vercel Authentication → Disabled**.

> **Note:** this combined site replaced the standalone *Composites* experience that used to
> sit at the root. Composites is preserved in git history (commit `c07c90c`) and can be
> remounted at a sub-route (e.g. `/composites`) if wanted.

### Local check

```bash
npm --prefix bodega-portal install
npm --prefix bodega-portal run build && node scripts/assemble.mjs
cd dist && python3 -m http.server 8099   # / and /portal/ both serve
```

Verify both the on-screen and the printed (Cmd/Ctrl-P → Save as PDF) views of contracts and
invoices, in both light and dark themes and on a narrow viewport — the print/mobile bugs the
document system guards against only appear there.
