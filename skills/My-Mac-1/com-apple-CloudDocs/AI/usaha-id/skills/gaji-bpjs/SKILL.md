\---  
name: gaji-bpjs  
description: \>  
 Use for any payroll run or payroll-readiness question — "gaji bulan ini",  
 "is it payroll time", "hitung BPJS", "PPh 21 karyawan", "THR", "bisa nggak  
 bayar gaji bulan ini". Computes gross-to-net with BPJS + PPh 21 TER, checks cash  
 cover, and stages payment instructions for approval. Indonesian payroll only.  
allowed-tools: Read, Bash  
\---  
  
Run the payroll-confidence pipeline for the resolved entity. Two stages: \*\*(1)  
compute the run\*\* (BPJS + PPh 21 TER, gross→net), \*\*(2) confirm cash covers it\*\*.  
Aero approves before any payment instruction is finalised. Nothing is paid or filed  
by this skill.  
  
Read \`reference/regulasi-id-2026.md\` §1–§2 for current rates. \*\*Re-verify rates\*\* —  
they change.  
  
Parse arguments:  
\- \`--entity\` (else infer via router)  
\- \`--month\` (default current)  
\- \`--with-thr\` (include THR — annualise correctly, see Step 4)  
  
\#\# Step 1 — Ingest the roster  
  
Pull employee data from CSV/XLSX export (Talenta/Jurnal/manual) or Supabase if wired.  
Per worker need: gaji pokok, tunjangan tetap/tidak tetap, PTKP status (TK/0…K/3),  
location (site vs office → JKK class), lembur, bonus.  
  
If no source: ask for a CSV with those columns. Don't guess salaries.  
  
\#\# Step 2 — BPJS per worker (regulasi §1)  
  
\- BPJS Kesehatan 5% (4% employer / 1% employee), \*\*upah dibatasi Rp12jt → max Rp600k\*\*  
\- JHT 5.7% (3.7 / 2.0)  
\- JP 3% (2.0 / 1.0) on JP ceiling — \*\*verify 2026 ceiling\*\*  
\- JKK by risk class — \*\*mining site crew = highest class (≈1.74%), office ≈0.24%.\*\* Split by location.  
\- JKM 0.3%  
  
\#\# Step 3 — PPh 21 TER (regulasi §2)  
  
\- Bruto = gaji + tunjangan + lembur + bonus/THR + \*\*employer-paid JKK+JKM+Kesehatan premiums\*\*  
\- Monthly (Jan–Nov): \`PPh21 = Bruto × TER%\`, TER% from category A/B/C by PTKP status  
\- \*\*Do not hardcode TER %\*\* — pull from PP 58/2023 lampiran or a Coretax calculator. Show the bracket used.  
\- December: annualise on Pasal 17 (5/15/25/30/35%), credit Jan–Nov, surface lebih/kurang bayar.  
  
Produce a gross→net table per worker + employer-cost total (gaji + employer BPJS).  
  
\#\# Step 4 — THR (if \`--with-thr\`, regulasi §6)  
  
THR is bruto and PPh21-taxable in the month paid → it spikes that month's TER. Statutory:  
≥1 month's wage for ≥12-month tenure, pro-rata below; pay \*\*≥ H-7 Idul Fitri\*\*. Flag the cash spike separately from base payroll.  
  
\#\# Step 5 — Cash cover check  
  
Pull the entity's cash position (ledger export / Supabase / Aero states it). Compare  
\*\*total disbursement\*\* (net pay + employer BPJS + PPh21 to remit) against available cash  
on the pay date. Output verdict: \*\*covered / tight / gap of Rp X\*\*. If gap, offer to  
pull forward AR or flag which receivable closes it — but never auto-act.  
  
\#\# Approval gates (must hold)  
  
\- \*\*Never finalise a payment instruction without approval.\*\* Drafts/summaries only until "ok bayar".  
\- \*\*Never file SPT Masa PPh 21 or pay BPJS.\*\* Output the numbers + Coretax-ready figures; Aero remits.  
\- If roster data is incomplete, stop and list what's missing — don't fabricate a worker's salary or PTKP.  
  
\#\# Output  
  
Per-entity HTML or XLSX: gross→net table, BPJS split (employer/employee), PPh21 with bracket shown, employer total cost, cash verdict, and a "to remit" block (PPh21, BPJS) with deadlines from regulasi §6. Filename \`{ENTITY}-PAYROLL-{YYYYMM}-R0.xlsx\`. One-paragraph recap: total net, total employer cost, cash verdict, what Aero must remit and by when.  