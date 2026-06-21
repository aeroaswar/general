# Bodega — Client Portal

A faithful rebuild of **bodega.pplx.app** — the Bodega client portal — in the
**Bodega brand design** (warm paper `#faf9f9`, ink `#181718`, blue `#2562e7`
accent with mint/pink/yellow, Bricolage Grotesque + Inter). Same usage and
screens as the real app, on the real stack, with a client-side demo store.

> Operating flow: **Client → Project → Framework → Content → Approval → Schedule → Report**

## Run it

```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # static production build → dist/
npm run preview  # serve the production build
```

Fully static — fonts bundled via `@fontsource`, no runtime CDN. Hash routing
(`/#/app/...`) so it deploys to any host with no rewrites. Light by default
(brand); a dark mode is available from the top bar / Settings.

## Demo login

Pick a role (no password — in-memory demo):

| Role | User | Sees |
|---|---|---|
| **Admin** | Aero Aswar | every client, project, approval, report |
| **Team** | Rizky Ananda | assigned projects & content |
| **Client** | Maya Putri | Maktour only — review & approve |

The top bar carries the **Client → Project** context: switch client, then switch the
active project — every working screen scopes to it. (Role switcher is a demo aid.)

## Navigation (pipeline-grouped, role-aware)

**Overview** Dashboard · My Queue — **Plan** Project · Campaigns · Assessment —
**Produce** Content · Assets — **Review** Approvals — **Publish** Calendar —
**Measure** Reports — **Account** Settings. Clients only see Dashboard, Assets,
Approvals, Calendar, Reports, Settings.

## Screens

- **Dashboard** — role-aware: staff get pipeline + "ready to schedule" + activity; clients get "needs your review / coming up / live".
- **My Queue** (staff) — your owned items grouped by next action, with one-click advance.
- **Project** (hub) — overview + framework (phases, pillars target-vs-actual, audience) + content summary. Switch project here too.
- **Content Board** — kanban across the real status machine; **editable** card drawer with readiness-gated actions, scheduling, comments, and an audit/activity trail.
- **Approvals** — client review queue + decision history; reminders.
- **Calendar** — schedule/reschedule by pick-and-place (staff); read-only for clients.
- **Campaigns** — time-bound objectives with progress; links into the board.
- **Assets** — library + request queue with (demo) upload and fulfilment.
- **Reports** — recharts + "Generate report" → frozen snapshot with share link + PDF export.
- **Assessment** — project readiness checklist with a score ring.
- **Settings** — profile, appearance (light/dark), notifications, members, demo reset.

## Stack

React 18 · Vite · Tailwind · framer-motion · recharts · lucide-react · wouter (hash) · date-fns.

## Structure

```
src/
  store.jsx        Auth + Data contexts (client-side, mirrors the real store API)
  seed.js          demo data: clients, projects, frameworks, content, approvals, snapshots
  lib/status.js    status state machine, brand palette, formatters
  lib/ui.jsx       brand UI kit (Button, Card, Badge, Modal, Stat, …)
  components/       AppShell (sidebar/topbar), AuroraBg (brand backdrop)
  pages/           Login + the 11 portal screens above
```

## Provenance

Rebuilt from the real app source in the Bodega Drive (`bodega_developer_source` —
React + Vite + shadcn/ui + Drizzle); data model and store mirror
`client/src/lib/types.ts` and `store.tsx`. The visual design matches the Bodega
brand system (palette + type extracted from the studio's own site stylesheet).
