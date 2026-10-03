"""Peta WIUP points for the Supervisor Office map table.

Reads a WIUP export from the ESDM geoportal (WIUP_Publish: {fields, rows, ...}, the same file the
Peta WIUP Indonesia site uses) and writes data/wiup-points.json: one centroid per permit, grouped by
commodity, plus the counts the room panel shows. Public data; no private repo is read.

  python3 scripts/make_wiup.py path/to/wiup.json
"""
import json
import sys
from collections import Counter
from pathlib import Path

HQ = Path(__file__).resolve().parent.parent
OUT = HQ / "data" / "wiup-points.json"
# commodity groups, in drawing order (the last is drawn first, under the rest)
GROUPS = [
    ("nikel", "Nikel", "#1f9d6b"),
    ("batubara", "Batubara", "#2b2522"),
    ("emas", "Emas", "#d9a21b"),
    ("timah", "Timah", "#5b7fa6"),
    ("bauksit", "Bauksit", "#c0563a"),
    ("tembaga", "Tembaga", "#b8733a"),
    ("besi", "Pasir / bijih besi", "#7b4f8f"),
    ("lain", "Batuan & mineral bukan logam", "#a9a39b"),
]


def group_of(kom: str) -> int:
    k = (kom or "").lower()
    for i, (key, _, _) in enumerate(GROUPS[:-1]):
        if key in k:
            return i
    return len(GROUPS) - 1


def build(src: dict, highlight: str = "3682062122014021") -> dict:
    f = src["fields"]
    ix = {k: i for i, k in enumerate(f)}
    pts, n, op, hit = [], Counter(), Counter(), None
    for r in src["rows"]:
        lx, ly = r[ix["lx"]], r[ix["ly"]]
        if lx is None or ly is None:
            continue
        g = group_of(r[ix["komoditas"]])
        pts += [round(lx * 100), round(ly * 100), g]
        n[g] += 1
        if r[ix["kegiatan"]] == "OPERASI PRODUKSI":
            op[g] += 1
        if r[ix["kode_wiup"]] == highlight:
            hit = {"name": r[ix["nama_usaha"]], "kode_wiup": highlight, "lx": lx, "ly": ly,
                   "kegiatan": r[ix["kegiatan"]], "komoditas": r[ix["komoditas"]], "area_ha": r[ix["area_ha"]]}
    return {
        "source": src.get("source", "ESDM geoportal WIUP_Publish"),
        "fetched": src.get("fetched"),
        "total": sum(n.values()),
        "groups": [{"key": k, "name": nm, "color": c, "n": n[i], "op": op[i]} for i, (k, nm, c) in enumerate(GROUPS)],
        "highlight": hit,
        "pts": pts,
    }


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    out = build(json.loads(Path(argv[0]).read_text()))
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print(f"{out['total']} permits → {OUT} ({OUT.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
