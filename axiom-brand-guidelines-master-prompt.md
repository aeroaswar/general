# MASTER PROMPT — AXIOM Brand Guidelines & Brand Identity System
**Deliverable: a complete, production-ready brand book + identity kit**
**Source of truth: the AXIOM one-file site (`axiom/index.html`)**

---

## 0 · HOW TO USE THIS PROMPT
Paste this whole document to the model/designer. Fill any `« »` field where you
have an opinion; leave it blank and the stated **default** (extracted from the
live AXIOM site) is used. Everything outside `« »` is a **hard requirement, not a
suggestion**. The goal is a brand system so complete that a new designer,
copywriter, or developer could produce on-brand work on day one without asking a
single question.

---

## 1 · OPERATING PROTOCOL (follow in order — do not skip)
1. **Ingest the source.** Treat the provided AXIOM site as the canonical brand
   artifact. Extract — do not invent — every color, type, spacing, motif, and
   voice cue already present. Where this prompt states a value, it is the
   ground-truth pulled from that file; reconcile, don't contradict.
2. **State findings.** Before designing, post a short audit: what the brand
   *already* signals (palette, type, tone, motifs) and any gaps the guidelines
   must resolve (e.g. no defined error/success colors, no photography rules).
3. **Clarify-or-assume.** Ask at most **3 sharp questions** only if truly
   blocking (e.g. legal entity name, primary market beyond Indonesia). Otherwise
   adopt the defaults, **state your assumptions**, and proceed. Never stall.
4. **Plan.** Post the table of contents you'll build (§4) and confirm the output
   format(s) (§9).
5. **Build** the full brand book to the spec below — every section, no
   placeholders, real copy and real swatches.
6. **Verify** against §10. Fix anything that fails. Never report "done" on
   unchecked work.
7. **Deliver** with the artifacts named in §9.

---

## 2 · THE BRAND IN ONE BREATH (context you must internalize)
- **Name:** AXIOM — *Human Performance & Longevity*.
- **Category:** Verified research peptides, clinical red-light therapy, recovery,
  wellness, and apparel — a multi-category house held to **one standard**.
- **One-line pitch:** *"Human performance, engineered for the long run."*
- **Positioning:** The considered, clinical-grade system for people who train for
  **decades, not weeks**. Short-term results, engineered to last.
- **Market / HQ:** Jakarta, Indonesia. Prices in **IDR (Rp)**. Bilingual reach
  (English + Bahasa Indonesia). WIB business hours.
- **Proof pillars:** HPLC/MS-tested ≥98% purity · Certificate of Analysis per lot
  · clinical-wavelength devices (660 + 850 nm) · cold-chain logistics · discreet,
  tamper-evident packaging · direct human support.
- **Compliance spine (non-negotiable):** Peptides are **Research Use Only (RUO),
  in-vitro** — never dosing, administration, cycling, or medical advice. The
  brand's restraint *is* its credibility. Every guideline must preserve this.
- **The five pillars** (the brand's mental model — use everywhere):
  1. **Peptide Science** — research-grade, HPLC/MS-verified.
  2. **Therapy & Recovery** — clinical red-light / photobiomodulation hardware.
  3. **Wellness** — antioxidants, NAD⁺, cellular-energy, daily baseline.
  4. **Longevity** — senescence, cellular-ageing, copper-peptide compounds.
  5. **Apparel** — neutral, precise performance wear + everyday carry.

**Brand character (the feel every asset must carry):** clinical but warm,
precise, understated, confident without hype. Laboratory rigor with the warmth of
lamplight on bronze. Editorial, airy, unhurried. *Never* neon-supplement,
bro-science, or loud.

---

## 3 · BRAND DNA — HARD-EXTRACTED TOKENS (use verbatim; these are the truth)

### 3.1 Color system
The palette is a **warm near-black canvas + bone-white ink + bronze/copper
accent**. No purple, no cool blue, no pure black, no pure white.

| Role | Token | HEX / value | Use |
|---|---|---|---|
| Canvas / base | `--bg` | `#070605` | Primary background (warm near-black) |
| Ink / primary text | `--ink` | `#F2EDE5` | Headlines, body on dark |
| Muted text | `--muted` | `#9C9488` | Secondary copy, labels |
| Muted deep | `--muted-2` | `#6A635A` | Tertiary, meta, captions |
| Accent (core) | `--accent` | `#C88A4E` | Bronze — links, marks, key emphasis |
| Accent bright | `--accent-bright` | `#E7B173` | Lit copper — highlights, gradient top |
| Accent deep | `--accent-deep` | `#7C4C24` | Shadow bronze — gradient base, depth |
| Accent soft | `--accent-soft` | `rgba(200,138,78,.14)` | Tinted fills, chips |
| Accent line | `--accent-line` | `rgba(200,138,78,.34)` | Accent hairlines |
| Hairline | `--line` | `rgba(242,237,229,.12)` | Dividers, borders |
| Hairline strong | `--line-2` | `rgba(242,237,229,.22)` | Button borders, inputs |
| Hairline soft | `--line-soft` | `rgba(242,237,229,.06)` | Faint internal rules |
| Accent gradient | `--accent-grad` | `linear-gradient(120deg,#E7B173 0%,#C88A4E 46%,#9A5F2C 100%)` | Marks, glows, hero energy |
| Selection | — | bg `#C88A4E`, text `#0A0704` | Text selection |

**You must extend** (guidelines gap to fill, staying in-palette):
- **Light-mode / print equivalents:** define a bone-paper canvas (`#F2EDE5`-ish)
  with `#070605` ink and the same bronze accent, for stationery and documents.
- **Semantic states:** success/verified (reuse bronze or a restrained sage that
  doesn't fight the palette), warning, error, info — muted, never saturated.
- **Tints & shades ramp:** publish a 50→900 step ramp for bronze and for the
  warm-neutral grays so product/UI teams don't guess.
- **Accessibility:** give WCAG contrast pairs (ink-on-bg passes AA; specify which
  accent uses are decorative vs. text, since bronze on near-black is borderline
  for small text — document the safe minimum size/weight).

### 3.2 Typography
| Role | Family | Weights | Notes |
|---|---|---|---|
| Display / headlines | **Jost** (fallback: Century Gothic, system geometric sans) | 300, 400, 500 | Geometric, airy. Headlines run **light (300)**. Negative tracking `-0.01em` on large sizes. |
| Body / UI / labels | **Inter** (fallback: system-ui, Helvetica Neue, Arial) | 300, 400, 500, 600 | Body 400; leads 300; labels 500. Tabular numerals on stats (`tnum`, `font-variant-numeric`). |
| Mono / data | Inter (used as pseudo-mono) | — | Numbers, prices, spec tables. |

**Signature type treatments (codify these as rules):**
- **Wordmark spacing:** the AXIOM wordmark is Jost, wide-tracked
  (`letter-spacing:.44em`), with a small 500-weight subline beneath at
  `.42em` tracking (e.g. "Human Performance & Longevity").
- **Micro-labels / kickers / eyebrows:** Inter, ~10.5px, **uppercase**,
  `letter-spacing:.32–.34em`, weight 500, colored `--muted`. This is the brand's
  most-used detail — appears above nearly every section.
- **Display headlines:** Jost 300, `clamp(28px,5vw,72px)`, line-height ~1.02–1.08;
  emphasis words rendered in `--muted` via `<em>` (italic-off, color-shift, *not*
  slanted) — e.g. "Human performance, *engineered for the long run.*"
- **Numerals:** always tabular in stats, prices, CoA tables.

Specify the full type scale (display XL→XS, body L/M/S, label, caption) with
size/line-height/tracking/weight/color for each, in one table.

### 3.3 Logo & marks
- **Symbol:** an abstract **"A" peak + orbit** — a bronze polyline forming an
  apex (points `24,74 → 38,26 → 52,74`) beside a bronze ring (`circle cx70 cy52
  r16`), stroke-linecap round, on the `#070605` canvas. Reads as *summit +
  cycle / performance + longevity*.
- **Wordmark:** "AXIOM" in wide-tracked Jost, optional subline.
- **Lockups to specify:** (a) symbol only, (b) horizontal symbol + wordmark,
  (c) stacked, (d) wordmark + subline. Define clear-space (min = ring diameter),
  minimum sizes (px + mm), and monochrome (all-ink, all-bronze, knockout) versions.
- **Misuse rules:** no recolor outside palette, no stretch, no drop-shadow, no
  gradient fills on the symbol beyond the sanctioned `--accent-grad`, no rotation,
  no placing on busy/low-contrast imagery without the scrim (§3.5).
- Provide the favicon spec already in use (SVG, bronze stroke on `#070605`).

### 3.4 Layout, grid & spacing
- **Max width:** 1280px content container; gutter padding ~34px (`--pad`),
  responsive down.
- **Section rhythm:** generous vertical padding (~110px desktop). Airy, never dense.
- **Section header pattern:** two-column — a narrow left "lead-col"
  (`01 / Focus` index number + kicker) and a right column (Jost headline + muted
  lead). Collapses to one column under 760px.
- **Hairline dividers** (`--line`) separate every major block. Thin rules are a
  core brand texture, not decoration to omit.
- **Meta/stat strips:** equal-width cells divided by soft vertical rules, each a
  tiny uppercase key + a Jost value (e.g. "Peptide purity / ≥ 98%",
  "Catalogue / 57", "Pillars / 05").
- Publish an 8-pt (or the site's actual) spacing scale and the grid columns.

### 3.5 Imagery, iconography & texture
- **Icons:** **Phosphor Icons** (thin/regular weight), monoline, bronze or ink.
  Name the exact set and weight; never mix icon families.
- **Signature background:** an **additive-blended bronze particle field** — points
  advected by curl-noise flow, colored `#7C4C24 → #E7B173` by depth, drifting
  upward (a "longevity current"), reactive to cursor. This is the brand's hero
  texture. Document a static fallback (gradient + grain) for print/email.
- **Scrim rule:** dark left-to-transparent gradient behind text over any imagery
  or the particle field, so ink always clears contrast.
- **Photography direction (guidelines gap to fill):** define art direction —
  clinical macro (vials, lyophilate, HPLC traces, CoA paper), warm-lit lab and
  recovery scenes, neutral apparel on warm-neutral seamless. Bronze/amber light,
  deep shadow, no clinical-cold blue, no stocky gym clichés. Give do/don't frames.
- **Grain/noise:** subtle film grain is on-brand; specify opacity ceiling.

### 3.6 Motion & interaction (brand-level, codify the principles)
- **Reveal:** elements fade + rise on scroll (IntersectionObserver), gentle
  stagger. Respect `prefers-reduced-motion` — always ship a static equivalent.
- **Easing:** slow, expo-out / `cubic-bezier(.16,1,.3,1)`; low bounce; unhurried.
- **Custom cursor** (fine pointers): a lagging ring + dot, ring widens on
  interactive targets. **Magnetic hover** on buttons/links (strength ~0.32).
- **Scroll:** progress bar in bronze; nav hides on scroll-down, shows on
  scroll-up.
- **Principle statement:** motion should feel *engineered and calm* — precision
  instruments, not carnival. Nothing flashes, nothing bounces hard.

### 3.7 Voice & tone
- **Personality:** the exacting lab director who is also a coach for the long
  game — precise, quietly confident, plain-spoken, never hyped.
- **Do:** short declaratives. "One standard." "Verified, documented, sourced
  right." "Engineered for the long run." Lead with proof (purity %, CoA, nm).
  Use the "one standard / one system" refrain. Metric, specific, unshowy.
- **Don't:** superlatives, miracle claims, emojis in body, exclamation marks,
  dosing or medical guidance, fear-selling.
- **Compliance voice:** where peptides appear, state RUO/in-vitro plainly and
  without apology; the disclaimer is part of the brand's honesty, set it in muted
  text but never bury it illegibly.
- **Lexicon:** *standard, verified, documented, protocol, lot, purity, clinical,
  research-grade, longevity, the long run, compound, cold-chain, Certificate of
  Analysis.* Avoid: *miracle, guaranteed, cure, anti-aging (as claim), stack/cycle
  (as advice).*
- Provide **10+ real copy examples** — headlines, product blurbs, a compliant
  disclaimer, a CTA, an error message, an email intro — all in AXIOM voice.

---

## 4 · BRAND BOOK — REQUIRED TABLE OF CONTENTS
Deliver every section. Each must contain real, usable content — not lorem, not
"TBD."

1. **Cover** — logo, "Brand Guidelines", version, date.
2. **Brand foundation** — mission, vision, positioning statement, the "engineered
   for the long run" promise, values, the five pillars, target audience &
   personas, competitive/tonal landscape, brand architecture (house-of-brands vs.
   branded-house — here: one master brand, five pillars).
3. **Brand story & messaging** — narrative, elevator pitch (15/30/60-word),
   tagline + approved alternates, value props per pillar, messaging matrix by
   audience, boilerplate (short/long), the compliance/RUO messaging standard.
4. **Verbal identity** — voice principles, tone-by-context table (marketing vs.
   product vs. legal vs. support), grammar/style rules (IDR formatting `Rp
   1.600.000`, units, numerals, capitalization of "AXIOM"), lexicon &
   words-to-avoid, worked copy examples.
5. **Logo system** — all lockups, clear-space, min sizes, color versions,
   placement, misuse gallery, co-branding/partner-lockup rules, downloadable
   asset index.
6. **Color** — full palette table (§3.1), tints/shades ramps, semantic states,
   light/print equivalents, accessible pairings + contrast ratios, usage
   proportions (canvas-dominant, bronze as ≤10% accent).
7. **Typography** — families, licensing/webfont loading, full type scale table,
   the signature treatments (§3.2), pairing rules, fallback stacks, do/don't.
8. **Layout & grid** — container, columns, spacing scale, the two-column section
   header, hairline system, meta/stat strips, responsive breakpoints.
9. **Iconography & imagery** — Phosphor spec, particle-field spec + static
   fallback, photography art direction with example frames, grain/texture,
   the scrim rule.
10. **Motion & interaction** — principles, easing tokens, reveal/stagger, cursor,
    magnetic hover, reduced-motion mandate.
11. **Applications** — see §5.
12. **Compliance & legal identity** — RUO/in-vitro standard, disclaimer library,
    age/acknowledgement-gate copy, CoA visual standard, packaging-claim rules,
    per-jurisdiction caution language.
13. **Design tokens & handoff** — see §6.
14. **Governance** — approval workflow, versioning, contact/owner, what needs
    sign-off, how to request assets.

---

## 5 · APPLICATIONS TO MOCK UP (show, don't just tell)
Produce on-brand mockups for:
- **Digital:** website hero + section, product card & detail, the reference/CoA
  drawer, the acknowledgement gate, email templates (quote reply, order,
  newsletter), social templates (post, story, profile), WhatsApp/ordering touch.
- **Packaging:** peptide vial label + carton (lot no., purity, tamper seal,
  RUO mark), device box, apparel hangtag & neck label, tissue/mailer, sticker.
- **Print & stationery:** business card, letterhead, the **Certificate of
  Analysis** as a designed document, invoice/quote sheet, spec/one-pager.
- **Merch/apparel:** tee, oversized hoodie, cap, steel bottle, duffel — neutral
  and precise, logo restraint.
- **Environmental (optional):** trade-booth / lab signage.

For each: show correct color proportion, type hierarchy, logo lockup, and spacing.

---

## 6 · DESIGN TOKENS & DEVELOPER HANDOFF (ship these files)
- **`tokens.json`** (or W3C Design Tokens format) — every color, type ramp,
  spacing step, radius, hairline, easing, and duration, named as in §3
  (`--bg`, `--ink`, `--accent`, `--accent-grad`, etc.).
- **`brand.css`** — the `:root` custom-property block, ready to drop in
  (mirror the site's variables exactly so code and guidelines never drift).
- **Tailwind / SCSS map** (optional) — same tokens for build pipelines.
- **Asset index** — logo SVGs (all lockups + favicon), icon reference, particle
  field module + static fallback image, OG image template (`og.svg`).
- Keep token names **identical** to the live site so the guidelines are the
  single source of truth, not a fork.

---

## 7 · «OPTIONAL INPUTS — fill if you have them»
- Legal entity / registered name: «___»
- Primary + secondary markets beyond Indonesia: «___»
- Brand owner / approver & contact: «___»
- Any fixed partner or retailer co-brand rules: «___»
- Existing font licenses (Jost/Inter are open — confirm): «___»
- Preferred deliverable format(s) (see §9): «___»
- Anything explicitly out of scope: «___»

If blank, proceed with the extracted defaults and **state each assumption**.

---

## 8 · GUARDRAILS (violating any of these fails the deliverable)
- **Stay in-palette.** No purple, no cool blue, no pure black/white, no neon.
- **Bronze is an accent (~≤10% of any surface), never a flood.**
- **Never** add dosing, administration, cycling, or medical-use language to any
  peptide-adjacent asset. RUO/in-vitro framing is mandatory and non-negotiable.
- **Never** overstate: no "cure," "guaranteed," "miracle," clinical claims the
  brand can't document.
- Headlines are **Jost 300**; micro-labels are **uppercase, wide-tracked Inter**.
  Don't swap these.
- Always ship a **reduced-motion / static** path for every animated element.
- Preserve the **hairline + airy-whitespace** discipline; do not crowd.
- Keep token names **in sync with the live site**.

---

## 9 · OUTPUT FORMAT (pick per the user's need; default = A+D)
- **A. Brand book** — a polished multi-page document (web page / PDF-ready), full
  §4 TOC, real content and swatches. *Default primary deliverable.*
- **B. One-page brand sheet** — the essentials on a single screen for quick ref.
- **C. Interactive style guide site** — a live HTML page rendering tokens,
  type specimens, components, and copy examples (house style: dark bronze system,
  matches the source site).
- **D. Token + asset kit** — the §6 files.
- **E. Figma-ready spec** — structured pages/frames if a Figma build is requested.

State which you're producing, then produce it in full.

---

## 10 · VERIFICATION GATES (check before reporting done)
1. **Fidelity:** every color/type/spacing value matches the source site's tokens;
   no invented values contradict it.
2. **Completeness:** all §4 sections present with real content — zero
   placeholders.
3. **Contrast:** ink-on-canvas and all text pairings meet WCAG AA; borderline
   bronze-text uses documented min size/weight.
4. **Compliance:** RUO/in-vitro + disclaimer standard is present and correct
   everywhere peptides appear; no dosing/medical language anywhere.
5. **Voice:** copy examples read as AXIOM (precise, unhyped, proof-led); lexicon
   and words-to-avoid respected.
6. **Applications:** at least the §5 digital + packaging + CoA mockups are shown
   and on-brand.
7. **Handoff:** tokens + brand.css + asset index delivered and names match the
   site.
8. **Reduced-motion:** every motion spec has a static equivalent.
9. **Consistency pass:** logo, palette proportion, type hierarchy, and spacing are
   coherent across every mockup.

Report with: the finished brand book, the token/asset kit, a short list of the
assumptions you made, and a note of any brand gaps you filled (semantic colors,
photography rules, light/print palette) so the owner can ratify them.

---

### APPENDIX — READY-TO-PASTE `:root` (extracted from the AXIOM site)
```css
:root{
  /* canvas + ink */
  --bg:#070605; --ink:#F2EDE5; --muted:#9c9488; --muted-2:#6a635a;
  /* hairlines */
  --line:rgba(242,237,229,.12); --line-2:rgba(242,237,229,.22);
  --line-soft:rgba(242,237,229,.06);
  /* bronze / copper accent system */
  --accent:#C88A4E; --accent-bright:#E7B173; --accent-deep:#7C4C24;
  --accent-soft:rgba(200,138,78,.14); --accent-line:rgba(200,138,78,.34);
  --accent-grad:linear-gradient(120deg,#E7B173 0%,#C88A4E 46%,#9A5F2C 100%);
  /* type */
  --display:"Jost","Century Gothic",system-ui,sans-serif;
  --sans:"Inter",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif;
  --mono:"Inter",system-ui,sans-serif;
  /* layout */
  --maxw:1280px; --pad:34px;
}
```
