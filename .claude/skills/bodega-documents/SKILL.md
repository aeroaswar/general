---
name: bodega-documents
description: Print-perfect, bilingual (EN / Bahasa Indonesia) business documents on the Bodega letterhead — engagement contracts (with e-signature + e-Meterai, authentic Indonesian legal format) and invoices (agency fee + VAT math, IDR formatting). Covers the hard-won techniques: a letterhead that repeats on every printed A4 page, theme-proof light "paper" print styling, reliable page breaks, phone↔desktop PDF parity, and a transform-safe canvas signature pad. Use when building/editing contracts, invoices, quotes, statements of work, or any printable PDF-style document in the Bodega portal or app. Pairs with `bodega-portal` (host app) and `bodega-brand` (the wordmark).
---

# Bodega — Print-perfect documents (contracts & invoices)

Documents that read like real paperwork when printed/saved as PDF: a **Bodega letterhead
on every page**, clean clause/line-item breaks, light ink on white, and the **same output
on a phone and a laptop**. Contracts are bilingual and follow an **authentic Indonesian
legal format**; invoices carry editable agency-fee + VAT math.

## Reference assets (these encode the painful lessons — reuse them)

- `reference/print.css` — the complete print system: `.doc-table` letterhead-repeat
  technique, `@media print` A4 rules, theme→paper token override, block-flow pagination,
  device-parity overrides. **Read its header comment for the required markup contract.**
- `reference/SignaturePad.jsx` — the canvas e-signature pad (drop-in React component).
- `reference/invoice-totals.js` — `invoiceTotals()`, `money()` (IDR), `defaultInvoiceNumber()`.
- `reference/contractI18n.js` / `reference/invoiceI18n.js` — the bilingual label tables,
  Indonesian legal boilerplate (opening/preamble/penutup, party sentences), and helpers.

## The five print techniques (each fixes a specific failure)

1. **Repeating letterhead** → wrap the document in `<table class="doc-table">` with the
   letterhead in `<thead class="print-head">` and a note in `<tfoot class="print-foot">`;
   in print they become `table-header-group` / `table-footer-group`, which browsers repeat
   on every page. `position:fixed` letterheads overlap the content — don't.
2. **Logo that actually prints** → render the wordmark as a real `<img class="ll-logo"
   src={WORDMARK}>` (data-URI), never a CSS `background-image`.
3. **Right edge not clipped** → `table-layout: fixed` on `.doc-table`, and in print set
   `main { overflow: visible }` and the document to `width: auto` (a fixed `mm` width
   overflows the container and clips). Let `@page { margin: 13mm }` form the borders.
4. **Clean page breaks** → flex items ignore `break-inside:avoid` in Chrome, splitting
   clauses. Block-flow the document (`.doc-body { display: block }`), space with margins not
   gap, and mark unbreakable units `avoid-break` / `sig-section`.
5. **Phone PDF == desktop PDF** → mobile browsers print the responsive *mobile* layout
   because `sm:`/`lg:` evaluate against screen width. The print block re-forces the full A4
   layout (`.sm\:hidden{display:none}`, `.hidden.sm\:grid{display:grid}`, grid columns).
   Add an override for every responsive utility a new document uses.

Also: `.print-area` overrides all theme tokens to fixed light "paper" values so the PDF is
clean whether the app is in dark or light mode.

## E-signature (`SignaturePad.jsx`)

Canvas pad, pointer-based, DPR-aware. The non-obvious bit: **size the buffer from
`canvas.clientWidth/clientHeight`, not `getBoundingClientRect()`** — while the sign modal
animates in it carries a transform, and a rect-sized buffer makes ink land offset from the
finger (the "glitch"). Pointer coords are mapped to CSS space with a residual-scale
correction. Exposes `clear()`, `isEmpty()`, `toDataURL()`. Wire a **Reset signature** action
to `clear()`; persist the signed PNG + a timestamp ("Signed electronically").

## E-Meterai (Indonesian duty stamp)

Provide an **"Affix e-Meterai"** flow: upload the official e-Meterai image obtained from
**PERURI / an authorized distributor** (PNG/JPG) and record its **serial number (Nomor
Seri)**. Render it on/near the signature block; allow remove. It's a record attachment — be
honest in the UI copy that legal validity comes from PERURI issuance, not from the app.

## Bilingual contracts (EN / Bahasa Indonesia)

A language switch (`LANGS` = EN / ID) flips all structural labels (`T`/`tr(lang)`) and the
default boilerplate clauses; studio-authored content (scope, deliverables, fee, custom
clauses) is shared. The **Indonesian variant uses real legal form**, not a translation:

- Opening: *"Pada hari ini, {hari}, tanggal {tgl}, yang bertanda tangan di bawah ini:"*
  (`openingID`, with `hariName()` for the weekday).
- Parties as **PIHAK PERTAMA** (the studio) / **PIHAK KEDUA** (the client) via
  `partySentenceID({name,address,rep,role,label})`; the **preambleID** binds them as
  *"Para Pihak"*.
- Clauses headed **PASAL** (`DEFAULT_CLAUSES_ID`); closing **PENUTUP** (`penutupID`) noting
  the agreement is signed in duplicate, *bermaterai cukup*, with equal legal force.
- Contract numbering + locale-aware long dates via `defaultContractNumber()` / `fmtDateL()`.

Make a comprehensive contract include the engagement **phases, content pillars, and audience
segments** (editable inline) alongside scope/deliverables/fee/terms.

## Invoices (`invoice-totals.js`)

Same letterhead/print plumbing as the contract. Totals cascade **Subtotal → + Agency fee
(on subtotal) → + VAT (on subtotal+fee) → Total**, with `agencyFeeRate`/`vatRate` **editable
per invoice** (defaults **agency 10% / VAT 2%**). Money in **IDR** ("Rp 25.000.000"); number
format `INV/001/BCS/<roman-month>/<year>`. Line items are responsive: a `hidden sm:grid`
desktop row and a `sm:hidden` stacked mobile card — print forces the desktop grid.

## Always verify

Confirm both the **on-screen** and the **printed** (Ctrl/Cmd-P → Save as PDF) views, in
**both light and dark** app themes, and on a **narrow viewport**, since the bugs this skill
prevents only appear in print and on mobile.
