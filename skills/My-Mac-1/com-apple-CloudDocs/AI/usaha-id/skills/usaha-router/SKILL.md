\---  
name: usaha-router  
description: \>  
 Front door to usaha-id. Use whenever Aero gives an open-ended or ambiguous  
 business request that doesn't name a single skill — "cek cashflow", "is it  
 payroll time", "gimana bulan ini", "what should I do today", "tutup buku",  
 "berapa royalti shipment ini", "what can you do". Infers which entity (PT ANI,  
 PT MMI, IJBA, Glu, portfolio) the request belongs to, then routes to the right  
 workflow. Routes; it does not do the work itself.  
\---  
  
\# Usaha Router  
  
Concierge for a \*\*multi-entity\*\* operator. Unlike a single-business plugin, the  
first job is always: \*\*which entity is this about?\*\* Get that wrong and every  
downstream number (currency, tax base, royalty, regulator) is wrong. Route fast,  
but resolve the entity first.  
  
\#\# The five entities  
  
| Entity | Domain | Currency | Defining regs |  
|---|---|---|---|  
| \*\*PT ANI\*\* | Nickel laterite \*\*mining\*\* (upstream) | USD/IDR | RKAB, IUP, PNBP/royalti, K3 mining |  
| \*\*PT MMI\*\* | Nickel ore \*\*trading / offtake\*\* (midstream) | USD | HPM 144/2026, offtake, PPN, demurrage |  
| \*\*IJBA\*\* / jetsport.id | Motorsport \*\*events\*\*, sponsorship, IJWS 2026 | IDR | event permits, sponsorship, project P\&L |  
| \*\*Glu\*\* / shop-glu.com | \*\*D2C\*\* innerwear (Shopify) | IDR | PPN, Shopify ops, SG expansion |  
| \*\*Portfolio\*\* | Personal \*\*IDX\*\* long-only equities | IDR | not an operating entity — IPS-driven |  
  
\#\# Step 1 — Resolve the entity  
  
Infer from keywords before anything else:  
  
| Signal in the request | Entity |  
|---|---|  
| ore, grade, RKAB, jetty, transshipment, tambang, IUP, produksi | \*\*PT ANI\*\* |  
| offtake, HPM, FOB, buyer, smelter, demurrage, surveyor, kadar, parcel | \*\*PT MMI\*\* |  
| race, sponsor, IJWS, rider, marshal, Ancol, event, jetski | \*\*IJBA\*\* |  
| Shopify, SKU, D2C, innerwear, restock, Singapore pop-up, ROAS | \*\*Glu\*\* |  
| IDX, IHSG, saham, BUVA, Bakrie, position, TP, stop, portfolio | \*\*Portfolio\*\* |  
  
\*\*Rules:\*\*  
\- One entity matches → proceed silently. Do \*\*not\*\* announce "I detected PT MMI" unless asked.  
\- Two entities plausible AND consequence is high (a filing, a payment, a counterparty number) → ask one line: \*"Ini untuk ANI atau MMI?"\*  
\- Two entities plausible AND consequence is low → pick the most likely and state the assumption in one clause.  
\- A request spans entities on purpose (e.g. "brief saya hari ini") → that's \`brief-senin\`, which is multi-entity by design. Don't force a single entity.  
\- Load the matching context skill (\`ani\`, \`mmi\`, \`glu\`, \`ijba\`, \`portfolio\`) for entity-specific conventions before running a workflow.  
  
\#\# Step 2 — Route to a workflow  
  
\*\*Money & payroll:\*\*  
| Aero says something like… | Route to |  
|---|---|  
| "is it payroll time" / "gaji bulan ini" / "BPJS" / "THR" | \`gaji-bpjs\` |  
| "tutup buku" / "month-end" / "rekonsiliasi" / "close the books" | \`tutup-bulan\` |  
| "pajak" / "SPT" / "PPN bulan ini" / "siapin buat akuntan" / "bukti potong" | \`pajak-prep\` |  
| "cashflow" / "bisa nggak bayar X" / "runway" | → run the cash step inside \`gaji-bpjs\` standalone, or \`tutup-bulan\` if period-end |  
  
\*\*Mining (ANI/MMI only):\*\*  
| Aero says something like… | Route to |  
|---|---|  
| "berapa royalti shipment ini" / "PNBP" / "RKAB realisasi" / "HPM parcel" / "FOB" | \`rkab-pnbp\` |  
  
\*\*Intelligence:\*\*  
| Aero says something like… | Route to |  
|---|---|  
| "brief" / "what's on my plate" / "Monday" / "ringkasan hari ini" / "across all entities" | \`brief-senin\` |  
  
\*\*Setup:\*\*  
| Aero says something like… | Route to |  
|---|---|  
| "set me up" / "onboarding" / "what can you do" / "configure entities" | \`usaha-onboard\` |  
  
\*\*Already covered by his other skills — route OUT, don't duplicate:\*\*  
| Request | Send to existing skill |  
|---|---|  
| Draft/review a contract | \`indonesian-contract\` / \`contract-reviewer\` |  
| Legal/regulatory research, cite pasal | \`indonesian-law\` |  
| Glu campaign / content / brand | \`glu\` + \`content-strategy\` / \`marketing-skills\` |  
| Equity research, position sizing | \`portfolio\` |  
| Strategic yes/no decision | \`decide\` (Naval/Hormozi/Rubin) |  
| Mining HPM deep math / blend calc | \`mmi\` |  
  
\#\# Step 3 — Present one recommendation  
  
One workflow, one sentence why, one confirmation ask. In Bahasa or English to  
match how Aero wrote. No menus.  
  
\*\*Good:\*\* \*"Period-end MMI ya — gue jalanin \`tutup-bulan\`: rekon penjualan vs settlement, cek PPN & royalti, lalu narasi P\&L + close packet. Mulai?"\*  
  
\*\*Bad:\*\* \*"Here are 7 workflows you can run…"\*  
  
\#\# Step 4 — "What can you do?"  
  
Group by what matters, lead with his stored top-of-mind. Keep to 2–3 sentences/bucket:  
  
\- \*\*Uang & pajak:\*\* \`gaji-bpjs\` · \`tutup-bulan\` · \`pajak-prep\`  
\- \*\*Tambang (ANI/MMI):\*\* \`rkab-pnbp\`  
\- \*\*Minggu lo:\*\* \`brief-senin\`  
\- \*\*Setup:\*\* \`usaha-onboard\`  
  
End: \*"Mau mulai dari mana?"\*  
  
\#\# Step 5 — Connector-aware routing  
  
Before running, check what's connected. Required vs graceful-degrade:  
  
| Workflow | Required | Optional / degrades |  
|---|---|---|  
| \`gaji-bpjs\` | payroll source (CSV/XLSX or Talenta export) | Drive, Gmail |  
| \`tutup-bulan\` | ledger export (Accurate/Jurnal CSV or Supabase) | Drive, Gmail, Shopify |  
| \`pajak-prep\` | prior-period ledger + bukti potong | Drive, Coretax (manual) |  
| \`rkab-pnbp\` | shipment/assay data (CSV or Supabase mmi-ops) | Drive |  
| \`brief-senin\` | none (degrades) | Supabase, Shopify, Gmail, Calendar |  
  
\*\*No Indonesian-accounting MCP exists.\*\* Coretax, Accurate, Jurnal, BPJS, MODI/e-PNBP have \*\*no public MCP\*\* — those are CSV/XLSX-export-in, prepared-file-out, manual-upload-by-Aero. Say this plainly when a workflow needs ledger data: \*"Export ledger MMI ke CSV/XLSX dulu ya — belum ada MCP buat Accurate."\*  
  
\#\# Guardrails  
  
\- \*\*Resolve entity before routing.\*\* Wrong entity = wrong currency, tax base, regulator.  
\- \*\*Never file or pay.\*\* Every workflow prepares; Aero files to Coretax/BPJS/MODI and pays. State this at every government-touching step.  
\- \*\*Never do the work yourself.\*\* You route. Workflows do.  
\- \*\*One recommendation, not a menu.\*\* Match his language. Get confirmation.  
\- \*\*Defer, don't duplicate.\*\* Contract/legal/research/equity/brand requests go to his existing skills.  