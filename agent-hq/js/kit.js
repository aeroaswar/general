// Shared low-poly building blocks: cached materials, boxes, cylinders, canvas boards.
import * as THREE from 'three';

const matCache = new Map();
export function mat(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0, ...opts }));
  }
  return matCache.get(key);
}

export function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'string' ? mat(color, opts) : color);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function cyl(rt, rb, h, color, seg = 12, opts) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof color === 'string' ? mat(color, opts) : color);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function sphere(r, color, opts, ws = 14, hs = 10) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), typeof color === 'string' ? mat(color, opts) : color);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function cone(r, h, color, seg = 10, opts) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), typeof color === 'string' ? mat(color, opts) : color);
  m.castShadow = true;
  return m;
}

/** place(obj, x, y, z, rotY) — tiny helper so prop code stays readable. */
export function at(obj, x, y, z, ry = 0) {
  obj.position.set(x, y, z); obj.rotation.y = ry; return obj;
}

export function plant(scale = 1, pot = '#d9a77a', leaf = '#7fb685') {
  const g = new THREE.Group();
  g.add(at(cyl(0.22 * scale, 0.17 * scale, 0.36 * scale, pot), 0, 0.18 * scale, 0));
  const f1 = sphere(0.34 * scale, leaf); f1.position.y = 0.62 * scale; f1.scale.set(1, 1.15, 1);
  const f2 = sphere(0.22 * scale, '#95c79a'); f2.position.set(0.14 * scale, 0.86 * scale, 0.05 * scale);
  g.add(f1, f2);
  return g;
}

export function lerpColor(a, b, t) {
  return '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
}

/**
 * A canvas-textured board. draw(ctx, w, h, data) paints it; redraw(data) repaints.
 * Boards show real state, so they repaint whenever state.json changes.
 */
export function board(wu, hu, draw, { px = 220, frame = '#5b4a3f', emissive = false } = {}) {
  const cw = Math.round(wu * px), ch = Math.round(hu * px);
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(wu, hu),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9,
      emissive: emissive ? new THREE.Color('#ffffff') : new THREE.Color('#000000'),
      emissiveMap: emissive ? tex : null, emissiveIntensity: emissive ? 0.55 : 0 }));
  const g = new THREE.Group();
  const back = box(wu + 0.1, hu + 0.1, 0.05, frame);
  back.position.z = -0.03;
  face.position.z = 0.0;
  g.add(back, face);
  const api = {
    group: g, canvas, ctx,
    redraw(data) { ctx.save(); draw(ctx, cw, ch, data); ctx.restore(); tex.needsUpdate = true; },
  };
  api.redraw(undefined);
  return api;
}

export const FONT = '"Geist", system-ui, -apple-system, Segoe UI, sans-serif';

export function txt(ctx, s, x, y, size, color = '#2b2522', weight = 500, align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

export function fitTxt(ctx, s, x, y, size, maxW, color, weight = 500, align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  let t = String(s ?? '');
  while (t.length > 1 && ctx.measureText(t).width > maxW) t = t.slice(0, -2) + '…';
  txt(ctx, t, x, y, size, color, weight, align);
}

export function rr(ctx, x, y, w, h, r, fill) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
}

export const STATUS = {
  working:        { label: 'Working',        color: '#3fa66b' },
  waiting_review: { label: 'Waiting review', color: '#e0a23a' },
  blocked:        { label: 'Blocked',        color: '#d64545' },
  idle:           { label: 'Idle',           color: '#7d93ad' },
  offline:        { label: 'Offline',        color: '#a9a39b' },
  unknown:        { label: 'Unknown',        color: '#b9b2c4' },
};

/** Deterministic RNG so ?cap= captures repeat exactly. */
export function rng(seed = 7) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
