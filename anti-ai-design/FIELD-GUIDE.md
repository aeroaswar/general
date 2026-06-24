# The Anti-AI-Generated Design Field Guide

> Inspired by Nelson Lee's "Why your website looks AI-generated" (nelsonxlee.substack.com).
> The Substack post is blocked by this workspace's network policy, so this guide
> synthesises the article's thesis from the established genre and corroborating
> sources rather than quoting it. It's written to plug into this workspace's
> house skills (`precision-bento`, `talvex-dashboard`, `framer-motion`) and the
> bold sports identity in `CLAUDE.md`.

---

## The one-sentence thesis

An AI builder, asked for "a landing page," returns the **statistical average** of
every landing page in its training data — Tailwind defaults, a purple gradient, a
centered hero, three emoji feature cards. It looks *fine*. "Fine" is the problem:
fine is indistinguishable from the million pages it was averaged from. **Looking
AI-generated is not a rendering bug — it's a decision-avoidance signature.** Every
tell below is a place where a default was accepted instead of a choice being made.

The fix is never "add more polish." It's "make one specific, opinionated, slightly
risky decision the average would never make" — and then make the page commit to it.

---

## The 10 tells (and the fix for each)

Each tell is a thing the model defaulted to. The fix is the decision to make instead.

### 1. The purple/blue-violet gradient
**Tell.** `#6366F1 → #8B5CF6`, `indigo-600`, `from-blue-500 to-purple-600`. This is
the single loudest AI signal — it's the Tailwind/shadcn default hue, so it's
over-represented in training data and the model reaches for it by reflex.
**Fix.** Pick a palette from *content*, not from a framework. Pull 2–3 colors from a
real photo, a brand asset, or the subject matter (for this workspace: Merah-Putih
red, daylight turquoise, navy ink — see `aeroaswar-light`). Ban `indigo`/`violet`
unless the brand is *actually* purple. One saturated accent used at ~5% coverage
beats a gradient flooding the hero. (This workspace already encodes "**no purple**"
in `CLAUDE.md` and the talvex spec — keep enforcing it.)

### 2. Centered-everything hero
**Tell.** Center-aligned headline + subhead + two buttons ("Get Started" / "Learn
More"), a faint radial glow behind it, dead-symmetrical. The safest possible layout.
**Fix.** Asymmetry signals authorship. Left-align the type, break the grid, let one
element bleed off-canvas, use real editorial whitespace (intentionally uneven, not
machine-even). A hero earns attention with one bold move — an oversized type set, a
real image, a piece of motion — not perfect symmetry.

### 3. The three-emoji feature row
**Tell.** Three or four cards, each a 🚀 / ✨ / ⚡ emoji, a two-word title, and a
generic sentence. Identical width, identical icon weight, identical copy rhythm.
**Fix.** Use a real icon set with consistent metal (this workspace: **Phosphor**,
thin/regular). Vary the card sizes (a bento, not a row). Make each card say
something only *this* product could say. If a feature card would survive being
pasted onto a competitor's site, it's AI copy — rewrite it.

### 4. One safe sans for everything
**Tell.** Inter (or Geist/Roboto) at one weight for headers and body, no contrast,
no display face, no character.
**Fix.** Pair a face with a voice for display/headlines against a clean body face —
or, if you keep one family, create contrast with *weight and size* (a real type
ramp, big jumps), tracking on caps, and tabular numerals for data. The house stacks
already do this (Italiana on `celeste-marais`, Geist on precision-bento); the tell
is *flatness*, not the font itself.

### 5. Even, rhythmless spacing
**Tell.** Everything is `gap-4`/`py-16`. Equal padding everywhere makes the page
read as a spreadsheet of sections — no hierarchy, no breathing, no emphasis.
**Fix.** Use a spacing *scale* with real range (4 → 8 → 16 → 32 → 64 → 128) and
**vary the vertical rhythm** between sections so the page has a pulse. Tight where
things relate, generous where the eye should rest. Whitespace is a hierarchy tool,
not a margin default.

### 6. Generic, on-the-nose copy
**Tell.** "Seamlessly elevate your workflow." "Unlock the power of…" "Take your X to
the next level." "Empower your team." Em-dash-heavy, triadic, adjective soup.
Confident about nothing specific.
**Fix.** Write like a person who knows the domain. Use the real nouns of the
business (this workspace ships `EN / ID` bilingual UI strings, KOL tiers, race
palmarès — that specificity *is* the anti-AI signal). Cut every sentence that would
be true for any company. Concrete > sweeping.

### 7. Stock geometric blobs & gradient mesh art
**Tell.** Abstract 3D blobs, gradient mesh backgrounds, isometric undraw-style
illustrations, glassmorphism for its own sake. Decoration with no referent.
**Fix.** Earn the imagery. Real photography (the `aeroaswar-light` race gallery),
purpose-built 3D that *means* something (the ocean-shader scrub, the digital-twin
yard), or honest restraint — a clean canvas beats a meaningless mesh.

### 8. Default shadows and default radii
**Tell.** `shadow-lg` on every card, `rounded-xl` everywhere, the exact shadcn
elevation. Uniform, soft, characterless depth.
**Fix.** Design a *small* shadow + radius system (two or three steps, used
deliberately) and apply it with intent — flat where things are grounded, lifted
where they float. Hairline 1px borders + one soft ambient shadow (the talvex
frosted-card recipe) reads as craft; `shadow-lg` on everything reads as a default.

### 9. The perfectly predictable section order
**Tell.** Hero → logos → 3 features → testimonial → pricing → CTA → footer, in that
exact order, every time. The model's most-probable page skeleton.
**Fix.** Order sections by *your* argument, not the template. Lead with proof if
proof is your strength; open with the product if the product sells itself. Cut the
sections you don't need (this workspace's `aeroaswar-light` deliberately drops the
"ventures" section to stay a pure jetski narrative — that edit is the craft).

### 10. Motion that's either absent or canned
**Tell.** No motion at all, or the canned `fade-in-up on scroll` on every element
with identical timing — the AOS.js default.
**Fix.** Motion should have a point of view: a consistent easing personality
(expo-out, low-bounce springs — see the `framer-motion` skill), gentle stagger, and
*reduced-motion* safety. One signature move done well (a velocity pin, a helix
scrub, a word-fill reveal) beats fade-up on everything.

---

## The deeper pattern

Notice that every fix is the same move: **replace an accepted default with a
specific decision.** That's the whole game. AI output looks AI-generated because the
model optimizes for "acceptable to everyone," and acceptable-to-everyone is
memorable to no one. Your edge is the opposite optimization — be *unmistakably*
something, even at the cost of being not-for-everyone.

A useful test before shipping: **"Could a competitor paste this section onto their
site and have it still make sense?"** If yes, it's averaged. Make it un-pasteable.

---

## Pre-ship checklist

Run this before calling any page/section/dashboard "done." Anything unchecked is a
place the average leaked through.

**Color**
- [ ] No `indigo`/`violet`/`purple` unless the brand is literally purple
- [ ] Palette derived from content/brand, not framework defaults
- [ ] One accent at ~5% coverage, not a gradient flooding the hero
- [ ] Semantic colors (success/warn/danger) are distinct and consistent

**Type**
- [ ] A defined type ramp (not 15 ad-hoc sizes) with real jumps for hierarchy
- [ ] Display/body contrast via face *or* weight+size+tracking
- [ ] Tabular numerals on all data/metrics
- [ ] Headline says something only this product could say

**Layout & space**
- [ ] At least one intentional asymmetry / grid-break in the hero
- [ ] Vertical rhythm *varies* between sections (page has a pulse)
- [ ] Spacing comes from a scale with range, not one repeated gap
- [ ] Section order follows the argument, not the template skeleton

**Components**
- [ ] Real icon set at consistent weight (Phosphor) — no emoji as UI icons
- [ ] Feature cards vary in size/role (bento), not an identical row
- [ ] Small, deliberate shadow + radius system — no `shadow-lg` on everything
- [ ] Imagery is real or purpose-built — no meaningless blobs/mesh

**Copy**
- [ ] Zero "seamless / elevate / unlock / empower / leverage / next level"
- [ ] Uses the real nouns of the domain
- [ ] Every sentence fails the "could a competitor say this?" test (i.e., they couldn't)

**Motion**
- [ ] One signature, intentional move — not fade-up on everything
- [ ] Consistent easing personality (expo-out / low-bounce springs)
- [ ] `prefers-reduced-motion` respected

**The final test**
- [ ] Pick the strongest section: a competitor could NOT paste it onto their site

---

## How this maps to the workspace

| If you're building… | Use the skill | …and these tells matter most |
|---|---|---|
| Hero / features / proof / contact | `precision-bento` | #2 centered hero, #3 emoji row, #7 blob art, #8 default shadows |
| React animation | `framer-motion` | #10 canned motion |
| Dashboard / admin / KPI | `talvex-dashboard` | #1 purple, #4 flat type, #5 even spacing, #8 default shadows |
| Any new project from scratch | `de-ai-tokens.css` (this folder) | #1 color, #4 type, #5 spacing, #8 shadows/radii |

The companion files in this folder operationalise the guide:
- **`de-ai-tokens.css`** — a drop-in token system that defaults *away* from the tells.
- **`anti-ai-look.skill`** — bakes these rules into the build workflow.
- **`AUDIT-index-html.md`** — this guide applied to the live KOL dashboard.
