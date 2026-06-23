# KOL Campaign Management Dashboard — Comprehensive Build Prompt
### Client: PT. EORI INDONESIA KREATIF · Prepared by: Senior Marketing Agency (global)

> **How to use this document.** This is a self-contained build prompt. Paste the whole file into an
> AI app builder (Lovable, Bolt, v0, or Claude), or hand it to a development team as a PRD. It is
> written in English; all user-facing UI strings are specified bilingually as **`EN / ID`** (English
> / Bahasa Indonesia). Sections 0–10 are the brief; the appendix (§9) is the domain reference the
> builder must follow for tiers, formulas, status enums, and labels.

---

## 0. Role & Objective

**You are a senior product engineer and product designer.** Build a **production-ready, multi-client
KOL (Key Opinion Leader / influencer) campaign management dashboard** for **PT. EORI INDONESIA
KREATIF**, an Indonesian creative & influencer-marketing agency.

The product is an **internal agency operating system** for the full influencer-campaign lifecycle:

> **Discover & shortlist KOLs → Brief them → Produce & approve content → Schedule & post → Measure &
> report → Monitor client portfolios → Track everything on one timeline.**

It is **multi-tenant by client**: one agency workspace manages many clients, each with many campaigns,
each campaign engaging many KOLs across many platforms. The six modules the client explicitly
requested are first-class navigation items: **KOL Monitoring List, KOL Brief, KOL Posting, KOL Report
posting, Client Monitoring, and Timeline.**

**Success looks like:** an account manager can open the app on Monday and, in one place, see every
campaign's health, what content is awaiting approval today, which posts went live, this week's
performance, and what's due next — without opening a spreadsheet.

**Out of scope (v1):** automated platform API ingestion (build manual + CSV import now, leave clean
adapter seams for IG/TikTok/YouTube APIs later), billing/invoicing, and DM/outreach inboxes.

---

## 1. Users, Roles & Permissions (RBAC)

| Role | EN / ID | Primary job | Key permissions |
|---|---|---|---|
| **Agency Admin** | Admin Agensi | Owns the workspace | Everything: users, clients, billing settings, delete |
| **Account Manager** | Account Manager | Owns client relationships & campaigns | Create/edit clients, campaigns, briefs; approve content; publish reports |
| **KOL / Talent Manager** | Manajer Talent | Manages the KOL roster & bookings | CRUD KOLs, rate cards, availability; assign KOLs to briefs |
| **Creative / Content Reviewer** | Reviewer Konten | Reviews drafts | Comment, request revision, internal-approve content |
| **Client** | Klien | External stakeholder | Read-only on their own data + approve/reject content & briefs sent to them |
| **Finance** *(optional)* | Keuangan | Budgets & spend | Read budgets/spend, export financial reports |

**Requirements:**
- Enforce RBAC on both **navigation visibility** and **API/data access**. A Client must never see
  another client's data (row-level scoping by `client_id`).
- Provide a **permissions matrix** screen under Settings (read-only display of the table above).
- Every destructive action (delete, blacklist) requires confirmation and is written to the audit log.

---

## 2. Global Design System

Adopt PT. EORI's "house" dashboard style (the **talvex-dashboard** system):

- **Recommended stack:** React + Vite + TypeScript + Tailwind CSS + Recharts. (See §8 for
  platform-agnostic and Lovable/Supabase mappings — the design rules below apply regardless of stack.)
- **Aesthetic:** airy, premium, data-dense-but-calm. **Frosted-glass cards** (subtle backdrop blur,
  1px hairline border, soft shadow) on a light, near-white canvas.
- **Accent color:** `#FFD85F` (warm yellow) — used for primary actions, active nav, key highlights,
  and the "today" marker. Use sparingly; it should pop, not flood.
- **Semantic colors:** success/green, warning/amber, danger/red, info/blue, neutral/slate. Map these
  to status chips consistently (see §9 status palettes).
- **Typography:** Inter or Geist. Tabular numerals for all metrics. Clear type scale; generous line
  height.
- **Iconography:** Phosphor icons, thin/regular weight.
- **Theme:** light default with a working **dark mode** toggle. **No purple.**
- **Density:** comfortable default with a "compact" toggle for power users on big tables.
- **Responsive:** desktop-first (this is an ops tool) but fully usable on tablet; graceful mobile for
  monitoring/approval-on-the-go.
- **i18n:** ship a working **EN / ID language toggle** in the top bar. All labels in this document's
  `EN / ID` pairs become the i18n string table.
- **Accessibility:** WCAG AA contrast, full keyboard nav, focus rings, ARIA on interactive elements,
  and **`prefers-reduced-motion`** respected (disable non-essential animation).

**The 6 card archetypes** (reuse these as the building blocks across every screen):

| # | Archetype | Used for |
|---|---|---|
| 1 | **KPI stat card** | Single metric + delta + sparkline (reach, ER, budget used, EMV) |
| 2 | **Trend chart card** | Time series (engagement over time, spend over time) |
| 3 | **Leaderboard / list card** | Ranked rows (top KOLs, top posts, top campaigns) |
| 4 | **Status / pipeline card** | Kanban columns or pipeline counts (content stages, brief stages) |
| 5 | **Calendar / timeline card** | Date-anchored items (Gantt, posting calendar, deadlines) |
| 6 | **Detail / profile card** | Rich entity view (KOL profile, client profile, campaign sheet) |

Every screen below names which archetypes it uses, so the component library is reused, not reinvented.

---

## 3. Information Architecture & Navigation

**Left sidebar (primary nav):**

| Item | EN / ID | Route |
|---|---|---|
| Overview | Ringkasan | `/` |
| KOL Monitoring List | Daftar Pantauan KOL | `/kols` |
| KOL Brief | Brief KOL | `/briefs` |
| KOL Posting | Posting KOL | `/posting` |
| KOL Report | Laporan KOL | `/reports` |
| Clients | Klien | `/clients` |
| Timeline | Timeline | `/timeline` |
| Settings | Pengaturan | `/settings` |

**Top bar (global, persistent):**
- **Client switcher / filter** (All clients or one) — `Client / Klien`
- **Campaign filter** — `Campaign / Kampanye`
- **Date-range picker** — `Date range / Rentang tanggal`
- **Global search** (KOLs, clients, campaigns, posts) — `Search / Cari`
- **Language toggle** (EN / ID)
- **Notifications bell** (approvals pending, deadlines, status changes)
- **User menu** (profile, theme, logout)

The Client + Campaign + Date filters in the top bar **scope every screen** (Overview, Reports,
Timeline, etc.) so the whole app reacts to one selection.

---

## 4. Core Modules — Detailed Specifications

> For each module: **purpose · layout · fields/columns · filters · actions · status enum · charts ·
> states (empty/loading/error) · card archetypes**.

### 4.1 KOL Monitoring List — `Daftar Pantauan KOL`

**Purpose.** The master directory of every KOL in the agency's roster — the single source of truth
for discovery, shortlisting, rates, and availability.

**Layout.** Toggle between **Table view** (dense, sortable) and **Grid view** (profile cards). A
filter rail (left or top), and a stats strip above the list.

**Fields / columns.**
- Identity: avatar, full name, primary handle, verified flag, **PIC/contact** (manager, phone, email)
- Platforms: chips for Instagram / TikTok / YouTube / X / Facebook (a KOL can have several)
- **Tier** (Nano → Mega — see §9.1), **Niche/category** (beauty, F&B, tech, parenting, gaming, etc.)
- Location (city/province), audience demographics (age band, gender split, top geos)
- Metrics per platform: followers, **avg ER %**, avg views, avg likes/comments
- **Rate card** per platform & format (see §9.3) and currency (IDR default)
- **Performance score** (agency's composite 0–100; define as weighted ER + reliability + brand-fit)
- **Availability status** (enum below) and **assigned client/campaign** (if booked)
- Tags (free-form), notes, last-collaborated date

**Availability status enum** → `Active / Aktif` · `Negotiating / Negosiasi` · `Booked / Terpesan` ·
`Blacklist / Daftar Hitam`.

**Filters.** Platform, tier, niche, ER range, follower range, budget/rate range, location,
availability, tag, assigned client. Free-text search on name/handle.

**Actions.**
- **Add KOL** (form) and **Import CSV** (bulk, with column-mapping + validation preview)
- **Assign to brief/campaign** (multi-select rows → assign)
- **Open profile** (archetype 6: full KOL profile with platform breakdown, past campaigns &
  historical performance, rate card, files)
- Tag, set availability, blacklist (with reason → audit log), export selection to CSV

**Charts / stats strip (archetypes 1 & 3).** Tier mix (donut), platform split, ER benchmark vs roster
median, count by availability, top KOLs by performance score.

**States.** Empty: "No KOLs yet — add your first KOL or import a CSV." Loading: skeleton rows. Error:
inline retry.

---

### 4.2 KOL Brief — `Brief KOL`

**Purpose.** Create, store, send, and track campaign briefs. One brief targets a campaign and can be
issued to **many KOLs**; each KOL's acknowledgement is tracked individually.

**Layout.** Brief **repository** (list/cards filtered by client/campaign/status) + a **Brief builder**
(structured form / wizard) + a **brief detail** view with the per-KOL distribution & status table.

**Fields.**
- Title, **client**, **campaign**, objective (`Awareness / Kesadaran` · `Consideration /
  Pertimbangan` · `Conversion / Konversi`)
- Campaign window (start/end), **posting window**, total/allocated budget
- **Key messages**, tone of voice, **do's & don'ts**, mandatory **hashtags / mentions / links / promo
  codes**, disclosure requirements (e.g. `#ad` / `#kerjasama` / "paid partnership")
- **Deliverables** spec (e.g. *1 IG Reel + 3 IG Stories + 1 TikTok video*) with per-deliverable format
  specs (aspect ratio, duration, resolution)
- Brand assets / references (file uploads, moodboard links), target audience, KPIs/targets
- **Approval chain** (internal reviewer → account manager → client)
- Assigned KOLs (pulled from the Monitoring List) each with a personalized rate/deliverable set

**Status enum** → `Draft / Draf` · `Sent to KOL / Dikirim ke KOL` · `Acknowledged / Dikonfirmasi` ·
`Revision / Revisi` · `Approved / Disetujui`.

**Actions.** Save draft, duplicate brief, **send to selected KOLs**, export/share (**PDF** + secure
share link), version history, convert approved brief → posting tasks (auto-creates Content Items in
§4.3 from the deliverables spec).

**Charts.** Brief funnel (sent → acknowledged → approved), per-KOL acknowledgement table (archetype
4 + 3).

**States.** Empty, loading skeleton, error retry. Validation: cannot "Send" without ≥1 KOL,
deliverables, and a posting window.

---

### 4.3 KOL Posting — `Posting KOL`

**Purpose.** The content **production & approval pipeline** — every piece of content from draft to
verified live post. This is where work moves day-to-day.

**Layout.** Primary **Kanban board** (columns = pipeline stages) with a **Table view** and a
**Calendar view** toggle. Each card = one **Content Item / deliverable**.

**Content Item card.** KOL (avatar + handle), client/campaign, platform + format chip, draft
caption/copy, **media preview** (image/video thumb), scheduled date-time, assignee/reviewer, due
date, live URL (once posted), comment count.

**Status pipeline (Kanban columns)** →
`Briefed / Di-brief` → `Draft submitted / Draf Dikirim` → `Internal review / Review Internal` →
`Client approval / Persetujuan Klien` → `Revision / Revisi` → `Approved / Disetujui` →
`Scheduled / Terjadwal` → `Posted / Telah Posting` → `Verified / Terverifikasi`.

**Actions.**
- Drag between stages (RBAC-gated: only reviewers/AM can move into approval stages; only Client role
  can move within Client approval)
- Open content detail: caption editor, media gallery, **threaded comments + revision notes**,
  **version history** (each resubmission = new version), approve / request changes (with required
  note), set schedule date-time, paste live URL, mark verified
- Bulk schedule; filter by client/campaign/KOL/platform/status/assignee/due date

**Calendar view (archetype 5).** Posts placed on their scheduled date; color by platform or status;
drag to reschedule; "overdue" highlighting.

**Charts.** Pipeline counts per stage (archetype 4), content due this week, approval-cycle time.

**States.** Empty per column, loading skeleton cards, error retry, optimistic drag with rollback on
failure.

---

### 4.4 KOL Report posting — `Laporan KOL`

**Purpose.** Capture and present **post-campaign performance** per post and aggregated — the
client-facing proof of results.

**Layout.** A **metric-entry** surface (per Content Item that is `Posted/Verified`, capture results
manually or via CSV import) **+ a reporting/analytics surface** (filterable dashboards + exportable
client reports).

**Metrics captured per post.** Reach, impressions, video views, likes, comments, shares, saves,
clicks/link taps, profile visits, video completion / avg watch time, and computed **ER %, CPV, CPE,
CPM, EMV** (formulas in §9.2). Store the spend attributed to each post to drive cost metrics.

**Aggregations.** By campaign, client, KOL, platform, tier, and time period. Always reflect the top-
bar client/campaign/date filters.

**Charts (archetypes 1, 2, 3).**
- KPI tiles: total reach, total engagements, blended ER, total spend, blended CPE, **EMV**, ROI proxy
- Trend lines: engagement & reach over the campaign
- Comparison bars: performance by platform / by tier / by KOL
- **Top performers leaderboard** (posts & KOLs)
- Funnel: impressions → engagements → clicks → conversions (if tracked)

**Actions.** Enter/import metrics, **generate client-ready report** (branded **PDF**), export CSV,
create a **shareable report link** (read-only, client-safe), and **save report snapshots** (frozen at
a date for the record).

**States.** Empty (no posted content yet → prompt to post first), loading, error. Show "metrics
pending" badges on posts awaiting results entry.

---

### 4.5 Client Monitoring — `Klien`

**Purpose.** A **client-centric portfolio view** — health and value of every client relationship at a
glance, plus a drill-down per client.

**Layout.** **Client list** (cards/table with health + KPIs) → **Client detail** (archetype 6).

**Client list fields.** Client name + logo, PIC/account manager, # active campaigns, budget spent vs
allocated (progress bar), # KOLs engaged, aggregate reach/engagement, **health status**, next
deadline.

**Client health enum** → `On-track / Sesuai Jadwal` (green) · `At-risk / Berisiko` (amber) ·
`Delayed / Terlambat` (red). Derive health from overdue deliverables, pending approvals past SLA, and
budget pace.

**Client detail.** Profile + contract/retainer info, all campaigns (status + dates), budget
utilization chart, engaged KOLs, upcoming deliverables, recent posts & performance summary, files,
activity feed. **Optional client-facing read-only mode** (the Client role sees only this, scoped to
their `client_id`).

**Filters.** Health, account manager, budget pace, has-active-campaign.

**Charts.** Spend by client (archetype 3), budget utilization gauges (archetype 1), campaigns per
client, portfolio engagement trend (archetype 2).

**States.** Empty, loading, error retry.

---

### 4.6 Timeline — `Timeline`

**Purpose.** The **cross-campaign master schedule** — every milestone and deadline across all clients
on one canvas.

**Layout.** **Gantt view** (default: rows = campaigns/briefs, bars = phases, diamonds = milestones) +
**Month calendar view** + **List/agenda view**.

**Milestone / event types.** `Brief sent / Brief Dikirim` · `Content due / Konten Jatuh Tempo` ·
`Approval deadline / Batas Persetujuan` · `Go-live / Tayang` · `Reporting due / Laporan Jatuh Tempo`.
Each event links back to its source entity (brief, content item, report).

**Features.**
- **Dependencies** between milestones (e.g. content due → approval → go-live), with visual links
- **Today marker** (use the `#FFD85F` accent), **overdue highlighting** (red), upcoming (amber)
- Drag to reschedule (RBAC-gated; cascades dependent items with confirmation)
- Group/swimlane by client or by campaign; zoom (week/month/quarter)
- Filter by client / campaign / KOL / platform / milestone type / assignee

**States.** Empty ("No scheduled milestones"), loading, error. Performance: virtualize long ranges.

---

## 5. Overview Dashboard (Home) — `Ringkasan`

The landing screen. Respects the top-bar client/campaign/date filters. Built entirely from the 6 card
archetypes:

**KPI tiles (archetype 1):** Active campaigns · KOLs engaged · Total reach (period) · Blended ER % ·
Budget utilization % · Posts live vs pending · **EMV** — each with a period-over-period delta + spark.

**Charts & lists:**
- Engagement & reach trend over time (archetype 2)
- Spend by client (archetype 3, ranked)
- Top KOLs / top posts this period (archetype 3, leaderboard)
- Content pipeline status (archetype 4 — counts per stage from §4.3)
- **Upcoming deadlines** & approvals awaiting me (archetype 5, from Timeline + Posting)
- Client health summary (mini cards: on-track / at-risk / delayed counts)

Clicking any card deep-links into the relevant module pre-filtered.

---

## 6. Data Model (Entities & Relationships)

Implement these entities (names indicative). Use UUID PKs, `created_at`/`updated_at`, soft-delete
where sensible, and scope client-owned rows by `client_id`.

- **User** — name, email, avatar, `role`, locale (en/id), status
- **Role** — name, permission set (drives RBAC)
- **Client** — name, logo, PIC, contract/retainer info, status; `1—∞ Campaign`
- **Campaign** — `client_id`, name, objective, budget_allocated, start/end, status; `1—∞ Brief`,
  `1—∞ Deliverable/ContentItem`
- **KOL** — name, handle(s), tier, niches[], location, audience_demographics (json), performance_score,
  availability_status, PIC/contact, tags[]; `1—∞ KOLPlatformProfile`, `1—∞ RateCard`
- **KOLPlatformProfile** — `kol_id`, platform, handle, followers, avg_er, avg_views, verified
- **RateCard** — `kol_id`, platform, format, price, currency (IDR)
- **Brief** — `campaign_id`, `client_id`, title, objective, key_messages, dos_donts, mandatories
  (hashtags/mentions/links), posting_window, budget, assets[], approval_chain, status; `∞—∞ KOL`
  (via BriefKOL join carrying per-KOL deliverables, rate, acknowledgement status)
- **Deliverable** — `brief_id`, `kol_id`, platform, format, qty, specs (json)
- **ContentItem** — `deliverable_id`, `kol_id`, `campaign_id`, caption, media[], scheduled_at,
  live_url, status (posting pipeline), assignee_id, reviewer_id, due_at; `1—∞ ContentVersion`,
  `1—∞ Comment`, `1—1 PostMetric`
- **ContentVersion** — `content_item_id`, version_no, snapshot, author, created_at
- **PostMetric** — `content_item_id`, reach, impressions, views, likes, comments, shares, saves,
  clicks, completion, spend; computed er/cpe/cpv/cpm/emv (store or compute)
- **Approval / Comment** — `content_item_id` (or `brief_id`), author, body, type
  (comment/revision/approve/reject), @mentions[], created_at
- **TimelineEvent / Milestone** — `campaign_id`, type, date, linked_entity (brief/content/report),
  dependencies[], status (upcoming/overdue/done)
- **Attachment** — polymorphic file (owner_type, owner_id), url, mime, size
- **AuditLog** — actor, action, entity, before/after, timestamp

**Key relationships:** Client `1—∞` Campaign `1—∞` Brief `∞—∞` KOL; Brief `1—∞` Deliverable `1—∞`
ContentItem `1—1` PostMetric; Campaign `1—∞` TimelineEvent.

---

## 7. Cross-Cutting Features

- **Auth + RBAC** (§1) with client-row scoping enforced server-side.
- **Multi-client tenancy** — global client switcher scopes all data.
- **Notifications** — in-app bell + (stub) email: approval requested/granted, status change, deadline
  approaching/overdue, @mention.
- **Comments & @mentions** on content items and briefs.
- **File uploads** — avatars, brand assets, media, report PDFs (with size/type validation + preview).
- **CSV import/export** everywhere it helps: KOLs, post metrics, reports.
- **Global search & filters** — consistent filter components; the top-bar filters scope all screens.
- **Audit log** — all create/update/delete + approvals + blacklist actions.
- **i18n (EN / ID)** — every label from this document's `EN / ID` pairs; language toggle persists per
  user; IDR currency + Indonesian number/date formatting (`id-ID`).
- **States everywhere** — empty, loading (skeletons), and error (retry) states on every list/chart.
- **Seed / demo data** — ship realistic seed data (≈3 clients, ≈6 campaigns, ≈30 KOLs across tiers &
  platforms, briefs/content at every pipeline stage, metrics, and a populated timeline) so the app
  looks alive on first run and every chart renders.

---

## 8. Tech Stack & Non-Functional

**Recommended (house) stack:** React + Vite + TypeScript + Tailwind CSS + Recharts; component
primitives via shadcn/ui or Radix; client state with React Query (server cache) + light local store;
forms with React Hook Form + Zod; drag-and-drop (Kanban/Gantt) with dnd-kit; dates with date-fns
(`id` locale).

**Platform-agnostic note.** The design system (§2), modules (§4), and data model (§6) are stack-
independent — any modern web stack or AI builder can implement them. Keep data access behind a thin
service layer so the backend can be swapped.

**Lovable / Supabase mapping** (if built on Lovable): Supabase **Auth** (roles via JWT claims +
RLS policies for client scoping), **Postgres** for the §6 schema, **Storage** for media/assets/PDFs,
and **Edge Functions** for report-PDF generation, CSV import parsing, and metric computation.

**Non-functional:** responsive + accessible (§2); fast tables (virtualize >100 rows); optimistic UI
on drag with rollback; secure (server-side RBAC + RLS, signed upload URLs, input validation); audit
trail; deployable as a static SPA + managed backend. Document env vars and a one-command seed.

---

## 9. Appendix — KOL Domain Reference (authoritative)

### 9.1 KOL tiers (Indonesia context)
| Tier | EN / ID | Followers |
|---|---|---|
| Nano | Nano | < 10K |
| Micro | Mikro | 10K – 100K |
| Mid | Menengah | 100K – 500K |
| Macro | Makro | 500K – 1M |
| Mega | Mega | > 1M |

### 9.2 Metric formulas
- **ER % (Engagement Rate)** = (likes + comments + shares + saves) ÷ reach × 100. *(If reach
  unavailable, fall back to ÷ followers and flag the basis.)*
- **CPE (Cost per Engagement)** = spend ÷ total engagements
- **CPV (Cost per View)** = spend ÷ video views
- **CPM (Cost per Mille)** = spend ÷ impressions × 1,000
- **EMV (Earned Media Value)** = Σ (action_count × benchmark_value_per_action) — make benchmark values
  configurable per platform/action in Settings.

### 9.3 Rate card formats (examples)
IG Feed post · IG Reel · IG Story (per frame/set) · TikTok video · YouTube integration · YouTube
dedicated · X post · FB post. Price per format per platform, currency IDR, with optional bundle/package
pricing.

### 9.4 Status enums & color mapping
- **Brief:** Draft (slate) · Sent (blue) · Acknowledged (indigo→use blue) · Revision (amber) ·
  Approved (green)
- **Posting pipeline:** Briefed (slate) · Draft submitted (blue) · Internal review (blue) · Client
  approval (amber) · Revision (amber) · Approved (green) · Scheduled (teal) · Posted (green) ·
  Verified (emerald)
- **KOL availability:** Active (green) · Negotiating (amber) · Booked (blue) · Blacklist (red)
- **Client health:** On-track (green) · At-risk (amber) · Delayed (red)

### 9.5 Bilingual label glossary (i18n seed — extend as needed)
| EN | ID |
|---|---|
| Overview | Ringkasan |
| KOL Monitoring List | Daftar Pantauan KOL |
| KOL Brief | Brief KOL |
| KOL Posting | Posting KOL |
| KOL Report | Laporan KOL |
| Clients | Klien |
| Timeline | Timeline |
| Settings | Pengaturan |
| Campaign | Kampanye |
| Deliverable | Deliverable |
| Reach | Jangkauan |
| Engagement | Interaksi |
| Approved | Disetujui |
| Request revision | Minta Revisi |
| Pending approval | Menunggu Persetujuan |
| Scheduled | Terjadwal |
| Posted | Telah Posting |
| Budget spent | Anggaran Terpakai |
| On-track / At-risk / Delayed | Sesuai Jadwal / Berisiko / Terlambat |
| Add KOL | Tambah KOL |
| Import CSV | Impor CSV |
| Export report | Ekspor Laporan |

---

## 10. Build Instructions & Acceptance Criteria

**Recommended build order:**
1. Foundation — design system (§2), layout shell (sidebar + top bar), auth + RBAC (§1), i18n toggle,
   theme toggle, seed data (§7).
2. Data model + service layer (§6).
3. **KOL Monitoring List** (§4.1) — it feeds everything else.
4. **KOL Brief** (§4.2) → on approval, auto-generate content items.
5. **KOL Posting** (§4.3) — Kanban + calendar + approvals.
6. **KOL Report** (§4.4) — metric entry + analytics + export.
7. **Client Monitoring** (§4.5) and **Timeline** (§4.6).
8. **Overview** (§5) last (it aggregates the rest).

**Definition of done (per module):** real data flows end-to-end with seed data; create/read/update/
delete works with RBAC enforced; all charts render; empty/loading/error states present; EN/ID labels
wired; responsive at desktop & tablet; keyboard-accessible; no console errors.

**Global acceptance criteria:**
- All six named modules exist as nav items and are fully functional with seed data.
- A Client-role user, when logged in, sees **only** their own client's data (RBAC + scoping verified).
- Top-bar Client/Campaign/Date filters scope Overview, Reports, and Timeline.
- A brief can be created → sent → approved → auto-create content → move through the posting pipeline →
  post metrics entered → appear in a generated report — as one connected flow.
- Language toggle switches the whole UI between EN and ID; currency shows IDR.
- Dark mode works; reduced-motion respected; AA contrast met.

---

*Prepared as an agency-grade build brief. Hand to your builder as-is, or lift any section into a
ticketing system. Questions on scope or sequencing should go to the account lead at PT. EORI
INDONESIA KREATIF.*
