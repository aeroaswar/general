\---  
name: pajak-prep  
description: \>  
 Use for tax preparation and organization — "siapin pajak", "SPT Masa", "SPT  
 Tahunan Badan", "PPN bulan ini", "bukti potong", "buat akuntan", "Coretax".  
 Collects and categorizes the period's tax data, computes the position, and  
 prepares Coretax-ready files for Aero (or his konsultan) to file. Never files.  
allowed-tools: Read, Bash  
\---  
  
Prepare — never file — the resolved entity's tax obligations for a period. Read  
\`reference/regulasi-id-2026.md\` §2–§3. \*\*Coretax has no MCP; output is  
upload-ready files Aero submits himself.\*\*  
  
Parse arguments:  
\- \`--entity\` (else infer)  
\- \`--type\` — \`masa-pph21\` | \`masa-ppn\` | \`masa-pph23\` | \`pph25\` | \`tahunan-badan\`  
\- \`--period\` (\`YYYY-MM\` for masa, \`YYYY\` for tahunan)  
  
\#\# Route by type  
  
\#\#\# \`masa-pph21\`  
Pull from \`gaji-bpjs\` output. Assemble bukti potong (1721-A1 swasta), produce the  
\*\*Coretax BPMP / BPA1 XML\*\* structure (or the data table to generate it). State the  
setor + lapor deadline (regulasi §6). Output: per-employee bupot + summary + XML-ready data.  
  
\#\#\# \`masa-ppn\`  
From \`tutup-bulan\` tax position: output PPN (Faktur Keluaran) vs input PPN (Faktur  
Masukan), net \*\*kurang/lebih bayar\*\*. \*\*Flag the 12% vs effective-11% DPP-nilai-lain  
treatment per the current PMK — verify before relying on it.\*\* Output: PPN recap +  
e-Faktur reconciliation + SPT Masa PPN data.  
  
\#\#\# \`masa-pph23\`  
List service/management/rent payments subject to 2% (with NPWP), generate bukti  
potong PPh 23 set + unifikasi data.  
  
\#\#\# \`pph25\`  
Compute the monthly instalment from last SPT Tahunan / current run-rate. Output the figure + deadline. Flag if run-rate suggests instalment is materially under/over.  
  
\#\#\# \`tahunan-badan\`  
The big one. Assemble: full-year P\&L (from 12× \`tutup-bulan\` packets), fiscal  
reconciliation (koreksi fiskal — non-deductibles, natura per PMK 66/2023), PPh  
Badan @ \*\*22%\*\*, credit PPh 25 paid + PPh 22/23 withheld → PPh 29 kurang bayar or  
lebih bayar. \*\*MMI/ANI:\*\* ensure royalti/PNBP and HPM-benchmarked revenue are  
reflected. Output a SPT Tahunan working paper + lampiran checklist. Deadline \*\*30 Apr\*\*.  
  
\#\# Approval gates  
  
\- \*\*Never file. Never pay.\*\* Every output is a prepared file or working paper for  
 Aero / his konsultan pajak to review and submit via Coretax.  
\- \*\*Flag, don't decide, on judgment calls\*\* (koreksi fiskal, natura classification,  
 PPN mechanism). State the rule, show the options, recommend, let Aero/konsultan choose.  
\- Note clearly: \*"Bukan nasihat pajak — review konsultan sebelum lapor."\*  
  
\#\# Output  
  
\`{ENTITY}-PAJAK-{TYPE}-{PERIOD}-R0\` as XLSX + PDF, plus any Coretax XML data block.  
Recap: position (kurang/lebih bayar Rp X), deadline, and the exact list of what Aero  
must upload to Coretax and what needs konsultan sign-off first.  