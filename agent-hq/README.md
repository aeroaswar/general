# Aero HQ

A cozy, tycoon-style isometric office. Each repo is a room, each room has an agent character, and
GitHub Actions bots are small robots. The building and its routines are decoration. **The status is
not:** every badge, board and number is read from the repos by `scripts/collect.py`. If a source
can't be read, the badge says *unknown* instead of guessing.

Built from `AGENT-HQ-BUILD-PROMPT.md`. No build step: three.js r186 + GSAP 3.15 + Geist, all vendored in `vendor/`.

## Run it

```bash
cd agent-hq
python3 scripts/collect.py --watch --fetch &   # writes data/state.json every 60 s
python3 -m http.server 4199                    # open http://localhost:4199
```

**Keep both running.** The page polls `data/state.json` every 60 s. If the collector stops, the HUD
shows **STALE** after 10 minutes.

- **Where the repos are:** the collector expects clones of `mmi`, `mme`, `ijba`, `axiom` and `general`
  side by side (the default `repos_root` is the folder that contains `general/`). Use
  `--root ~/code` or `HQ_REPOS_ROOT` if yours live elsewhere.
- **`--fetch`:** runs `git fetch` on each repo first. Without it you see whatever your clones last pulled.
- **`GITHUB_TOKEN`:** set it to a read-only token to add open PRs and workflow runs. Without it, PR and
  CI fields show *unknown* and "waiting review" falls back to unmerged `claude/*` branches.
- **No `state.json`:** the page loads `data/sample-state.json`, which is fictional data with a **SAMPLE DATA** chip.

## What is live and what is sample

| Room | Agent | Live source | What it shows |
|---|---|---|---|
| MMI · ANI (nickel) | Fox (MMI) + Badger (PT ANI) + Kurs Clerk bot | git, GitHub API, `site/assets/hma.json`, `holidays-id.json` | MMI side: PRs and branches; price basis FRESH or STALE by the 1st/15th rule, rolled past weekends and holidays; the clerk walks to the board only when the HMA bot really ran in the last 10 min. ANI side: **offline**, no data source yet (planned: MMI One). |
| MME · SMU (coal) | Raven (MME, contractor & trader) + Mole (PT SMU, coal IUP holder) | git, GitHub API, `README.md` | MME side: open "Placeholders to confirm" count as pins. SMU side: **offline**, no data source yet. |
| AXIOM Lab | Heron + Gatekeeper | git, GitHub API, `docs/DECISIONS.md`, migration file names | Decision count, one drawer per migration, the `gates` CI result |
| IJBA Race Control | Otter | git, GitHub API, `site/*.html` names | jetsport.id pages. The master plan cabinet is locked and never read. |
| Creative Studio | Raccoon | git, GitHub API, `CLAUDE.md` projects table | One tile per workspace project |
| Supervisor Office (glass corner office, east end) | Aero | aggregate | Review tray: one paper per room waiting on you |
| Coordination Den (basement) | Octopus | aggregate | Task board for all agents. Pipes glow by each room's status. |
| Knowledge Library (basement) | — | file names only | One shelf per repo, one spine per `docs/*.md` / `skills/*.md` |
| Portfolio Den | — | none | Locked door |

**Status rules,** applied in order (`scripts/collect.py → derive_agent_status`, covered by tests):

1. **blocked:** the latest run of a workflow on the room's default branch failed.
2. **working:** a `claude/*` branch got a commit in the last 2 h.
3. **waiting_review:** open PRs exist. Without a token: unmerged `claude/*` branches updated in the last 14 days.
4. **idle:** none of the above.
5. **offline:** the repo clone isn't on this machine.
6. **unknown:** the source needs a token.

## Confidentiality

`mmi`, `mme` and `ijba` are private.

- **Read access:** the collector reads only the files listed in `allowed_reads`. `excluded_paths`
  (the IJBA master plan and `sponsorship/`) can never be read, and never appear even as names.
- **Tests:** they prove the refusal works.
- **Gate:** `scripts/gate.py` fails if a state file mentions an excluded path, or if
  `data/state.json` is tracked by git.
- **Local only:** `data/state.json` is gitignored and stays on your machine. The server binds to
  localhost. Don't deploy this without putting auth in front of it, because it shows commit and PR titles.

## Controls

| | Desktop | Phone / tablet |
|---|---|---|
| Zoom | scroll, `+`/`-` | pinch |
| Rotate (snaps to 4 iso angles) | drag, `Q`/`E`, toolbar | one-finger drag, toolbar |
| Pan | right-drag or shift-drag | two-finger drag |
| Room details | click a room or its label | tap |
| Step inside | double-click, `I` on a label, panel button | double-tap, panel button, on-screen D-pad |
| Basement | `B`, toolbar | toolbar |

- **Keyboard:** Tab moves between rooms, Esc closes the panel or leaves a room.
- **Audio:** music and office sounds are synthesised in the browser (no audio files), off by default,
  and the toggles persist.
- **Lighting:** follows Jakarta time; `?hour=21` previews night.
- **Reduced motion:** with `prefers-reduced-motion`, characters stay seated and the camera doesn't ease.

## Add a room

Add one entry to `rooms` in `agents.config.json` (and its repo under `repos`). Give it a `rect` that
doesn't overlap another room, a door side, an accent and an `agent`. Rooms without bespoke props get a
desk, shelf and status board automatically. If a file needs reading, add it to `allowed_reads`.

## Checks

```bash
python3 -m unittest discover -s tests -v   # status rules, 1st/15th rule, read guards, gate
python3 scripts/gate.py                     # confidentiality gate on the state files
npm i --no-save playwright-core && node scripts/verify.cjs   # browser: errors, layouts, panel, basement, inside
```

- **`verify.cjs`:** fails on any console error or failed request, checks 1440/768/390 px for horizontal
  overflow, steps the simulation to confirm characters walk with no NaNs, and writes screenshots to
  `scratch_shots/` (gitignored).

## Debug handle

`window.__hq` offers:

- `snap(i)`, `jump(roomId)`, `basement(bool)`, `inside(roomId)`, `exitInside()`
- `freeze(bool)`, `frame(seconds)` (deterministic stepping), `inject(state)`, `zoom(z)`, `state`

`?cap=<room-id|basement|0..1>` gives a frozen, seeded frame for screenshots.

## Known limits

- **PR check status:** a PR's own check status isn't read; only workflow runs are. "Blocked" means a
  failure on the default branch.
- **Headless frame rate:** measured in software GL it's not meaningful. On a laptop GPU it is expected
  to be smooth, but that hasn't been measured on a real device yet.
- **Paths:** characters walk straight lines between door and anchor nodes, so they can clip through furniture.
- **ANI, SMU and the portfolio:** these have no data source yet. ANI and SMU share their group's room and read offline; the portfolio is a locked door.
