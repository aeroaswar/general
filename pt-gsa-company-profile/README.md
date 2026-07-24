# PT GSA — Company Profile (Swiss Redesign)

An 11-page, A4 (210 × 297 mm) company profile for **PT Global Sarana Angkasa (PT GSA)**,
rebuilt in the **International Typographic Style (Swiss Style)** from the company's
original Canva business-proposal deck.

## Design system
- **Typography** — a single grotesque sans-serif family (Inter) throughout: headlines,
  body, labels, and tabular numerals. No serif type anywhere.
- **Palette** — restricted to ink (`#0A0A0A`), paper (white), and one red accent
  (`#E8491D`, flattened from PT GSA's brand red-orange). No gradients, shadows, or
  decorative shapes.
- **Grid** — strict 8-column grid with 14 mm margins, hairline (0.5–1.25 pt) rules,
  numbered section locators (01–09), and a repeating folio head/foot.
- **Imagery** — all photography rendered duotone (grayscale) in hard-edged grid cells.
  Airline trademarks are the one deliberate exception, reproduced in their real brand
  colors on a plain white field.

## Contents
Cover · Profile · Organizational Structure · Milestones · Airline Partners · Services ·
Marketing Plan · Recognition · Infrastructure & Facilities · Key Success Factors · Closing.

All facts are carried verbatim from the source PDF. The source contains no contact
details, so the closing page leaves a labeled placeholder rather than inventing any.

## Files
- `index.html` — the document (self-contained, print-tuned `@page { size: A4 }`).
- `assets/` — photos and logos extracted from the source PDF (airline logos alpha-composited).
- `PT-GSA-Company-Profile.pdf` — rendered print proof.

## Print / export
Open `index.html` and print to PDF (A4, margins: None, Background graphics: on), or serve
the folder and render headless:

```sh
python3 -m http.server 4321
# then print http://localhost:4321/index.html to A4 PDF
```
