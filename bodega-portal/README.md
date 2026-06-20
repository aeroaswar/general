# Bodega — Client Portal (aurora-glass)

A faithful rebuild of **bodega.pplx.app** — the Bodega client portal — re-skinned in
the **aurora-glass** design language. Same usage and screens as the real app, built
on the real stack and a client-side demo store (no backend required).

> Operating flow: **Client → Project → Framework → Content → Approval → Schedule → Report**

## Run it

```bash
npm install
npm run dev      # local dev server (Vite)
npm run build    # static production build → dist/
npm run preview  # serve the production build
```

Fully static — fonts bundled via `@fontsource`, no runtime CDN. Hash routing
(`/#/app/...`) so it deploys to any host (Vercel/Netlify/Pages) with no rewrites.

## Demo login

The login screen lets you enter as any role (no password — in-memory demo):

| Role | User | Sees |
|---|---|---|
| **Admin** | Aero Aswar | every client, project, approval, report |
| **Team** | Rizky Ananda | assigned projects & content |
| **Client** | Maya Putri | Maktour only — review & approve |

Switch role any time from the top bar; switch the active client from the client picker.

## Screens (core portal)

- **Dashboard** — KPIs, content pipeline overview, reach, upcoming schedule, recent activity, project health.
- **Projects** — project cards + a detail drawer with the full framework (phases, pillars, audience segments, goals).
- **Content Board** — kanban across the real status state machine (Idea → … → Posted). Card drawer with role-aware actions: advance status, request client review, approve / request revision, comment.
- **Approvals** — the client review queue (approve / request revision) + decision history; team can send reminders.
- **Calendar** — month grid of scheduled/published content, status-coloured, with a day panel.
- **Reports** — recharts: planned vs posted, approval turnaround, pillar mix, platform split, KPIs, PDF export log.

## Stack

React 18 · Vite · Tailwind · framer-motion · recharts · lucide-react · wouter · date-fns —
matching the real app (`@radix`/shadcn → hand-rolled glass primitives in `src/lib/ui.jsx`).

## Structure

```
src/
  store.jsx        Auth + Data contexts (client-side, mirrors the real store API)
  seed.js          demo data: clients, projects, frameworks, content, approvals, snapshots
  lib/status.js    status state machine, palette, formatters
  lib/ui.jsx       aurora-glass UI kit (Button, Card, Badge, Modal, Stat, …)
  components/       AppShell (sidebar/topbar), AuroraBg
  pages/           Login, Dashboard, Projects, ContentBoard, Approvals, Calendar, Reports
```

## Provenance

Rebuilt from the real app source in the Bodega Drive (`bodega_developer_source` —
React + Vite + shadcn/ui + Drizzle) and its architecture spec. The data model
(`ContentStatus`, roles, entities) mirrors `client/src/lib/types.ts`; the store
mirrors `client/src/lib/store.tsx`. Visuals are re-imagined in aurora-glass.
