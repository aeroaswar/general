// Procedural low-poly characters. Front faces +z. Feet at y = 0.
import * as THREE from 'three';
import { box, cyl, sphere, cone, at, mat } from './kit.js';

const SPECIES = {
  fox:     { body: '#e3793f', belly: '#fbeee0', head: '#e3793f', ear: 'pointy', snout: '#fbeee0', tail: 'fox', outfit: '#6d5b50' },
  raven:   { body: '#2d2d36', belly: '#43434f', head: '#2d2d36', ear: 'none', beak: '#e0b04f', tail: 'feather', outfit: '#A50E12', visor: true },
  heron:   { body: '#eef1f4', belly: '#ffffff', head: '#eef1f4', ear: 'none', beak: '#f08c3a', neck: true, outfit: '#f7f7f7', coat: true },
  otter:   { body: '#8b5a3c', belly: '#d9b896', head: '#8b5a3c', ear: 'round', snout: '#d9b896', tail: 'otter', outfit: '#1650B4', stripe: '#D01530' },
  raccoon: { body: '#8d8f96', belly: '#d8d9dc', head: '#8d8f96', ear: 'pointy', snout: '#e7e7e9', tail: 'raccoon', mask: true, outfit: '#5b8f7b' },
  badger:  { body: '#7d7f84', belly: '#e9e9e9', head: '#f2f2f2', ear: 'round', snout: '#f2f2f2', tail: 'short', badger: true, outfit: '#8a6a3b', hardhat: true },
  mole:    { body: '#5a4f4a', belly: '#7a6e68', head: '#5a4f4a', ear: 'none', snout: '#f0a3a8', tail: 'short', outfit: '#2b2b30', minerhat: true },
  bear:    { body: '#a0745a', belly: '#e8d3bf', head: '#a0745a', ear: 'round', snout: '#e8d3bf', tail: 'short', outfit: '#ffffff', apron: true },
  human:   { body: '#f0c9a8', belly: '#f0c9a8', head: '#f0c9a8', ear: 'none', outfit: '#D01530', human: true },
};

/**
 * Character rig: root → body (bobs) → torso, head, arms, legs.
 * pose(name, t) drives the decorative animation; status(st) only recolours the orb.
 */
export function makeCharacter(species, opts = {}) {
  if (species === 'robot') return makeRobot();
  if (species === 'turnstile') return makeTurnstile();
  if (species === 'octopus') return makeOctopus();
  const S = SPECIES[species] || SPECIES.fox;
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);

  // legs
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    const m = box(0.16, 0.42, 0.18, S.human ? '#2e3a4f' : S.body); m.position.y = -0.21;
    leg.add(m); leg.position.set(s * 0.13, 0.42, 0); body.add(leg); legs.push(leg);
  }
  // torso (outfit)
  const torso = box(0.56, 0.58, 0.42, S.outfit); torso.position.y = 0.72; body.add(torso);
  if (S.belly && !S.human && !S.coat) { const b = box(0.36, 0.4, 0.04, S.belly); b.position.set(0, 0.72, 0.22); body.add(b); }
  if (S.stripe) { const st = box(0.58, 0.09, 0.44, S.stripe); st.position.y = 0.82; body.add(st); }
  if (S.coat) { const ct = box(0.6, 0.7, 0.46, '#ffffff'); ct.position.y = 0.66; body.add(ct); }
  if (S.apron) { const ap = box(0.4, 0.5, 0.04, '#7a5b45'); ap.position.set(0, 0.66, 0.23); body.add(ap); }
  if (S.human) { const sh = box(0.3, 0.4, 0.04, '#ffffff'); sh.position.set(0, 0.78, 0.22); body.add(sh); }

  // arms
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    const m = box(0.14, 0.44, 0.14, S.outfit === '#ffffff' ? S.body : S.outfit); m.position.y = -0.2;
    const paw = sphere(0.08, S.human ? S.body : S.belly || S.body); paw.position.y = -0.44;
    arm.add(m, paw); arm.position.set(s * 0.36, 0.98, 0); body.add(arm); arms.push(arm);
  }

  // head
  const head = new THREE.Group(); head.position.y = S.neck ? 1.42 : 1.22; body.add(head);
  if (S.neck) { const n = cyl(0.07, 0.09, 0.42, S.body); n.position.y = 1.2; body.add(n); }
  const skull = sphere(S.neck ? 0.2 : 0.3, S.head); head.add(skull);
  if (S.ear === 'pointy') for (const s of [-1, 1]) { const e = cone(0.1, 0.24, S.head, 6); e.position.set(s * 0.17, 0.26, 0); e.rotation.z = -s * 0.25; head.add(e); }
  if (S.ear === 'round') for (const s of [-1, 1]) { const e = sphere(0.09, S.head); e.position.set(s * 0.22, 0.22, 0); head.add(e); }
  if (S.snout) { const sn = sphere(0.13, S.snout); sn.scale.set(1, 0.8, 1.2); sn.position.set(0, -0.06, 0.24); head.add(sn);
                 const nose = sphere(0.05, '#2b2522'); nose.position.set(0, -0.02, 0.38); head.add(nose); }
  if (S.beak) { const bk = cone(0.07, S.neck ? 0.46 : 0.26, S.beak, 6); bk.rotation.x = Math.PI / 2; bk.position.set(0, -0.02, S.neck ? 0.38 : 0.36); head.add(bk); }
  for (const s of [-1, 1]) { const e = sphere(0.045, '#1d1a18'); e.position.set(s * 0.11, 0.05, S.neck ? 0.17 : 0.26); head.add(e); }
  if (S.mask) { const mk = box(0.5, 0.11, 0.05, '#2b2b30'); mk.position.set(0, 0.05, 0.25); head.add(mk); }
  if (S.badger) for (const s of [-1, 1]) { const st = box(0.08, 0.04, 0.5, '#2b2b30'); st.position.set(s * 0.1, 0.28, 0.02); head.add(st); }
  if (S.visor) { const v = box(0.46, 0.08, 0.06, '#A50E12'); v.position.set(0, 0.1, 0.27); head.add(v); }
  if (S.hardhat) { const hh = sphere(0.3, '#f2c230'); hh.scale.y = 0.6; hh.position.y = 0.18; head.add(hh, at(cyl(0.36, 0.36, 0.03, '#f2c230', 14), 0, 0.12, 0)); }
  if (S.minerhat) {
    const hh = sphere(0.3, '#1d1d20'); hh.scale.y = 0.6; hh.position.y = 0.18; head.add(hh, at(cyl(0.36, 0.36, 0.03, '#1d1d20', 14), 0, 0.12, 0));
    const lampM = new THREE.MeshStandardMaterial({ color: '#fff3c4', emissive: '#ffd36b', emissiveIntensity: 0.9 });
    const lp = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 10), lampM); lp.rotation.x = Math.PI / 2; lp.position.set(0, 0.26, 0.27); head.add(lp);
  }
  if (S.human) {
    const hair = sphere(0.31, '#2b2522'); hair.scale.set(1, 0.7, 1); hair.position.set(0, 0.1, -0.03); head.add(hair);
    const cap = cyl(0.3, 0.31, 0.12, '#D01530', 14); cap.position.y = 0.2; head.add(cap);
    const brim = box(0.3, 0.03, 0.22, '#D01530'); brim.position.set(0, 0.16, 0.3); head.add(brim);
  }

  // tail
  if (S.tail === 'fox') { const t = sphere(0.18, S.body); t.scale.set(0.8, 0.8, 1.9); t.position.set(0, 0.5, -0.45); t.rotation.x = -0.6;
                          const tip = sphere(0.12, '#fbeee0'); tip.position.set(0, 0.72, -0.72); body.add(t, tip); }
  if (S.tail === 'raccoon') for (let i = 0; i < 4; i++) { const t = sphere(0.13, i % 2 ? '#3b3b40' : S.body); t.position.set(0, 0.45 + i * 0.07, -0.3 - i * 0.12); body.add(t); }
  if (S.tail === 'otter') { const t = cone(0.12, 0.6, S.body, 6); t.rotation.x = -Math.PI / 2 - 0.3; t.position.set(0, 0.35, -0.45); body.add(t); }
  if (S.tail === 'feather') { const t = box(0.3, 0.05, 0.36, S.body); t.position.set(0, 0.5, -0.3); t.rotation.x = 0.4; body.add(t); }

  return finish(root, body, { legs, arms, head, kind: 'creature', scale: opts.scale });
}

function makeRobot() {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const brass = { metalness: 0.6, roughness: 0.35 };
  body.add(at(box(0.5, 0.5, 0.4, '#c9a24a', brass), 0, 0.55, 0));
  const wheels = cyl(0.16, 0.16, 0.5, '#555', 10); wheels.rotation.z = Math.PI / 2; wheels.position.y = 0.16; body.add(wheels);
  body.add(at(box(0.12, 0.2, 0.12, '#8d7a3a', brass), 0, 0.3, 0));
  const head = new THREE.Group(); head.position.y = 0.98; body.add(head);
  head.add(box(0.44, 0.34, 0.34, '#d8b45c', brass));
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.22), new THREE.MeshStandardMaterial({ color: '#1b2a3a', emissive: '#7af0c8', emissiveIntensity: 0.4 }));
  face.position.z = 0.175; head.add(face);
  head.add(at(cyl(0.015, 0.015, 0.22, '#555'), 0, 0.28, 0));
  const bulbM = new THREE.MeshStandardMaterial({ color: '#ffe08a', emissive: '#ffcf4a', emissiveIntensity: 0.2 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), bulbM); bulb.position.y = 0.42; head.add(bulb);
  const arms = [];
  for (const s of [-1, 1]) { const a = new THREE.Group(); a.add(at(box(0.08, 0.36, 0.08, '#8d7a3a', brass), 0, -0.16, 0)); a.position.set(s * 0.31, 0.72, 0); body.add(a); arms.push(a); }
  const c = finish(root, body, { legs: [], arms, head, kind: 'robot' });
  c.activeLight = bulbM; c.face = face.material;
  return c;
}

function makeTurnstile() {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  body.add(at(box(0.5, 1.0, 0.5, '#3b3631'), 0, 0.5, 0));
  const hub = new THREE.Group(); hub.position.set(0, 0.85, 0.3); body.add(hub);
  for (let i = 0; i < 3; i++) { const a = box(0.06, 0.06, 0.7, '#C88A4E', { metalness: 0.6 }); a.position.z = 0.35; const p = new THREE.Group(); p.add(a); p.rotation.x = 0; p.rotation.y = 0; p.rotation.z = (i / 3) * Math.PI * 2; hub.add(p); }
  const lightM = new THREE.MeshStandardMaterial({ color: '#888', emissive: '#888', emissiveIntensity: 0.6 });
  const light = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), lightM); light.position.y = 1.1; body.add(light);
  const head = new THREE.Group(); head.position.y = 1.0; body.add(head);
  const c = finish(root, body, { legs: [], arms: [], head, kind: 'turnstile' });
  c.hub = hub; c.gateLight = lightM;
  return c;
}

function makeOctopus() {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const col = '#ef8a6f';
  const dome = sphere(0.55, col); dome.scale.set(1, 1.15, 1); dome.position.y = 1.15; body.add(dome);
  for (const s of [-1, 1]) {
    body.add(at(sphere(0.11, '#ffffff'), s * 0.2, 1.1, 0.46), at(sphere(0.06, '#1d1a18'), s * 0.2, 1.1, 0.55));
  }
  const tentacles = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const t = new THREE.Group();
    const segs = [];
    let parent = t;
    for (let k = 0; k < 4; k++) {
      const seg = new THREE.Group();
      seg.add(at(sphere(0.12 - k * 0.022, k % 2 ? '#f3a08a' : col), 0, -0.08, 0));
      seg.position.y = k === 0 ? 0 : -0.16;
      parent.add(seg); segs.push(seg); parent = seg;
    }
    t.position.set(Math.sin(a) * 0.38, 0.75, Math.cos(a) * 0.38);
    t.rotation.y = a; body.add(t);
    tentacles.push({ group: t, segs, phase: i * 0.8 });
  }
  const head = new THREE.Group(); head.position.y = 1.7; body.add(head);
  const c = finish(root, body, { legs: [], arms: [], head, kind: 'octopus' });
  c.tentacles = tentacles;
  return c;
}

function finish(root, body, { legs, arms, head, kind, scale = 1 }) {
  root.scale.setScalar(scale);
  // status orb above the head + a soft ring under the feet
  const orbM = new THREE.MeshStandardMaterial({ color: '#7d93ad', emissive: '#7d93ad', emissiveIntensity: 0.5 });
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), orbM);
  orb.position.y = (head.position.y || 1.2) + 0.62; root.add(orb);
  const ringM = new THREE.MeshBasicMaterial({ color: '#7d93ad', transparent: true, opacity: 0.45 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.44, 24), ringM);
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.02; root.add(ring);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  ring.castShadow = false;

  const c = {
    root, body, legs, arms, head, kind, orb, orbM, ringM, poseName: 'stand', t: 0, status: 'idle',
    setStatus(status, color) {
      c.status = status;
      orbM.color.set(color); orbM.emissive.set(color); ringM.color.set(color);
    },
    /** Decorative only. Status never changes here. */
    animate(dt, pose, time) {
      c.poseName = pose;
      const w = pose === 'walk', sit = pose === 'sit' || pose === 'type' || pose === 'sitlow';
      const sw = w ? Math.sin(time * 9) : 0;
      legs.forEach((l, i) => { l.rotation.x = sit ? -1.4 : sw * 0.6 * (i ? 1 : -1); });
      arms.forEach((a, i) => {
        if (pose === 'type') a.rotation.x = -1.1 + Math.sin(time * 18 + i * 2) * 0.12;
        else if (pose === 'read' || pose === 'drink') a.rotation.x = i ? -1.2 : -0.2;
        else if (pose === 'wave') a.rotation.x = i ? -2.6 + Math.sin(time * 8) * 0.3 : 0;
        else a.rotation.x = w ? -sw * 0.5 * (i ? 1 : -1) : Math.sin(time * 1.4 + i) * 0.04;
      });
      body.position.y = sit ? (pose === 'sitlow' ? -0.12 : 0.06) : (w ? Math.abs(sw) * 0.05 : Math.sin(time * 2) * 0.012);
      if (pose === 'read') head.rotation.x = 0.25; else if (pose === 'type') head.rotation.x = 0.12; else head.rotation.x = 0;
      orb.rotation.y += dt * 1.5;
      orb.position.y = (head.position.y + 0.62) + Math.sin(time * 2.4) * 0.04 + body.position.y;
      const pulse = c.status === 'working' ? 0.5 + Math.sin(time * 5) * 0.35 : c.status === 'blocked' ? (Math.sin(time * 7) > 0 ? 1 : 0.2) : 0.45;
      orbM.emissiveIntensity = pulse;
      if (c.tentacles) c.tentacles.forEach(tn => tn.segs.forEach((s, k) => { s.rotation.x = 0.35 + Math.sin(time * 1.6 + tn.phase + k * 0.7) * 0.25; }));
      if (c.hub) c.hub.rotation.z += dt * (c.status === 'working' ? 3 : 0.0);
    },
  };
  return c;
}
