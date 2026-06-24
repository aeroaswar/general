# anti-ai-design

Tools for keeping this workspace's web work from looking *AI-generated* — i.e. from
defaulting to the statistical-average page (purple gradient, centered hero, three
emoji cards, generic copy) that an AI builder returns when no real decisions are made.

Prompted by Nelson Lee's "Why your website looks AI-generated"
(nelsonxlee.substack.com). That post is blocked by this environment's network
policy, so the material here synthesises the argument from the established genre and
corroborating sources, adapted to this workspace's house skills and bold sports
identity.

## Contents

| File | What it is | Use when |
|---|---|---|
| [`FIELD-GUIDE.md`](./FIELD-GUIDE.md) | The 10 tells, the fix for each, and a pre-ship checklist | Reference / learning; run the checklist before shipping any page |
| [`de-ai-tokens.css`](./de-ai-tokens.css) | Drop-in token system that defaults *away* from the tells | Starting any new project from scratch |
| [`anti-ai-look.skill`](./anti-ai-look.skill) | House-style guardrail skill (runs on top of precision-bento / talvex-dashboard / framer-motion) | Generating or reviewing a build; "de-AI this" |
| [`AUDIT-index-html.md`](./AUDIT-index-html.md) | The guide applied to the live KOL dashboard (`../index.html`) | Worked example; record of the indigo fix |

## The whole idea in one line

Every "AI-generated" tell is an accepted default. The fix is always the same move:
**replace the default with a specific, brand-anchored decision** — and ask of your
strongest section, *"could a competitor paste this onto their site?"* If yes, it's
averaged. Make it un-pasteable.

## Applied so far

- `../index.html` — retuned the lone Tailwind-`indigo-600` (`#4F46E5`, the #1 AI
  color tell + a "no purple" house-rule violation) to a house cobalt blue
  `#1E40AF`. See the audit for details.
