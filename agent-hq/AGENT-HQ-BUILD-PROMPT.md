# AGENT HQ — MASTER BUILD PROMPT
### A cozy isometric office where my repos and agents live, and every status shown is real.

---

## 0 · HOW TO USE
Point an executing agent at this file with these five repos cloned side by side:
`aeroaswar/general`, `aeroaswar/ijba`, `aeroaswar/mmi`, `aeroaswar/mme`, `aeroaswar/axiom`.
Fields marked « » are mine to answer. If I leave one blank, use the stated default and list it
under "Assumptions" in the final report. Everything else is a **hard requirement**.

---

## 1 · OPERATING PROTOCOL (in order, no skipping)
1. **Context pass.** Read each repo's `README.md` and `CLAUDE.md` (plus `HANDOFF.md`, `docs/DECISIONS.md` and `.github/workflows/` where they exist).
   Post one table: repo → room → which verified signals you can actually read from it.
   Ask at most **5** questions, each with a default, so I can reply "defaults".
2. **Mockup.** Deliver static frames of (a) the whole-office overview, (b) the MMI Trading Desk in
   Step-Inside view and (c) the character lineup. **Stop and wait for my approval.**
3. **Build** in the §8 phases. Each phase must run before the next one starts.
4. **Verify** against §9 in a real browser (Playwright, `/opt/pw-browsers/chromium`).
5. **Report** with screenshots, a live-vs-sample table and the launch steps.

---

## 2 · WHAT THIS IS
"Aero HQ" is a tycoon-style isometric office. Each repo is a room. Each room has an agent character
with its own personality and routine. Bots (GitHub Actions) are small robot characters.
I'm the supervisor upstairs, and the coordinating agent works in a basement den.
**The building is decorative; the status is not.** Every badge, board and number traces back to §4.

---

## 3 · CAST & ROOMS (from the repos — confirm or correct «»)

| Room | Repo | Agent character | Personality | Room props (each mapped to a real file or signal) | Accent (from the repo's own tokens) |
|---|---|---|---|---|---|
| **MMI Trading Desk** | `mmi` | Fox trader | Precise, price-obsessed | HMA/kurs wall board ← `site/assets/hma.json`; HPM calculator screen ← `site/kalkulator.html`; 10 playbook binders ← `skills/mmi-*.md`; tug-and-barge model | brown `#6d5b50` / bone `#e6dcd5` |
| ↳ **Kurs Clerk** (bot) | `mmi` | Tiny brass robot | Punctual | Walks to the board when `update-hma.yml` runs; `set-hma.yml` / `hma-from-image.yml` = "manual entry" animation | — |
| **MME Coal Desk** (connecting door to MMI) | `mme` | Raven with a ledger visor | Formal, ledger-minded | Printed company-profile stack ← `MEI_Company_Profile_2026.pdf`; **"To confirm" pinboard** ← the "Placeholders to confirm" list in `README.md` | paper `#F3EEE6` / red `#A50E12` |
| **AXIOM Lab** | `axiom` | Heron in a lab coat | Exacting, rule-bound | Vial shelf ← `stickers/`; lot-verify scanner ← `/verify`; **decision board** ← rows in `docs/DECISIONS.md`; migration cabinet ← `supabase/migrations/*.sql` count | ground `#070605` / bronze `#C88A4E` |
| ↳ **Gatekeeper** (bot) | `axiom` | Turnstile robot | Strict | Green/red gate ← latest `ci.yml` ("gates") run | — |
| **IJBA Race Control** | `ijba` | Otter in a race suit | High-energy | jetsport.id screen ← `site/index.html`; round calendar ← the calendar table in `site/index.html`; JIA invoice printer ← `tools/jia-invoice.html`; locked filing cabinet = `docs/master-plan.md` + `sponsorship/` (**never opened**, see §5) | navy `#05112B` / blue `#1650B4` / red `#D01530` |
| **Creative Studio** | `general` | Raccoon designer | Playful tinkerer | One monitor per project in the `CLAUDE.md` Projects table (name + port); KOL dashboard prompt on an easel ← `eori-kol-dashboard/` | workspace neutrals |
| **ANI Field Annex** (no repo) | — | Badger in a hard hat | Methodical | Core-sample shelf. Clearly **SAMPLE** unless I give a source «» | — |
| **Glu Studio / Portfolio Den** (no repo) | — | — | — | Locked doors labelled "No repo connected". Default: locked «» | — |
| **Supervisor Office** (top floor, glass wall) | — | **Me, "Aero"** | Decisive, restless | Review desk ← PRs waiting on me across all repos; IJWS helmet; jetski poster | — |
| **Coordination Den** (basement, cutaway, brighter when selected) | all | Octopus orchestrator | Calm, many arms | Pipes run up to every room; task board ← open PRs + failing runs across repos. It has no log of its own, so it shows **aggregates only** | — |

Shared spaces (decorative only): café with a barista NPC, arcade, beanbags, rooftop garden.
**Knowledge Library** (storeroom): one shelf per repo, one spine per `docs/*.md` and `skills/*.md`
file. Show titles only; the reading view opens non-confidential files only (§5).

---

## 4 · DATA CONTRACT — the only source of truth
`scripts/collect.py` (Python stdlib only) reads the local clones and writes
`data/state.json`. The page polls it every 60 s.

**Sources, by verifiability:**
1. **Local git (always available).** Last commit hash, author, subject and date per repo; `claude/*`
   branches and their last commit time. Author `github-actions[bot]` = bot activity.
2. **GitHub API (only if `GITHUB_TOKEN` is set).** Open PRs (draft / ready / review state),
   latest workflow runs (`update-hma.yml`, `set-hma.yml`, `hma-from-image.yml`, `links.yml`, `ci.yml`).
   Without a token, these fields are `null` and render as "unknown", never guessed.
3. **Repo files.** `mmi/site/assets/hma.json` (`hma.period`, `hma.effective`, `kurs.effective`,
   `updatedAt`, `confidence`), `axiom/docs/DECISIONS.md`, the `mme/README.md` placeholders, and the
   `general/CLAUDE.md` projects table.

```json
{ "generated_at": "ISO8601", "mode": "live | sample",
  "rooms": [{ "id": "mmi", "repo": "aeroaswar/mmi",
              "last_commit": { "sha": "", "subject": "", "author": "", "at": "" },
              "open_prs": [{ "number": 0, "title": "", "draft": true, "head": "claude/…", "updated_at": "" }],
              "workflows": [{ "name": "update-hma.yml", "conclusion": "success|failure|null", "at": "" }],
              "signals": { } } ],
  "agents": [{ "id": "fox", "room": "mmi",
               "status": "working|waiting_review|blocked|idle|offline",
               "reason": "human-readable why", "source": "git|github_api|file", "updated_at": "" }] }
```

**Status rules, applied in order:**
- `blocked`: the latest run of a room's workflow on the default branch or an open PR failed.
- `working`: a `claude/*` branch or an open PR got a commit in the last 2 h.
- `waiting_review`: an open PR has had no commit for over 2 h → it also shows on my Supervisor desk.
- `idle`: none of the above, and a readable source exists.
- `offline`: no readable source (ANI, Glu, Portfolio).

**Room-specific signals:**
- **MMI price basis freshness.** HMA resets on the **1st and 15th**, kurs on the **1st** (per the
  repo's HANDOFF invariants). If `hma.effective` is older than the latest reset, the board shows
  "STALE — awaiting ESDM graphic". Show `confidence.*` verbatim on hover.
  Don't recompute HPM; link to the calculator.
- **AXIOM.** Gate status, the number of decisions in `DECISIONS.md`, the migration count.
- **MME.** The number of open placeholders.

**Honesty rules:**
- Decorative routines (walking, typing, coffee) never change or imply a status.
- `mode: sample` → a "SAMPLE DATA" chip on the HUD and on every panel.
- Data older than 10 min (or the page can't reach `state.json`) → a grey "STALE" badge.
- Every badge shows its `reason` and `source` on hover or tap.

---

## 5 · CONFIDENTIALITY (non-negotiable)
`mmi`, `ijba` and `mme` are private and hold commercial data under confidentiality clauses.
- Read **metadata only** from them: commit subjects, PR titles, workflow status, file names, and
  the specific fields listed in §4. **Never** parse or render `ijba/docs/master-plan.md`,
  `ijba/sponsorship/**`, the figures in `mmi/docs/**` (tonnages, counterparties, margins, contract numbers),
  or any personal names and contact details.
- `data/state.json` is **gitignored** and generated locally. Never commit it.
- HQ binds to **localhost only**. Don't add a deploy config. If I later ask for hosting, it goes
  behind auth.
- The Library reading view only opens files from `general` and `axiom` (public). Private repos
  show spines only.

---

## 6 · TECH & CONVENTIONS (match `general/CLAUDE.md`)
- **No-build Three.js + GSAP** (ES modules via an import map, vendored like `mmi/site/assets/vendor/`),
  orthographic isometric camera. Low-poly procedural characters and props; any external asset is CC0
  and credited in the README.
- Lives in `general/agent-hq/` with `index.html`, `js/`, `data/` (gitignored), `scripts/collect.py`,
  and `agents.config.json` (rooms, characters, repo paths). **Adding a repo or agent = one config entry.**
- Serve: `python3 scripts/collect.py --watch & python3 -m http.server 4199` «port».
- Debug: `window.__hq` (snap the camera, freeze a frame, jump to a room, inject sample state) and
  `?cap=<room-id|0..1>` static-capture mode.
- Fonts: Geist for UI. Each room's signage uses that repo's accent tokens (§3) over a pastel base.

---

## 7 · EXPERIENCE
- **Look:** cozy tycoon isometric, pastel walls, warm key light + cool fill, plants and small
  playful details. Lighting follows Jakarta time (WIB) «on by default».
- **Desktop controls:** wheel zoom; left-drag rotate (snaps to 4 isometric angles); right-drag pan.
  Click a room → side panel (agent, role, status + reason, last commit, open PRs, workflows, room
  signals). Double-click → **Step Inside** (WASD/arrows, Esc to exit).
- **Mobile controls:** pinch zoom, two-finger pan, one-finger rotate, tap → bottom sheet, on-screen
  D-pad. Works at 390 px.
- **Motion:** characters walk through doors, face their desks, type, read, chat and take café breaks.
  Bots animate only when their workflow actually ran (an `at` timestamp in the last 10 min); otherwise they idle in a charging dock.
- **Audio:** a lo-fi loop **off by default** and occasional office sounds, both royalty-free, with a
  mute toggle that persists in localStorage.
- **Accessibility:** Tab cycles rooms. With prefers-reduced-motion: static poses, no camera easing,
  panels still complete.

---

## 8 · PHASES
- **P1** Building shell, rooms from `agents.config.json`, camera and touch controls.
- **P2** Characters, bots and the decorative routine state machine.
- **P3** `collect.py`, `state.json`, panels and the live/sample/stale/unknown badges. Test with no
  token, with a token, and with a missing repo.
- **P4** Basement den, Library, Supervisor review desk, shared spaces, audio.
- **P5** Verification (§9), screenshots, README.

---

## 9 · DEFINITION OF DONE
- 0 console errors. ≥50 fps on desktop and ≥30 fps on a mid-range phone during the overview orbit.
- Correct at 1440 / 768 / 390 px. With reduced motion, a full static version renders.
- Tests for `collect.py` cover each status rule plus the MMI 1st/15th freshness rule using fixtures.
- A grep gate fails the build if `state.json` or any rendered string contains content from the §5
  excluded paths.
- The README has: launch command, what must stay running (collector + server), a live-vs-sample table
  per room, the token setup, known limits, and how to add a room.

---

## 10 · OPEN QUESTIONS (defaults in brackets)
1. GitHub token for PR and workflow status? [no, local git only, so PR/CI fields show "unknown"]
2. Rooms for ANI / Glu / Portfolio? [ANI annex as SAMPLE; Glu and Portfolio locked]
3. Should IJBA Race Control show a countdown to an IJWS 2026 date? [no countdown until I give the date]
4. Are the characters right? [as in §3]
5. Port? [4199]
