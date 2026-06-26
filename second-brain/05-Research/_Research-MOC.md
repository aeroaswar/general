---
type: moc
tags: [moc]
---
# 🗺️ Research MOC

_Pipeline: **Source** → **Literature note** (read & summarize) → **Permanent note** (atomic idea in 04-Knowledge)._

→ Live queues live in [[_dashboards/Research-Dashboard|Research Dashboard]].

## All literature notes
```dataview
TABLE status, author
FROM #literature
SORT status DESC, file.name ASC
```

## All sources
```dataview
TABLE medium, author, year
FROM #source
SORT file.cday DESC
```
