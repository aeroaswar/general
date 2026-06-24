# Audit — `index.html` (Wonderful Indonesia · KOL Program 2026 dashboard)

The field guide applied to the live dashboard. **Headline: it already reads as
human-designed, not AI-generated.** It follows the `talvex-dashboard` house system
and shows real craft signals. The findings below are subtle; one was safe to fix
in place, the rest are recommendations (delivered as `de-ai-tokens.css`) rather than
risky sweeping edits to a 165 KB working file.

## Score against the 10 tells

| # | Tell | Verdict | Evidence |
|---|---|---|---|
| 1 | Purple/blue-violet gradient | ⚠️ → ✅ fixed | One Tailwind-`indigo-600` `#4F46E5` woven into 6 spots — see fix below |
| 2 | Centered-everything hero | ✅ pass | App-shell layout (sidebar + content grid), not a centered marketing hero |
| 3 | Three-emoji feature row | ✅ pass | Real inline SVG icons; no emoji used as UI |
| 4 | One safe sans, flat | ⚠️ minor | Inter only — defensible for a data tool, but type is one-family-flat |
| 5 | Even, rhythmless spacing | ✅ mostly | Deliberate density system with a "compact" toggle |
| 6 | Generic AI marketing copy | ✅ pass | **Zero** hits for seamless/elevate/unlock/empower/leverage; real domain nouns (KOL tiers, EMV, `EN / ID`) |
| 7 | Stock blobs / gradient mesh | ✅ pass | Two soft radial background washes only — restrained, not blob art |
| 8 | Default shadows & radii | ⚠️ minor | Hairline + soft shadow recipe is good; **radii are scattered** (2,3,5,6,8,9,10,11,12,18,999px) |
| 9 | Template section order | ✅ pass | Ordered by the 6 requested modules, not a marketing skeleton |
| 10| Canned/absent motion | ✅ pass | Purposeful dashboard transitions; not fade-up-on-everything |

**Craft signals present** (the opposite of AI-default): `letter-spacing` used 11×,
`tabular-nums` on metrics, the `·` separator 55×, a warm-tinted near-white canvas
(`#F3F5F9`, not pure white), a working dark mode, bilingual `EN / ID` strings.

## Applied fix (committed)

**Retuned the lone indigo off purple.** `#4F46E5` is Tailwind `indigo-600` — the
exact hue the "AI look" calls out, and a violation of this workspace's own standing
**"no purple"** rule (`CLAUDE.md`, talvex spec §2). Changed to `#1E40AF` (a deep
cobalt blue that was *already* in the palette), at 4 sites; the 3 `var(--indigo)`
status-chip references inherited the new value automatically.

| Location | Before | After |
|---|---|---|
| `:root --indigo` (line 18) | `#4F46E5` | `#1E40AF` |
| Avatar gradient (line 405) | `…,#4F46E5` | `…,#1E40AF` |
| `TIER.macro` color (line 533) | `#4F46E5` | `#1E40AF` |
| Timeline "Reporting" phase (line 609) | `#4F46E5` | `#1E40AF` |

Verified: `grep -c '#4F46E5' index.html` → `0`; no other purple/violet hexes remain.
This is semantics-preserving (macro tier / negotiating / consideration chips stay
distinct) and visually low-risk — `#1E40AF` was already a house blue.

## Recommendations (not auto-applied — would touch the whole file)

These are real but lower-confidence and would mean a wide refactor of a working
dashboard, so they're offered as options rather than pushed. `de-ai-tokens.css`
in this folder is the ready-made remedy for all three.

1. **Consolidate the type scale.** ~20 ad-hoc `font-size` values
   (9 → 30px). Map them onto the 8-step ramp in `de-ai-tokens.css` so hierarchy
   comes from a defined ladder, not improvisation. *(Impact: medium. Risk: medium —
   touches many rules.)*
2. **Consolidate radii.** 11 distinct `border-radius` values → the 3-step set
   (`--r-sm 8 / --r 14 / --r-lg 22` + pill). *(Impact: low. Risk: low.)*
3. **Optional type contrast.** If you ever want the dashboard to feel less
   single-family-flat, add a display/numeric face for big KPI numbers (keep Inter
   for body). *(Impact: low. Optional — Inter-only is fine for an ops tool.)*

Say the word and I'll apply 1 + 2 as a follow-up commit.

## Bottom line

This dashboard is **not** an example of the AI-generated look — it's a
counter-example. The only genuine tell was the indigo, now fixed. The rest is
polish-level consolidation, available on request.
