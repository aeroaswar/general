---
type: project
status: active
area: Jetski Racing & Athletic Identity
tags: [project, jetski, palmares, athlete, results]
---
# 🏆 Palmarès — Race Record

**Status:** active · **Area:** [[Jetski Racing & Athletic Identity]]

## 🎯 Outcome
A single canonical, source-of-truth list of my competitive jetski results
(year · series/round · class · placing · venue). Feeds the palmarès section on
[[aeroaswar.com — Personal Site]] and any press/federation bio.

## Where the data currently lives
- **`aeroaswar-light` site** — palmarès section is data-driven; the structured
  results array lives in the app source (`app.js`, Drive id
  `1nOHlnRwOyaAJJMLFDrffZwWofmg9zgz_`). This is the most complete machine list.
- **Historical PDF** — `Results TIWGP Round 3.pdf` (2012, Thailand IJSBA World Cup
  round) in Drive — earliest documented result on file.
- Race **photos** for the gallery live in the `aeroaswar-light` / `aeroaswar-site`
  asset folders.

## ⚠️ To consolidate (gap)
The authoritative list is still **inside the site code**, not transcribed here.
Next pass: pull the results array from `app.js`, normalise into the table below
(one row per result), and mark the category filter values (so the note and the
site stay in sync).

## Results (to fill from source)
| Year | Series / Round | Class | Placing | Venue |
|---|---|---|---|---|
| 2012 | TIWGP Round 3 | — | — | Thailand |
| … | _pull from `aeroaswar-light/app.js`_ | | | |

## 📦 Log
- 2026-06-20 — note created; sourced from aeroaswar-light app data + TIWGP 2012 PDF (transcription pending).
