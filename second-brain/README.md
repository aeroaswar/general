# 🧠 Second Brain — Obsidian system

A drop-in vault scaffold tuned for three jobs: **Knowledge**, **Tasks**, and **Research**.
Built on plain Markdown + three community plugins.

## How to install into your existing vault

1. Copy the contents of this `second-brain/` folder into your Obsidian vault
   (or copy individual folders/templates you want).
2. Install + enable these **community plugins** (Settings → Community plugins):
   - **Dataview** — powers every dashboard/MOC query. Enable *"JavaScript Queries"* off is fine; inline `dataview`/`dataviewjs` not required.
   - **Tasks** — powers the task dashboards (`📅 due`, `⏫ priority`, etc.).
   - **Templater** — runs the `<% %>` template variables (dates, titles).
3. Point Templater at the template folder: Settings → Templater → *Template folder location* → `second-brain/_templates`.
   - Optional: set daily-note template + folder (`01-Daily`) under Core "Daily notes" or Templater folder triggers.
4. Open `_dashboards/Home.md` and **pin it** — that's your cockpit.

## The folder system (PARA + Zettelkasten-lite)

| Folder | Holds |
|---|---|
| `00-Inbox/` | Quick capture. Nothing stays here — process to a real home. |
| `01-Daily/` | Daily notes (journal + task triage + capture). |
| `02-Projects/` | Things with an end state. One note per project. |
| `03-Areas/` | Ongoing responsibilities (Health, Brand, Finances…). |
| `04-Knowledge/` | **Permanent/evergreen atomic notes** — the actual "brain". |
| `05-Research/` | `Sources/` (what you read) + `Literature/` (your notes on them). |
| `06-Resources/` | Reference material, assets, snippets. |
| `99-Archive/` | Done / inactive. Out of sight, still searchable. |
| `_templates/` | Note templates (Templater). |
| `_dashboards/` | Home, Tasks, Research cockpits (Dataview). |

## The workflows

**Knowledge** — Capture a thought in `00-Inbox` → when it's a real idea, make a
*permanent note* (`04-Knowledge`, atomic, one idea, in your words) and **link it**
to related notes. The graph + Knowledge MOC do the rest.

**Tasks** — Write tasks anywhere as `- [ ] thing 📅 2026-06-20 ⏫`. The Tasks
plugin emoji set: `📅` due, `⏳` scheduled, `🛫` start, `⏫`/`🔼`/`🔽` priority,
`🔁` recurring. They all roll up into `_dashboards/Tasks-Dashboard.md` and your daily note.

**Research** — `Source` (saved thing) → `Literature note` (read + summarize +
quote) → promote atomic takeaways into `04-Knowledge` permanent notes. Track the
pipeline in `_dashboards/Research-Dashboard.md`.

## Metadata convention

Every note carries a `type:` in frontmatter (`permanent`, `literature`, `source`,
`project`, `area`, `daily`, `meeting`, `moc`, `dashboard`). All Dataview queries
key off `type` and tags — keep it consistent and the dashboards stay accurate.

## What I (Claude) can do next on this vault

- Bulk-import your Drive docs into structured source/literature notes.
- Generate MOCs that tie scattered notes together.
- Find orphans, broken links, duplicate tags; normalize frontmatter.
- Write custom Dataview/Tasks queries for any view you want.

Just commit your real notes into this folder (or tell me the topics) and ask.
