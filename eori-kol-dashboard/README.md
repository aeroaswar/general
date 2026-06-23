# EORI KOL Dashboard — Build Prompt

A comprehensive, agency-grade build prompt for the **KOL (influencer) campaign management dashboard**
requested by **PT. EORI INDONESIA KREATIF**.

- **File:** [`KOL-DASHBOARD-BUILD-PROMPT.md`](./KOL-DASHBOARD-BUILD-PROMPT.md)
- **What it is:** a single, self-contained spec covering all six modules — KOL Monitoring List,
  KOL Brief, KOL Posting, KOL Report, Client Monitoring, and Timeline — plus roles/RBAC, design
  system, data model, metrics (ER/CPV/CPE/CPM/EMV), and acceptance criteria.
- **Language:** written in English; UI labels specified bilingually (EN / Bahasa Indonesia).

## How to use it

1. **AI app builder** (Lovable, Bolt, v0, Claude) — paste the whole prompt file in to scaffold the app.
2. **Dev team** — read it as a PRD; each `§` section maps cleanly to epics/tickets.

The prompt recommends the house stack (React + Vite + Tailwind + Recharts, frosted-glass cards,
`#FFD85F` accent) but is platform-agnostic, with a Lovable/Supabase mapping included.
