// Peta WIUP: the ESDM permit centroids (data/wiup-points.json, built by scripts/make_wiup.py) for the
// Supervisor Office map table and its panel. Loaded once; a missing file just leaves the table blank.
import { txt, rr } from './kit.js';

let cache = null;
export const loadWiup = () => (cache ||= fetch('data/wiup-points.json', { cache: 'no-store' })
  .then(r => (r.ok ? r.json() : null)).catch(() => null));

// Indonesia in lon/lat, with a margin; the table is drawn in an equirectangular frame
const BOX = { w: 94.5, e: 141.5, s: -11.5, n: 6.5 };

/** Draw the permits as dots (bukan logam first, faint; metals and coal on top) and ring PT ANI. */
export function drawWiupMap(ctx, w, h, W) {
  rr(ctx, 0, 0, w, h, 0, '#eef3f1');
  const pad = 28, top = 56, iw = w - pad * 2, ih = h - top - 40;
  const k = Math.min(iw / (BOX.e - BOX.w), ih / (BOX.n - BOX.s));
  const ox = pad + (iw - (BOX.e - BOX.w) * k) / 2, oy = top + (ih - (BOX.n - BOX.s) * k) / 2;
  const X = lon => ox + (lon - BOX.w) * k, Y = lat => oy + (BOX.n - lat) * k;
  txt(ctx, 'PETA WIUP INDONESIA', pad, 38, 24, '#1d2a26', 700);
  if (!W) { txt(ctx, 'data/wiup-points.json belum ada', pad, h / 2, 20, '#7a8a85'); return; }
  txt(ctx, `${W.total.toLocaleString('id-ID')} WIUP · ESDM`, w - pad, 38, 20, '#5f6f6a', 600, 'right');
  const p = W.pts, n = p.length / 3;
  for (let pass = W.groups.length - 1; pass >= 0; pass--) {
    const g = W.groups[pass], faint = g.key === 'lain';
    ctx.fillStyle = g.color; ctx.globalAlpha = faint ? 0.28 : 0.9;
    const s = faint ? 2.2 : 3.4;
    for (let i = 0; i < n; i++) if (p[i * 3 + 2] === pass) ctx.fillRect(X(p[i * 3] / 100) - s / 2, Y(p[i * 3 + 1] / 100) - s / 2, s, s);
  }
  ctx.globalAlpha = 1;
  if (W.highlight) {
    const x = X(W.highlight.lx), y = Y(W.highlight.ly);
    ctx.strokeStyle = '#D01530'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.stroke();
    txt(ctx, 'PT ANI', x + 18, y - 12, 18, '#D01530', 700);
  }
  // legend: the metals and coal, by count
  let lx = pad;
  for (const g of W.groups.filter(g => g.key !== 'lain')) {
    rr(ctx, lx, h - 28, 12, 12, 3, g.color); txt(ctx, `${g.name} ${g.n}`, lx + 17, h - 17, 15, '#3a4a45', 600);
    lx += 34 + ctx.measureText(`${g.name} ${g.n}`).width;
  }
}
