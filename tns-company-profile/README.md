# PT Tambang Nikel Sulawesi — Company Profile 2025 (Swiss edition)

A redesigned company profile for **PT Tambang Nikel Sulawesi (TNS)**, rebuilt in
the **Swiss / International Typographic Style** from the content of the original
2025 profile and expanded with partner/investor-grade sections. Output is a
**20-page A4 portrait PDF**.

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
4. By the Numbers (key figures at a glance)
5. Vision & Mission
6. Core Values
7. Why TNS (value proposition)
8. A Trusted Supplier (position in the chain)
9. How We Work (five-step operating model)
10. Supply by Region
11. Coverage & Logistics (map)
12. Suppliers & Smelters
13. Product & Specifications (ore grades & terms)
14. Volume & Growth
15. Track Record (2022–2025 timeline)
16. Services
17. Responsible Sourcing & Hilirisasi
18. Philosophy
19. Connect With Us (contact)
20. Back cover

Figures, names, addresses and statements are taken from the source profile.
Additions built without new data (By the Numbers, Why TNS, How We Work, Coverage,
Track Record, Responsible Sourcing) are derived from that source and standard
domain practice. Two items are clearly labelled as provisional pending the
company's real data: the **year-on-year revenue** chart (shown as a relative
index, not invented figures) and the **product specifications** (indicative
laterite-ore ranges, confirmed per cargo).

## Map — real geography

The Coverage & Logistics map is drawn from **Natural Earth 1:10m** coastline data
(`world-atlas`), projected to the Sulawesi + Halmahera region. Sourcing regions
are scaled by volume; smelter hubs (IMIP/Morowali, Konawe, Weda Bay) and a barge
route are overlaid. `make_map.js` regenerates the coastline paths and node
positions.

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

# to regenerate the map coastline paths (optional):
npm install world-atlas topojson-client
node make_map.js                        # writes map_coast.txt + node positions
```

`render_pdf.py` loads `profile.html`, waits for fonts, and prints to A4 with
`prefer_css_page_size` (honouring `@page { size: A4 }`) and backgrounds on.
Set `CHROME_PATH=/path/to/chrome` to use a preinstalled browser.
