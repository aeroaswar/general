---
type: area
status: active
tags: [area]
---
# <% tp.file.title %>

_An ongoing responsibility with no end date (e.g. Health, Finances, Brand)._

## Standards
_What "good" looks like for this area._
- 

## Projects in this area
```dataview
TABLE status, due
FROM #project
WHERE area = this.file.name
SORT status ASC
```

## Knowledge
```dataview
LIST
FROM "04-Knowledge"
WHERE contains(area, this.file.name)
```

## Notes
- 
