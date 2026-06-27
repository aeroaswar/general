# Head of Design — a composing design sub-agent

A Claude Code **sub-agent** that acts as a hands-on design director for this
workspace. Hand it a sentence — or a page of plain, unstyled HTML — and it plans
the work, dispatches the right specialist agents and house skills, gates the
result against the house bar, and hands back something that needs no further art
direction.

- **Agent definition:** [`head-of-design.agent.md`](./head-of-design.agent.md)
- **Showcase / story:** [`index.html`](./index.html) — *"From Vanilla HTML to a
  Composing Designer in One Session."*

## What makes it different

The workspace already has **specialists** — `brand-designer`,
`web-section-builder`, `dashboard-builder`, `reference-scout`, `design-critic` —
and **house skills** — `precision-bento`, `framer-motion`, `talvex-dashboard`.
What it lacked was a single owner to *compose* them: one agent that turns a vague
brief into a thesis, writes the plan, runs the specialists in the right order
(parallel where independent, serial where dependent), keeps the seams consistent,
and won't ship until `design-critic` clears it.

The Head of Design is that owner. It doesn't reinvent the craft — it sequences
it.

## The composition workflow

1. **Intake** → restate the brief as a one-line design *thesis*.
2. **Reference** → dispatch `reference-scout` so taste isn't generic.
3. **Compose** → write a vetoable plan: spine, system, assignment table.
4. **Dispatch** → launch specialists (parallel/serial), owning the shared tokens.
5. **Integrate & critique** → run `design-critic`, fix, converge, *then* ship.

## The signature move — vanilla HTML in, composed experience out

Given plain or weak markup, it does **not** restyle line-by-line. It reads the
markup as *content*, re-derives the information architecture, recomposes with the
house system, and **preserves the content while replacing the design** — your
words, data, and links survive verbatim.

## Install

Sub-agents live in `~/.claude/agents/` (alongside the existing design
specialists). Copy the definition there:

```sh
cp head-of-design.agent.md ~/.claude/agents/head-of-design.md
```

Then invoke it explicitly — *"use the head-of-design agent to …"* — or let Claude
route to it on open-ended, multi-discipline design briefs.

## House bar (the non-negotiables it enforces)

**No purple** · Geist/Inter with a real type scale · airy near-white canvas +
mint/frosted glass · Phosphor icons · one disciplined accent · expo-out / low-
bounce motion that's `prefers-reduced-motion` safe · WCAG AA · adapt references
toward the workspace's bold sports identity.

## Preview the showcase

The preview server can't read the iCloud folder, so serve from `/tmp`:

```sh
rsync -a head-of-design-agent/ /tmp/hod/ && cd /tmp/hod && python3 -m http.server 4199
# open http://localhost:4199/index.html
```
