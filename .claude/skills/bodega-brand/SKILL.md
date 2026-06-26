---
name: bodega-brand
description: Bodega Creative Studio brand identity & marketing-surface design system — the editorial-monochrome "paper → ink" language (Fraunces / Instrument Sans / JetBrains Mono, a single brand colour per page from the yellow-led spectrum, liquid blobs, film grain, glass sheets, the bodega® wordmark). Use when building or restyling any Bodega-branded PUBLIC surface — marketing landing pages, hero/feature sections, credentials decks, microsites, OG images, email — or when asked to "make it look like Bodega" / "use the Bodega brand". For the internal client portal/app UI use `bodega-portal`; for contracts & invoices use `bodega-documents`.
---

# Bodega Creative Studio — Brand System

Bodega is a Jakarta creative studio for **brand-first social-media ecosystems**. The
public brand is **editorial-monochrome, reinterpreted as a cinematic scroll experience**:
a single bold "paper" colour fills the screen, type is set in a serif/sans/mono trio,
and the page can grade from bright paper toward near-black "ink" at the close.

Tagline to lean on: *"Great brands don't just speak — they shape culture."*

## Use the tokens, don't reinvent them

`reference/brand-tokens.css` is the drop-in foundation (CSS variables, type classes,
layout primitives, the wordmark hook). `reference/wordmark.js` is the exact bodega®
wordmark as a base64 data-URI (`WORDMARK`). Start from these every time.

## The four rules (do these or it stops looking like Bodega)

1. **One brand colour per page.** The background (`--paper`) is a single saturated
   field from the sanctioned spectrum — never a gradient wash of many colours at once.
   `--ink` is the text (near-black `#0d0d0d`, or white when paper is dark/ink).
   - Spectrum: **yellow `#F2E400` (primary/default)** · mint `#2FE4A4` · blue `#2A46E8`
     · pink `#FF2E93` · orange `#FF7A2F` · ink `#0d0d0d` (the close).
   - **Never purple.** Accent (`--ember`) is used *sparingly* and defaults to the ink itself.
2. **Type trio, fixed roles.**
   - **Fraunces** (serif, optical sizing, `letter-spacing:-.025em`, `line-height:.96`) — all
     display/headlines. *Italic Fraunces is the single emphasis device* (`<em>`).
   - **Instrument Sans** (`ss01`,`cv11` features) — body copy.
   - **JetBrains Mono** (uppercase, `letter-spacing:.2em`) — kickers, labels, eyebrows, meta.
3. **Living surface, restrained.** The signature backdrop = soft **liquid blobs**
   (brand-spectrum radial pools drifting on long 17–26s eases) + a faint **film grain**
   overlay (`opacity:.05`, multiply). Content sits on opaque **glass `.sheet`** panels so
   body copy stays crisp; only hero text gets a paper-coloured text-shadow halo over the field.
4. **Motion is calm and physical.** Ease everything on `cubic-bezier(.32,.72,0,1)`; buttons
   `active:scale(.975)`. Honour `prefers-reduced-motion` (kill blob/scroll animation).

## Anatomy of a Bodega marketing page

- **Sticky header** (`backdrop-filter: blur(10px)`, paper at 86% opacity), wordmark left,
  mono nav, ink-filled primary CTA (`.btn.ink`), WhatsApp link uses `#25D366`.
- **Hero**: `min-height:100svh`, content bottom-aligned, oversized Fraunces `.display`,
  mono kicker, sitting directly on the live blob field (with the paper halo).
- **Sections**: generous vertical rhythm, each a "phase" of one idea; `.container` caps at
  1400px; `.rule` hairlines and a faint grid for structure.
- **Close**: paper grades to **ink** — the bright studio resolves into a dark sign-off.
- **Stack of the real site**: no-build single `index.html`, Three.js + GSAP scroll, all CSS
  inline. Keep new surfaces buildless and self-contained unless told otherwise.

## SEO / metadata baseline (carry these on any new page)

`theme-color` = the page's paper colour; full OG + Twitter card; `ProfessionalService`
JSON-LD (studio name, Jakarta address, services: Branding & Identity, Marketing Strategy,
Brand Activation, Web & App Dev, Digital Marketing, Social Media Management); the wordmark
PNG as favicon.

## Pairs with

- **House skills**: `precision-bento` for premium section layout, `framer-motion` for React
  motion — both compose cleanly on top of these tokens.
- **`bodega-portal`** — the internal app/dashboard language (warm glass "Studio OS", different
  accent). Don't mix the two surfaces' palettes.
- **`bodega-documents`** — print-perfect contracts & invoices on the Bodega letterhead.
