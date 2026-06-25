\---  
name: rkab-pnbp  
description: \>  
 Use for mining royalty, PNBP, RKAB realization, and HPM sales-value questions on  
 PT ANI or PT MMI — "berapa royalti shipment ini", "PNBP parcel", "HPM bijih  
 nikel", "FOB", "RKAB realisasi", "iuran produksi", "value parcel limonit ini".  
 Computes HPM-benchmarked sale value, progressive royalty (PP 19/2025), and tracks  
 realization against approved RKAB. ANI/MMI only.  
allowed-tools: Read, Bash  
\---  
  
Compute the value-and-obligation chain for a nickel parcel/shipment, and track it  
against RKAB. Read \`reference/regulasi-id-2026.md\` §4–§5 and \*\*defer to the \`mmi\`  
skill for the authoritative HPM convention + blend calculator\*\* — load it first.  
  
Parse arguments:  
\- \`--entity\` (ANI or MMI)  
\- \`--ni --fe --co --cr\` (grades, decimal fractions) \`--mc\` (moisture %)  
\- \`--hma-ni\` (and ikutan HMAs) \`--tonnage\` (WMT) \`--margin\` (trader margin)  
  
\#\# Step 1 — HPM (Kepmen 144/2026)  
  
\`\`\`  
HPM = \[ (%Ni × CF\_Ni × HMA\_Ni)  
 + (%Fe × CF\_Fe × HMA\_Fe × 100)  
 + (%Co × CF\_Co × HMA\_Co)  
 + (%Cr × CF\_Cr × HMA\_Cr × 100) \] × (1 − MC%)  
FOB = HPM − trader margin  
\`\`\`  
\- Grades as decimals; \*\*Fe and Cr terms × 100\*\*  
\- \`CF\_Ni = 0.28 + (Ni% − 1.40) × 0.1\`; CF ikutan Fe 30% / Co 30% / Cr 10%  
\- Always run the \*\*cobalt byproduct credit\*\* — Co ≈ 3.5× Ni per unit grade; a limonite parcel with \*\*Co ≥ 0.05% and Fe ≤ 35%\*\* is likely economic even at low Ni. Don't reject before checking.  
  
Output HPM (USD/WMT) and parcel value = HPM × tonnage.  
  
\#\# Step 2 — Progressive royalty (PP 19/2025, regulasi §4)  
  
Pick the royalty rate from the \*\*HMA nikel band\*\*:  
  
| HMA nikel (USD/t) | Bijih nikel royalty |  
|---|---|  
| \<18,000 | 14% · 18–21k → 15% · 21–24k → 16% · 24–31k → 18% · \>31k → 19% |  
  
\`Royalti = royalty\_base × rate\`, where \*\*royalty\_base = max(HPM-benchmarked value, invoice value)\*\* — government won't accept a base below HPM. For processed product (FeNi/NPI) use the 3.5–7% band instead. \*\*Cobalt royalty (\~2%) is proposed, not confirmed — flag, don't auto-apply.\*\*  
  
\#\# Step 3 — Full obligation stack  
  
Don't report royalty in isolation. Surface the parcel's PNBP + tax footprint:  
\- Iuran produksi (royalty) — Step 2  
\- Iuran tetap (landrent) — periodic, allocate  
\- PPN on the sale (MMI) — regulasi §3  
\- Eventual PPh Badan @ 22% on margin  
\- (PPKH, reklamasi/pascatambang jaminan — note as carrying obligations)  
  
\#\# Step 4 — RKAB realization tracking  
  
Compare cumulative realised production/sales tonnage against \*\*approved RKAB\*\* volume  
for the period. Output: % realised, headroom remaining, and a \*\*flag if this shipment  
pushes cumulative over approved RKAB\*\* → needs RKAB revision before further sales.  
Note reporting routes through \*\*MODI / MOMS / e-PNBP\*\* (manual — no MCP).  
  
\#\# Approval gates  
  
\- \*\*Grades, HMA, and tonnage are inputs Aero/surveyor verify.\*\* Never invent assay  
 numbers. If a grade is missing, stop and ask — a wrong %Co swings value materially.  
\- \*\*Never report to MODI/e-PNBP or pay PNBP.\*\* Output the computed figures; Aero (or  
 the CP/competent person) verifies and submits.  
\- Flag every rate as "verify against live PP 19/2025 + Kepmen 144/2026" — both are  
 recent and contested (APNI/FINI pushing revisions).  
  
\#\# Output  
  
\`{ENTITY}-PNBP-{PARCEL}-{YYYYMMDD}-R0\` HTML/XLSX: HPM + FOB, parcel value, royalty  
band + amount, full obligation stack, RKAB realisation gauge. Recap: parcel value  
USD X, royalty Y% = USD Z, RKAB headroom W%, and whether any obligation needs action  
before the parcel ships.  