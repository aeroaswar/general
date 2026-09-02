# AI Pertambangan Toolkit

Single-file, no-build interactive tool (`index.html`) consolidating the useful
content from the Google Drive folder **AI PERTAMBANGAN** (a shared product
folder, owner `nasuha.muhammadd@gmail.com`) into one instrument instead of
eight static PDFs.

## Source folder (8 files)
```
AI PERTAMBANGAN/
├── AKSES AI PERTAMBANGAN.pdf                 — receipt + 3rd-party ChatGPT GPT link (not embedded — paid access on another account)
├── MATERI PERTAMBANGAN/
│   ├── SOP TAMBANG BATUBARA/
│   │   ├── 34. SOP PELAPORAN KINERJA.pdf
│   │   └── 2. SOP PENILAIAN RESIKO.pdf
│   └── SOP PERTAMBANGAN/
│       └── 18. SOP Pengawasan Sistem Peralatan Tambang.pdf
└── BONUS/
    ├── bonus-bank-template-laporan.pdf
    ├── bonus-paket-dokumen-k3-hse.pdf
    ├── bonus-template-rkab-lengkap.pdf
    └── bonus-kalkulator-produktivitas-alat.pdf
```

## What's in the tool
- **Kalkulator Produktivitas Alat** — 8 live-computing formulas (Cycle Time,
  Productivity, PA, UA, Match Factor, Fuel Ratio, Cost/Ton, Stripping Ratio)
  color-coded against the source PDF's target thresholds.
- **RKAB Builder** — the 12-BAB structure as reference accordion, a 14-item
  data checklist + 12-item lampiran checklist (persisted, with progress
  bars), and a rencana-vs-realisasi deviation table that auto-flags Wajar /
  Perlu Penjelasan / Wajib Analisis Akar Masalah.
- **K3 / HSE** — editable JSA table, an interactive HIRADC 5×5 risk matrix
  (pick Kemungkinan × Keparahan → score + color-coded level), a Permit-to-Work
  reference table, and a P2H daily unit-inspection checklist with a live
  counter.
- **Template Laporan** — Form Harian Produksi (shift 1/2, auto-totaled),
  weekly/monthly report structure references, and an editable Notulen
  Meeting & Action Plan table with status pills.
- **SOP** — the 3 source SOPs as accordions with a visual step-flow mirroring
  each PDF's flowchart, plus their fillable form templates.

All checklist/table/form state persists to the browser's `localStorage` —
nothing is sent to a server. Every printable section has a "Cetak" button
(`window.print()` with a dedicated print stylesheet).

## Run it
No build step — open `index.html` directly, or serve it:
```sh
python3 -m http.server 4300
```

## Design
Dark "ops console" aesthetic (aurora-glass: frosted glass panels, sage/teal
ambient glow, ultralight display numerals) — deliberately distinct from the
light KOL dashboard at the repo root.
