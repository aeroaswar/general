\---  
name: brief-senin  
description: \>  
 Use for a start-of-week or daily cross-entity snapshot — "brief", "brief senin",  
 "what's on my plate", "ringkasan hari ini", "across all entities", "Monday",  
 "where do things stand". The one workflow that is multi-entity by design: pulls a  
 one-screen picture across ANI, MMI, Glu, IJBA, and the portfolio. Degrades  
 gracefully when a source isn't connected.  
allowed-tools: Read, Bash  
\---  
  
Produce a one-screen Monday brief spanning all active entities. Pull from every  
connected source; note (don't fail on) missing ones. Read in under two minutes.  
  
Parse arguments:  
\- \`--save-to\` (\`drive\` default / \`local\` / \`both\`)  
\- \`--post\` (\`none\` default — could stage to Notion/Gmail draft, never auto-send)  
  
\#\# Pull, scoped to what's connected  
  
1\. \*\*Cash by entity\*\* — ledger export / stated balances. Headline cash + 7-day net per operating entity.  
2\. \*\*MMI\*\* — open shipments, stockpile from \*\*Supabase mmi-ops\*\* (\`current\_stockpile\` view), any HPM/price moves, demurrage clock.  
3\. \*\*Glu\*\* — \*\*Shopify\*\* last-7d sales vs prior 7d, % change, top SKU, restock flags.  
4\. \*\*IJBA\*\* — IJWS 2026 (19–23 Aug, Ancol) milestone countdown, open sponsorship outreach, permit/vendor deadlines.  
5\. \*\*Portfolio\*\* — IDX snapshot: notable moves in held names, anything near a TP/stop (read-only; defer deep calls to \`portfolio\`).  
6\. \*\*Calendar/inbox\*\* — week's external meetings + deliverable deadlines (Calendar), flagged "needs reply" (Gmail).  
7\. \*\*The 3 things\*\* — three highest-leverage actions for today, ranked, each tagged with its entity.  
  
Missing source → one line in the brief (\*"Shopify belum connect — Glu sales dilewati"\*), never a hard fail.  
  
\#\# Format (one screen, HTML preferred per output defaults)  
  
\`\`\`  
\# Brief — {Senin, DD Mon YYYY}  
  
\#\# Kas (per entity)  
ANI {…} · MMI {…} · Glu {…} · IJBA {…}  
  
\#\# MMI {open shipments · stockpile WMT · demurrage}  
\#\# Glu {7d sales · {+/-}% · top SKU · restock}  
\#\# IJBA {IJWS H-{n} · sponsor pipeline · next deadline}  
\#\# Portfolio {movers · near TP/stop}  
  
\#\# Minggu ini {external meetings · deadlines}  
  
\#\# 3 hal hari ini  
1\. \[ENTITY\] …  
2\. \[ENTITY\] …  
3\. \[ENTITY\] …  
\`\`\`  
  
\#\# Guardrails  
  
\- \*\*Read-only.\*\* This brief observes; it doesn't act. No emails sent, no orders placed, no positions traded.  
\- \*\*Don't deep-dive.\*\* It's a scan. If something needs work, name the workflow to run next (\`tutup-bulan\`, \`rkab-pnbp\`, etc.) — don't do it here.  
\- \*\*Portfolio = informational.\*\* No buy/sell advice in the brief; route to \`portfolio\` for that.  
  
\#\# Output  
  
The one-screen brief (HTML), saved as \`BRIEF-{YYYYMMDD}-R0.html\`. End by naming the  
single most urgent follow-up workflow, e.g. \*"Paling mendesak: \`tutup-bulan\` MMI — close-nya telat 3 hari. Jalanin?"\*  