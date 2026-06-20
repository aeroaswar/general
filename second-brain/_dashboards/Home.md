---
type: dashboard
tags: [dashboard]
---
# 🧠 Second Brain — Home

> Pin this note (right-click → Pin) or set it as your start page.
> New here? Read [[START-HERE]] first.

## 🔥 Today
- [[01-Daily/{{date:YYYY-MM-DD}}|Open today's daily note]]
- [[Now|🎯 Now]] · [[Weekly Review|🔄 Weekly Review]] · [[Goals 2026]] · [[Decision Log]]
- [[_dashboards/Tasks-Dashboard|✅ Tasks dashboard]]
- [[_dashboards/Research-Dashboard|🔬 Research dashboard]]

## 🚧 Active projects
```dataview
TABLE status, area, due
FROM #project
WHERE status = "active"
SORT due ASC
```

## 📥 Inbox to process
```dataview
LIST
FROM "00-Inbox"
WHERE type != "dashboard"
SORT file.cday DESC
```

## 🗺️ Maps of Content
- [[04-Knowledge/_Knowledge-MOC|Knowledge MOC]]
- [[05-Research/_Research-MOC|Research MOC]]
- [[02-Projects/_Projects-MOC|Projects MOC]]
- [[03-Areas/_Areas-MOC|Areas MOC]]
- [[07-Skills/_Skills-MOC|Skills MOC]]

## 🌱 Recently created
```dataview
LIST
FROM "04-Knowledge" OR "05-Research"
SORT file.cday DESC
LIMIT 10
```

## 🪵 Orphans (no links in or out — connect or archive)
```dataview
LIST
WHERE length(file.inlinks) = 0 AND length(file.outlinks) = 0
AND type != "dashboard"
SORT file.cday DESC
LIMIT 15
```
