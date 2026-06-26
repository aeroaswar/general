---
type: area
status: active
tags: [area, ai, automation, tooling, agents]
---
# AI & Automation

_How I use AI as a co-builder and the tooling around it._

## Philosophy
- **I curate; AI synthesizes & files.** Compounding, machine-parseable knowledge
  bases (this vault, the [[Business Strategy Wiki]]) with strict frontmatter + links.
- Batch + checkpoint over streaming. Nothing important lives only in chat history.

## Tooling I work with
- **Build:** Lovable, Supabase, Vercel, Netlify, Figma, Canva, Gamma.
- **Media:** Higgsfield (image/video/audio/3D).
- **Ops:** Gmail, Google Calendar, Google Drive, Notion, GitHub.
- **Workspace:** Claude Code (web + CLI), MCP servers, custom skills & subagents.

## Interests / watch-list
- Self-improving agents ("Dreaming" — memory curation as moat) → see Research notes.
- Agent business models: outcome-based pricing, runtime-as-moat.

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
WHERE contains(tags, "ai") OR contains(tags, "agents")
```
