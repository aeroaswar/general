---
type: project
status: active
area: AI & Automation
tags: [project, ai, knowledge-base, strategy]
---
# Business Strategy Wiki

**Status:** active · **Area:** [[AI & Automation]]

## 🎯 Outcome
A persistent, LLM-maintained knowledge base for business strategy, competitive
intelligence, and market analysis. I curate sources; the LLM integrates.

## How it works (schema)
- **raw/** immutable sources → **wiki/** generated pages (companies / markets /
  concepts / analyses / sources) → `index.md`, `log.md`, `overview.md`, `contradictions.md`.
- Strict frontmatter (`type`, `created`, `updated`, `sources`, `tags`, `status`),
  semantic slug filenames, generous relative cross-links.
- Workflows: **ingest** (batch + checkpoint), **query** (search→cite→file), **lint**
  (contradictions / staleness / orphans / gaps).

## Where
- Drive: `Business & Finance/business-wiki/` (CLAUDE.md schema + wiki/ + raw/).

## Relationship to this vault
- Same philosophy as this second brain (compounding, machine-parseable). This vault
  is *personal/cross-domain*; the Business Wiki is *competitive-intelligence focused*.

## Current content (as of 2026-04-23, 1 ingest)
Early-stage, **nickel-focused**:
- **Markets (1):** `market-nickel-mining` (Indonesia laterite, HPM profitability).
- **Concepts (4):** HPM formula · mineral monetization · progressive royalty · moisture-content impact.
- **Sources (1):** nickel-profitability-parameter calculator. **Companies / Analyses:** 0 (next-step gaps).
- Ties directly into [[MMI — Mangkuluhur Mineral Indonesia]] / [[mmi pack (full)]].

## 📦 Log
- 2026-06-19 — project note created from business-wiki schema.
- 2026-06-20 — captured current wiki state (nickel market + 4 concepts).
