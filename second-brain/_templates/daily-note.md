---
type: daily
date: <% tp.date.now("YYYY-MM-DD") %>
tags: [daily]
---
# <% tp.date.now("dddd, D MMMM YYYY") %>

> [[<% tp.date.now("YYYY-MM-DD", -1) %>|← Yesterday]] · [[<% tp.date.now("YYYY-MM-DD", 1) %>|Tomorrow →]]

## 🎯 Focus
- 

## ✅ Tasks
```tasks
not done
(due before tomorrow) OR (scheduled before tomorrow) OR no due date
sort by priority
short mode
```

### Captured today
- [ ] 

## 📓 Log
- 

## 🧠 Notes started today
```dataview
LIST
FROM "04-Knowledge" OR "05-Research"
WHERE file.cday = date(<% tp.date.now("YYYY-MM-DD") %>)
```
