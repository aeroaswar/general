#!/usr/bin/env python3
"""Confidentiality gate: fail if state.json mentions any excluded path, or if it is tracked by git.

  python3 scripts/gate.py                 # checks data/state.json (if present) and data/sample-state.json
  python3 scripts/gate.py path/to/state.json
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

HQ = Path(__file__).resolve().parent.parent


def _strings(node):
    if isinstance(node, dict):
        for k, v in node.items():
            yield str(k)
            yield from _strings(v)
    elif isinstance(node, list):
        for v in node:
            yield from _strings(v)
    elif isinstance(node, str):
        yield node


def check(state: dict, cfg: dict) -> list[str]:
    bad = []
    needles = [p.rstrip("/") for paths in cfg.get("excluded_paths", {}).values() for p in paths]
    for s in _strings(state):
        for n in needles:
            if n and n in s:
                bad.append(f"mentions excluded path {n!r}: {s[:80]!r}")
    return bad


def tracked(path: Path) -> bool:
    r = subprocess.run(["git", "-C", str(HQ), "ls-files", "--error-unmatch", str(path)],
                       capture_output=True, text=True)
    return r.returncode == 0


def main(argv: list[str]) -> int:
    cfg = json.loads((HQ / "agents.config.json").read_text())
    targets = [Path(a) for a in argv] or [p for p in (HQ / "data" / "state.json", HQ / "data" / "sample-state.json")
                                          if p.exists()]
    failures = []
    for t in targets:
        failures += [f"{t.name}: {b}" for b in check(json.loads(t.read_text()), cfg)]
    live = HQ / "data" / "state.json"
    if live.exists() and tracked(live):
        failures.append("data/state.json is tracked by git — it must stay local (see .gitignore)")
    for f in failures:
        print("GATE FAIL:", f)
    if not failures:
        print(f"gate ok · {len(targets)} file(s) checked")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
