\---  
name: ani  
description: Load full context for PT Adhita Nikel Indonesia (PT ANI), Aero's nickel laterite mining entity. Use whenever the conversation involves PT ANI, nickel mining operations, grade control, RKAB, IUP, ore stockpile, transshipment, jetty operations, mining contractors, KKP/KPP, ESDM regulations, Kepmen 144/2026, HPM nickel formula, low-grade limonite or saprolite economics, or anything about the upstream nickel side of Aero's business.  
\---  
  
\# PT Adhita Nikel Indonesia (PT ANI)  
  
\#\# Entity snapshot  
  
\- \*\*Business\*\*: Nickel laterite mining (IUP holder)  
\- \*\*Position in value chain\*\*: Upstream — ore extraction and sale to smelters/traders  
\- \*\*Sister entity\*\*: PT MMI (handles trading/offtake)  
\- \*\*Tech stack\*\*: mmi-ops platform (Next.js + Supabase) for stockpile visibility, grade control, RKAB tracking  
  
\#\# Operating context  
  
\- \*\*Regulatory frame\*\*: UU Minerba, PP 96/2021, ESDM Permen series, Kepmen ESDM No. 144/2026 (HPM formula update)  
\- \*\*Reporting cadence\*\*: RKAB annual submission + revisions, monthly production reports to ESDM  
\- \*\*Permitting\*\*: IUP Operasi Produksi (verify status before discussing mine plan changes)  
\- \*\*IUP Prioritas\*\*: Aero has researched Permen UMKM No. 4/2025 / PP 39/2025 requirements  
\- \*\*Grade control SOP\*\*: ANI-GC-2026-001 (already documented — reference, don't recreate)  
\- \*\*Operational dashboard\*\*: Built (5-tab interactive HTML, Chart.js) — reference baseline  
  
\#\# Default working assumptions  
  
\- All numbers in IDR unless otherwise stated; tonnage in WMT (wet metric tons) or DMT (dry metric tons) — clarify if not specified  
\- Grade conventions: Ni%, Fe%, MgO%, SiO₂%, moisture% — full assay always preferred over single-spec  
\- Cutoff grade decisions depend on HPM formula, blending strategy, and current cobalt byproduct pricing  
\- Limonite vs saprolite — Aero has worked through low-grade limonite economics under cobalt byproduct premium (Kepmen 144/2026)  
\- Transshipment via barge to mother vessel at anchorage — coastal logistics matter  
  
\#\# Tone & output  
  
\- Peer-level technical Indonesian mining language  
\- Cite specific pasal when referencing UU/PP/Permen  
\- Tables for tonnage/grade/blend math  
\- Skip generic intros to "what is nickel mining"  
\- For ops decisions: state assumption, show math, give verdict  
  
\#\# What to NOT do  
  
\- Don't recommend equipment brands or contractors — Aero has those decisions  
\- Don't restate the grade control SOP unless asked to update it  
\- Don't speculate on commodity prices beyond what the HPM formula and current LME/Argus references support  
\- Don't conflate ANI (mining) with MMI (trading) — keep value-chain position straight  
  
\#\# Common request types  
  
\- HPM calculation under current Kepmen 144/2026 formula → run the math, output table  
\- RKAB compliance check → reference current regulatory frame  
\- Blend ratio optimization → start with limonite/saprolite split, layer in cobalt economics  
\- Stockpile movement / inventory questions → tie to mmi-ops schema  
\- New regulation impact analysis → cite pasal, give before/after table  