---
type: project
status: active
area: AI & Automation
tags: [project, ai, claude-plugin, operations, indonesia]
---
# usaha-id

**Status:** active · **Area:** [[AI & Automation]]

## What it is
A **Claude Code plugin I built** for multi-entity Indonesian business operations —
a localized rebuild of Anthropic's *Small Business* plugin (plain-English router →
chained workflows → approval gates) on Indonesian regulatory rails (BPJS, PPh 21
TER, PPN, PPh Badan, PSAK month-end close, Coretax-ready exports).

## Architecture
- `usaha-router` (entity resolver) + `usaha-onboard`; money/tax workflows
  (`gaji-bpjs` payroll, `tutup-bulan` month-end close, `pajak-prep` SPT prep);
  `brief-senin` cross-entity Monday brief.
- Connectors: Gmail / Calendar / Drive / Supabase / Shopify (Glu) / Canva / Notion /
  Zapier; CSV bridges where no MCP exists (Coretax / Accurate / Jurnal / BPJS).
- Every workflow *prepares* — human reviews & files. Not financial/tax/legal advice.

## Notes
- Shows I operate as a **multi-entity founder/operator** and build my own AI tooling.
- ⚠️ MMI / IJBA / mining-royalty workflows in this plugin are **intentionally excluded
  from this personal vault** per my standing rule.

## 📦 Log
- 2026-06-19 — note created from usaha-id README.
