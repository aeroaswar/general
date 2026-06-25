\---  
name: usaha-onboard  
description: \>  
 Use when Aero first installs usaha-id, says "set me up", "onboarding",  
 "configure my entities", or when a workflow needs entity/connector context that  
 hasn't been captured yet. Builds the per-entity profile and connector map the  
 router and workflows read from.  
\---  
  
\# Usaha Onboard  
  
One-time (or refresh) setup. Capture per-entity facts so workflows stop asking the  
same questions. Write the result to session memory under \`\#\# Usaha context\` and  
offer to persist via \`memory\_user\_edits\`.  
  
\#\# What to capture  
  
For \*\*each\*\* active entity, confirm or fill:  
  
| Field | ANI | MMI | IJBA | Glu | Portfolio |  
|---|---|---|---|---|---|  
| Legal name / NPWP | PT Adhita Nikel Indonesia | PT Mangkuluhur Mineral Indonesia | IJBA | — (PT? PMA?) | personal |  
| Fiscal year-end | Dec 31? | Dec 31? | Dec 31? | Dec 31? | — |  
| Functional currency | USD/IDR | USD | IDR | IDR | IDR |  
| Headcount / has payroll? | site + office | office | event crew? | small | — |  
| Ledger source | Accurate/Jurnal/manual | Accurate/Jurnal/manual | project sheet | Shopify + Jurnal | — |  
| Tax: PKP (PPN)? | yes | yes | ? | yes if \>4.8bn | — |  
| Mining-specific | IUP no., RKAB cycle | offtake counterparties | — | — | — |  
  
\#\# Connector map  
  
Walk through what's connected and what each unlocks. Be honest about gaps:  
  
\- \*\*Connected & useful now:\*\* Gmail, Calendar, Drive, Supabase (mmi-ops), Canva, Notion, Shopify (Glu), Zapier  
\- \*\*No MCP — CSV/manual:\*\* Accurate / Mekari Jurnal / Talenta (accounting & payroll), Coretax DJP (filing), BPJS portals, MODI / MOMS / e-PNBP (ESDM)  
\- For the manual ones, the workflow takes a \*\*CSV/XLSX export\*\* and returns a \*\*prepared file\*\* Aero uploads himself.  
  
\#\# Set the defaults  
  
Confirm the standing preferences so workflows don't re-ask:  
\- Output: HTML (interactive) or PDF, never plain-text  
\- File naming: \`{ENTITY}-{DOCTYPE}-{YYYYMMDD}-{REV}.{ext}\`  
\- Language: match the message (BI/EN)  
\- Regulatory defaults: Indonesian (UU HPP, PP 19/2025, Kepmen 144/2026, PSAK)  
  
\#\# Output  
  
A one-screen entity + connector summary, then: \*"Tersimpan. Sekarang tinggal bilang  
apa yang lo butuh — gue rutekan. Coba \`brief-senin\` buat lihat semua entity sekaligus?"\*  
  
\#\# Guardrails  
  
\- Don't ask for NPWP/bank/sensitive IDs you don't need — capture only what workflows use.  
\- Don't invent entity facts. If unknown, mark \`TBD\` and ask when first relevant.  