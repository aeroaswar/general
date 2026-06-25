\---  
name: tutup-bulan  
description: \>  
 Use for month-end / period close on any operating entity — "tutup buku",  
 "close the books", "rekonsiliasi", "month-end MMI", "siapin laporan bulan ini",  
 "P\&L bulan lalu". Reconciles the ledger against settlements/Shopify/shipments,  
 flags gaps, runs the PPN/PPh cross-check, narrates the P\&L, and exports a close  
 packet. Prepares for the accountant; does not file.  
allowed-tools: Read, Bash  
\---  
  
Run month-end close for the resolved entity. Reconcile → flag → tax cross-check →  
P\&L narrative → close packet. PSAK basis. Read \`reference/regulasi-id-2026.md\` §3.  
  
Parse arguments:  
\- \`--entity\` (else infer)  
\- \`--month\` (default previous calendar month, \`YYYY-MM\`)  
\- \`--save-to\` (\`drive\` default / \`local\` / \`both\`)  
  
\#\# Step 1 — Reconcile (entity-specific source)  
  
Pull the ledger (Accurate/Jurnal CSV export) for the month, then match against the  
entity's revenue source:  
  
| Entity | Reconcile ledger against |  
|---|---|  
| \*\*MMI\*\* | shipment sales (HPM-benchmarked) vs buyer settlements + demurrage adjustments |  
| \*\*ANI\*\* | production/sales realisation vs RKAB, PNBP paid |  
| \*\*Glu\*\* | Shopify payouts + marketplace settlements vs bank |  
| \*\*IJBA\*\* | sponsorship receipts + ticketing vs project budget lines |  
  
Match by amount + date (±2 days). Surface three gap types:  
\- \*\*Unmatched settlement\*\* — cash in, not in ledger  
\- \*\*Unmatched ledger deposit\*\* — booked income, no settlement trail  
\- \*\*Variance\*\* — matched but amount differs (fees, FX, demurrage, refunds)  
  
\#\# Step 2 — Flag suspicious entries  
  
Uncategorised lines, duplicate vendors (same amount/vendor/≤3 days — but group by  
transaction ID first; splits aren't duplicates), missing tax invoices (Faktur Pajak)  
on PPN-relevant lines. Recommend an action each. \*\*Wait for Aero to triage. Never  
auto-categorise or auto-delete.\*\*  
  
\#\# Step 3 — Tax cross-check (regulasi §3) — the Indonesia-specific layer  
  
\- \*\*PPN:\*\* does output PPN on sales reconcile with e-Faktur issued? Input PPN claimable matches Faktur Pajak Masukan? Flag the \*\*12% vs effective-11% (DPP nilai lain)\*\* treatment per line — \*\*verify the current mechanism.\*\*  
\- \*\*PPh 23:\*\* withheld on service/rent payments where required?  
\- \*\*PPh 25:\*\* monthly instalment booked?  
\- \*\*MMI/ANI extra:\*\* is \*\*royalti/PNBP\*\* for the period accrued (link \`rkab-pnbp\`)? Is sale value benchmarked to \*\*HPM\*\*, not just invoice?  
  
Output a tax-position mini-table: PPN payable/refundable, PPh 23 to remit, PPh 25 instalment — \*\*for filing prep, not filing.\*\*  
  
\#\# Step 4 — P\&L narrative (PSAK)  
  
Plain-language: revenue vs prior month + driver, margin + cost commentary, three  
notable items. Numbers from the ledger; the \*why\* from cross-referencing top  
transactions. For MMI, tie margin to HPM/FOB realisation and trader margin.  
  
\#\# Step 5 — Close packet  
  
Two files:  
1\. \`{ENTITY}-CLOSE-{YYYYMM}-R0.xlsx\` — tabs: \`Rekonsiliasi\`, \`Flagged\`, \`P\&L\`, \`Posisi Pajak\`, \`Trial Balance\`  
2\. \`{ENTITY}-CLOSE-{YYYYMM}-R0.pdf\` — one-page: P\&L narrative + headline numbers + tax position + open-gap count  
  
Save to \`--save-to\`.  
  
\#\# Approval gates  
  
\- \*\*Never auto-fix flagged items\*\* — show, recommend, wait.  
\- \*\*Never delete duplicates without explicit confirm\*\* (show both rows).  
\- \*\*Never file PPN/PPh.\*\* Tax position is prep for Aero's konsultan/Coretax upload.  
\- Saving the packet to Aero's own Drive is auto.  
  
\#\# Connector failures  
  
No ledger export → stop, request CSV (ledger is the source of truth). Missing a  
settlement source (Shopify/Supabase) → reconcile against what's present and \*\*state  
what was skipped\*\*. Never silently produce a partial close as if complete.  
  
\#\# Output  
  
One-paragraph recap: revenue, margin, tax position headline, unresolved gap count,  
file paths. List any unresolved gaps so Aero can revisit before the accountant sees it.  