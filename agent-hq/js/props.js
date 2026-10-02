// Room furnishings. Every board/prop that shows a number reads it from state.json via redraw().
import * as THREE from 'three';
import { box, cyl, sphere, cone, at, plant, mat, board, txt, fitTxt, rr, lerpColor, STATUS } from './kit.js';

const WALL_IN = 0.32; // distance from a wall line to stand a board/shelf

const FACE = { north: Math.PI, south: 0, east: Math.PI / 2, west: -Math.PI / 2 };

// ── reusable furniture ─────────────────────────────────────────────────────

function deskSet(group, x, y, z, face, { top = '#d8b48c', screen = '#2d3a4a', accent = '#888', seat = true } = {}) {
  const d = new THREE.Group();
  d.add(at(box(1.7, 0.08, 0.8, top), 0, 0.76, 0));
  for (const [lx, lz] of [[-0.78, -0.33], [0.78, -0.33], [-0.78, 0.33], [0.78, 0.33]]) d.add(at(box(0.07, 0.74, 0.07, '#8d6a4a'), lx, 0.37, lz));
  const mon = box(0.8, 0.5, 0.05, '#2b2b2b'); mon.position.set(0, 1.12, 0.22);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.42),
    new THREE.MeshStandardMaterial({ color: screen, emissive: screen, emissiveIntensity: 0.55 }));
  scr.position.set(0, 1.12, 0.19); scr.rotation.y = Math.PI;
  d.add(mon, scr, at(box(0.08, 0.2, 0.08, '#444'), 0, 0.88, 0.22));
  d.add(at(box(0.55, 0.03, 0.18, '#f2f2f2'), 0, 0.81, -0.12));          // keyboard
  d.add(at(cyl(0.05, 0.05, 0.1, accent), 0.62, 0.85, -0.05));             // mug
  if (seat) {
    const ch = new THREE.Group();
    ch.add(at(box(0.55, 0.08, 0.55, accent), 0, 0.48, 0), at(box(0.55, 0.6, 0.08, accent), 0, 0.82, -0.26),
           at(cyl(0.04, 0.04, 0.44, '#555'), 0, 0.24, 0), at(cyl(0.25, 0.25, 0.04, '#555', 10), 0, 0.03, 0));
    ch.position.set(0, 0, -0.72);
    d.add(ch);
  }
  d.position.set(x, y, z); d.rotation.y = face;
  group.add(d);
  const seatPos = new THREE.Vector3(0, 0, -0.62).applyAxisAngle(new THREE.Vector3(0, 1, 0), face).add(new THREE.Vector3(x, y, z));
  return { pos: seatPos, face, sit: true, screen: scr };
}

function shelf(group, x, y, z, face, w = 2.2, h = 2.1, colors = ['#c96f53', '#e0b04f', '#6f9fc4', '#8bb57a', '#b48bc4']) {
  const s = new THREE.Group();
  s.add(at(box(w, h, 0.42, '#b8875f'), 0, h / 2, -0.06));
  const rows = 4, bookGeo = new THREE.BoxGeometry(0.11, 0.34, 0.3);
  let k = 0;
  for (let rI = 0; rI < rows; rI++) {
    const yy = 0.25 + rI * (h - 0.3) / rows;
    s.add(at(box(w - 0.12, 0.04, 0.36, '#a4744f'), 0, yy - 0.02, 0.02));
    for (let bx = -w / 2 + 0.16; bx < w / 2 - 0.16; bx += 0.14 + ((k * 7) % 3) * 0.015) {
      if ((k * 13) % 9 === 0) { k++; continue; }
      const b = new THREE.Mesh(bookGeo, mat(colors[k % colors.length]));
      const hh = 0.24 + ((k * 5) % 4) * 0.03;
      b.scale.y = hh / 0.34; b.position.set(bx, yy + hh / 2, 0.06); b.castShadow = true;
      s.add(b); k++;
    }
  }
  s.position.set(x, y, z); s.rotation.y = face;
  group.add(s);
  const stand = new THREE.Vector3(0, 0, 0.95).applyAxisAngle(new THREE.Vector3(0, 1, 0), face).add(new THREE.Vector3(x, y, z));
  return { pos: stand, face: face + Math.PI, read: true };
}

function wallBoard(group, R, side, frac, yC, w, h, draw, opts) {
  const r = R.rect;
  const b = board(w, h, draw, opts);
  const g = b.group;
  if (side === 'north') { g.position.set(r.x0 + r.w * frac, R.y + yC, r.z0 + WALL_IN); g.rotation.y = 0; }
  if (side === 'south') { g.position.set(r.x0 + r.w * frac, R.y + yC, r.z1 - WALL_IN); g.rotation.y = Math.PI; }
  if (side === 'west')  { g.position.set(r.x0 + WALL_IN, R.y + yC, r.z0 + r.d * frac); g.rotation.y = Math.PI / 2; }
  if (side === 'east')  { g.position.set(r.x1 - WALL_IN, R.y + yC, r.z0 + r.d * frac); g.rotation.y = -Math.PI / 2; }
  group.add(g);
  R.boards.push(b);
  const stand = new THREE.Vector3(0, 0, 1.25).applyAxisAngle(new THREE.Vector3(0, 1, 0), g.rotation.y)
    .add(new THREE.Vector3(g.position.x, R.y, g.position.z));
  return { board: b, anchor: { pos: stand, face: g.rotation.y + Math.PI } };
}

function rug(group, x, y, z, w, d, color, border) {
  const a = box(w, 0.025, d, border || color); a.position.set(x, y + 0.013, z); a.castShadow = false;
  group.add(a);
  if (border) { const b = box(w - 0.3, 0.03, d - 0.3, color); b.position.set(x, y + 0.016, z); b.castShadow = false; group.add(b); }
}

function lamp(group, x, y, z, nightMats, color = '#ffe2a8') {
  const g = new THREE.Group();
  g.add(at(cyl(0.03, 0.03, 1.5, '#5a5048'), 0, 0.75, 0), at(cyl(0.2, 0.2, 0.04, '#5a5048'), 0, 0.02, 0));
  const shadeMat = new THREE.MeshStandardMaterial({ color, emissive: '#ffc773', emissiveIntensity: 0.4 });
  nightMats.push(shadeMat);
  const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.28, 0.32, 12, 1, true), shadeMat);
  sh.position.y = 1.55; g.add(sh);
  g.position.set(x, y, z); group.add(g);
}

// ── shared drawing helpers ─────────────────────────────────────────────────

const roomState = (data, id) => data?.state?.rooms?.[id];
const agentState = (data, id) => data?.state?.agents?.find(a => a.id === id);
const isSample = data => data?.state?.mode !== 'live';

function header(ctx, w, title, color = '#2b2522', bg = null) {
  if (bg) rr(ctx, 0, 0, w, 64, 0, bg);
  txt(ctx, title, 24, 44, 30, color, 600);
}

function sampleMark(ctx, w, h, data) {
  if (!isSample(data)) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  rr(ctx, w - 170, 14, 150, 38, 19, '#e0a23a');
  txt(ctx, 'SAMPLE', w - 95, 41, 22, '#fff', 700, 'center');
  ctx.restore();
}

function chip(ctx, x, y, label, color, size = 22) {
  ctx.font = `600 ${size}px Geist, system-ui`;
  const w = ctx.measureText(label).width + size * 1.4;
  rr(ctx, x, y - size * 1.05, w, size * 1.5, size * 0.75, color);
  txt(ctx, label, x + w / 2, y + size * 0.05, size, '#fff', 600, 'center');
  return w;
}

// ── per-room furnishing ────────────────────────────────────────────────────

export function furnish(R, { cfg, nightMats, pickables }) {
  const c = R.cfg, r = R.rect, y = R.y, g = R.group;
  const P = (fx, fz) => [r.x0 + r.w * fx, r.z0 + r.d * fz];
  R.updaters = [];

  switch (c.id) {
    case 'mmi': {
      // MMI side (left two thirds): trading desk, price board, playbooks, tug & barge model
      const [dx, dz] = P(0.26, 0.42);
      R.anchors.desk = deskSet(g, dx, y, dz, FACE.north, { accent: c.accent, screen: '#3c5a73' });
      const wb = wallBoard(g, R, 'north', 0.28, 1.75, 3.2, 1.75, drawMMI, { frame: '#6d5b50' });
      R.anchors.board = wb.anchor;
      const [sx, sz] = P(0.035, 0.7);
      R.anchors.shelf = shelf(g, sx + 0.25, y, sz, FACE.east, 2.4, 2.0,
        ['#6d5b50', '#a8876f', '#c9b8a6', '#8a6d58', '#e6dcd5']);
      const [tx, tz] = P(0.36, 0.8);
      g.add(at(box(1.9, 0.75, 1.0, '#d8b48c'), tx, y + 0.375, tz));
      const barge = new THREE.Group();
      barge.add(at(box(1.2, 0.18, 0.42, '#7a5b45'), 0, 0.09, 0), at(box(1.05, 0.12, 0.36, '#5c4636'), 0, 0.21, 0));
      for (let i = 0; i < 3; i++) barge.add(at(sphere(0.12, '#4a4038'), -0.35 + i * 0.35, 0.28, 0));
      barge.add(at(box(0.36, 0.22, 0.3, '#d0453a'), 0.86, 0.11, 0), at(box(0.18, 0.18, 0.18, '#f4f0ea'), 0.82, 0.3, 0));
      barge.position.set(tx - 0.2, y + 0.75, tz); g.add(barge);
      R.anchors.barge = { pos: new THREE.Vector3(tx, y, tz - 1.0), face: 0 };
      const [kx, kz] = P(0.52, 0.14);
      g.add(at(cyl(0.38, 0.42, 0.08, '#c9a24a', 16, { metalness: 0.5, roughness: 0.4 }), kx, y + 0.04, kz));
      R.anchors.dock = { pos: new THREE.Vector3(kx, y, kz), face: 0 };
      R.anchors.botBoard = { pos: new THREE.Vector3(r.x0 + r.w * 0.4, y, r.z0 + 1.2), face: Math.PI };
      lamp(g, P(0.06, 0.1)[0] + 0.3, y, P(0.06, 0.1)[1] + 0.3, nightMats);
      // ANI side (right third): the IUP holder — grade control, core samples, hard hats
      rug(g, ...[P(0.82, 0.5)[0], y, P(0.82, 0.5)[1]], 3.6, 7.0, '#efe5d3', '#8a6a3b');
      const [ax, az] = P(0.8, 0.42);
      R.anchors.p_desk = deskSet(g, ax, y, az, FACE.north, { accent: '#8a6a3b', screen: '#6b5a3a' });
      const ab = wallBoard(g, R, 'north', 0.8, 1.8, 2.3, 1.2, drawANI, { frame: '#8a6a3b' });
      R.anchors.p_board = ab.anchor;
      const rack = new THREE.Group();
      rack.add(at(box(2.0, 0.9, 0.5, '#9b7653'), 0, 0.45, 0));
      for (let i = 0; i < 6; i++) for (let k = 0; k < 3; k++) {
        const sc = cyl(0.07, 0.07, 0.3, ['#7a4b2a', '#b5793f', '#5e6b4e'][(i + k) % 3], 8); sc.rotation.z = Math.PI / 2;
        sc.position.set(-0.75 + i * 0.3, 0.98, -0.12 + k * 0.12); rack.add(sc);
      }
      rack.position.set(...[P(0.8, 0.86)[0], y, P(0.8, 0.86)[1]]); g.add(rack);
      R.anchors.p_shelf = { pos: new THREE.Vector3(rack.position.x, y, rack.position.z - 0.9), face: 0, read: true };
      const [hx, hz] = P(0.96, 0.7);
      g.add(at(box(0.5, 0.9, 0.5, '#9b7653'), hx - 0.2, y + 0.45, hz));
      for (let i = 0; i < 3; i++) g.add(at(hardhat(), hx - 0.2, y + 0.9 + i * 0.25, hz));
      R.anchors.p_hats = { pos: new THREE.Vector3(hx - 1.1, y, hz), face: Math.PI / 2 };
      g.add(at(plant(1.0), ...[P(0.96, 0.08)[0] - 0.2, y, P(0.96, 0.08)[1] + 0.2]));
      break;
    }
    case 'mme': {
      // MME side (left): coal-trading ledger desk, to-confirm pinboard, printed profiles
      const [dx, dz] = P(0.3, 0.42);
      R.anchors.desk = deskSet(g, dx, y, dz, FACE.north, { accent: c.accent, top: '#e9e2d8', screen: '#3a3a3a' });
      const wb = wallBoard(g, R, 'north', 0.3, 1.75, 2.6, 1.6, drawMME, { frame: '#8b6f4f' });
      R.anchors.board = wb.anchor;
      const [px, pz] = P(0.2, 0.78);
      g.add(at(box(1.6, 0.75, 0.9, '#e9e2d8'), px, y + 0.375, pz));
      for (let i = 0; i < 4; i++) {
        const st = box(0.42, 0.06 + i * 0.03, 0.3, i % 2 ? '#F3EEE6' : '#ffffff');
        st.position.set(px - 0.55 + i * 0.37, y + 0.78 + (0.03 + i * 0.015), pz); g.add(st);
      }
      g.add(at(box(0.42, 0.02, 0.3, '#A50E12'), px - 0.55, y + 0.85, pz));
      R.anchors.shelf = { pos: new THREE.Vector3(px, y, pz - 1.0), face: 0, read: true };
      // SMU side (right): the coal IUP holder — mine plan board, coal stockpile, miner's lamp rack
      rug(g, ...[P(0.76, 0.5)[0], y, P(0.76, 0.5)[1]], 4.0, 7.0, '#e8e3dc', '#1A1714');
      const [sx2, sz2] = P(0.74, 0.42);
      R.anchors.p_desk = deskSet(g, sx2, y, sz2, FACE.north, { accent: '#1A1714', top: '#e9e2d8', screen: '#4a4a4a' });
      const sb = wallBoard(g, R, 'north', 0.75, 1.8, 2.4, 1.2, drawSMU, { frame: '#1A1714' });
      R.anchors.p_board = sb.anchor;
      const pile = new THREE.Group();
      for (const [ox, oz, rr2, hh] of [[0, 0, 0.75, 0.8], [0.7, 0.3, 0.5, 0.55], [-0.6, 0.25, 0.45, 0.5]]) {
        const cn = cone(rr2, hh, '#26221f', 9); cn.position.set(ox, hh / 2, oz); pile.add(cn);
      }
      pile.position.set(...[P(0.78, 0.84)[0], y, P(0.78, 0.84)[1]]); g.add(pile);
      R.anchors.p_shelf = { pos: new THREE.Vector3(pile.position.x - 0.2, y, pile.position.z - 1.3), face: 0, read: true };
      g.add(at(plant(1.0), ...[P(0.06, 0.92)[0], y, P(0.06, 0.92)[1]]));
      break;
    }
    case 'axiom': {
      rug(g, r.cx + 0.4, y, r.cz + 1.2, r.w - 5.5, r.d - 5.2, '#4a423b', '#C88A4E');
      const [dx, dz] = P(0.32, 0.4);
      R.anchors.desk = deskSet(g, dx, y, dz, FACE.north, { accent: '#C88A4E', top: '#3b3631', screen: '#C88A4E' });
      const wb = wallBoard(g, R, 'north', 0.34, 1.75, 2.8, 1.6, drawAXIOM, { frame: '#070605' });
      R.anchors.board = wb.anchor;
      // vial shelf (east wall)
      const vs = new THREE.Group();
      vs.add(at(box(2.4, 1.9, 0.4, '#1f1c19'), 0, 0.95, 0));
      for (let rI = 0; rI < 3; rI++) for (let i = 0; i < 9; i++) {
        vs.add(at(cyl(0.06, 0.06, 0.24, '#f2ede5', 8), -1.0 + i * 0.25, 0.4 + rI * 0.55, 0.12));
        vs.add(at(cyl(0.065, 0.065, 0.05, '#C88A4E', 8, { metalness: 0.6, roughness: 0.3 }), -1.0 + i * 0.25, 0.55 + rI * 0.55, 0.12));
      }
      vs.position.set(r.x1 - 0.45, y, r.z0 + r.d * 0.42); vs.rotation.y = FACE.west;
      g.add(vs);
      R.anchors.shelf = { pos: new THREE.Vector3(r.x1 - 1.45, y, r.z0 + r.d * 0.42), face: FACE.east, read: true };
      // migration cabinet: one drawer per migration (capped at 12)
      const cab = new THREE.Group();
      cab.add(at(box(0.9, 1.5, 0.6, '#3b3631'), 0, 0.75, 0));
      const drawers = [];
      for (let i = 0; i < 12; i++) {
        const dr = box(0.38, 0.2, 0.04, '#C88A4E', { metalness: 0.4, roughness: 0.5 });
        dr.position.set(i % 2 ? 0.2 : -0.2, 0.18 + Math.floor(i / 2) * 0.23, 0.31); cab.add(dr); drawers.push(dr);
      }
      cab.position.set(...[P(0.82, 0.12)[0], y, P(0.82, 0.12)[1]]); g.add(cab);
      R.updaters.push(data => {
        const n = roomState(data, 'axiom')?.signals?.migrations?.count ?? 0;
        drawers.forEach((d, i) => { d.visible = i < Math.min(n, 12); });
      });
      // lot-verify scanner
      const [sx, sz] = P(0.62, 0.72);
      g.add(at(cyl(0.25, 0.3, 0.95, '#3b3631', 12), sx, y + 0.47, sz));
      const beam = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3),
        new THREE.MeshStandardMaterial({ color: '#ff6b4a', emissive: '#ff6b4a', emissiveIntensity: 0.8, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      beam.rotation.x = -Math.PI / 2; beam.position.set(sx, y + 0.97, sz); g.add(beam);
      R.anchors.scanner = { pos: new THREE.Vector3(sx, y, sz + 0.7), face: Math.PI };
      R.anchors.gate = { pos: new THREE.Vector3(r.cx + 2.2, y, r.z1 - 1.2), face: 0 };
      g.add(at(plant(1.1, '#3b3631', '#7fb685'), ...[P(0.06, 0.92)[0], y, P(0.06, 0.92)[1]]));
      break;
    }
    case 'ijba': {
      const sc = wallBoard(g, R, 'west', 0.45, 1.7, 3.0, 1.7, drawIJBA, { frame: '#05112B', emissive: true });
      R.anchors.board = sc.anchor;
      const [dx, dz] = P(0.24, 0.45);
      R.anchors.desk = deskSet(g, dx, y, dz, FACE.west, { accent: '#1650B4', screen: '#1650B4' });
      // jet ski on a stand
      const js = jetski('#1650B4', '#D01530');
      js.position.set(...[P(0.62, 0.55)[0], y + 0.45, P(0.62, 0.55)[1]]); js.rotation.y = 0.6;
      g.add(at(box(2.6, 0.45, 1.4, '#e3ecf7'), js.position.x, y + 0.22, js.position.z), js);
      R.anchors.jetski = { pos: new THREE.Vector3(js.position.x - 0.2, y, js.position.z - 1.3), face: 0 };
      for (const [fx, fz, col] of [[0.88, 0.25, '#ff8a3d'], [0.93, 0.4, '#ffd23f'], [0.86, 0.5, '#ff8a3d']]) {
        const [bx, bz] = P(fx, fz);
        g.add(at(cyl(0.22, 0.28, 0.9, col, 12), bx, y + 0.45, bz), at(sphere(0.2, col), bx, y + 0.95, bz));
      }
      // locked filing cabinet: master plan + sponsorship, never opened
      const fc = new THREE.Group();
      fc.add(at(box(0.8, 1.4, 0.65, '#5a6475'), 0, 0.7, 0));
      for (let i = 0; i < 3; i++) fc.add(at(box(0.66, 0.36, 0.03, '#6c7789'), 0, 0.28 + i * 0.44, 0.33));
      fc.add(at(box(0.16, 0.2, 0.08, '#c9a24a', { metalness: 0.6 }), 0.2, 1.15, 0.36));
      const tag = board(0.6, 0.18, (ctx, w, h) => { rr(ctx, 0, 0, w, h, 0, '#D01530'); txt(ctx, 'CONFIDENTIAL', w / 2, h * 0.72, h * 0.55, '#fff', 700, 'center'); }, { px: 400, frame: '#D01530' });
      tag.group.position.set(-0.05, 0.95, 0.36); fc.add(tag.group);
      fc.position.set(...[P(0.88, 0.86)[0], y, P(0.88, 0.86)[1]]); fc.rotation.y = -Math.PI / 2;
      g.add(fc);
      // calendar board on the north (door) wall
      const cal = wallBoard(g, R, 'north', 0.18, 1.7, 1.8, 1.2, drawCalendar, { frame: '#05112B' });
      R.anchors.calendar = cal.anchor;
      g.add(at(box(0.7, 0.5, 0.5, '#e8e8e8'), ...[P(0.45, 0.88)[0], y + 0.25, P(0.45, 0.88)[1]]));
      g.add(at(plant(1.0), ...[P(0.06, 0.9)[0], y, P(0.06, 0.9)[1]]));
      break;
    }
    case 'cafe': {
      const [cx, cz] = P(0.5, 0.8);
      g.add(at(box(4.4, 1.05, 0.9, '#c98d68'), cx, y + 0.52, cz), at(box(4.6, 0.08, 1.05, '#f3e2cf'), cx, y + 1.08, cz));
      const em = new THREE.Group();
      em.add(at(box(0.6, 0.55, 0.45, '#b9b9b9', { metalness: 0.5, roughness: 0.35 }), 0, 0.28, 0), at(box(0.15, 0.12, 0.15, '#333'), 0, 0.08, 0.2));
      em.position.set(cx - 1.2, y + 1.12, cz); g.add(em);
      for (let i = 0; i < 4; i++) g.add(at(cyl(0.07, 0.06, 0.12, ['#fff', '#f6c7a8', '#c9e4d6', '#fff'][i]), cx + 0.4 + i * 0.25, y + 1.18, cz));
      g.add(at(cake(), cx + 1.6, y + 1.12, cz));
      R.anchors.counter = { pos: new THREE.Vector3(cx, y, cz - 1.1), face: 0 };
      R.anchors.barista = { pos: new THREE.Vector3(cx + 0.4, y, cz + 0.85), face: Math.PI };
      // beanbags
      const bb = [[0.18, 0.28, '#f2a07b'], [0.32, 0.42, '#9ccfc0'], [0.14, 0.52, '#f6d27a']];
      R.anchors.beanbags = bb.map(([fx, fz, col]) => {
        const [bx, bz] = P(fx, fz);
        const s = sphere(0.55, col); s.scale.set(1, 0.55, 1); s.position.set(bx, y + 0.3, bz); g.add(s);
        return { pos: new THREE.Vector3(bx, y + 0.18, bz), face: Math.PI / 2, sit: true, low: true };
      });
      // arcade cabinets (east wall)
      R.anchors.arcade = [0.28, 0.5].map((fz, i) => {
        const [ax, az] = P(0.93, fz);
        const cab = new THREE.Group();
        cab.add(at(box(0.8, 1.7, 0.7, i ? '#6fa8dc' : '#f28b82'), 0, 0.85, 0));
        const scrM = new THREE.MeshStandardMaterial({ color: '#1b2a3a', emissive: i ? '#7af0c8' : '#ffd36b', emissiveIntensity: 0.7 });
        nightMats.push(scrM);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), scrM); scr.position.set(0, 1.25, 0.36);
        cab.add(scr, at(box(0.7, 0.08, 0.3, '#333'), 0, 0.95, 0.45));
        cab.position.set(ax, y, az); cab.rotation.y = FACE.west; g.add(cab);
        return { pos: new THREE.Vector3(ax - 1.0, y, az), face: FACE.east };
      });
      // tables
      for (const [fx, fz] of [[0.55, 0.28], [0.7, 0.45]]) {
        const [tx, tz] = P(fx, fz);
        g.add(at(cyl(0.45, 0.45, 0.05, '#f3e2cf', 16), tx, y + 0.75, tz), at(cyl(0.05, 0.05, 0.75, '#8d6a4a'), tx, y + 0.37, tz));
      }
      g.add(at(plant(1.2), ...[P(0.06, 0.92)[0], y, P(0.06, 0.92)[1]]), at(plant(1.0), ...[P(0.94, 0.92)[0], y, P(0.94, 0.92)[1]]));
      const sign = wallBoard(g, R, 'west', 0.6, 2.0, 1.6, 0.6, (ctx, w, h) => {
        rr(ctx, 0, 0, w, h, 0, '#fff4e8'); txt(ctx, 'Kopi · Arcade', w / 2, h * 0.62, h * 0.38, '#b0603e', 600, 'center');
      }, { frame: '#c98d68' });
      void sign;
      break;
    }
    case 'studio': {
      const wb = wallBoard(g, R, 'west', 0.5, 1.75, 4.0, 1.9, drawStudio, { frame: '#2f3b36', emissive: true });
      R.anchors.board = wb.anchor;
      const [dx, dz] = P(0.2, 0.5);
      R.anchors.desk = deskSet(g, dx, y, dz, FACE.west, { accent: '#5b8f7b', screen: '#5b8f7b' });
      // easel with the KOL dashboard build prompt
      const [ex, ez] = P(0.68, 0.55);
      const easel = new THREE.Group();
      for (const s of [-1, 1]) { const l = box(0.06, 1.8, 0.06, '#8d6a4a'); l.position.set(s * 0.45, 0.9, 0); l.rotation.z = s * 0.12; easel.add(l); }
      const canv = board(1.1, 0.8, (ctx, w, h) => {
        rr(ctx, 0, 0, w, h, 0, '#fffaf2');
        txt(ctx, 'KOL dashboard', 20, 50, 30, '#2b2522', 600); txt(ctx, 'build prompt', 20, 88, 26, '#7a6f66', 500);
        for (let i = 0; i < 5; i++) rr(ctx, 20, 110 + i * 22, w - 40 - (i % 3) * 30, 10, 5, '#e6dccd');
      }, { frame: '#d8b48c' });
      canv.group.position.set(0, 1.2, 0.06); easel.add(canv.group);
      easel.position.set(ex, y, ez); easel.rotation.y = -0.5; g.add(easel);
      R.anchors.easel = { pos: new THREE.Vector3(ex - 0.6, y, ez + 0.9), face: Math.PI - 0.5 };
      R.anchors.shelf = shelf(g, ...[P(0.55, 0.06)[0], y, P(0.55, 0.06)[1] + 0.1], FACE.south, 2.4, 2.0);
      g.add(at(plant(1.2), ...[P(0.92, 0.9)[0], y, P(0.92, 0.9)[1]]), at(plant(0.9, '#e8b0a0'), ...[P(0.9, 0.12)[0], y, P(0.9, 0.12)[1]]));
      lamp(g, ...[P(0.08, 0.15)[0], y, P(0.08, 0.15)[1]], nightMats);
      break;
    }
    default: {
      // Any repo room added in agents.config.json gets a working set: desk, shelf, and a board
      // showing its last commit and agent status, so a new room is one config entry.
      if (c.kind !== 'repo') break;
      const [dx, dz] = P(0.35, 0.42);
      const side = c.door === 'north' ? 'west' : 'north';
      R.anchors.desk = deskSet(g, dx, y, dz, side === 'north' ? FACE.north : FACE.west, { accent: c.accent, screen: c.accent });
      R.anchors.board = wallBoard(g, R, side, 0.5, 1.75, 2.8, 1.5, (ctx, w, h, data) => {
        rr(ctx, 0, 0, w, h, 0, c.accent2 || '#fbf7f2');
        txt(ctx, c.name.toUpperCase(), 24, 52, 30, c.accent || '#2b2522', 700);
        sampleMark(ctx, w, h, data);
        const rs = roomState(data, c.id), a = data?.state?.agents?.find(x => x.room === c.id && x.kind === 'agent');
        if (a) chip(ctx, 24, 112, STATUS[a.status]?.label ?? a.status, STATUS[a.status]?.color ?? '#999', 22);
        if (rs?.last_commit) fitTxt(ctx, rs.last_commit.subject, 24, 170, 24, w - 48, '#2b2522');
        if (rs?.last_commit) txt(ctx, rs.last_commit.at.slice(0, 10), 24, 204, 20, '#7a6f66');
      }, { frame: c.accent }).anchor;
      R.anchors.shelf = shelf(g, ...[P(0.85, 0.5)[0], y, P(0.85, 0.5)[1]], FACE.west, 2.2, 2.0);
      g.add(at(plant(1.0), ...[P(0.08, 0.9)[0], y, P(0.08, 0.9)[1]]));
      break;
    }
    case 'glu':
    case 'portfolio': {
      for (const [fx, fz] of [[0.3, 0.4], [0.6, 0.6]]) {
        const s = box(1.1, 0.8, 0.9, '#e9e4dd'); s.position.set(...[P(fx, fz)[0], y + 0.4, P(fx, fz)[1]]); g.add(s);
      }
      break;
    }
    case 'office': {
      // glass corner office at the east end of the hallway; door on the west wall
      const [dx, dz] = P(0.5, 0.52);
      R.anchors.desk = deskSet(g, dx, y, dz, FACE.north, { accent: '#D01530', top: '#f4efe9', screen: '#D01530' });
      const tray = new THREE.Group();
      tray.add(at(box(0.5, 0.06, 0.38, '#8d6a4a'), 0, 0, 0));
      const papers = [];
      for (let i = 0; i < 8; i++) { const pp = box(0.42, 0.02, 0.3, i % 2 ? '#ffffff' : '#fdf3e3'); pp.position.y = 0.05 + i * 0.025; pp.rotation.y = (i % 3 - 1) * 0.06; tray.add(pp); papers.push(pp); }
      tray.position.set(dx + 0.55, y + 0.82, dz + 0.1); g.add(tray);
      R.updaters.push(data => {
        const n = (data?.state?.agents || []).filter(a => a.status === 'waiting_review' && a.id !== 'aero').length;
        papers.forEach((pp, i) => { pp.visible = i < Math.min(n, 8); });
      });
      // review screen on a stand at the north side, facing the desk
      const scr = board(2.6, 1.5, drawReview, { frame: '#1d1d1d', emissive: true });
      scr.group.position.set(r.cx, y + 1.55, r.z0 + 0.7); g.add(scr.group, at(box(0.12, 0.8, 0.12, '#333'), r.cx, y + 0.4, r.z0 + 0.66));
      R.boards.push(scr);
      R.anchors.board = { pos: new THREE.Vector3(r.cx - 0.6, y, r.z0 + 1.9), face: Math.PI };
      // helmet + IJWS poster on the east side
      const helm = sphere(0.24, '#D01530', { roughness: 0.4 }); helm.scale.set(1, 0.85, 1.1);
      g.add(at(box(0.5, 1.0, 0.6, '#e9e0d6'), r.x1 - 0.6, y + 0.5, r.z0 + 0.8), at(helm, r.x1 - 0.6, y + 1.18, r.z0 + 0.8));
      const poster = board(1.0, 1.4, (ctx, w, h) => {
        const gr = ctx.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#05112B'); gr.addColorStop(1, '#1650B4');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
        txt(ctx, 'IJWS', w / 2, h * 0.36, 70, '#fff', 700, 'center'); txt(ctx, '2026', w / 2, h * 0.5, 44, '#D01530', 700, 'center');
        txt(ctx, 'Ancol · Jakarta', w / 2, h * 0.86, 22, '#d6e8f8', 500, 'center');
      }, { frame: '#fff' });
      poster.group.position.set(r.x1 - 0.5, y + 1.3, r.cz + 0.6); poster.group.rotation.y = -Math.PI / 2;
      g.add(poster.group, at(box(0.06, 0.6, 0.06, '#555'), r.x1 - 0.5, y + 0.3, r.cz + 0.6));
      const sofa = new THREE.Group();
      sofa.add(at(box(2.0, 0.4, 0.8, '#f0b6a8'), 0, 0.3, 0), at(box(2.0, 0.6, 0.2, '#e89f90'), 0, 0.6, -0.35));
      sofa.position.set(r.cx + 0.8, y, r.z1 - 0.9); sofa.rotation.y = Math.PI; g.add(sofa);
      R.anchors.sofa = { pos: new THREE.Vector3(r.cx + 0.8, y + 0.05, r.z1 - 1.0), face: Math.PI, sit: true };
      g.add(at(plant(1.0), r.x0 + 0.6, y, r.z1 - 0.6), at(plant(0.8), r.x1 - 0.5, y, r.z1 - 0.5));
      break;
    }
    case 'den': {
      // central console ring
      const con = new THREE.Group();
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.35, 10, 32), mat('#2b3a40'));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.8; con.add(ring);
      con.add(at(cyl(1.2, 1.4, 0.3, '#3f8f9a', 24), 0, 0.15, 0));
      const holo = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.05, 32),
        new THREE.MeshStandardMaterial({ color: '#7fe0e6', emissive: '#7fe0e6', emissiveIntensity: 0.6, transparent: true, opacity: 0.55 }));
      holo.position.y = 1.6; con.add(holo);
      con.position.set(r.cx, y, r.cz); g.add(con);
      R.anchors.console = { pos: new THREE.Vector3(r.cx, y + 0.3, r.cz), face: 0 };
      R.holo = holo;
      // big task board
      const tb = wallBoard(g, R, 'north', 0.5, 2.3, 7.0, 2.8, drawDen, { frame: '#16262b', emissive: true, px: 160 });
      void tb;
      // pipes from the console up to every repo room
      R.pipes = [];
      for (const other of cfg.rooms.filter(o => o.kind === 'repo')) {
        const [ox, oz, ow, od] = other.rect;
        const tx = ox + ow / 2, tz = oz + od / 2;
        const pm = new THREE.MeshStandardMaterial({ color: other.accent, emissive: other.accent, emissiveIntensity: 0.25, roughness: 0.4 });
        const len = Math.hypot(tx - r.cx, tz - r.cz);
        const h = cyl(0.12, 0.12, len, pm, 8); h.rotation.z = Math.PI / 2;
        h.rotation.y = -Math.atan2(tz - r.cz, tx - r.cx);
        h.position.set((tx + r.cx) / 2, -0.7, (tz + r.cz) / 2);
        const v = cyl(0.12, 0.12, 3.2, pm, 8); v.position.set(tx, -0.7 - 1.6 + 1.6, tz); v.scale.y = 0.4;
        const drop = cyl(0.12, 0.12, 3.6, pm, 8); drop.position.set(r.cx + (tx - r.cx) * 0.05, y + 2.2, r.cz + (tz - r.cz) * 0.05);
        g.add(h, v, drop);
        R.pipes.push({ roomId: other.id, mat: pm });
      }
      for (const [fx, fz] of [[0.08, 0.92], [0.92, 0.92], [0.08, 0.3]]) g.add(at(plant(1.1, '#5b6a70', '#6fa98a'), ...[P(fx, fz)[0], y, P(fx, fz)[1]]));
      break;
    }
    case 'library': {
      const repoRooms = cfg.rooms.filter(o => o.kind === 'repo');
      const bookGeo = new THREE.BoxGeometry(0.12, 0.36, 0.28);
      repoRooms.forEach((o, i) => {
        const zz = r.z0 + 3.0 + i * 4.2;
        const sh = new THREE.Group();
        sh.add(at(box(5.2, 2.2, 0.5, '#6b4f3a'), 0, 1.1, 0));
        const im = new THREE.InstancedMesh(bookGeo, mat(o.accent), 72);
        const m4 = new THREE.Matrix4();
        for (let k = 0; k < 72; k++) {
          const row = Math.floor(k / 18), col = k % 18;
          m4.makeTranslation(-2.3 + col * 0.27, 0.35 + row * 0.5, 0.2);
          im.setMatrixAt(k, m4);
        }
        im.count = 0; im.castShadow = true; im.frustumCulled = false; sh.add(im);
        const sign = board(2.4, 0.5, (ctx, w, h, data) => {
          rr(ctx, 0, 0, w, h, 0, '#2a211c');
          const lib = roomState(data, o.id)?.signals?.library;
          txt(ctx, o.name, 20, h * 0.66, h * 0.42, '#f3e6d6', 600);
          txt(ctx, lib ? `${lib.length} docs` : '—', w - 20, h * 0.66, h * 0.36, o.accent, 600, 'right');
        }, { frame: '#b07a3c', px: 200 });
        sign.group.position.set(0, 2.5, 0.1); sh.add(sign.group);
        R.boards.push(sign);
        sh.position.set(r.cx + 0.6, y, zz); g.add(sh);
        R.updaters.push(data => { im.count = Math.min(roomState(data, o.id)?.signals?.library?.length ?? 0, 72); });
      });
      g.add(at(box(1.8, 0.75, 1.0, '#8d6a4a'), r.x0 + 1.6, y + 0.375, r.cz));
      lamp(g, r.x0 + 1.0, y, r.cz + 1.2, nightMats);
      break;
    }
  }
}

function jetski(body, stripe) {
  const g = new THREE.Group();
  const hull = box(1.9, 0.36, 0.7, body); hull.position.y = 0.18;
  const nose = cone(0.35, 0.6, body, 4); nose.rotation.z = -Math.PI / 2; nose.rotation.x = Math.PI / 4; nose.position.set(1.22, 0.18, 0);
  const deck = box(1.3, 0.12, 0.55, '#f5f5f5'); deck.position.set(-0.1, 0.42, 0);
  const seat = box(0.75, 0.16, 0.36, '#222'); seat.position.set(-0.25, 0.56, 0);
  const stripeM = box(1.9, 0.08, 0.72, stripe); stripeM.position.y = 0.3;
  const bar = box(0.08, 0.08, 0.6, '#333'); bar.position.set(0.35, 0.8, 0);
  const col = box(0.08, 0.3, 0.08, '#333'); col.position.set(0.32, 0.62, 0);
  g.add(hull, nose, deck, seat, stripeM, bar, col);
  return g;
}

function cake() {
  const g = new THREE.Group();
  g.add(at(cyl(0.18, 0.18, 0.14, '#f6d6e0', 16), 0, 0.07, 0), at(cyl(0.18, 0.18, 0.03, '#e0607e', 16), 0, 0.15, 0));
  return g;
}

function hardhat() {
  const g = new THREE.Group();
  const d = sphere(0.18, '#f2c230'); d.scale.y = 0.7; g.add(d, at(cyl(0.24, 0.24, 0.02, '#f2c230', 14), 0, -0.02, 0));
  return g;
}

// ── board painters (state → canvas) ────────────────────────────────────────

function drawMMI(ctx, w, h, data) {
  rr(ctx, 0, 0, w, h, 0, '#fbf7f2');
  header(ctx, w, 'PRICE BASIS', '#3b2f28');
  sampleMark(ctx, w, h, data);
  const s = roomState(data, 'mmi')?.signals?.hma;
  if (!s) { txt(ctx, data?.state ? 'hma.json unreadable' : 'Loading…', 24, 130, 28, '#8a7a6c'); return; }
  const H = s.hma, K = s.kurs, col = w * 0.54, colW = col - 48;
  // HMA (left)
  txt(ctx, 'HMA', 24, 100, 20, '#9a8b7d', 600);
  fitTxt(ctx, `${H.monthLabel ?? '—'} · periode ${H.period ?? '—'}`, 24, 134, 27, colW, '#2b2522', 600);
  txt(ctx, `effective ${H.effective}`, 24, 166, 21, '#6d5b50');
  chip(ctx, 24, 212, H.fresh ? 'FRESH' : `STALE · due ${H.due}`, H.fresh ? '#3fa66b' : '#d64545', 20);
  if (!H.fresh) txt(ctx, 'awaiting ESDM graphic', 24, 252, 20, '#d64545', 500);
  // KURS (right)
  txt(ctx, 'KURS · BI MID', col, 100, 20, '#9a8b7d', 600);
  fitTxt(ctx, K.rate ? `Rp ${Number(K.rate).toLocaleString('id-ID')}` : '—', col, 138, 32, w - col - 24, '#2b2522', 600);
  txt(ctx, `effective ${K.effective}`, col, 170, 21, '#6d5b50');
  chip(ctx, col, 212, K.fresh ? 'FRESH' : `STALE · due ${K.due}`, K.fresh ? '#3fa66b' : '#d64545', 20);
  // values + source
  const v = H.values || {};
  const f = n => n == null ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  rr(ctx, 24, h - 96, w - 48, 2, 1, '#e6dcd0');
  fitTxt(ctx, `Ni ${f(v.ni)} · Co ${f(v.co)} · Fe ${f(v.fe)} · Cr ${f(v.cr)} ${H.unit || ''}`, 24, h - 60, 20, w - 48, '#4d4038');
  fitTxt(ctx, `site/assets/hma.json · updated ${s.updatedAt} by ${s.updatedBy}`, 24, h - 26, 17, w - 48, '#9a8b7d');
}

function drawPartner(ctx, w, h, title, sub, accent, bg) {
  rr(ctx, 0, 0, w, h, 0, bg);
  txt(ctx, title, 24, 58, 36, accent, 700);
  fitTxt(ctx, sub, 24, 100, 24, w - 48, '#5a4c40', 500);
  rr(ctx, 24, 130, 300, 50, 25, '#a9a39b');
  txt(ctx, 'NO DATA SOURCE', 174, 165, 24, '#fff', 700, 'center');
  txt(ctx, 'Status stays offline until one is connected.', 24, 226, 22, '#5a4c40', 500);
}
function drawANI(ctx, w, h) { drawPartner(ctx, w, h, 'PT ANI', 'IUP-OP holder · Halmahera Timur', '#5a4524', '#f1e6d0'); }
function drawSMU(ctx, w, h) { drawPartner(ctx, w, h, 'PT SMU', 'Sarana Mandiri Utama · coal IUP', '#1A1714', '#F3EEE6'); }

function drawMME(ctx, w, h, data) {
  ctx.fillStyle = '#c99d6b'; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 400; i++) { ctx.fillStyle = `rgba(90,60,30,${0.05 + (i % 5) * 0.02})`; ctx.fillRect((i * 97) % w, (i * 53) % h, 3, 3); }
  rr(ctx, 20, 18, w - 40, 62, 8, '#F3EEE6');
  txt(ctx, 'TO CONFIRM', 40, 62, 34, '#A50E12', 700);
  sampleMark(ctx, w, h, data);
  const n = roomState(data, 'mme')?.signals?.placeholders_open;
  if (n == null) { txt(ctx, data?.state ? 'README unreadable' : 'Loading…', 40, 150, 28, '#3b2a1a'); return; }
  for (let i = 0; i < n; i++) {
    const x = 50 + (i % 4) * ((w - 100) / 4), y = 110 + Math.floor(i / 4) * 95;
    ctx.save(); ctx.translate(x + 60, y + 40); ctx.rotate(((i * 37) % 11 - 5) * 0.02);
    rr(ctx, -60, -40, 120, 80, 4, i % 2 ? '#fff6c9' : '#ffffff');
    for (let k = 0; k < 3; k++) rr(ctx, -45, -18 + k * 16, 90 - k * 18, 6, 3, '#d5c9b8');
    ctx.beginPath(); ctx.arc(0, -34, 9, 0, Math.PI * 2); ctx.fillStyle = '#A50E12'; ctx.fill();
    ctx.restore();
  }
  txt(ctx, `${n} open placeholder${n === 1 ? '' : 's'} · README.md`, 40, h - 26, 26, '#2a1a0c', 600);
}

function drawAXIOM(ctx, w, h, data) {
  rr(ctx, 0, 0, w, h, 0, '#14110f');
  header(ctx, w, 'DECISIONS', '#F2EDE5');
  sampleMark(ctx, w, h, data);
  const sig = roomState(data, 'axiom')?.signals;
  const n = sig?.decisions;
  if (n == null) { txt(ctx, data?.state ? 'DECISIONS.md unreadable' : 'Loading…', 24, 130, 28, '#9C9488'); return; }
  for (let i = 0; i < n; i++) {
    const x = 24 + (i % 6) * ((w - 48) / 6), y = 90 + Math.floor(i / 6) * 86;
    rr(ctx, x, y, (w - 48) / 6 - 12, 72, 6, '#2a2520');
    txt(ctx, String(i + 1), x + 14, y + 46, 30, '#C88A4E', 600);
  }
  const m = sig.migrations;
  txt(ctx, `${n} decisions in docs/DECISIONS.md`, 24, h - 62, 24, '#F2EDE5', 500);
  if (m) fitTxt(ctx, `${m.count} migrations · latest ${m.latest}`, 24, h - 26, 22, w * 0.6, '#9C9488');
  const gate = agentState(data, 'gatekeeper');
  if (gate) chip(ctx, w - 260, h - 30, `gates: ${STATUS[gate.status]?.label ?? gate.status}`, STATUS[gate.status]?.color ?? '#777', 20);
}

function drawIJBA(ctx, w, h, data) {
  const gr = ctx.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#05112B'); gr.addColorStop(1, '#0d2b6b');
  ctx.fillStyle = gr; ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(58,143,217,0.35)'; ctx.lineWidth = 3;
  for (let i = 0; i < 6; i++) { ctx.beginPath(); for (let x = 0; x <= w; x += 20) ctx.lineTo(x, h * 0.72 + Math.sin(x / 60 + i) * 10 + i * 14); ctx.stroke(); }
  txt(ctx, 'jetsport.id', 30, 80, 56, '#ffffff', 700);
  txt(ctx, 'IJWS 2026 · Ancol, Jakarta', 30, 124, 28, '#D6E8F8', 500);
  rr(ctx, 30, 140, 90, 6, 3, '#D01530');
  sampleMark(ctx, w, h, data);
  const pages = roomState(data, 'ijba')?.signals?.site_pages;
  if (pages) pages.slice(0, 5).forEach((p, i) => fitTxt(ctx, '▸ ' + p, 30, 196 + i * 34, 24, w - 60, '#D6E8F8'));
  else txt(ctx, data?.state ? 'site/ unreadable' : 'Loading…', 30, 200, 24, '#D6E8F8');
}

function drawCalendar(ctx, w, h) {
  rr(ctx, 0, 0, w, h, 0, '#F0F4FA');
  txt(ctx, 'RACE CALENDAR', 20, 44, 28, '#05112B', 700);
  for (let i = 0; i < 8; i++) {
    const x = 20 + (i % 4) * ((w - 40) / 4), y = 70 + Math.floor(i / 4) * 90;
    rr(ctx, x, y, (w - 40) / 4 - 10, 78, 6, i === 0 ? '#1650B4' : '#D6E8F8');
    txt(ctx, 'R' + (i + 1), x + 12, y + 48, 28, i === 0 ? '#fff' : '#05112B', 700);
  }
}

function drawStudio(ctx, w, h, data) {
  rr(ctx, 0, 0, w, h, 0, '#1f2925');
  txt(ctx, 'PROJECTS', 24, 52, 32, '#eef6f1', 700);
  sampleMark(ctx, w, h, data);
  const pr = roomState(data, 'studio')?.signals?.projects;
  if (!pr) { txt(ctx, data?.state ? 'CLAUDE.md unreadable' : 'Loading…', 24, 120, 28, '#9cc3b2'); return; }
  const cols = 4, cw = (w - 48) / cols, chh = 84;
  pr.slice(0, 16).forEach((p, i) => {
    const x = 24 + (i % cols) * cw, y = 78 + Math.floor(i / cols) * (chh + 10);
    rr(ctx, x, y, cw - 12, chh, 8, '#2c3934');
    fitTxt(ctx, p.name, x + 14, y + 38, 24, cw - 40, '#eef6f1', 600);
    txt(ctx, ':' + p.port, x + 14, y + 68, 20, '#7fc3a4', 500);
  });
}

function drawReview(ctx, w, h, data) {
  rr(ctx, 0, 0, w, h, 0, '#161616');
  txt(ctx, 'REVIEW DESK', 24, 52, 32, '#ffffff', 700);
  sampleMark(ctx, w, h, data);
  const ag = (data?.state?.agents || []).filter(a => a.id !== 'aero' && a.id !== 'octopus');
  if (!data?.state) { txt(ctx, 'Loading…', 24, 120, 26, '#aaa'); return; }
  const waiting = ag.filter(a => a.status === 'waiting_review' || a.status === 'blocked');
  if (!waiting.length) { txt(ctx, 'Nothing waiting on you.', 24, 120, 28, '#9fe0b5', 500); return; }
  waiting.slice(0, 6).forEach((a, i) => {
    const y = 96 + i * 58;
    const st = STATUS[a.status];
    rr(ctx, 24, y - 30, 14, 14, 7, st.color);
    fitTxt(ctx, `${a.room.toUpperCase()} — ${a.reason}`, 50, y - 16, 22, w - 80, '#eee');
  });
}

function drawDen(ctx, w, h, data) {
  rr(ctx, 0, 0, w, h, 0, '#0f1c20');
  txt(ctx, 'COORDINATION · all repos', 30, 56, 38, '#bff2f0', 700);
  sampleMark(ctx, w, h, data);
  const ag = (data?.state?.agents || []).filter(a => a.id !== 'octopus');
  if (!data?.state) { txt(ctx, 'Loading…', 30, 130, 30, '#7aa'); return; }
  ag.slice(0, 10).forEach((a, i) => {
    const col = i < 5 ? 0 : 1, row = i % 5;
    const x = 30 + col * (w / 2), y = 112 + row * 70;
    const st = STATUS[a.status] || STATUS.unknown;
    rr(ctx, x, y - 26, 18, 18, 9, st.color);
    txt(ctx, a.id, x + 32, y - 10, 26, '#e6fbfa', 600);
    fitTxt(ctx, st.label + ' · ' + a.reason, x + 32, y + 22, 20, w / 2 - 80, '#8fbcbc');
  });
}
