# CLAUDE.md — audited rules (kept)

Survivors of the 2026-08-10 audit. These are the only lines from the current
`CLAUDE.md` that pass all three tests: not default behavior, not a fixed
weakness, not a duplicate/conflict of something already stated elsewhere.
Everything else in `CLAUDE.md` (project catalog, folder map, drive links) is
reference data, not instructions, and is out of scope for this audit — see
`audit-report.md` for the full reasoning.

## Environment quirks

- Preview server can't read the iCloud folder (`preview_start` → PermissionError,
  ports unreachable). Rsync the project to `/tmp` and serve from there; add
  `?v=N` cache-busters after edits; use `python3 -m http.server <port>` when
  sharing a link.
- Black screenshot = hidden window. Retry: screenshot twice → restart the
  server → fall back to Playwright MCP (also use Playwright for resized
  screenshots).
- For RAF-driven animations, expose a `window.__<name>` snap/frame handle so
  paused frames can be captured deterministically.

## House style

- For design work, dispatch the matching subagent in `~/.claude/agents/`:
  `brand-designer`, `dashboard-builder`, `web-section-builder`,
  `reference-scout`, or (read-only) `design-critic`.
- Apply saved industry references automatically by project type — adapt
  structure/motion to the brand identity, don't clone visuals.
