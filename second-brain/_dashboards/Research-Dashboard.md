---
type: dashboard
tags: [dashboard]
---
# 🔬 Research Dashboard

## 📖 Reading queue
```dataview
TABLE author, source AS "Source", status
FROM #literature
WHERE status = "to-read" OR status = "reading"
SORT status DESC, file.cday DESC
```

## ✅ Recently digested
```dataview
TABLE author, file.mtime AS "Updated"
FROM #literature
WHERE status = "done"
SORT file.mtime DESC
LIMIT 10
```

## 🗃️ Sources by medium
```dataview
TABLE medium, author, year
FROM #source
SORT medium ASC, year DESC
```

## 🌱 Ideas spawned from research
```dataview
LIST
FROM "04-Knowledge"
WHERE type = "permanent" AND source != null
SORT file.cday DESC
LIMIT 15
```
