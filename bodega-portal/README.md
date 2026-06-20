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

Switch role any time from the top bar; switch the active client from the picker.

## Screens

- **Dashboard** — KPIs, pipeline overview, reach, upcoming schedule, activity, project health.
- **Projects** — cards + framework drawer (phases, pillars, audience, goals).
- **Strategy** — the project framework with target-vs-actual pillar mix.
- **Content Board** — kanban across the real status state machine; card drawer with role-aware actions (advance, request review, approve / revise, comment).
- **Approvals** — client review queue + decision history; reminders.
- **Calendar** — month grid of scheduled/published content, status-coloured.
- **Campaigns** — time-bound objectives with progress and linked content.
- **Assets** — library + request queue with (demo) upload and fulfilment.
- **Reports** — recharts (planned vs posted, approval turnaround, pillar mix, platform split) + PDF export log.
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
