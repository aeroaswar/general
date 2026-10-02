#!/usr/bin/env python3
"""Agent HQ collector: turns the local repo clones into data/state.json.

Everything the HQ shows as real comes from this file. It reads:
  1. local git (always): last commit, claude/* branches, bot-authored commits;
  2. the GitHub REST API (only when GITHUB_TOKEN is set): open PRs, workflow runs;
  3. a short allowlist of repo files (agents.config.json → allowed_reads).

Anything it cannot read is reported as null / "unknown", never guessed.
Private repos are read for metadata only: a file outside `allowed_reads` is
refused, and a path under `excluded_paths` is refused even if allowlisted.

Usage:
  python3 scripts/collect.py                 # one pass → data/state.json
  python3 scripts/collect.py --watch         # every 60 s
  python3 scripts/collect.py --fetch         # git fetch each repo first
  python3 scripts/collect.py --root ~/code   # where the repo clones live
Standard library only.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from zoneinfo import ZoneInfo

HQ = Path(__file__).resolve().parent.parent
CONFIG_PATH = HQ / "agents.config.json"
STATE_PATH = HQ / "data" / "state.json"
VERSION = "1.0"

STATUSES = ("working", "waiting_review", "blocked", "idle", "offline", "unknown")


# ───────────────────────────── time helpers ─────────────────────────────

def utcnow() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def parse_ts(s: str | None) -> dt.datetime | None:
    if not s:
        return None
    try:
        return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


def iso(t: dt.datetime | None) -> str | None:
    return t.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z") if t else None


def minutes_since(t: dt.datetime | None, now: dt.datetime) -> float | None:
    return None if t is None else (now - t).total_seconds() / 60.0


# ───────────────────────────── repo access ─────────────────────────────

class ReadNotAllowed(Exception):
    """Raised when code tries to read a file the confidentiality rules forbid."""


class Repo:
    def __init__(self, key: str, cfg: dict, root: Path, allowed: list[str], excluded: list[str]):
        self.key = key
        self.cfg = cfg
        self.path = (root / cfg["dir"]).resolve()
        self.github = cfg.get("github")
        self.allowed = set(allowed or [])
        self.excluded = list(excluded or [])
        self.exists = (self.path / ".git").exists()
        self.ref = self._resolve_ref() if self.exists else None

    # git plumbing ---------------------------------------------------------
    def git(self, *args: str, timeout: int = 30) -> str:
        out = subprocess.run(["git", "-C", str(self.path), *args], capture_output=True,
                             text=True, timeout=timeout)
        if out.returncode != 0:
            raise RuntimeError(out.stderr.strip() or f"git {' '.join(args)} failed")
        return out.stdout

    def _try(self, *args: str) -> str | None:
        try:
            return self.git(*args)
        except Exception:
            return None

    def _resolve_ref(self) -> str:
        branch = self.cfg.get("branch")
        cands = [f"origin/{branch}", branch] if branch else []
        head = self._try("symbolic-ref", "--short", "refs/remotes/origin/HEAD")
        if head:
            cands.append(head.strip())
        cands.append("HEAD")
        for c in cands:
            if c and self._try("rev-parse", "--verify", "--quiet", f"{c}^{{commit}}"):
                return c
        return "HEAD"

    @property
    def branch_name(self) -> str:
        if self.ref and self.ref.startswith("origin/"):
            return self.ref.split("/", 1)[1]
        if self.ref == "HEAD":
            return (self._try("rev-parse", "--abbrev-ref", "HEAD") or "HEAD").strip()
        return self.ref or ""

    def fetch(self) -> str | None:
        try:
            self.git("fetch", "--quiet", "--prune", "origin", timeout=120)
            self.ref = self._resolve_ref()
            return None
        except Exception as e:  # network down is normal; report, keep going
            return f"{self.key}: fetch failed ({e})"

    # confidentiality-guarded reads ---------------------------------------
    def _is_excluded(self, path: str) -> bool:
        return any(path == ex or (ex.endswith("/") and path.startswith(ex)) for ex in self.excluded)

    def show(self, path: str) -> str:
        if self._is_excluded(path):
            raise ReadNotAllowed(f"{self.key}:{path} is an excluded path")
        if path not in self.allowed:
            raise ReadNotAllowed(f"{self.key}:{path} is not in allowed_reads")
        return self.git("show", f"{self.ref}:{path}")

    def ls(self, prefix: str) -> list[str]:
        """File names under a directory (names only, never contents)."""
        out = self._try("ls-tree", "--name-only", f"{self.ref}", prefix.rstrip("/") + "/")
        names = [n for n in (out or "").splitlines() if n]
        return [n for n in names if not self._is_excluded(n)]

    # facts ------------------------------------------------------------------
    def last_commit(self) -> dict | None:
        out = self._try("log", "-1", "--format=%H%x1f%s%x1f%an%x1f%cI", self.ref)
        if not out:
            return None
        sha, subject, author, at = out.strip().split("\x1f")
        return {"sha": sha[:7], "subject": subject, "author": author, "at": at}

    def last_commit_by(self, author: str) -> dict | None:
        out = self._try("log", "-1", f"--author={author}", "--format=%H%x1f%s%x1f%cI", self.ref)
        if not out or not out.strip():
            return None
        sha, subject, at = out.strip().split("\x1f")
        return {"sha": sha[:7], "subject": subject, "at": at}

    def branches(self, now: dt.datetime, days: int) -> list[dict]:
        out = self._try("for-each-ref", "--sort=-committerdate",
                        "--format=%(refname:short)%1f%(committerdate:iso-strict)%1f%(subject)",
                        "refs/remotes/origin")
        res = []
        for line in (out or "").splitlines():
            parts = line.split("\x1f")
            if len(parts) != 3:
                continue
            name, at, subject = parts
            short = name.split("/", 1)[1] if "/" in name else name
            if short in ("HEAD", self.branch_name) or name == "origin":
                continue
            if not short.startswith("claude/"):
                continue
            t = parse_ts(at)
            if t is None or (now - t).days > days:
                continue
            ahead = self._try("rev-list", "--count", f"{self.ref}..{name}")
            res.append({"name": short, "at": at, "subject": subject,
                        "ahead": int(ahead) if ahead and ahead.strip().isdigit() else None})
        return res


# ───────────────────────────── GitHub (optional) ─────────────────────────────

def gh_get(path: str, token: str):
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "agent-hq-collector"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def github_facts(full: str, token: str) -> tuple[list | None, list | None, str | None]:
    try:
        pulls = gh_get(f"/repos/{full}/pulls?state=open&per_page=100", token)
        open_prs = [{"number": p["number"], "title": p["title"], "draft": p.get("draft", False),
                     "head": p["head"]["ref"], "updated_at": p["updated_at"], "url": p["html_url"]}
                    for p in pulls]
        runs = gh_get(f"/repos/{full}/actions/runs?per_page=50", token).get("workflow_runs", [])
        latest: dict[tuple, dict] = {}
        for r in runs:  # API returns newest first; keep the first per (file, branch)
            key = (r.get("path", "").split("/")[-1], r.get("head_branch"))
            latest.setdefault(key, {"file": key[0], "name": r.get("name"), "branch": key[1],
                                    "status": r.get("status"), "conclusion": r.get("conclusion"),
                                    "at": r.get("updated_at"), "event": r.get("event"),
                                    "url": r.get("html_url")})
        return open_prs, list(latest.values()), None
    except (urllib.error.URLError, TimeoutError, KeyError, ValueError) as e:
        return None, None, f"{full}: GitHub API failed ({e})"


# ───────────────────────────── status rules ─────────────────────────────

def derive_agent_status(f: dict, now: dt.datetime, th: dict) -> dict:
    """The status rules, applied in order. Pure; covered by tests/test_collect.py."""
    if not f.get("exists"):
        return {"status": "offline", "reason": "Repo clone not found on this machine", "source": "git"}

    wfs, prs, branches = f.get("workflows"), f.get("open_prs"), f.get("branches") or []
    default = f.get("default_branch")

    if wfs is not None:
        failed = [w for w in wfs if w.get("branch") == default and w.get("conclusion") == "failure"]
        if failed:
            w = max(failed, key=lambda w: w.get("at") or "")
            return {"status": "blocked", "source": "github_api",
                    "reason": f"{w['file']} failed on {default} ({w.get('at')})"}

    recent = [b for b in branches
              if (m := minutes_since(parse_ts(b["at"]), now)) is not None and m <= th["working_minutes"]]
    if recent:
        b = recent[0]
        mins = int(minutes_since(parse_ts(b["at"]), now))
        return {"status": "working", "source": "git",
                "reason": f"Commit on {b['name']} {mins} min ago: {b['subject']}"}

    if prs is not None:
        if prs:
            newest = max(prs, key=lambda p: p["updated_at"])
            return {"status": "waiting_review", "source": "github_api",
                    "reason": f"{len(prs)} open PR{'s' if len(prs) != 1 else ''} — newest #{newest['number']} {newest['title']}"}
    else:
        unmerged = [b for b in branches if b.get("ahead") != 0]
        if unmerged:
            return {"status": "waiting_review", "source": "git",
                    "reason": (f"{len(unmerged)} claude/* branch{'es' if len(unmerged) != 1 else ''} "
                               f"updated in the last {th['recent_branch_days']} days and not on {default} "
                               "(PR state unknown without GITHUB_TOKEN)")}

    lc = f.get("last_commit")
    when = lc["at"][:10] if lc else "never"
    return {"status": "idle", "source": "git",
            "reason": f"No agent activity in the last {th['working_minutes'] // 60} h; last commit on {default} {when}"}


def derive_bot_status(b: dict, now: dt.datetime, th: dict) -> dict:
    runs = b.get("runs")
    if runs:
        r = max(runs, key=lambda r: r.get("at") or "")
        m = minutes_since(parse_ts(r.get("at")), now)
        if r.get("status") in ("queued", "in_progress", "waiting"):
            return {"status": "working", "source": "github_api", "reason": f"{r['file']} is running now",
                    "active_at": r.get("at")}
        if r.get("conclusion") == "failure":
            return {"status": "blocked", "source": "github_api",
                    "reason": f"{r['file']} failed on {r.get('branch')} ({r.get('at')})", "active_at": r.get("at")}
        if m is not None and m <= th["bot_active_minutes"]:
            return {"status": "working", "source": "github_api", "reason": f"{r['file']} ran {int(m)} min ago",
                    "active_at": r.get("at")}
        return {"status": "idle", "source": "github_api",
                "reason": f"Last run: {r['file']} {r.get('conclusion')} ({r.get('at')})", "active_at": r.get("at")}

    c = b.get("last_bot_commit")
    if c:
        m = minutes_since(parse_ts(c["at"]), now)
        if m is not None and m <= th["bot_active_minutes"]:
            return {"status": "working", "source": "git", "reason": f"Committed {int(m)} min ago: {c['subject']}",
                    "active_at": c["at"]}
        return {"status": "idle", "source": "git", "reason": f"Last commit {c['at'][:16].replace('T', ' ')}: {c['subject']}",
                "active_at": c["at"]}
    if not b.get("exists"):
        return {"status": "offline", "source": "git", "reason": "Repo clone not found on this machine"}
    return {"status": "unknown", "source": "none",
            "reason": "Workflow runs are only readable with GITHUB_TOKEN set"}


# ───────────────────────────── room signals ─────────────────────────────

def _working_day(d: dt.date, holidays: set[str]) -> bool:
    return d.weekday() < 5 and d.isoformat() not in holidays


def roll_forward(d: dt.date, holidays: set[str]) -> dt.date:
    while not _working_day(d, holidays):
        d += dt.timedelta(days=1)
    return d


def current_due(today: dt.date, anchors_days: tuple[int, ...], holidays: set[str]) -> dt.date:
    """Most recent anchor (rolled forward past weekends/holidays) that has taken effect by `today`."""
    cands = []
    for back in (0, 1, 2):
        y, m = today.year, today.month - back
        while m <= 0:
            y, m = y - 1, m + 12
        for day in anchors_days:
            rolled = roll_forward(dt.date(y, m, day), holidays)
            if rolled <= today:
                cands.append(rolled)
    return max(cands)


def hma_signal(repo: Repo, today: dt.date) -> dict:
    basis = json.loads(repo.show("site/assets/hma.json"))
    holidays, provisional = set(), True
    try:
        hol = json.loads(repo.show("site/assets/holidays-id.json")).get("years", {})
        for y in {str(today.year), str(today.year - 1)}:
            if y in hol:
                holidays.update(hol[y].get("dates", []))
        provisional = not hol.get(str(today.year), {}).get("complete", False)
    except Exception:
        pass
    hma_due = current_due(today, (1, 15), holidays)
    kurs_due = current_due(today, (1,), holidays)
    hma, kurs = basis.get("hma", {}), basis.get("kurs", {})
    eff_h = dt.date.fromisoformat(hma["effective"]) if hma.get("effective") else None
    eff_k = dt.date.fromisoformat(kurs["effective"]) if kurs.get("effective") else None
    return {
        "hma": {"period": hma.get("period"), "monthLabel": hma.get("monthLabel"), "effective": hma.get("effective"),
                "due": hma_due.isoformat(), "fresh": bool(eff_h and eff_h >= hma_due),
                "values": {k: hma.get(k) for k in ("ni", "co", "fe", "cr")}, "unit": hma.get("unit")},
        "kurs": {"effective": kurs.get("effective"), "rate": kurs.get("rate"), "due": kurs_due.isoformat(),
                 "fresh": bool(eff_k and eff_k >= kurs_due)},
        "updatedAt": basis.get("updatedAt"), "updatedBy": basis.get("updatedBy"),
        "confidence": basis.get("confidence"), "holidays_provisional": provisional,
    }


def parse_placeholders(readme: str) -> int:
    count, inside = 0, False
    for line in readme.splitlines():
        if line.startswith("## "):
            inside = line.lower().startswith("## placeholders to confirm")
            continue
        if inside and line.startswith("- "):
            count += 1
    return count


def parse_decisions(md: str) -> int:
    return sum(1 for line in md.splitlines() if re.match(r"^\|\s*\d+\s*\|", line))


def parse_projects(md: str) -> list[dict]:
    out = []
    for line in md.splitlines():
        m = re.match(r"^\|\s*`([^`]+)`\s*\|\s*(\d{4,5})\s*\|", line)
        if m:
            out.append({"name": m.group(1), "port": int(m.group(2))})
    return out


def library_for(repo: Repo) -> list[dict]:
    names = []
    for prefix in ("docs", "skills"):
        for n in repo.ls(prefix):
            if n.endswith(".md"):
                stem = Path(n).stem
                names.append({"path": n, "title": re.sub(r"[-_]+", " ", stem).strip().capitalize()})
    return names


def collect_signals(room: dict, repo: Repo, today: dt.date, errors: list[str]) -> dict:
    sig: dict = {}
    for s in room.get("signals", []):
        try:
            if s == "hma":
                sig["hma"] = hma_signal(repo, today)
            elif s == "placeholders":
                sig["placeholders_open"] = parse_placeholders(repo.show("README.md"))
            elif s == "decisions":
                sig["decisions"] = parse_decisions(repo.show("docs/DECISIONS.md"))
            elif s == "migrations":
                migs = [n for n in repo.ls("supabase/migrations") if n.endswith(".sql")]
                sig["migrations"] = {"count": len(migs), "latest": Path(migs[-1]).name if migs else None}
            elif s == "projects":
                sig["projects"] = parse_projects(repo.show("CLAUDE.md"))
            elif s == "site_pages":
                sig["site_pages"] = [Path(n).name for n in repo.ls("site") if n.endswith(".html")]
            elif s == "library":
                sig["library"] = library_for(repo)
        except ReadNotAllowed:
            raise
        except Exception as e:
            errors.append(f"{room['id']}.{s}: {e}")
            sig[s] = None
    return sig


# ───────────────────────────── main pass ─────────────────────────────

def collect(cfg: dict, root: Path, token: str | None, fetch: bool, now: dt.datetime | None = None) -> dict:
    now = now or utcnow()
    tz = ZoneInfo(cfg.get("timezone", "Asia/Jakarta"))
    today = now.astimezone(tz).date()
    th = cfg["thresholds"]
    errors: list[str] = []
    repos: dict[str, Repo] = {}
    for key, rc in cfg["repos"].items():
        repos[key] = Repo(key, rc, root, cfg["allowed_reads"].get(key, []), cfg["excluded_paths"].get(key, []))
        if fetch and repos[key].exists:
            if (err := repos[key].fetch()):
                errors.append(err)

    rooms_out, agents = {}, []
    for room in cfg["rooms"]:
        rid = room["id"]
        if room.get("kind") != "repo":
            continue
        repo = repos[room["repo"]]
        facts = {"exists": repo.exists, "default_branch": repo.branch_name, "open_prs": None, "workflows": None}
        rec = {"id": rid, "repo": repo.github, "branch": repo.branch_name, "exists": repo.exists,
               "last_commit": None, "branches": [], "open_prs": None, "workflows": None, "signals": {}}
        if repo.exists:
            rec["last_commit"] = facts["last_commit"] = repo.last_commit()
            rec["branches"] = facts["branches"] = repo.branches(now, th["recent_branch_days"])
            if token and repo.github:
                prs, wfs, err = github_facts(repo.github, token)
                if err:
                    errors.append(err)
                rec["open_prs"] = facts["open_prs"] = prs
                rec["workflows"] = facts["workflows"] = wfs
            rec["signals"] = collect_signals(room, repo, today, errors)
        rooms_out[rid] = rec

        if room.get("agent"):
            st = derive_agent_status(facts, now, th)
            agents.append({"id": room["agent"]["id"], "room": rid, "kind": "agent", **st,
                           "updated_at": iso(now)})
        for bot in room.get("bots", []):
            bf = {"exists": repo.exists, "runs": None, "last_bot_commit": None}
            if rec["workflows"] is not None:
                bf["runs"] = [w for w in rec["workflows"] if w["file"] in bot.get("workflows", [])]
            if repo.exists and bot.get("commit_author"):
                bf["last_bot_commit"] = repo.last_commit_by(bot["commit_author"])
            st = derive_bot_status(bf, now, th)
            agents.append({"id": bot["id"], "room": rid, "kind": "bot", **st, "updated_at": iso(now)})

    # rooms with no repo: honest placeholders
    for room in cfg["rooms"]:
        if room.get("kind") == "sample" and room.get("agent"):
            agents.append({"id": room["agent"]["id"], "room": room["id"], "kind": "agent", "status": "offline",
                           "source": "none", "reason": "No repo connected — this room is SAMPLE",
                           "updated_at": iso(now)})

    # aggregates: Supervisor desk and Coordination Den
    review = [a for a in agents if a["status"] == "waiting_review"]
    blocked = [a for a in agents if a["status"] == "blocked"]
    working = [a for a in agents if a["status"] == "working"]
    agents.append({"id": "aero", "room": "office", "kind": "agent", "source": "aggregate",
                   "status": "waiting_review" if review else "idle",
                   "reason": (f"{len(review)} room{'s' if len(review) != 1 else ''} waiting on your review"
                              if review else "Nothing waiting on your review"),
                   "updated_at": iso(now)})
    den_status = "blocked" if blocked else "working" if working else "idle"
    agents.append({"id": "octopus", "room": "den", "kind": "agent", "source": "aggregate", "status": den_status,
                   "reason": f"{len(working)} working · {len(review)} waiting review · {len(blocked)} blocked",
                   "updated_at": iso(now)})

    return {"generated_at": iso(now), "mode": "live", "timezone": cfg.get("timezone"),
            "collector": {"version": VERSION, "github_token": bool(token), "fetched": fetch, "errors": errors},
            "rooms": rooms_out, "agents": agents}


def write_state(state: dict, path: Path = STATE_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, ensure_ascii=False))
    os.replace(tmp, path)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", help="directory holding the repo clones (default: config repos_root)")
    ap.add_argument("--watch", action="store_true", help="re-collect every --interval seconds")
    ap.add_argument("--interval", type=int, default=60)
    ap.add_argument("--fetch", action="store_true", help="git fetch each repo before reading it")
    ap.add_argument("--out", default=str(STATE_PATH))
    args = ap.parse_args(argv)

    cfg = json.loads(CONFIG_PATH.read_text())
    root = Path(args.root or os.environ.get("HQ_REPOS_ROOT") or (HQ / cfg["repos_root"])).expanduser().resolve()
    token = os.environ.get("GITHUB_TOKEN") or None
    while True:
        state = collect(cfg, root, token, args.fetch)
        write_state(state, Path(args.out))
        n = len(state["agents"])
        print(f"[{state['generated_at']}] {n} agents · token={'yes' if token else 'no'} · "
              f"errors={len(state['collector']['errors'])} → {args.out}", flush=True)
        for e in state["collector"]["errors"]:
            print("  !", e, file=sys.stderr)
        if not args.watch:
            return 0
        time.sleep(args.interval)


if __name__ == "__main__":
    sys.exit(main())
