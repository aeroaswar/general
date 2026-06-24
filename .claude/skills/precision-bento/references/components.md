# Precision-Bento — Component Catalog

Copy-paste building blocks. All CSS references the `:root` variables defined in
`assets/starter-template.html` (and listed in `design-system.md`). Class names use a neutral,
reusable prefix so the system isn't tied to any one section. Compose these inside the section
shell + bento grid.

## Contents
- [1. Section shell](#1-section-shell)
- [2. Header (intro + CTA)](#2-header-intro--cta)
- [3. CTA pill + circular icon button](#3-cta-pill--circular-icon-button)
- [4. Bento grid + stacks](#4-bento-grid--stacks)
- [5. Media / video panel card](#5-media--video-panel-card)
- [6. Eyebrow label](#6-eyebrow-label)
- [7. Timeline overlay](#7-timeline-overlay)
- [8. Metric overlay](#8-metric-overlay)
- [9. Quote card](#9-quote-card)
- [10. Contact card](#10-contact-card)
- [11. Glass tool-marquee](#11-glass-tool-marquee)
- [12. Responsive rules](#12-responsive-rules)

---

## 1. Section shell

The outer block. Near-white canvas, fluid padding, centered max-width wrapper.

```html
<section class="section">
  <div class="section__wrap">
    <!-- header + bento go here -->
  </div>
</section>
```
```css
.section {
  position: relative;
  min-height: 100vh;
  padding: var(--section-pad);
  background: var(--canvas);
  color: var(--ink);
}
.section__wrap { max-width: var(--max-width); margin: 0 auto; }
```

---

## 2. Header (intro + CTA)

Flex row: a left intro (ultra-light H2 + teal-gray lede) and a right CTA pill pinned to the top.

```html
<header class="section__header">
  <div class="section__intro">
    <h2>Propulsion programs need a partner that can move from concept to certified hardware.</h2>
    <p>EngineTech combines precision manufacturing, hot-fire validation, materials engineering,
       and mission support for programs that cannot afford uncertainty.</p>
  </div>
  <button class="btn-pill" type="button">
    Start a Program
    <i class="ph ph-arrow-up-right" aria-hidden="true"></i>
  </button>
</header>
```
```css
.section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: clamp(24px, 3vw, 42px);
}
.section__intro { max-width: 860px; }
.section__intro h2 {
  max-width: 920px;
  margin: 0;
  color: var(--ink);
  font-size: clamp(29px, 3.2vw, 54px);
  font-weight: 300;
  letter-spacing: 0;
  line-height: 1.08;
}
.section__intro p {
  max-width: 760px;
  margin: 18px 0 0;
  color: var(--text);
  font-size: clamp(14px, 1vw, 17px);
  font-weight: 400;
  line-height: 1.62;
}
```

---

## 3. CTA pill + circular icon button

The **light glass pill** is the primary CTA. The **dark circular icon button** is the inverse
accent (used in the contact card, etc.).

```css
/* Light glass CTA pill */
.btn-pill {
  flex: 0 0 auto;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid var(--hairline);
  border-radius: var(--r-button);
  background: rgb(255 255 255 / 0.78);
  color: var(--ink);
  font: 700 14px/1 inherit;
  cursor: pointer;
  box-shadow: var(--shadow-button);
}
.btn-pill i { font-size: 18px; }

/* Dark circular icon button */
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--hairline);
  border-radius: var(--r-circle, 50%);
  background: var(--ink);
  color: #fff;
  text-decoration: none;
}
.icon-btn i { font-size: 19px; }
```
Icon-only buttons need an `aria-label`.

---

## 4. Bento grid + stacks

A 3-column grid; each column is a **stack** (a nested grid) so cards can split vertically. Use
`minmax(0, 1fr)` columns so media never overflows. A "wide" stack can hold a large feature card.

```html
<div class="bento">
  <div class="bento__stack"><!-- column 1: one tall card or two --></div>
  <div class="bento__stack"><!-- column 2 --></div>
  <div class="bento__stack bento__stack--wide"><!-- column 3 --></div>
</div>
```
```css
.bento {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--grid-gap);
  min-height: clamp(620px, 72vh, 780px);
}
.bento__stack {
  display: grid;
  grid-template-rows: minmax(210px, 0.74fr) minmax(270px, 1fr);
  gap: var(--grid-gap);
}
/* a column whose top card is a large feature panel */
.bento__stack--wide { grid-template-rows: minmax(420px, 1.45fr) auto; }
/* a single card that fills its whole column */
.card--tall { grid-row: 1 / -1; }
```

---

## 5. Media / video panel card

A card filled by looping muted video, with a dark gradient foot for legibility. Always set a
solid fallback background (`--card-neutral`) so it degrades if the video fails.

```html
<article class="card card--media card--tall">
  <video autoplay muted loop playsinline preload="auto">
    <source src="https://assets.mixkit.co/videos/45229/45229-720.mp4" type="video/mp4">
  </video>
  <div class="card__shade"></div>
  <div class="eyebrow">Program Background</div>
  <!-- optional overlay: timeline / metric / marquee -->
</article>
```
```css
.card { position: relative; }
.card--media {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--card-line);
  border-radius: var(--r-card);
  background: var(--card-neutral);
  color: #fff;
  box-shadow: var(--shadow-card);
}
.card--media video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
}
.card__shade { position: absolute; inset: 0; background: var(--shade); }
.card__shade--soft { background: var(--shade-soft); }
```

---

## 6. Eyebrow label

Tiny uppercase tracked label. Centered by default (good on media); `--left` for content cards.

```css
.eyebrow {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: rgb(255 255 255 / 0.78);
  font-size: 11px;
  font-weight: 760;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
.eyebrow--left { justify-content: flex-start; padding: 0; color: var(--label); }
```

---

## 7. Timeline overlay

A pinned-to-bottom list over a media card. Each row: year · dot · title · note.

```html
<div class="timeline">
  <div class="timeline__row">
    <span class="timeline__year">2026</span>
    <span class="timeline__dot"></span>
    <span class="timeline__title">Reusable upper-stage demonstrator</span>
    <span class="timeline__note">Thermal qualification</span>
  </div>
  <!-- more rows -->
</div>
```
```css
.timeline {
  position: absolute;
  z-index: 1;
  right: 20px; bottom: 20px; left: 20px;
  display: grid;
  gap: 12px;
}
.timeline__row {
  display: grid;
  grid-template-columns: 58px 16px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  color: rgb(255 255 255 / 0.76);
  font-size: 12px;
}
.timeline__dot { width: 5px; height: 5px; border-radius: 50%; background: rgb(255 255 255 / 0.62); }
.timeline__title { font-size: clamp(13px, 0.95vw, 15px); font-weight: 650; color: #fff; }
.timeline__note { color: rgb(255 255 255 / 0.58); }
```

---

## 8. Metric overlay

A single giant, ultra-light numeral centered over media, with a caption pinned bottom.

```html
<article class="card card--media">
  <video autoplay muted loop playsinline preload="auto">
    <source src="https://assets.mixkit.co/videos/23211/23211-720.mp4" type="video/mp4">
  </video>
  <div class="card__shade"></div>
  <div class="metric">
    <span class="metric__value">2K</span>
    <span class="metric__label">Highly Qualified Engineers</span>
  </div>
</article>
```
```css
.metric {
  position: absolute;
  inset: 0;
  z-index: 1;
  text-align: center;
  text-shadow: 0 12px 32px rgb(0 0 0 / 0.3);
}
.metric__value {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(82px, 7.4vw, 134px);
  font-weight: 220;
  line-height: 0.9;
}
.metric__label {
  position: absolute;
  right: 24px; bottom: 24px; left: 24px;
  color: rgb(255 255 255 / 0.82);
  font-size: clamp(14px, 1.05vw, 18px);
  line-height: 1.4;
}
```

---

## 9. Quote card

A light **mint-gradient** card: eyebrow, blockquote, attribution. Flex column, space-between.

```html
<article class="card quote">
  <div class="eyebrow eyebrow--left">Mission Voice</div>
  <blockquote>EngineTech brought the discipline we needed: clear design reviews, repeatable
     test data, and hardware that arrived ready for integration.</blockquote>
  <div class="quote__by">
    <strong>Dr. Lena Morris</strong>
    Propulsion Lead, Orbital Systems Group
  </div>
</article>
```
```css
.quote {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--card-pad);
  border: 1px solid var(--card-line);
  border-radius: var(--r-card);
  background: var(--mint-card);
}
.quote blockquote {
  margin: clamp(22px, 2.4vw, 34px) 0 20px;
  color: var(--quote);
  font-size: clamp(15px, 1vw, 18px);
  line-height: 1.62;
}
.quote__by { color: var(--meta); font-size: 14px; line-height: 1.5; }
.quote__by strong { display: block; color: var(--ink); font-size: 15px; font-weight: 600; }
```

---

## 10. Contact card

Mint-gradient card with email + phone and a dark circular icon button pinned right. Reserve
right padding for the absolutely-positioned button.

```html
<article class="card contact">
  <div>
    <div class="eyebrow eyebrow--left">Reach Engineering</div>
    <a class="contact__email" href="mailto:programs@enginetech.com">programs@enginetech.com</a>
    <div class="contact__phone">+1 415 018 4270</div>
  </div>
  <a class="icon-btn" href="mailto:programs@enginetech.com" aria-label="Email programs team">
    <i class="ph ph-arrow-up-right" aria-hidden="true"></i>
  </a>
</article>
```
```css
.contact {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 118px;
  padding: 20px 76px 20px 24px;   /* right pad clears the icon button */
  border: 1px solid var(--card-line);
  border-radius: var(--r-card);
  background: var(--mint-card);
}
.contact__email {
  display: block;
  margin: 14px 0 6px;
  color: var(--ink);
  font-size: clamp(18px, 1.45vw, 24px);
  font-weight: 360;
  text-decoration: none;
}
.contact__phone { color: var(--meta); font-size: 14px; line-height: 1.5; }
.contact .icon-btn { position: absolute; top: 50%; right: 16px; transform: translateY(-50%); }
```

---

## 11. Glass tool-marquee

Two rows of frosted pills scrolling opposite directions, edges masked. **Duplicate each row's
pills once** so the `-50%` translate loops seamlessly. Place inside a media card's bottom.

```html
<div class="marquee">
  <div class="marquee__row marquee__row--1">
    <span class="pill"><i class="ph ph-gear-six" aria-hidden="true"></i>Turbopumps</span>
    <span class="pill"><i class="ph ph-fire" aria-hidden="true"></i>Hot-fire</span>
    <!-- ...rest of set... then the SAME set duplicated once -->
  </div>
  <div class="marquee__row marquee__row--2">
    <span class="pill"><i class="ph ph-cpu" aria-hidden="true"></i>Controls</span>
    <!-- ...set + duplicate... -->
  </div>
</div>
```
```css
.marquee {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 14px;
  overflow: hidden;
  padding: 26px 0 8px;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
}
.marquee__row { display: flex; width: max-content; gap: 12px; }
.marquee__row--1 { animation: marquee-left 24s linear infinite; }
.marquee__row--2 { transform: translateX(-50%); animation: marquee-right 28s linear infinite; }

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 54px;
  padding: 0 16px;
  border: 1px solid var(--glass-line);
  border-radius: var(--r-pill);
  background: var(--glass-fill);
  color: #fff;
  font: 700 13px/1 inherit;
  white-space: nowrap;
  -webkit-backdrop-filter: blur(10px);
          backdrop-filter: blur(10px);
  box-shadow: var(--shadow-glass);
}
.pill i { font-size: 20px; }

@keyframes marquee-left  { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
@keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
```
For a marquee card that is mostly video, use `.card__shade--soft` so the footage stays visible
behind the pills, and set the card to `display:flex; flex-direction:column; justify-content:
space-between;` so the eyebrow sits top and the marquee sits bottom.

---

## 12. Responsive rules

The three signature breakpoints. Add once at the end of the stylesheet.

```css
@media (max-width: 1080px) {
  .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); min-height: auto; }
  .card--tall { min-height: 620px; }
  .bento__stack--wide {       /* let a feature column span full width as a 2-col sub-grid */
    grid-column: 1 / -1;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: minmax(260px, 1fr);
  }
}

@media (max-width: 760px) {
  .section__header { flex-direction: column; }
  .btn-pill { width: 100%; }
  .bento,
  .bento__stack { grid-template-columns: 1fr; grid-template-rows: auto; }
  .bento__stack--wide { grid-column: auto; grid-template-columns: 1fr; grid-template-rows: auto; }
  .card--tall { min-height: 560px; }
  .timeline__row { grid-template-columns: 52px 14px minmax(0, 1fr); }  /* note wraps under */
}

@media (prefers-reduced-motion: reduce) {
  .marquee__row { animation: none; }
}
```
