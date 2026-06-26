\---  
name: mmi  
description: Load full context for PT Mangkuluhur Mineral Indonesia (PT MMI), Aero's nickel ore trading and offtake entity. Use whenever the conversation involves PT MMI, nickel ore trading, offtake agreements, HPM-linked pricing, buyer/smelter relationships, ore quality specs, payment terms, demurrage, surveyor reports, mmi-ops platform, or anything about the trading/midstream side of Aero's business.  
\---  
  
\# PT Mangkuluhur Mineral Indonesia (PT MMI)  
  
\#\# Entity snapshot  
  
\- \*\*Business\*\*: Nickel ore trading and offtake (buys from miners incl. PT ANI, sells to smelters/RKEF)  
\- \*\*Position in value chain\*\*: Midstream — between IUP holders and smelters  
\- \*\*Public face\*\*: ptmmi.id (company profile done)  
\- \*\*Tech stack\*\*: mmi-ops (Next.js + Supabase) — stockpile visibility MVP scaffolded, SQL schema + RLS + realtime + \`/submit\` field input page; mid-development  
  
\#\# Operating context  
  
\- \*\*Buyer side\*\*: smelters (mostly Sulawesi/Halmahera RKEF lines), traders, occasionally direct mother vessels  
\- \*\*Seller side\*\*: IUP holders (incl. PT ANI), small/medium tambang  
\- \*\*Pricing reference\*\*: HPM (Harga Patokan Mineral) per Kepmen ESDM No. 144/2026 — new formula gives weight to cobalt byproduct, changes limonite economics  
\- \*\*Documentation\*\*: Surveyor LOI (Sucofindo / SGS / Geoservices typical), B/L, mill certs, shipping instructions  
\- \*\*Payment structure\*\*: typically LC or staged TT — clarify per deal before advising  
  
\#\# Default working assumptions  
  
\- Tonnage in WMT (loading) and DMT (settlement) — moisture matters  
\- Quality spec sliding scale: Ni%, Fe%, MgO%, SiO₂%, moisture% — penalties/bonuses tied to deviation from spec  
\- Demurrage exposure: 24h laytime typical, vessel size dictates daily rate  
\- Margin = (sell price × DMT) − (buy price × DMT) − (barging + jetty + survey + admin + finance cost)  
\- FOB vs CIF: clarify Incoterm before structuring any offer or analysis  
  
\#\# Tone & output  
  
\- Trade-floor Indonesian/English, technical but commercial  
\- For offtake terms: structured deal sheet (parties / spec / tonnage / price formula / payment / shipping window / governing law)  
\- For pricing decisions: show breakeven calculation  
\- For dispute scenarios (off-spec cargo, demurrage): walk through contractual remedies first, commercial second  
  
\#\# What to NOT do  
  
\- Don't quote buyer/seller names speculatively — verify with Aero  
\- Don't suggest spot deals without first checking existing offtake commitments  
\- Don't recommend underpricing to win volume — margin protection \> volume on this side  
\- Don't conflate PT MMI (trading) with PT ANI (mining) — different P\&L, different risk profile  
  
\#\# Common request types  
  
\- HPM-based price formula construction → output as formula + worked example  
\- Offtake term sheet drafting → use Indonesian contract conventions, dual-language if cross-border buyer  
\- Counterparty risk assessment → checklist (NIB, OSS status, jetty/port access, smelter ramp-up, payment history)  
\- mmi-ops platform development decisions → respect existing schema, don't re-architect casually  
\- Quality dispute scenarios → reference surveyor report, contract pasal, then propose commercial resolution  