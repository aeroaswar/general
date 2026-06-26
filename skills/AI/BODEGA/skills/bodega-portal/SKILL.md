\---  
name: bodega-portal  
description: Bodega "Studio OS" — the internal client-portal/app design language and architecture (warm editorial glass UI in dark+light, a Client→Project→Framework→Content→Approval→Schedule→Report→Billing workflow with a content state machine, role-gated nav, and a localStorage demo store). Stack: React 18 + Vite + Tailwind v3 + framer-motion + wouter + recharts + lucide-react + date-fns. Use when building or extending the Bodega client portal, or any agency/SaaS client dashboard in this house style. For the PUBLIC marketing brand use \`bodega-brand\`; for contracts/invoices use \`bodega-documents\`.  
\---  
  
\# Bodega — Studio OS (client portal)  
  
A faithful agency client portal: the studio runs every client's project through one  
pipeline, and clients log in to review & approve. The UI is \*\*warm editorial glass\*\* —  
near-black/paper canvas, a single ember accent, Fraunces/Instrument Sans/JetBrains Mono  
type, frosted cards. Distinct from the public marketing brand (different palette, no blobs).  
  
\#\# Reference assets (copy these in, they're the real thing)  
  
\- \`reference/tokens.css\` — the full design-token layer (\`:root\` light + \`.dark\`, glass/chip/  
 input components, eyebrow/mono/display utilities, warm backdrop + grain) and the Tailwind  
 \`extend\` config to pair with it.  
\- \`reference/ui-primitives.jsx\` — the component kit: \`Button\` \`Card\` \`Badge\` \`StatusBadge\`  
 \`PlatformTag\` \`Avatar\` \`Progress\` \`Stat\` \`PageTitle\` \`EmptyState\` \`Modal\` + the \`fadeUp\`  
 motion preset. Build screens out of these — don't hand-roll new buttons/cards.  
\- \`reference/state-machine.js\` — the content workflow: statuses, stages, transitions,  
 readiness gates, role + platform + project-status metadata, date helpers.  
  
\#\# The domain model (the "backbone")  
  
The portal is the backbone of every client engagement. Entity hierarchy:  
  
\`\`\`  
Client → Project → Framework(Phases · Content Pillars · Audience Segments)  
 → Campaigns → Content items → Approvals → Schedule(Calendar) → Reports  
 → Contract (see bodega-documents) → Invoices (Billing)  
\`\`\`  
  
All "backbone" entities (clients, projects, phases, pillars, audience segments, contracts,  
invoices) are \*\*user-editable and persisted\*\* — not hardcoded.  
  
\#\# The content state machine (\`state-machine.js\` — treat as canonical)  
  
Granular statuses → grouped into the flow stages the board reads as:  
  
\`Brief\` (Idea, Briefing) → \`Content\` (Draft, Internal Review) → \`Approval\` (Client Review,  
Revision Requested) → \`Schedule\` (Approved, Scheduled) → \`Live\` (Posted) → Archived.  
  
\- \`NEXT\_STATUS\` defines the only allowed forward moves. \`checkMove(item, to, ctx)\` returns  
 \`{ ok, missing\[\] }\` — \*\*readiness gates\*\* (e.g. → Internal Review needs hook+brief+CTA+  
 owner+deadline; → Scheduled needs publish date+platform+owner+an asset). Disable the  
 advance button and show the missing list when \`\!ok\`.  
\- \`CLIENT\_VISIBLE\` whitelists what a client role may ever see (Client Review, Approved,  
 Scheduled, Posted — never internal drafts/setup).  
\- \`STATUS\_META\` / \`PLATFORM\_META\` / \`ROLE\_META\` / \`PROJECT\_STATUS\_C\` carry the legibility-  
 tuned colours. Render status with \`\<StatusBadge\>\`, platform with \`\<PlatformTag\>\`.  
  
\#\# Roles (\`ROLE\_META\`)  
  
\`admin\` (full studio access) · \`team\` (assigned projects) · \`client\` (review & approve).  
Nav items and data are gated by role everywhere — always filter by \`me.role\`.  
  
\#\# App shell pattern  
  
\- Left sidebar (sticky, glass) with \*\*grouped nav\*\*: \`Start\` (Cockpit, My Queue) · \`Set up\`  
 (Clients, Contract, Assessment) · \`Plan\` (Project, Campaigns, Content, Calendar) ·  
 \`Approve\` (Approvals, Assets) · \`Report\` (Reports) · \`Billing\` (Invoices) · \`System\`  
 (Settings). Each item declares \`roles: \[...\]\`; hide groups that end up empty.  
\- Header: \*\*client switcher + project switcher\*\* (dropdowns that filter the whole app),  
 theme toggle, an approvals bell with a count badge, avatar. On mobile it collapses to a  
 drawer; switcher labels truncate (\`max-w\` + \`truncate\`) and the header wrapper must \*\*not\*\*  
 set \`overflow-hidden\` (it clips the dropdowns).  
\- Routing is \*\*hash-based (wouter)\*\* so it deploys as a static SPA under a sub-path  
 (\`base: "/portal/"\`). Routes live in \`App.jsx\`; client-blocked routes are gated there too.  
  
\#\# State / persistence pattern (no backend)  
  
Context providers: \`ThemeProvider\` (persists \`bodega-theme\`, default dark, toggles \`.dark\`),  
\`AuthProvider\` (persists current user + authed flag; \`loginAs(role)\`), \`DataProvider\`.  
  
\- \`DataProvider\` hydrates every entity from \`localStorage\` (\`seeded(key, FALLBACK\_SEED)\`),  
 else from \`seed.js\`, and \*\*re-saves the whole dataset on any change\*\* under a \*versioned\*  
 key (\`bodega-store-v2\` — bump the suffix when the shape changes).  
\- IDs: \`uid(prefix)\` = \`prefix\_\<ts\>\_\<rand\>\`. Timestamps ISO. Wrap mutations with \`logAudit\`.  
\- Expose \*\*role-scoped selectors\*\* (\`useVisibleClients\`, \`useVisibleProjects\`,  
 \`useVisibleContent\`, \`useSelectedClient\`, \`useActiveProject\`, \`useProjectContent\`) so pages  
 never see data the role shouldn't. Selected client/project persist across reloads.  
  
\#\# Stack & conventions  
  
React 18 · Vite 5 · Tailwind v3 (\`darkMode:"class"\`) · framer-motion 11 · wouter 3 ·  
recharts 2 · lucide-react · date-fns 3 · \`@fontsource-variable/{instrument-sans,fraunces,  
jetbrains-mono}\` · \`clsx\` (re-exported as \`cx\`). Page transitions use the \`fadeUp\` preset;  
modals/drawers use the spring in \`ui-primitives.jsx\` / \`AppShell\`. Keep everything  
\*\*mobile-first\*\* and reduced-motion-safe.  
  
\#\# Deploy  
  
Marketing site + portal ship as one static Vercel deployment: \`vite build\` the portal, then  
\`scripts/assemble.mjs\` lays out \`dist/\` with the marketing \`index.html\` at \`/\` and the portal  
at \`/portal/\`. Run assemble from the \*\*repo root\*\*, not from \`bodega-portal/\`.  