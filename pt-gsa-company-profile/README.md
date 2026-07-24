# PT GSA — Company Profile

A 12-page, A4 company profile for **PT Global Sarana Angkasa (PT GSA)**, an
international air cargo General Sales Agent. Built as a self-contained HTML
document, print-tuned to A4.

## Design
The layout follows the **PT MMI Company Profile 2026** editorial system:

- **Palette** — warm ivory paper (`#F0EAE1`), charcoal ink (`#221E1A`), warm body
  grey (`#4C453C`), hairline rules, and a single muted terracotta (`#B2947F`)
  used only inside data exhibits (charts, map routes).
- **Typography** — Newsreader (serif) for display/headlines, Inter (humanist
  sans) for body, labels, tables and figures.
- **Photography** — warm duotone (grayscale + light sepia). Airline trademarks
  are desaturated to sit in the monochrome palette.
- **Structure** — running heads/feet, numbered sections, hairline-ruled tables,
  key/value records, dark feature/quote blocks, MMI-style horizontal bar charts,
  and a location/route map.

## Pages
1. Cover · 2. About the company (+ contents, stat row, company record, hub map) ·
3. What we do · 4. Organizational structure · 5. Milestones · 6. Airline partners ·
7. **Global network** (Indonesia → Europe & USA route map) ·
8. **Reach and cargo lanes** (great-circle distance chart) · 9. Marketing plan ·
10. Recognition and strengths · 11–12. Contact.

## Data notes
- All company facts are carried from the source GSA proposal.
- The **route map** (page 7) plots the company's primary Europe- and US-bound lanes
  on a Pacific-centred equirectangular projection. The **chart** (page 8) shows
  **great-circle distance** from Jakarta (CGK) to each gateway — objective
  geographic data, not invented tonnage. World map derived from Natural Earth
  (public domain).
- The source contains no contact details; the contact page uses labelled
  placeholders for the company to complete.
- Cargo/aviation photography: the session's network policy blocked external image
  hosts, so imagery is drawn from the source deck and treated in the MMI duotone
  style. Swap files in `assets/` to update.

## Files
- `index.html` — the document (self-contained, `@page { size: A4 }`).
- `assets/` — photos, desaturated airline logos, and `world-pacific.svg` (base map).
- `PT-GSA-Company-Profile.pdf` — rendered print proof.

## Export
Open `index.html` and print to PDF (A4, margins: None, Background graphics: on),
or serve the folder and render headless Chromium to A4.
