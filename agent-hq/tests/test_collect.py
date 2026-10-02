"""Tests for scripts/collect.py — status rules, price-basis freshness, confidentiality guards.

Run:  python3 -m unittest discover -s tests -v
"""
import datetime as dt
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

HQ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HQ / "scripts"))
import collect as C  # noqa: E402

TH = {"working_minutes": 120, "stale_state_minutes": 10, "bot_active_minutes": 10, "recent_branch_days": 14}
NOW = dt.datetime(2026, 10, 2, 4, 0, tzinfo=dt.timezone.utc)


def ago(**kw):
    return C.iso(NOW - dt.timedelta(**kw))


class AgentStatusRules(unittest.TestCase):
    def base(self, **kw):
        f = {"exists": True, "default_branch": "main", "open_prs": None, "workflows": None, "branches": [],
             "last_commit": {"at": "2026-09-30T10:00:00Z"}}
        f.update(kw)
        return C.derive_agent_status(f, NOW, TH)

    def test_missing_repo_is_offline(self):
        self.assertEqual(C.derive_agent_status({"exists": False}, NOW, TH)["status"], "offline")

    def test_failed_workflow_on_default_branch_blocks(self):
        wfs = [{"file": "ci.yml", "branch": "main", "conclusion": "failure", "at": ago(hours=1)}]
        r = self.base(workflows=wfs, open_prs=[])
        self.assertEqual((r["status"], r["source"]), ("blocked", "github_api"))

    def test_failure_on_a_feature_branch_does_not_block(self):
        wfs = [{"file": "ci.yml", "branch": "claude/x", "conclusion": "failure", "at": ago(hours=1)}]
        self.assertEqual(self.base(workflows=wfs, open_prs=[])["status"], "idle")

    def test_recent_claude_commit_is_working(self):
        r = self.base(branches=[{"name": "claude/a", "at": ago(minutes=30), "subject": "s", "ahead": 2}])
        self.assertEqual((r["status"], r["source"]), ("working", "git"))

    def test_commit_older_than_window_is_not_working(self):
        r = self.base(branches=[{"name": "claude/a", "at": ago(minutes=121), "subject": "s", "ahead": 2}])
        self.assertEqual(r["status"], "waiting_review")  # unmerged branch, no token

    def test_open_prs_wait_for_review(self):
        prs = [{"number": 7, "title": "t", "updated_at": ago(days=3)}]
        r = self.base(open_prs=prs, workflows=[])
        self.assertEqual((r["status"], r["source"]), ("waiting_review", "github_api"))

    def test_with_token_and_no_prs_is_idle_even_with_old_branches(self):
        r = self.base(open_prs=[], workflows=[],
                      branches=[{"name": "claude/a", "at": ago(days=3), "subject": "s", "ahead": 4}])
        self.assertEqual(r["status"], "idle")

    def test_merged_branch_without_token_is_idle(self):
        r = self.base(branches=[{"name": "claude/a", "at": ago(days=3), "subject": "s", "ahead": 0}])
        self.assertEqual(r["status"], "idle")

    def test_blocked_beats_working(self):
        wfs = [{"file": "ci.yml", "branch": "main", "conclusion": "failure", "at": ago(minutes=5)}]
        r = self.base(workflows=wfs, open_prs=[],
                      branches=[{"name": "claude/a", "at": ago(minutes=5), "subject": "s", "ahead": 1}])
        self.assertEqual(r["status"], "blocked")


class BotStatusRules(unittest.TestCase):
    def test_recent_bot_commit_is_working(self):
        r = C.derive_bot_status({"exists": True, "runs": None,
                                 "last_bot_commit": {"at": ago(minutes=4), "subject": "data"}}, NOW, TH)
        self.assertEqual(r["status"], "working")

    def test_old_bot_commit_is_idle(self):
        r = C.derive_bot_status({"exists": True, "runs": None,
                                 "last_bot_commit": {"at": ago(hours=20), "subject": "data"}}, NOW, TH)
        self.assertEqual(r["status"], "idle")

    def test_no_token_no_author_is_unknown(self):
        r = C.derive_bot_status({"exists": True, "runs": None, "last_bot_commit": None}, NOW, TH)
        self.assertEqual(r["status"], "unknown")

    def test_failed_run_blocks_bot(self):
        runs = [{"file": "ci.yml", "branch": "x", "status": "completed", "conclusion": "failure", "at": ago(hours=2)}]
        self.assertEqual(C.derive_bot_status({"exists": True, "runs": runs}, NOW, TH)["status"], "blocked")

    def test_running_workflow_is_working(self):
        runs = [{"file": "ci.yml", "branch": "x", "status": "in_progress", "conclusion": None, "at": ago(hours=2)}]
        self.assertEqual(C.derive_bot_status({"exists": True, "runs": runs}, NOW, TH)["status"], "working")


class PriceBasisFreshness(unittest.TestCase):
    """HMA resets on the 1st and 15th, kurs on the 1st, each rolled forward past weekends and holidays."""
    HOL = {"2026-08-17", "2026-12-24", "2026-12-25", "2027-01-01"}

    def due(self, day, anchors=(1, 15)):
        return C.current_due(dt.date.fromisoformat(day), anchors, self.HOL)

    def test_first_on_a_weekday(self):
        self.assertEqual(self.due("2026-10-02"), dt.date(2026, 10, 1))

    def test_fifteenth_not_sixteenth(self):
        self.assertEqual(self.due("2026-10-15"), dt.date(2026, 10, 15))
        self.assertEqual(self.due("2026-10-14"), dt.date(2026, 10, 1))

    def test_weekend_anchor_rolls_forward_not_back(self):
        # 1 Nov 2026 is a Sunday: on the Sunday the 15 Oct basis still applies; Monday 2 Nov takes over.
        self.assertEqual(self.due("2026-11-01"), dt.date(2026, 10, 15))
        self.assertEqual(self.due("2026-11-02"), dt.date(2026, 11, 2))

    def test_holiday_roll(self):
        # 15 Aug 2026 is a Saturday, 16 Sunday, 17 Monday Hari Kemerdekaan → 18 Aug.
        self.assertEqual(self.due("2026-08-17"), dt.date(2026, 8, 3))
        self.assertEqual(self.due("2026-08-18"), dt.date(2026, 8, 18))

    def test_kurs_only_on_the_first(self):
        self.assertEqual(self.due("2026-10-20", anchors=(1,)), dt.date(2026, 10, 1))

    def test_new_year_holiday_looks_back_into_december(self):
        # 1 Jan 2027 (Fri) is a holiday → rolls to Mon 4 Jan; until then 15 Dec 2026 applies.
        self.assertEqual(self.due("2027-01-01"), dt.date(2026, 12, 15))


class Parsers(unittest.TestCase):
    def test_placeholders(self):
        md = "# T\n## Placeholders to confirm before external use\n\n- a\n- b\n  - nested\n- c\n## Next\n- x\n"
        self.assertEqual(C.parse_placeholders(md), 3)

    def test_decisions(self):
        md = "| # | D |\n|---|---|\n| 1 | a |\n| 12 | b |\n| x | c |\n"
        self.assertEqual(C.parse_decisions(md), 2)

    def test_projects(self):
        md = "| Project | Port |\n|---|---|\n| `terminal-yard` | 4195 | x |\n| `horizons` | 4180 | y |\n"
        self.assertEqual([p["name"] for p in C.parse_projects(md)], ["terminal-yard", "horizons"])


class Confidentiality(unittest.TestCase):
    """The collector must refuse to read anything outside allowed_reads, and never excluded paths."""

    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name) / "fake"
        (root / "docs").mkdir(parents=True)
        (root / "sponsorship").mkdir()
        (root / "docs" / "master-plan.md").write_text("SECRET-FIGURE-123\n")
        (root / "docs" / "about.md").write_text("# About\n")
        (root / "sponsorship" / "deck.md").write_text("SECRET\n")
        (root / "README.md").write_text("hello\n")
        for cmd in (["init", "-q", "-b", "main"], ["add", "-A"],
                    ["-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "init"]):
            subprocess.run(["git", "-C", str(root), *cmd], check=True)
        cls.repo = C.Repo("fake", {"dir": "fake", "branch": "main"}, Path(cls.tmp.name),
                          allowed=["README.md", "docs/master-plan.md"],
                          excluded=["docs/master-plan.md", "sponsorship/"])

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def test_allowed_read_works(self):
        self.assertEqual(self.repo.show("README.md"), "hello\n")

    def test_unlisted_read_is_refused(self):
        with self.assertRaises(C.ReadNotAllowed):
            self.repo.show("docs/about.md")

    def test_excluded_wins_over_allowlist(self):
        with self.assertRaises(C.ReadNotAllowed):
            self.repo.show("docs/master-plan.md")

    def test_excluded_names_are_not_listed(self):
        self.assertEqual(self.repo.ls("docs"), ["docs/about.md"])
        self.assertEqual(self.repo.ls("sponsorship"), [])

    def test_config_never_allowlists_an_excluded_path(self):
        cfg = json.loads((HQ / "agents.config.json").read_text())
        for key, paths in cfg["allowed_reads"].items():
            for p in paths:
                for ex in cfg["excluded_paths"].get(key, []):
                    self.assertFalse(p == ex or (ex.endswith("/") and p.startswith(ex)), f"{key}:{p}")


class Gate(unittest.TestCase):
    def test_gate_passes_on_sample_state(self):
        sys.path.insert(0, str(HQ / "scripts"))
        import gate
        cfg = json.loads((HQ / "agents.config.json").read_text())
        state = json.loads((HQ / "data" / "sample-state.json").read_text())
        self.assertEqual(gate.check(state, cfg), [])

    def test_gate_catches_an_excluded_path(self):
        import gate
        cfg = json.loads((HQ / "agents.config.json").read_text())
        bad = {"rooms": {"ijba": {"signals": {"library": [{"path": "docs/master-plan.md"}]}}}}
        self.assertTrue(gate.check(bad, cfg))


if __name__ == "__main__":
    unittest.main()
