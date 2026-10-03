// The building: island, floors, walls with tycoon-style cutaway, stairs, mezzanine office, basement.
import * as THREE from 'three';
import { box, cyl, sphere, cone, at, plant, mat, lerpColor } from './kit.js';
import { furnish } from './props.js';

export const FLOOR_Y = { basement: -4.6, ground: 0, upper: 4.6 };
const WALL_H = { basement: 4.2, ground: 3.0, upper: 2.6 };
const TH = 0.18;              // wall thickness
const DOOR_W = 1.8, DOOR_H = 2.25;
const STUB = 0.22;            // cut wall height
const CREAM = '#f7efe4';

export function rectOf(c) {
  const [x, z, w, d] = c.rect;
  return { x0: x, x1: x + w, z0: z, z1: z + d, cx: x + w / 2, cz: z + d / 2, w, d };
}

function parseDoor(spec) {
  if (!spec) return null;
  const [side, frac] = spec.split(':');
  return { side, t: frac ? parseFloat(frac) : 0.5 };
}

const NORMALS = { north: new THREE.Vector3(0, 0, -1), south: new THREE.Vector3(0, 0, 1),
                  west: new THREE.Vector3(-1, 0, 0), east: new THREE.Vector3(1, 0, 0) };

export function buildWorld(cfg) {
  const above = new THREE.Group(); above.name = 'above';
  const below = new THREE.Group(); below.name = 'below';
  const walls = [];
  const rooms = new Map();
  const pickables = [];
  const nightMats = [];   // emissive bits that glow at night

  // ── island ───────────────────────────────────────────────────────────────
  const earth = box(58, 5.0, 38, '#b88f68'); earth.position.set(0.5, -2.82, 0); earth.receiveShadow = true;
  const lawn = box(58, 0.3, 38, '#c4e2ae'); lawn.position.set(0.5, -0.17, 0);
  above.add(earth, lawn);
  // light wells hinting at the basement under the lawn
  const wellMat = new THREE.MeshStandardMaterial({ color: '#ffd9a0', emissive: '#ffb45c', emissiveIntensity: 0.9 });
  nightMats.push(wellMat);
  for (const x of [-12, -4, 4, 12]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 0.06), wellMat);
    w.position.set(x, -1.8, 19.02); above.add(w);
  }
  for (const z of [-8, 0, 8]) {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 2.2), wellMat);
    w.position.set(29.52, -1.8, z); above.add(w);
  }
  // trees & path
  const treeSpots = [[-25, -14], [-25.5, 13], [-12, 16.5], [26, 14.5], [26.5, -13], [12, 16.8], [-2, -15.8], [20, -15.6], [-19, 16.4]];
  for (const [x, z] of treeSpots) above.add(tree(x, z));
  for (let i = 0; i < 6; i++) {
    const s = cyl(0.5, 0.5, 0.06, '#e8dccb', 10); s.position.set(-0.4 + (i % 2) * 0.8, 0.01, 13 + i * 1.0); s.castShadow = false;
    above.add(s);
  }

  // ── rooms ────────────────────────────────────────────────────────────────
  for (const c of cfg.rooms) {
    const r = rectOf(c);
    const y = FLOOR_Y[c.floor];
    const parent = c.floor === 'basement' ? below : above;
    const R = { cfg: c, rect: r, y, anchors: {}, boards: [], pick: [], group: new THREE.Group() };
    R.group.name = 'room:' + c.id;
    parent.add(R.group);
    rooms.set(c.id, R);

    // floor
    const fl = box(r.w, 0.2, r.d, c.floorColor || '#e8dccb');
    fl.position.set(r.cx, y - 0.1, r.cz); fl.castShadow = false;
    fl.userData.roomId = c.id; R.pick.push(fl); pickables.push(fl);
    R.group.add(fl);
    if (c.kind === 'hall') { addHallway(R); continue; }

    // walls
    const doors = [];
    const d0 = parseDoor(c.door);
    if (d0) doors.push(d0);
    for (const other of c.connects || []) {
      const o = rectOf(cfg.rooms.find(x => x.id === other));
      const side = o.x0 >= r.x1 - 0.01 ? 'east' : o.x1 <= r.x0 + 0.01 ? 'west' : o.z0 >= r.z1 - 0.01 ? 'south' : 'north';
      doors.push({ side, t: 0.5, connect: other });
    }
    // reverse connections (MME gets the doorway MMI declared)
    for (const other of cfg.rooms) {
      if ((other.connects || []).includes(c.id)) {
        const o = rectOf(other);
        const side = o.x1 <= r.x0 + 0.01 ? 'west' : o.x0 >= r.x1 - 0.01 ? 'east' : o.z1 <= r.z0 + 0.01 ? 'north' : 'south';
        doors.push({ side, t: 0.5, connect: other.id });
      }
    }
    if (c.id === 'den') doors.push({ side: 'east', t: 0.5, connect: 'library' });
    if (c.id === 'library') doors.push({ side: 'west', t: 0.5, connect: 'den' });

    const glass = c.kind === 'supervisor';
    const wallColor = c.floor === 'basement' ? lerpColor('#4a4f55', c.accent || '#555', 0.18)
                    : lerpColor(CREAM, c.accent || CREAM, c.kind === 'locked' ? 0.05 : 0.12);
    for (const side of ['north', 'south', 'west', 'east']) {
      const gaps = doors.filter(d => d.side === side).map(d => ({ t: d.t, w: DOOR_W, locked: c.kind === 'locked' && !d.connect }));
      const piece = wallSide(c.id, side, r, y, WALL_H[c.floor], gaps, wallColor, glass, outerSide(c, side), c.floor);
      R.group.add(piece.group);
      walls.push(piece);
    }

    // door positions (inside, outside) for navigation
    if (d0) {
      const p = doorPoint(r, d0);
      const n = NORMALS[d0.side];
      R.doorIn = new THREE.Vector3(p.x - n.x * 1.3, y, p.z - n.z * 1.3);
      R.doorOut = new THREE.Vector3(p.x + n.x * 1.4, y, p.z + n.z * 1.4);
      if (c.kind === 'locked') R.group.add(lockedDoor(p, d0.side, y, c.accent));
    }
    R.center = new THREE.Vector3(r.cx, y, r.cz);
    R.labelPos = new THREE.Vector3(r.cx, y + WALL_H[c.floor] + (c.floor === 'upper' ? 3.2 : 0.9), r.cz);

    furnish(R, { cfg, nightMats, pickables });
  }

  // ── stairs to the mezzanine, office shell, roof garden ─────────────────────
  const office = rooms.get('office');
  if (office?.cfg.floor === 'upper') addMezzanine(above, office, nightMats);
  else if (office) addGarden(above, office.rect.cx + 2.2, 0, office.rect.z1 + 3.4, nightMats);

  // basement outer shell (earth tray seen from outside when the basement is open)
  const shell = box(33, 0.4, 25, '#5d4a3b'); shell.position.set(0, FLOOR_Y.basement - 0.4, 0);
  below.add(shell);

  return { above, below, walls, rooms, pickables, nightMats,
    setCutaway(yaw, insideRoom = null) {
      // camera sits at (sin yaw, ·, cos yaw) from its target; walls facing it get cut
      const toCam = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
      for (const w of walls) {
        const cut = insideRoom ? false : (w.normal.dot(toCam) > 0.2);
        if (w.cut !== cut) setCut(w, cut);
      }
    },
  };
}

function outerSide(c, side) {
  const r = rectOf(c);
  if (c.floor !== 'ground') return true;
  return (side === 'north' && r.z0 <= -12) || (side === 'south' && r.z1 >= 12) ||
         (side === 'west' && r.x0 <= -16) || (side === 'east' && r.x1 >= 16);
}

function doorPoint(r, d) {
  switch (d.side) {
    case 'north': return { x: r.x0 + r.w * d.t, z: r.z0 };
    case 'south': return { x: r.x0 + r.w * d.t, z: r.z1 };
    case 'west':  return { x: r.x0, z: r.z0 + r.d * d.t };
    default:      return { x: r.x1, z: r.z0 + r.d * d.t };
  }
}

function wallSide(roomId, side, r, y, h, gaps, color, glass, outer, floor) {
  const horiz = side === 'north' || side === 'south';
  const L = horiz ? r.w : r.d;
  const group = new THREE.Group();
  const piece = { group, bodies: [], caps: [], lintels: [], extras: [], normal: NORMALS[side], roomId, h, cut: false };
  const material = glass
    ? new THREE.MeshStandardMaterial({ color: '#cfe8f3', transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.1 })
    : mat(color);
  const capMat = mat(glass ? '#9aa9b3' : lerpColor(color, '#3b302a', 0.55));

  // solid intervals between gaps
  const sorted = [...gaps].sort((a, b) => a.t - b.t);
  const intervals = [];
  let s = 0;
  for (const g of sorted) {
    const c = g.t * L;
    intervals.push([s, c - g.w / 2]);
    s = c + g.w / 2;
  }
  intervals.push([s, L]);

  const place = (m, a, b, yy) => {
    const mid = (a + b) / 2;
    if (side === 'north') m.position.set(r.x0 + mid, yy, r.z0 + TH / 2);
    if (side === 'south') m.position.set(r.x0 + mid, yy, r.z1 - TH / 2);
    if (side === 'west')  m.position.set(r.x0 + TH / 2, yy, r.z0 + mid);
    if (side === 'east')  m.position.set(r.x1 - TH / 2, yy, r.z0 + mid);
    if (!horiz) m.rotation.y = Math.PI / 2;
  };

  for (const [a, b] of intervals) {
    const len = b - a;
    if (len < 0.05) continue;
    const geo = new THREE.BoxGeometry(len, 1, TH); geo.translate(0, 0.5, 0);
    const body = new THREE.Mesh(geo, material);
    body.castShadow = !glass; body.receiveShadow = true;
    place(body, a, b, y); body.scale.y = h;
    group.add(body); piece.bodies.push(body);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(len + 0.02, 0.07, TH + 0.05), capMat);
    place(cap, a, b, y + h); group.add(cap); piece.caps.push(cap);
    // windows on long outer stretches
    if (outer && !glass && len > 2.8 && floor === 'ground') {
      const n = Math.floor(len / 3.2);
      for (let i = 0; i < n; i++) {
        const t0 = a + (len / n) * (i + 0.5);
        const win = windowPane();
        place(win, t0 - 0.01, t0 + 0.01, y + 1.55);
        group.add(win); piece.extras.push(win);
      }
    }
  }
  for (const g of sorted) {
    const c = g.t * L;
    if (h > DOOR_H + 0.05) {
      const geo = new THREE.BoxGeometry(g.w, h - DOOR_H, TH); geo.translate(0, (h - DOOR_H) / 2, 0);
      const lin = new THREE.Mesh(geo, material); lin.castShadow = !glass;
      place(lin, c - g.w / 2, c + g.w / 2, y + DOOR_H);
      group.add(lin); piece.lintels.push(lin);
    }
  }
  return piece;
}

function setCut(w, cut) {
  w.cut = cut;
  for (const b of w.bodies) b.scale.y = cut ? STUB : w.h;
  for (const c of w.caps) c.position.y = (c.userData.y0 ??= c.position.y) - (cut ? w.h - STUB : 0);
  for (const l of w.lintels) l.visible = !cut;
  for (const e of w.extras) e.visible = !cut;
}

function windowPane() {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.24), mat('#ffffff'));
  const glassM = new THREE.Mesh(new THREE.BoxGeometry(1.32, 1.02, 0.26),
    new THREE.MeshStandardMaterial({ color: '#bfe3f2', emissive: '#9fd0ff', emissiveIntensity: 0.15, roughness: 0.2 }));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.02, 0.27), mat('#ffffff'));
  g.add(frame, glassM, bar);
  return g;
}

function lockedDoor(p, side, y, accent) {
  const g = new THREE.Group();
  const leaf = box(DOOR_W - 0.1, DOOR_H - 0.05, 0.08, lerpColor('#8d7b6c', accent, 0.25));
  leaf.position.y = DOOR_H / 2;
  const lock = box(0.22, 0.26, 0.12, '#c9a24a', { metalness: 0.6, roughness: 0.35 }); lock.position.set(0.55, 1.05, 0.08);
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.025, 6, 12, Math.PI), mat('#9a9a9a', { metalness: 0.7 }));
  shackle.position.set(0.55, 1.2, 0.08);
  g.add(leaf, lock, shackle);
  g.position.set(p.x, y, p.z);
  g.rotation.y = side === 'east' || side === 'west' ? Math.PI / 2 : 0;
  return g;
}

function tree(x, z) {
  const g = new THREE.Group();
  g.add(at(cyl(0.18, 0.26, 1.4, '#9b7653'), 0, 0.7, 0));
  const c1 = cone(1.25, 2.2, '#86b97f', 9); c1.position.y = 2.2;
  const c2 = cone(0.95, 1.7, '#9cc98f', 9); c2.position.y = 3.1;
  g.add(c1, c2);
  g.position.set(x, 0, z);
  return g;
}

function addHallway(R) {
  const { rect: r, group } = R;
  const rug = box(r.w - 2, 0.03, 1.6, '#e7c9a9'); rug.position.set(r.cx, 0.02, r.cz); rug.castShadow = false;
  group.add(rug);
  for (const x of [-13.5, -3, 3, 13.5]) {
    group.add(at(plant(1.1), x, 0, r.z0 + 0.6));
  }
  // bench
  const bench = new THREE.Group();
  bench.add(at(box(1.8, 0.12, 0.6, '#c99a6d'), 0, 0.45, 0), at(box(0.12, 0.45, 0.5, '#8d6a4a'), -0.75, 0.22, 0),
            at(box(0.12, 0.45, 0.5, '#8d6a4a'), 0.75, 0.22, 0));
  bench.position.set(-6.5, 0, 2.3); group.add(bench);
  R.anchors.bench = { pos: new THREE.Vector3(-6.5, 0, 1.9), face: Math.PI, sit: true };
}

function addMezzanine(above, office, nightMats) {
  const r = office.rect, y = office.y;
  // slab + columns
  const slab = box(r.w, 0.28, r.d, '#e9e0ea'); slab.position.set(r.cx, y - 0.14, r.cz);
  above.add(slab);
  for (const [x, z] of [[r.x0 + 0.2, r.z0 + 0.2], [r.x1 - 0.2, r.z0 + 0.2], [r.x0 + 0.2, r.z1 - 0.2], [r.x1 - 0.2, r.z1 - 0.2]]) {
    above.add(at(cyl(0.12, 0.12, y, '#d8cfc6'), x, y / 2, z));
  }
  // stairs: bottom (9,0) → top (5,4.6) along -x at z≈2.2
  const steps = 13, x0 = 9.2, x1 = 5.0, z = 2.2;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const s = box(0.36, 0.14, 1.0, '#cfa27a');
    s.position.set(x0 + (x1 - x0) * t, (y - 0.1) * t + 0.07, z);
    above.add(s);
  }
  const railLen = Math.hypot(x0 - x1, y);
  const rail = box(railLen, 0.06, 0.06, '#8d6a4a');
  rail.position.set((x0 + x1) / 2, y / 2 + 0.9, z + 0.52);
  rail.rotation.z = -Math.atan2(y, x0 - x1);
  above.add(rail);
  office.stairs = { bottom: new THREE.Vector3(x0 + 0.5, 0, z), top: new THREE.Vector3(x1 + 0.25, y, z) };

  // roof + garden
  const roofY = y + WALL_H.upper;
  const roof = box(r.w + 0.2, 0.22, r.d + 0.2, '#efe6dc'); roof.position.set(r.cx, roofY + 0.11, r.cz);
  above.add(roof);
  addGarden(above, r.cx, roofY + 0.22, r.cz, nightMats, r.w, r.d);
}

/** Planters, a small tree, a bench and string lights — on the office roof, or on the lawn beside it. */
function addGarden(above, cx, gy, cz, nightMats, w = 10, d = 6) {
  const r = { w, d };
  const g = new THREE.Group(); g.position.y = gy;
  for (const [x, zz] of [[-4, -2.2], [-1.5, -2.2], [1.5, -2.2], [4, -2.2]]) {
    g.add(at(box(2.0, 0.45, 0.8, '#b08463'), x, 0.22, zz));
    for (let k = 0; k < 3; k++) {
      const f = sphere(0.28, ['#ef9fa8', '#f6d27a', '#a7d3a0'][k % 3]); f.position.set(x - 0.6 + k * 0.6, 0.6, zz);
      g.add(f);
    }
  }
  g.add(at(tree(0, 0), 3.8, 0, 1.7)); g.children[g.children.length - 1].scale.setScalar(0.55);
  g.add(at(plant(1.2), -4.2, 0, 2.0), at(plant(0.9), -3.2, 0, 2.2));
  const bench = new THREE.Group();
  bench.add(at(box(1.6, 0.1, 0.5, '#c99a6d'), 0, 0.42, 0), at(box(1.6, 0.5, 0.08, '#c99a6d'), 0, 0.7, -0.22));
  g.add(at(bench, 0, 0, 1.8));
  // string lights
  const bulbMat = new THREE.MeshStandardMaterial({ color: '#fff2c4', emissive: '#ffd77a', emissiveIntensity: 0.6 });
  nightMats.push(bulbMat);
  for (let i = 0; i < 12; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), bulbMat);
    b.position.set(-4.6 + i * 0.84, 1.75 - Math.sin((i / 11) * Math.PI) * 0.35, 0.1);
    g.add(b);
  }
  for (const x of [-4.8, 4.8]) g.add(at(cyl(0.04, 0.04, 1.8, '#6b5a4a'), x, 0.9, 0.1));
  // parapet
  for (const [w, d, x, zz] of [[r.w, 0.15, 0, -r.d / 2], [r.w, 0.15, 0, r.d / 2], [0.15, r.d, -r.w / 2, 0], [0.15, r.d, r.w / 2, 0]]) {
    g.add(at(box(w, 0.35, d, '#e2d6c8'), x, 0.17, zz));
  }
  g.position.x = cx; g.position.z = cz;
  above.add(g);
}
