#!/usr/bin/env python3
"""Writes data/sample-state.json — clearly fictional data in the collector's schema.

The page falls back to this file when data/state.json is missing (and shows a SAMPLE DATA
chip). It deliberately exercises every status so the UI can be checked without real repos.
Nothing here is read from a repo.
"""
import json
from pathlib import Path

HQ = Path(__file__).resolve().parent.parent
T = "2026-10-02T03:00:00Z"


def room(rid, repo, branch, subject, signals, prs=None, branches=None, workflows=None):
    return {"id": rid, "repo": repo, "branch": branch, "exists": True,
            "last_commit": {"sha": "0000000", "subject": subject, "author": "sample", "at": T},
            "branches": branches or [], "open_prs": prs, "workflows": workflows, "signals": signals}


def lib(*titles):
    return [{"path": f"docs/{t.lower().replace(' ', '-')}.md", "title": t} for t in titles]


state = {
    "generated_at": T, "mode": "sample", "timezone": "Asia/Jakarta",
    "collector": {"version": "sample", "github_token": False, "fetched": False, "errors": []},
    "rooms": {
        "mmi": room("mmi", "sample/mmi", "main", "Sample: refresh the price basis",
                    {"hma": {"hma": {"period": "II", "monthLabel": "Sample month", "effective": "2026-09-15",
                                     "due": "2026-10-01", "fresh": False,
                                     "values": {"ni": 10000.0, "co": 20000.0, "fe": 1.0, "cr": 5.0},
                                     "unit": "USD/DMT"},
                             "kurs": {"effective": "2026-10-01", "rate": 16000.0, "due": "2026-10-01", "fresh": True},
                             "updatedAt": "2026-10-01", "updatedBy": "sample",
                             "confidence": {"hma": "SAMPLE — not a real figure", "kurs": "SAMPLE — not a real figure"},
                             "holidays_provisional": False},
                     "library": lib("Company profile", "Business model", "Pricing", "Operations workflow",
                                    "Glossary")},
                    branches=[{"name": "claude/sample-ops", "at": "2026-10-02T02:40:00Z",
                               "subject": "Sample: ops tracker tweak", "ahead": 3}]),
        "mme": room("mme", "sample/mme", "main", "Sample: profile copy edit",
                    {"placeholders_open": 3, "library": []},
                    prs=[{"number": 1, "title": "Sample: landing page polish", "draft": True,
                          "head": "claude/sample", "updated_at": "2026-09-30T10:00:00Z", "url": "#"}]),
        "axiom": room("axiom", "sample/axiom", "main", "Sample: catalogue fix",
                      {"decisions": 4, "migrations": {"count": 3, "latest": "0003_sample.sql"},
                       "library": lib("Decisions")},
                      prs=[], workflows=[{"file": "ci.yml", "name": "gates", "branch": "main", "status": "completed",
                                          "conclusion": "failure", "at": "2026-10-02T01:00:00Z",
                                          "event": "push", "url": "#"}]),
        "ijba": room("ijba", "sample/ijba", "main", "Sample: race notice draft",
                     {"site_pages": ["index.html", "sample-notice.html"], "library": lib("About", "Overview")},
                     prs=[]),
        "studio": room("studio", "sample/general", "main", "Sample: new hero section",
                       {"projects": [{"name": "sample-site", "port": 4100}, {"name": "sample-hero", "port": 4101},
                                     {"name": "sample-gallery", "port": 4102}], "library": []}),
    },
    "agents": [
        {"id": "fox", "room": "mmi", "kind": "agent", "status": "working", "source": "git",
         "reason": "SAMPLE — commit on claude/sample-ops 20 min ago", "updated_at": T},
        {"id": "kurs-clerk", "room": "mmi", "kind": "bot", "status": "idle", "source": "git",
         "reason": "SAMPLE — last commit yesterday", "active_at": "2026-10-01T09:00:00Z", "updated_at": T},
        {"id": "raven", "room": "mme", "kind": "agent", "status": "waiting_review", "source": "github_api",
         "reason": "SAMPLE — 1 open PR", "updated_at": T},
        {"id": "heron", "room": "axiom", "kind": "agent", "status": "blocked", "source": "github_api",
         "reason": "SAMPLE — ci.yml failed on main", "updated_at": T},
        {"id": "gatekeeper", "room": "axiom", "kind": "bot", "status": "blocked", "source": "github_api",
         "reason": "SAMPLE — ci.yml failed", "active_at": "2026-10-02T01:00:00Z", "updated_at": T},
        {"id": "otter", "room": "ijba", "kind": "agent", "status": "idle", "source": "git",
         "reason": "SAMPLE — no agent activity in the last 2 h", "updated_at": T},
        {"id": "raccoon", "room": "studio", "kind": "agent", "status": "unknown", "source": "none",
         "reason": "SAMPLE — shows how an unreadable source looks", "updated_at": T},
        {"id": "badger", "room": "mmi", "kind": "agent", "status": "offline", "source": "none",
         "reason": "No data source for ANI yet (planned: MMI One)", "updated_at": T},
        {"id": "mole", "room": "mme", "kind": "agent", "status": "offline", "source": "none",
         "reason": "No data source for SMU yet", "updated_at": T},
        {"id": "aero", "room": "office", "kind": "agent", "status": "waiting_review", "source": "aggregate",
         "reason": "SAMPLE — 1 room waiting on your review", "updated_at": T},
        {"id": "octopus", "room": "den", "kind": "agent", "status": "blocked", "source": "aggregate",
         "reason": "SAMPLE — 1 working · 1 waiting review · 2 blocked", "updated_at": T},
    ],
}

if __name__ == "__main__":
    out = HQ / "data" / "sample-state.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(state, indent=2))
    print("wrote", out)
