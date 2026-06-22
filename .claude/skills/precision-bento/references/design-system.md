# Precision-Bento — Design System Reference

The complete token system. Use these exact values; they're tuned to hold together. The
canonical `:root` block lives in `assets/starter-template.html` — this file explains each
token and the roles it plays.

## Contents
- [Type](#type)
- [Color](#color)
- [Gradients](#gradients)
- [Spacing & layout](#spacing--layout)
- [Radius](#radius)
- [Shadow](#shadow)
- [Motion](#motion)
- [Icons](#icons)
- [Canonical :root block](#canonical-root-block)

---

## Type

**Font stack** (load Geist as a *variable* font so off-grid weights render):
```
"Geist", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```
Load via Google Fonts: `family=Geist:wght@100..900&family=Inter:wght@100..900`. Always set:
```css
-webkit-font-smoothing: antialiased;
text-rendering: geometricPrecision;
```

**Weight scale (a fingerprint — use these, not just 400/700):**
| Weight | Role |
|--------|------|
| 220 | Giant metric numerals |
| 300 | Display / H2 headlines |
| 360 | Lede email / large soft links |
| 400 | Body copy |
| 600 | Attribution names |
| 650 | Inline emphasis on media (timeline titles) |
| 700 | Buttons, pills, tags |
| 760 | Eyebrow labels (uppercase) |

**Type roles (all fluid via `clamp()`):**
| Role | Size | Weight | Line-height | Letter-spacing | Color |
|------|------|--------|-------------|----------------|-------|
| Display / H2 | `clamp(29px, 3.2vw, 54px)` | 300 | 1.08 | 0 | `#111111` |
| Body / lede paragraph | `clamp(14px, 1vw, 17px)` | 400 | 1.62 | — | `#677070` |
| Eyebrow label | `11px` | 760 | — | `0.18em` (UPPERCASE) | `#758080` (light) / `rgb(255 255 255 / 0.78)` (media) |
| Blockquote | `clamp(15px, 1vw, 18px)` | 400 | 1.62 | — | `#263030` |
| Giant metric | `clamp(82px, 7.4vw, 134px)` | 220 | 0.9 | — | `#ffffff` |
| Metric caption | `clamp(14px, 1.05vw, 18px)` | 400 | 1.4 | — | `rgb(255 255 255 / 0.82)` |
| Email / lede link | `clamp(18px, 1.45vw, 24px)` | 360 | — | — | `#111111` |
| Button / pill text | `14px` (pills `13px`) | 700 | — | — | `#111111` / `#ffffff` |
| Small meta (phone, note) | `12–14px` | 400 | 1.4–1.5 | — | `#6b7676` / muted white |

---

## Color

**Neutrals & ink**
| Token | Value | Use |
|-------|-------|-----|
| Canvas | `#f7f8f8` | Section background (never `#fff`) |
| Ink | `#111111` | Primary text, inverse buttons |
| Body text | `#677070` | Paragraphs / lede |
| Label muted | `#758080` | Eyebrow labels on light |
| Meta muted | `#6b7676` | Secondary meta (phone, role) |
| Quote ink | `#263030` | Blockquote text |
| Card neutral | `#dce3e3` | Solid fallback behind video cards |
| Mint base | `#edf2f2` | Base under mint gradient cards |

**Borders & lines**
| Token | Value | Use |
|-------|-------|-----|
| Hairline (on light/white) | `rgb(17 17 17 / 0.1)` | Buttons, icon buttons |
| Card hairline | `rgb(18 35 35 / 0.09)` | All card edges |
| Glass border | `rgb(255 255 255 / 0.2)` | Frosted pills/tags |

**White-on-media opacity tiers** (text/elements over video or dark shade):
`rgb(255 255 255 / 0.82)` › `/ 0.78` › `/ 0.76` › `/ 0.62` › `/ 0.58`. Use the higher
values for primary text, lower for supporting/decorative (dots, sub-notes).

**Glass fill:** `rgb(255 255 255 / 0.18)` with `backdrop-filter: blur(10px)`.

**Hard rule:** no purple/violet anywhere. Accents stay teal-gray / mint.

---

## Gradients

| Name | Value | Use |
|------|-------|-----|
| Mint card | `linear-gradient(135deg, rgb(255 255 255 / 0.72), rgb(238 244 244 / 0.86)), #edf2f2` | Quote & contact card backgrounds |
| White-glass button | `rgb(255 255 255 / 0.78)` (solid, not gradient) | CTA pill fill |
| Shade foot (standard) | `linear-gradient(180deg, rgb(5 12 14 / 0.3), transparent 34%), linear-gradient(0deg, rgb(5 12 14 / 0.78), transparent 48%)` | Over video so top label + bottom content stay legible |
| Shade foot (soft) | `linear-gradient(180deg, rgb(5 12 14 / 0.18), transparent 34%), linear-gradient(0deg, rgb(5 12 14 / 0.32), transparent 56%)` | Over busier video / when content is lighter |

The shade is two stacked gradients: a short darkening at the **top** (for the eyebrow label)
and a taller darkening from the **bottom** (the "foot," for titles/metrics/marquee).

---

## Spacing & layout

| Token | Value | Use |
|-------|-------|-----|
| Section padding | `clamp(34px, 4vw, 72px) clamp(16px, 3.8vw, 72px)` | `.section` block padding |
| Max content width | `1820px` | Centered wrapper (`--max-width`) |
| Grid gap | `clamp(14px, 1.25vw, 22px)` | Between bento cards and within stacks |
| Card padding | `24px` | Inner padding of content cards |
| Header→grid gap | `clamp(24px, 3vw, 42px)` | Header margin-bottom |
| Grid min-height | `clamp(620px, 72vh, 780px)` | Desktop bento height target |

**Breakpoints:**
- **`max-width: 1080px`** — 3-col bento → 2 cols; min-height auto; a wide "feature" stack can
  span `grid-column: 1 / -1` as a 2-col sub-grid.
- **`max-width: 760px`** — everything → single column; header switches to
  `flex-direction: column` and the CTA pill goes full width; multi-col overlays simplify.

---

## Radius

| Token | Value | Use |
|-------|-------|-----|
| Card | `18px` | All cards / media panels |
| Pill / tag | `14px` | Marquee tags |
| Button | `999px` | CTA pill |
| Circle | `50%` | Icon buttons (42px square) |

Never collapse these to one uniform radius.

---

## Shadow

| Token | Value | Use |
|-------|-------|-----|
| Card lift | `0 22px 60px rgb(21 34 34 / 0.08)` | Ambient depth on feature/media cards |
| Button | `inset 0 1px 0 rgb(255 255 255 / 0.95), 0 18px 44px rgb(31 44 44 / 0.08)` | CTA pill (top sheen + soft cast) |
| Glass inset | `inset 0 1px 0 rgb(255 255 255 / 0.24)` | Top highlight on frosted pills |
| Metric text | `0 12px 32px rgb(0 0 0 / 0.3)` (as `text-shadow`) | Giant numeral legibility on video |

---

## Motion

**Marquee** — two rows scrolling opposite directions, content duplicated once for a seamless
loop, edges masked:
```css
mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
/* row 1 */ animation: marquee-left 24s linear infinite;   /* 0 → -50% */
/* row 2 */ animation: marquee-right 28s linear infinite;  /* -50% → 0 (start translated) */
@keyframes marquee-left  { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
@keyframes marquee-right { from { transform: translateX(-50%); } to { transform: translateX(0); } }
```

**Video** — `object-fit: cover; transform: scale(1.02);` (the slight scale hides edge seams),
attributes `autoplay muted loop playsinline preload="auto"`.

**Reduced motion** — always include:
```css
@media (prefers-reduced-motion: reduce) {
  .marquee__row { animation: none; }
  /* optionally pause video via JS, or accept the first frame */
}
```

---

## Icons

**Phosphor Icons**, regular weight, via CDN:
```html
<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css">
```
Usage: `<i class="ph ph-arrow-up-right" aria-hidden="true"></i>`. Sizes: **18–20px** inline.
Common picks: `ph-arrow-up-right` (CTAs), `ph-gear-six`, `ph-fire`, `ph-gauge`, `ph-atom`,
`ph-wrench`, `ph-cpu`, `ph-wave-sine`, `ph-shield-check`, `ph-rocket-launch`,
`ph-chart-line-up`. Decorative icons get `aria-hidden="true"`.

---

## Canonical :root block

This is the source of truth, also embedded in `assets/starter-template.html`:

```css
:root {
  /* layout */
  --max-width: 1820px;
  --section-pad: clamp(34px, 4vw, 72px) clamp(16px, 3.8vw, 72px);
  --grid-gap: clamp(14px, 1.25vw, 22px);
  --card-pad: 24px;

  /* color */
  --canvas: #f7f8f8;
  --ink: #111111;
  --text: #677070;
  --label: #758080;
  --meta: #6b7676;
  --quote: #263030;
  --card-neutral: #dce3e3;
  --mint-base: #edf2f2;

  /* lines */
  --hairline: rgb(17 17 17 / 0.1);
  --card-line: rgb(18 35 35 / 0.09);
  --glass-line: rgb(255 255 255 / 0.2);
  --glass-fill: rgb(255 255 255 / 0.18);

  /* gradients */
  --mint-card: linear-gradient(135deg, rgb(255 255 255 / 0.72), rgb(238 244 244 / 0.86)), #edf2f2;
  --shade: linear-gradient(180deg, rgb(5 12 14 / 0.3), transparent 34%), linear-gradient(0deg, rgb(5 12 14 / 0.78), transparent 48%);
  --shade-soft: linear-gradient(180deg, rgb(5 12 14 / 0.18), transparent 34%), linear-gradient(0deg, rgb(5 12 14 / 0.32), transparent 56%);

  /* radius */
  --r-card: 18px;
  --r-pill: 14px;
  --r-button: 999px;

  /* shadow */
  --shadow-card: 0 22px 60px rgb(21 34 34 / 0.08);
  --shadow-button: inset 0 1px 0 rgb(255 255 255 / 0.95), 0 18px 44px rgb(31 44 44 / 0.08);
  --shadow-glass: inset 0 1px 0 rgb(255 255 255 / 0.24);
}
```
