---
type: source
medium: article    # article | book | video | paper | podcast | repo
author: 
year: 
url: 
tags: [source]
created: <% tp.date.now("YYYY-MM-DD") %>
---
# <% tp.file.title %>

**Author:** · **Year:** · **Medium:** article
**URL:** 

## Why I saved this


## Literature notes from this source
```dataview
LIST
FROM #literature
WHERE contains(source, this.file.name)
```
