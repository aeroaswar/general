---
type: moc
tags: [moc]
---
# 🗺️ Knowledge MOC

_Your evergreen, atomic notes. Link liberally — the value is in the connections._

## By topic
```dataview
TABLE rows.file.link AS Notes
FROM #permanent OR "04-Knowledge"
WHERE type = "permanent"
FLATTEN (length(tags) = 0 ? "untagged" : tags) AS topic
GROUP BY topic
SORT topic ASC
```

## Most connected (your hubs)
```dataview
TABLE length(file.inlinks) AS "Backlinks"
FROM "04-Knowledge"
WHERE type = "permanent"
SORT length(file.inlinks) DESC
LIMIT 10
```

## Needs connecting (orphans)
```dataview
LIST
FROM "04-Knowledge"
WHERE type = "permanent" AND length(file.inlinks) = 0 AND length(file.outlinks) = 0
```
