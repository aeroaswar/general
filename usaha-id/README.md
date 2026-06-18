# usaha-id

Multi-entity Indonesian business operations for **Cowork** / **Claude Code**. A
localized rebuild of Anthropic's *Small Business* plugin — same architecture
(plain-English router → chained workflows → approval gates), rebuilt on Indonesian
regulatory rails and wired to a five-entity operator's actual stack.

> **Not financial, tax, legal, or mining advice.** Every workflow *prepares* — you
> (and where relevant your konsultan pajak, accountant, notaris, or competent
> person) review and file. Nothing here pays, files, or reports to a government
> system on its own.

## What's different from the US Small Business plugin

| US plugin | usaha-id |
|---|---|
| One business | **Five entities** — router resolves which one first |
| QuickBooks / PayPal / HubSpot | **Supabase / Shopify / Gmail / Drive / Canva / Notion** + CSV for Accurate/Jurnal |
| US payroll | **BPJS (Kes + TK) + PPh 21 TER** (PP 58/2023, PMK 168/2023) |
| GAAP month-end | **PSAK close + PPN/PPh cross-check + Coretax-ready** |
| US tax | **SPT Masa/Tahunan, PPh Badan 22%, Coretax XML** |
| — | **Mining royalty/PNBP (PP 19/2025) + HPM (Kepmen 144/2026)** — unique to ANI/MMI |

## The pack

**Front door**
- `usaha-router` — infers entity (ANI/MMI/IJBA/Glu/portfolio), routes to a workflow
- `usaha-onboard` — entity profiles, connector map, defaults

**Money & tax**
- `gaji-bpjs` — payroll: BPJS + PPh 21 TER, gross→net, cash cover, THR
- `tutup-bulan` — month-end close: reconcile, PPN/PPh cross-check, P&L narrative, close packet
- `pajak-prep` — SPT Masa/Tahunan prep, bukti potong, Coretax-ready files

**Mining (ANI/MMI)**
- `rkab-pnbp` — HPM-benchmarked value, progressive royalty, RKAB realization

**Intelligence**
- `brief-senin` — one-screen cross-entity Monday brief

**Backbone**
- `reference/regulasi-id-2026.md` — BPJS rates, PPh 21 TER, PPN, PPh Badan, mining
  royalty (PP 19/2025), HPM (144/2026), compliance calendar — with confidence flags.

## Install (Claude Code)

```bash
# from a local marketplace or your fork
claude plugin install usaha-id
```

Then say **"set me up"** → runs `usaha-onboard`. After that, just talk: *"gimana
bulan ini buat MMI"*, *"is it payroll time"*, *"berapa royalti shipment ini"*,
*"brief gue"* — the router picks the workflow.

## Connector reality

Live & useful: Gmail, Calendar, Drive, Supabase (mmi-ops), Canva, Notion, Shopify
(Glu), Zapier. **No public MCP** for Coretax, Accurate, Mekari Jurnal/Talenta, BPJS,
or MODI/e-PNBP — those flows take a CSV/XLSX export in and hand back a prepared file
you upload yourself.

## Defers to existing skills (no duplication)

Contracts → `indonesian-contract` / `contract-reviewer` · legal research →
`indonesian-law` · Glu brand/campaign → `glu` + marketing skills · equities →
`portfolio` · HPM deep math → `mmi` · strategic forks → `decide`.

## Caveats

- Rates in `regulasi-id-2026.md` are flagged ✅/🟡/🔴 by confidence. **PPN 12%-vs-11%
  mechanism, JP ceiling, and mining royalty are in active flux — verify before use.**
- This pack follows the structural conventions of `writing-skills` but has **not**
  been through the full RED-GREEN-REFACTOR subagent test loop. Pressure-test the
  router's entity resolution before trusting it on high-consequence (filing/payment) calls.

---
`v0.1.0` · built for Aero Aswar
