---
type: area
status: active
tags: [area, design, brand-system, house-style]
---
# Design Practice & House Style

_My opinionated visual system and the skills/subagents that encode it._

## House style
- Premium, **airy canvas**; Geist type; **mint glass**; video bento; Phosphor icons;
  **no purple**. Bold sports identity adapted from saved industry references.
- Motion: expo-out easing, low-bounce springs, gentle stagger, reduced-motion safe.

## Skills (reusable)
- **precision-bento** — premium web sections (hero/features/proof/contact).
- **framer-motion** — React animation defaults.
- **talvex-dashboard** — analytics dashboards (frosted cards, `#FFD85F` yellow accent, 6 archetypes).

## Design subagents
- `brand-designer`, `web-section-builder`, `dashboard-builder`, `reference-scout`,
  and read-only `design-critic`. Dispatch the matching one for design work.

## Standards
- Apply saved industry references (sports, dashboards, trends) by project type;
  adapt structure/motion, don't clone visuals.

## Projects in this area
```dataview
TABLE status, due
FROM #project
WHERE area = this.file.name
SORT status ASC
```
