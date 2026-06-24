# Bodega skills

House-style skills distilled from the combined Bodega project (marketing site +
client portal). Each is a self-contained Claude Code skill (`SKILL.md` + copy-paste
`reference/` assets pulled straight from the working codebase).

| Skill | Surface | Use it for |
|---|---|---|
| **bodega-brand** | Public marketing | Editorial "paper → ink" brand system — Fraunces/Instrument Sans/JetBrains Mono, one brand colour per page (yellow-led spectrum), liquid blobs, film grain, glass sheets, the bodega® wordmark. Landing pages, decks, microsites. |
| **bodega-portal** | Internal app | "Studio OS" — warm glass client-portal UI + architecture: the content workflow state machine, role-gated nav, UI primitive kit, localStorage demo store. React + Vite + Tailwind + framer-motion + wouter + recharts. |
| **bodega-documents** | Printable PDFs | Print-perfect bilingual (EN/ID) contracts & invoices on the Bodega letterhead — repeating-letterhead technique, theme-proof print CSS, phone↔desktop parity, e-signature pad, e-Meterai, Indonesian legal format, agency-fee + VAT math. |

The three compose: `bodega-portal` hosts `bodega-documents`; both share the `bodega-brand`
wordmark. Pair with the global house skills `precision-bento` and `framer-motion`.

## Using them

These live in the repo at `.claude/skills/`, so they're available to any Claude Code
session run from this project automatically. To make them available everywhere, copy the
folders into `~/.claude/skills/`.
