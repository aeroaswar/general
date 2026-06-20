---
type: dashboard
tags: [dashboard, review, weekly]
---
# 🔄 Weekly Review

> Run this every week (15 min). It's the engine that keeps the vault alive. Update [[Now]] at the end.

## 1. Clear the decks
- [ ] Process [[00-Inbox]] to zero
```dataview
LIST FROM "00-Inbox" WHERE type != "dashboard"
```
- [ ] Triage overdue tasks → [[_dashboards/Tasks-Dashboard]]

## 2. Review the week
- **Wins:** 
- **Misses / friction:** 
- **Decisions made** → log in [[Decision Log]]
- **Notes worth promoting** to permanent (`04-Knowledge`)?
```dataview
LIST FROM "" WHERE file.mtime >= date(today) - dur(7 days) AND type = "literature"
```

## 3. Look ahead (entity sweep — am I underweighting the right ones?)
- **GLU** · **MMI** · **portfolio** · **IJBA** · **ANI** — anything on fire / neglected?
- Update **Top 3 this week** in [[Now]].

## 4. Stale / orphan check (monthly)
```dataview
LIST WHERE length(file.inlinks)=0 AND length(file.outlinks)=0 AND type!="dashboard" SORT file.cday DESC LIMIT 10
```
