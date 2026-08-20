# PT Tanra Daya Jaya — Company Profile 2026

Industrial-luxury redesign of the PT Tanra Daya Jaya company profile (nickel mining services contractor — mining, hauling, barging, main road). Recreated from the original 13-page PDF deck; logo, client logos, and photography extracted and reused from the source document.

## Structure

- `index.html` + `styles.css` — 15 exact-A4 pages (210×297mm), Bahasa Indonesia
- `assets/img/` — keyed logo mark, client chips (GMS / SBP / BNN / ANI), photo crops, dot-grid Indonesia map (generated from Natural Earth 50m geometry)
- `assets/fonts/` — self-hosted variable woff2: Fraunces (display serif), Space Grotesk (body), JetBrains Mono (data/legal)
- `build/PT_TANRA_DAYA_JAYA_COMPRO_2026.pdf` — final print-ready export

## Content upgrades vs. original

New pages: Wilayah Operasi (dot map), Lintasan Perusahaan (milestones timeline), Komitmen K3 & Lingkungan, fleet detail table. All figures (tonnages, unit counts, legal numbers) are taken verbatim from the source document — nothing invented.

## Rebuild PDF

```bash
node pdf.js   # Playwright + Chromium: A4, printBackground, zero margins
```

Or open `index.html` in Chrome → Print → A4, no margins, background graphics on.
