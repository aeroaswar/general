---
type: moc
tags: [moc, skills]
---
# 🗺️ Skills MOC — my Claude skills

_Every skill I've **made** or **use** in Claude. Full source lives in `~/.claude/skills`,
the workspace `.skill` files, and Drive — these notes are the navigable catalog._

## Made — design / web / QA
- [[precision-bento]] — premium web sections.
- [[framer-motion]] — React animation defaults.
- [[talvex-dashboard]] — analytics dashboards.
- [[animista]] — animation presets.
- [[gstack]] — headless-browser QA, screenshots, dogfooding.

## Made — business / ops / decision
- [[usaha-id pack]] — Indonesian multi-entity ops (payroll, tax, month-end, briefs).
- [[mmi pack]] · [[mmi pack (full)]] — nickel-trade playbooks (all 10, full text).
- [[glu (skill)]] — load full Glu brand/ops context (premium minimalist innerwear).
- [[portfolio (skill)]] — personal IDX equity portfolio context (SMC, IPS).
- [[decide (skill)]] — Naval × Hormozi × Rubin decision framework + 5-entity leverage model.
- [[writing-skills]] — writing craft/discipline (base for other skills).

## Full source inlined
- [[gstack (full)]] · [[talvex-dashboard (full)]] · [[animista (full)]] · [[mmi pack (full)]]

## Used — downloaded
- [[Downloaded & Used Skills]] (design skill pack, superpowers, agent-skills, ui-ux-pro-max, caveman).

## Catalog-only (couldn't inline full source here)
- [[precision-bento]], [[framer-motion]] — exist **only as `.skill` zip bundles** in Drive;
  they return inline-sized and didn't decode cleanly through this environment. Commit the
  `.skill` files to the repo (or unzip them) and I'll inline the full SKILL.md.

## Not found in Drive
- `indonesian-contract`, `contract-reviewer`, `indonesian-law` — referenced by [[usaha-id]]
  but **no folder exists** on a name search (only generic Legal/Contracts doc folders +
  Law slide-templates). Likely local-only (`~/.claude`) or not yet built. Tell me if they exist.

## All skills (catalog)
```dataview
TABLE origin, what
FROM #skill
SORT origin ASC, file.name ASC
```
