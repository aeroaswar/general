# CLAUDE.md rules audit — 2026-08-10

## Scope

Audited every instruction-bearing file this session has access to for the
`aeroaswar/general` repo: `CLAUDE.md` (the only rules file in the repo),
plus a check for `.claude/` rules, hooks, skills, and memory files.

Result: **`CLAUDE.md` is the only rules file that exists in this repo.**
There is no `.claude/` directory, no hooks, no `.skill` files, and no
separate memory file checked into this repo — `MANIFEST.md` confirms the
`.claude/`, `.agents/`, and `.remember/` folders live in the source Google
Drive workspace and were never imported here. This audit is therefore
scoped to `CLAUDE.md`'s content.

Two kinds of content live in `CLAUDE.md`, and only the first is in scope:

- **Instructions/rules** — the "Environment quirks" and "House style"
  sections. Audited below against three tests.
- **Reference data** — the project catalog (ports, notes), folder map, and
  `MANIFEST.md`'s Drive links. This is a lookup index, not a behavioral
  instruction — there's no "would I do this without being told" test that
  applies to a port number. Left untouched.

## Test applied to each instruction

1. Would I already do this without being told?
2. Is it correcting a weakness I no longer have?
3. Does it conflict with anything else I've been told?

A "no" on any test marks the line for removal. Only lines that fail none of
the tests (i.e., a real, still-needed, non-conflicting correction) survive.

## Findings

| # | Instruction | Verdict | Why |
|---|---|---|---|
| 1 | iCloud folder breaks `preview_start`; rsync to `/tmp` and serve from there | **Keep** | Non-obvious, environment-specific failure mode. I would not guess a permissions workaround this specific without being told. |
| 2 | Black screenshot = hidden window; retry → restart server → Playwright fallback | **Keep** | Same reasoning — a specific debug recipe for a known false-negative, not something inferable. |
| 3 | Expose `window.__<name>` snap/frame handle for RAF animations | **Keep** | A house convention for deterministic capture; nothing about default behavior would produce this exact handle pattern on its own. |
| 4 | Use `precision-bento` for hero/features/proof/contact sections | **Remove** | Redundant. The skill's own description, which loads automatically into every session (`precision-bento: ... Default for hero/features/proof/contact sections.`), already states this verbatim. Repeating it in `CLAUDE.md` adds no information and creates a second copy that can drift out of sync with the skill if the skill's description ever changes — i.e. it risks a future conflict rather than preventing one. |
| 5 | Use `framer-motion` for React motion work | **Remove** | Same reason as #4 — the skill's description already says "Default for React motion work" verbatim. |
| 6 | Use `talvex-dashboard` for dashboard/admin/KPI builds | **Remove** | Same reason as #4 — the skill's description already says "Default for dashboard/admin/KPI builds" verbatim. |
| 7 | Dispatch the matching design subagent (`brand-designer`, `dashboard-builder`, `web-section-builder`, `reference-scout`, `design-critic`) | **Keep** | Unlike the skills above, these custom subagents' own descriptions aren't visible to a session ahead of time, so there's no duplicate source telling me which one matches which task. Genuinely load-bearing. |
| 8 | Apply saved industry references automatically by project type; adapt, don't clone | **Keep** | Corrects a real default failure mode (an agent asked to use a reference will tend to copy it too literally). The "adapt, don't clone" clause is doing real work. |

## Numbers

- **Rules audited:** 8
- **Kept:** 5 (#1, #2, #3, #7, #8)
- **Removed:** 3 (#4, #5, #6 — all house-style skill pointers)
- **Original rules text (Environment quirks + House style sections):** 180 words
- **Kept, rewritten concisely:** 115 words
- **Removed:** 3 rules / ~65 words, all for the same reason (duplicate of skill metadata already in context)

## What was removed and why (summary)

All three removals are the `precision-bento` / `framer-motion` /
`talvex-dashboard` "use this skill for X" bullets. Every one of them
restates — almost word-for-word — the "Default for ..." clause already
built into that skill's own description, which is loaded automatically
every session. They fail test 1 (I'd already do this without being told,
because the skill system tells me) and create a latent risk under test 3:
two copies of the same routing rule can silently drift apart if one is
edited and the other isn't. Nothing else in `CLAUDE.md`'s instruction
sections failed any of the three tests.

## Not touched

The project catalog, folder map, and `MANIFEST.md` are reference data, not
instructions — they don't have a "default behavior" to compare against, so
the three-question test doesn't apply. They were left as-is.

## Proposed next step

`kept-rules.md` in this same folder is the trimmed, concise replacement for
`CLAUDE.md`'s "Environment quirks" and "House style" sections. This is
staged here for review, not yet applied — swap it in by hand once you've
confirmed nothing here is still needed for reasons outside this audit's
visibility (e.g. a workflow that only exists on your local machine).
