---
type: area
status: active
tags: [area, glu, brand, business, apparel]
---
# GLU — Eco-Athletic Brand

_Women's eco-friendly athletic apparel brand — my flagship venture._

> **Canonical positioning:** **eco-athletic masterbrand** (movement: "female athletes who
> refuse to compromise"). **Loungewear** = the comfort-led **entry/wedge line** ("GLU Lounge
> Essentials™"), not the masterbrand. → [[GLU — Website (build notes)]]

## Standards
- Position as a **movement**, not a product: "for female athletes who refuse to
  compromise" on sustainability or performance.
- Colour from values + community, not discounts. Premium-but-accessible ($15–50 entry).
- Sub-brands/assets: GLU Essentials, **GLU Noir**, shop-glu, Season 3 Mens Collection.

## Current state
- Revenue ~ IDR 6–8M/mo (~$375–500). Main gap: **brand awareness = positioning clarity**.
- Strategy doc: Hormozi offer-engineering deck (Value Equation, Grand Slam Offer,
  pricing ladder, 90-day launch). → see [[GLU]] project note.

## Pricing ladder (target)
- Entry ($25/item) → Core ($49/mo box) → Premium ($199/mo VIP) → Elite ($5–15K/yr ambassador).

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
WHERE contains(area, this.file.name)
```
