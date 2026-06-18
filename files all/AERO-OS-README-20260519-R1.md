# Aero's Claude.ai OS

A 9-skill private operating system for Claude.ai web/desktop.
Built for Aero Aswar. Owned by you. No subscription, no agency.

---

## The full stack (9 skills)

### Advisors (decision-support)

| Skill | When it loads | Job |
|---|---|---|
| `hormozi` | Pricing, offers, sales, unit economics | Math + offer construction |
| `rubin` | Brand, taste, copy, creative review | Cut what's noise |
| `naval` | Strategic forks, focus, leverage | Pick the right game |

### Entities (context-loading)

| Skill | When it loads | Job |
|---|---|---|
| `ani` | PT ANI, nickel mining, RKAB, grade control | Mining operations context |
| `mmi` | PT MMI, offtake, ore trading, HPM | Trading desk context |
| `ijba` | IJBA, IJWS, motorsport, sponsorship | Event production context |
| `glu` | Glu brand, intimate apparel, Shopify | Consumer brand context |
| `portfolio` | IDX, IHSG, equities, SMC/DOL | Personal investing context |

### Meta

| Skill | When it loads | Job |
|---|---|---|
| `decide` | "Should I do X?", strategic forks | Routes through Naval → Hormozi → Rubin |

---

## Installation

1. claude.ai → profile icon → **Settings → Capabilities → Skills**
2. Ensure **Code execution** is ON
3. Upload each of the 9 zips
4. Toggle all ON

---

## How they compose

The skills are designed to **stack**. Claude will pull the relevant ones based on your prompt. You can also call them explicitly.

### Example 1 — Glu pricing audit

> "Audit Glu's current SKU pricing and propose a 3-piece bundle. Use hormozi + glu skills."

Loads: `hormozi` (offer math) + `glu` (brand discipline). Hormozi pushes for value-stacked premium pricing; Glu's voice protects against discount language. Output is on-brand and on-math.

### Example 2 — Sponsor outreach

> "Draft sponsorship outreach for PT City Vision. Use ijba + rubin skills."

Loads: `ijba` (event context, PT City Vision research) + `rubin` (cut the noise). You get a tight, value-led email instead of corporate sponsor-deck language.

### Example 3 — Strategic fork

> "Should I personally take on day-to-day Glu Singapore ops, or hire a country manager?"

Auto-loads `decide` (because "should I"). `decide` itself pulls Naval (leverage check), Hormozi (cost math), Rubin (taste check) plus `glu` for context. You get a structured verdict, not a both-sides essay.

### Example 4 — Pure technical work

> "Calculate HPM for limonite at 1.5% Ni, 0.06% Co under Kepmen 144/2026."

Loads: `ani` and/or `mmi` (HPM context). No advisor skill needed — this is execution, not decision-making.

---

## What this replaces

| Altari / "Claude Code OS" sells | Your OS does |
|---|---|
| Per-entity folder structure | Per-entity SKILL.md (loaded on demand, no folder management) |
| Persistent memory | Claude.ai native memory + Cowork instructions + these skills |
| Slash commands | Skill auto-invocation by keyword (cleaner than `/glu`) |
| Agent workforce | Advisor skills composed with entity skills |
| Local ownership | You own all 9 SKILL.md files; portable, version-controllable |

You did not pay $49/month for this. You did not book a discovery call.

---

## Maintaining it

The skills are markdown. Update them like any document.

1. Edit the `SKILL.md` inside the relevant folder
2. Re-zip the folder
3. Re-upload to Claude.ai (replace existing)

**Update triggers:**

- New regulation affects an entity → update that entity skill
- Brand evolution → update `glu` or others
- New advisor lens you want → create a 10th skill (the pattern is repeatable)
- A skill keeps mis-firing → tighten its `description:` field; that's how Claude decides when to load it

---

## What this is NOT

- Not a replacement for the mmi-ops platform (that's the operational system of record)
- Not a substitute for your skills repo on Claude Code (different runtime, different purpose)
- Not "always on" — Claude loads skills only when their description matches your prompt
- Not a memory system — it's a context system. Memory is separate (Claude.ai's native feature)

---

## Naming convention

All skill names follow lowercase-hyphen. If you add more entities (e.g., a new PT), use:
- `entity-name` (short, single-word preferred)
- Description starts with "Load full context for…"
- Trigger keywords listed explicitly so Claude can route reliably

---

## Final principle

The Altari "OS" is a productised version of patterns power users have been using for a year. The actual asset isn't the framework — it's the discipline to keep the context files tight, current, and honest.

Most "AI operating systems" sold online add complexity. This one removes it.

— Built 19 May 2026
