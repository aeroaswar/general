---
type: moc
tags: [moc]
---
# 🗺️ Projects MOC

```dataview
TABLE status, area, start, due
FROM #project
SORT status ASC, due ASC
```

## On hold / someday
```dataview
LIST
FROM #project
WHERE status = "on-hold" OR status = "someday"
```
