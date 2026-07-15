# PT Tambang Nikel Sulawesi — Company Profile 2025 (Swiss edition)

A redesigned company profile for **PT Tambang Nikel Sulawesi (TNS)**, rebuilt in
the **Swiss / International Typographic Style** from the content of the original
2025 profile. Output is a **12-page A4 portrait PDF**.

**Deliverable:** [`TNS_Company_Profile_2025.pdf`](./TNS_Company_Profile_2025.pdf)

---

## Design language

Rebuilt on the principles of the International Typographic Style:

- **Grid** — a strict 12-column grid with consistent 16 mm margins, flush-left
  ragged-right setting, and a running header / folio system.
- **Type** — *Inter*, a neo-grotesque in the Helvetica/Akzidenz lineage.
  Hierarchy is built from weight and size only (Light 300 → Black 900).
- **Palette** — disciplined **red / black / white**. The red is sampled from the
  TNS brand (`#E01A1D`); the classic Swiss red/black/white system maps directly
  onto TNS's own identity.
- **Photography** — objective, documentary **black-and-white** imagery, anchored
  to the foot of most pages as a full-bleed "earth-line" band with a red rule.
- **Logo** — the TNS wordmark is used correctly in both variants: red on light
  grounds, reversed white on red/photographic grounds.

## Pages

1. Cover — *Locally mined, nationally trusted*
2. Contents
3. The Company (history, founded 2022)
4. Vision & Mission
5. Core Values
6. A Trusted Supplier (position in the chain)
7. Nickel Ore Supply by Region
8. Suppliers & Smelters
9. Volume & Growth (ore volume supplied to smelter)
10. Services
11. Philosophy
12. Connect With Us (contact)

All figures, names, addresses and statements are taken from the source profile.
Where the source presented relative bar heights without numbers (year-on-year
revenue), the chart is reproduced as a clearly labelled relative index rather
than inventing currency figures.

## Assets

- `profile.html` — the complete, self-contained source (all styles inline).
- `assets/` — processed black-and-white photography, the two logo lockups
  (transparent PNG), and the Inter web fonts (`assets/fonts/`).
- Photography is the company's own operational imagery, treated to a consistent
  high-contrast grayscale for the Swiss aesthetic.

## Rebuilding the PDF

```bash
pip install playwright pillow pymupdf   # PyMuPDF/Pillow only needed for source asset extraction
playwright install chromium             # or set CHROME_PATH to an existing Chromium
python3 render_pdf.py
```

`render_pdf.py` loads `profile.html`, waits for fonts, and prints to A4 with
`prefer_css_page_size` (honouring `@page { size: A4 }`) and backgrounds on.
Set `CHROME_PATH=/path/to/chrome` to use a preinstalled browser.
