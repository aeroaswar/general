// Aero HQ — boot, render loop, state polling, modes (overview / basement / inside), debug handle.
import * as THREE from 'three';
import { buildWorld, FLOOR_Y } from './world.js';
import { makeCharacter } from './characters.js';
import { Sim } from './sim.js';
import { Overview, Inside } from './controls.js';
import { createUI } from './ui.js';
import { Audio } from './audio.js';
import { STATUS, rng } from './kit.js';

const params = new URLSearchParams(location.search);
const CAP = params.get('cap');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || params.has('still');
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode: fine */ } },
};
const POLL_MS = 60_000;
const VIEW = 34; // world units visible vertically at zoom 1

boot().catch(err => {
  console.error(err);
  const f = document.getElementById('fallback');
  f.hidden = false; f.querySelector('p').textContent = 'Aero HQ failed to start: ' + err.message;
});

async function boot() {
  const cfg = await (await fetch('agents.config.json', { cache: 'no-store' })).json();
  window.gsap?.ticker.lagSmoothing(0);
  try { await Promise.all(['500 20px Geist', '600 20px Geist', '700 20px Geist'].map(f => document.fonts.load(f))); } catch { /* system font fallback */ }

  // ── renderer / scene ─────────────────────────────────────────────────────
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!CAP });
  } catch (e) {
    return noWebGL(cfg);
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.setClearColor(0x000000, 0);
  document.getElementById('stage').appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label', 'Isometric view of the office. Use the room buttons to navigate.');

  const scene = new THREE.Scene();
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 400);
  const persp = new THREE.PerspectiveCamera(62, 1, 0.05, 200);
  let cam = ortho;

  const hemi = new THREE.HemisphereLight('#fff6ea', '#c9b8a6', 1.2);
  const sun = new THREE.DirectionalLight('#fff1dc', 2.2);
  sun.position.set(22, 34, 16); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 26, bottom: -26, near: 1, far: 120 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
  scene.add(hemi, sun, sun.target);

  const world = buildWorld(cfg);
  scene.add(world.above, world.below);
  const denLight = new THREE.PointLight('#9fe8ee', 30, 30, 1.6); denLight.position.set(-6, FLOOR_Y.basement + 3.6, 0);
  const libLight = new THREE.PointLight('#ffd7a0', 22, 24, 1.6); libLight.position.set(10, FLOOR_Y.basement + 3.6, 0);
  world.below.add(denLight, libLight);
  const roomLamps = [];
  for (const [, R] of world.rooms) {
    if (R.cfg.floor === 'basement' || R.cfg.kind === 'hall' || R.cfg.kind === 'locked') continue;
    const l = new THREE.PointLight('#ffcf8a', 0, 11, 1.8); l.position.set(R.center.x, R.y + 2.7, R.center.z);
    world.above.add(l); roomLamps.push(l);
  }

  // ── characters ───────────────────────────────────────────────────────────
  const rand = rng(CAP ? 11 : (Date.now() & 0xffff));
  const sim = new Sim(world, rand);
  const chars = new Map();
  const pickables = [...world.pickables];
  const addChar = (id, species, home, role, anchor, prefix) => {
    const R = world.rooms.get(home);
    const c = makeCharacter(species);
    (R.cfg.floor === 'basement' ? world.below : world.above).add(c.root);
    c.root.traverse(o => { if (o.isMesh) { o.userData.roomId = home; o.userData.agentId = id; pickables.push(o); } });
    chars.set(id, c);
    sim.add({ id, char: c, home, role, anchor, prefix });
    return c;
  };
  for (const r of cfg.rooms) {
    if (r.agent) {
      const role = r.agent.id === 'aero' ? 'boss' : r.agent.id === 'octopus' ? 'static' : 'agent';
      addChar(r.agent.id, r.agent.species, r.id, role, r.agent.id === 'octopus' ? 'console' : null);
    }
    for (const p of r.partners || []) addChar(p.id, p.species, r.id, 'agent', null, 'p_');
    for (const b of r.bots || []) addChar(b.id, b.species, r.id, b.species === 'turnstile' ? 'static' : 'bot', b.species === 'turnstile' ? 'gate' : 'dock');
  }
  addChar('barista', 'bear', 'cafe', 'static', 'barista');

  // ── UI, controls, audio ──────────────────────────────────────────────────
  let mode = 'overview', state = null, meta = {}, frozen = !!CAP, insideRoom = null;
  const audio = new Audio();
  const ui = createUI(cfg, {
    onSelectRoom: id => selectRoom(id),
    onStepInside: id => stepInside(id),
    onExitInside: () => exitInside(),
    onToggleBasement: () => setBasement(mode !== 'basement'),
    onRotate: d => overview.rotateBy(d * Math.PI / 2),
    onMusic: () => { const on = !audio.music; audio.setMusic(on); store.set('hq.music', on ? '1' : '0'); ui.setAudio(audio.music, audio.sfx); },
    onSfx: () => { const on = !audio.sfx; audio.setSfx(on); store.set('hq.sfx', on ? '1' : '0'); ui.setAudio(audio.music, audio.sfx); },
    onPad: (dir, on) => { if (on) inside.pad.add(dir); else inside.pad.delete(dir); },
  });
  ui.setAudio(false, false);
  // Saved preference is honoured, but audio still needs one gesture before the browser allows it.
  const wantMusic = store.get('hq.music') === '1', wantSfx = store.get('hq.sfx') === '1';
  if (wantMusic || wantSfx) addEventListener('pointerdown', () => {
    if (wantMusic) audio.setMusic(true); if (wantSfx) audio.setSfx(true); ui.setAudio(audio.music, audio.sfx);
  }, { once: true });

  const overview = new Overview(ortho, renderer.domElement, {
    onTap: (x, y) => pick(x, y, false), onDoubleTap: (x, y) => pick(x, y, true),
    onYaw: yaw => { if (mode !== 'inside') world.setCutaway(yaw); },
  });
  overview.instant = REDUCED;
  const inside = new Inside(persp, renderer.domElement);

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const shown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  function pick(x, y, dbl) {
    if (mode === 'inside') return;
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const hit = ray.intersectObjects(pickables, false).find(h => shown(h.object) && h.object.userData.roomId);
    if (!hit) { ui.close(); return; }
    const id = hit.object.userData.roomId;
    if (id === 'hall') return;
    if (dbl) stepInside(id); else selectRoom(id);
  }

  function selectRoom(id) {
    const R = world.rooms.get(id);
    if (!R) return;
    if (R.cfg.floor === 'basement' && mode !== 'basement') setBasement(true);
    if (R.cfg.floor !== 'basement' && mode === 'basement') setBasement(false);
    overview.focus(new THREE.Vector3(R.center.x, R.y, R.center.z), Math.max(overview.targetZoom, fitZoom() * 1.5));
    ui.open(id);
  }

  function setBasement(on) {
    if (mode === 'inside') exitInside();
    mode = on ? 'basement' : 'overview';
    ui.setMode(mode);
    const g = window.gsap;
    g?.killTweensOf(world.above.position);
    if (on) {
      world.below.visible = true;
      if (g && !REDUCED) g.to(world.above.position, { y: 7, duration: 0.45, ease: 'power2.in', onComplete: () => { world.above.visible = false; } });
      else world.above.visible = false;
      overview.focus(new THREE.Vector3(0, FLOOR_Y.basement, 0));
    } else {
      world.above.visible = true;
      if (g && !REDUCED) g.to(world.above.position, { y: 0, duration: 0.5, ease: 'power2.out' }); else world.above.position.y = 0;
      overview.focus(new THREE.Vector3(0, 0, 0));
    }
    denLight.intensity = on ? 60 : 30; libLight.intensity = on ? 40 : 22;
  }

  function stepInside(id) {
    const R = world.rooms.get(id);
    if (!R || R.cfg.floor === 'basement' || R.cfg.kind === 'locked' || R.cfg.kind === 'hall') return;
    if (mode === 'basement') setBasement(false);
    mode = 'inside'; insideRoom = R; ui.setMode('inside'); ui.close(); ui.insideTitle(R.cfg.name);
    world.setCutaway(0, id);
    inside.enter(R); cam = persp;
    if (R.cfg.id === 'office') world.above.children.forEach(o => { if (o.name === 'roof') o.visible = false; });
  }

  function exitInside() {
    if (mode !== 'inside') return;
    inside.exit(); cam = ortho; mode = 'overview'; ui.setMode('overview');
    world.setCutaway(overview.yaw);
    insideRoom = null;
  }

  addEventListener('keydown', e => {
    if (e.target.closest?.('input, textarea')) return;
    const k = e.key.toLowerCase();
    if (k === 'escape') { if (mode === 'inside') exitInside(); else ui.close(); }
    if (mode === 'inside') return;
    if (k === 'b') setBasement(mode !== 'basement');
    if (k === 'q') overview.rotateBy(-Math.PI / 2);
    if (k === 'e') overview.rotateBy(Math.PI / 2);
    if (k === '+' || k === '=') overview.zoomBy(1.2);
    if (k === '-') overview.zoomBy(1 / 1.2);
  });

  // ── layout ───────────────────────────────────────────────────────────────
  function fitZoom() {
    const w = innerWidth, h = innerHeight, aspect = w / h;
    return THREE.MathUtils.clamp((VIEW * aspect) / 46, 0.42, 1.45);
  }
  function resize() {
    const w = innerWidth, h = innerHeight, aspect = w / h;
    renderer.setSize(w, h);
    Object.assign(ortho, { left: -VIEW * aspect / 2, right: VIEW * aspect / 2, top: VIEW / 2, bottom: -VIEW / 2 });
    ortho.updateProjectionMatrix();
    persp.aspect = aspect; persp.updateProjectionMatrix();
  }
  addEventListener('resize', resize);
  resize();
  overview.zoom = overview.targetZoom = fitZoom();
  overview.goal.set(0, 0, 2);

  // ── state ────────────────────────────────────────────────────────────────
  function applyState(s, m = {}) {
    state = s; meta = m;
    ui.setState(s, m);
    const data = { state: s, cfg };
    for (const [, R] of world.rooms) { R.boards.forEach(b => b.redraw(data)); R.updaters?.forEach(u => u(data)); }
    for (const [id, c] of chars) {
      const a = s?.agents?.find(x => x.id === id);
      const st = a ? a.status : id === 'barista' ? null : 'unknown';
      if (st) c.setStatus(st, STATUS[st]?.color || STATUS.unknown.color);
      else { c.orb.visible = false; c.ringM.opacity = 0; }
      if (c.activeLight) c.activeLight.emissiveIntensity = st === 'working' ? 1.2 : 0.15;
      if (c.gateLight) { const col = st === 'blocked' ? '#d64545' : st === 'working' ? '#e0a23a' : st === 'idle' ? '#3fa66b' : '#999'; c.gateLight.color.set(col); c.gateLight.emissive.set(col); }
    }
  }

  async function load() {
    if (window.__hqInjected) return;
    try {
      const r = await fetch('data/state.json?ts=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      applyState(await r.json(), { fetchFailed: false });
    } catch {
      if (state?.mode === 'live') { applyState(state, { fetchFailed: true }); return; }
      try {
        const s = await (await fetch('data/sample-state.json', { cache: 'no-store' })).json();
        s.mode = 'sample';
        applyState(s, { fetchFailed: false });
      } catch { applyState(null, { fetchFailed: true }); }
    }
  }
  await load();
  if (!CAP) { setInterval(load, POLL_MS); setInterval(() => ui.tick(), 30_000); }

  // ── day / night (Jakarta time) ───────────────────────────────────────────
  const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function jakartaHour() {
    if (params.has('hour')) return parseFloat(params.get('hour'));
    if (CAP || cfg.day_night === false) return 10.5;
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: cfg.timezone || 'Asia/Jakarta', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => +parts.find(p => p.type === t).value;
    return g('hour') + g('minute') / 60;
  }
  const dayC = new THREE.Color('#fff1dc'), duskC = new THREE.Color('#ffb27a'), nightC = new THREE.Color('#8fa6d9');
  function lighting() {
    const h = jakartaHour();
    const day = smooth(5.5, 7.5, h) * (1 - smooth(17.3, 19.2, h));
    const dusk = Math.max(smooth(16.3, 18, h) * (1 - smooth(18.3, 19.5, h)), smooth(5, 6, h) * (1 - smooth(6.3, 7.5, h)));
    sun.intensity = 0.35 + 2.0 * day;
    sun.color.copy(nightC).lerp(dayC, day).lerp(duskC, dusk * 0.7);
    hemi.intensity = 0.55 + 0.75 * day;
    const night = 1 - day;
    world.nightMats.forEach(m => { m.emissiveIntensity = 0.25 + night * 1.4; });
    roomLamps.forEach(l => { l.intensity = night * 14; });
    document.body.style.setProperty('--day', day.toFixed(3));
    document.body.style.setProperty('--dusk', dusk.toFixed(3));
  }
  lighting();
  if (!CAP) setInterval(lighting, 60_000);

  // ── loop ─────────────────────────────────────────────────────────────────
  if (REDUCED) sim.settle();
  const clock = new THREE.Clock();
  let time = 0, sfxIn = 8;
  function step(dt) {
    time += dt;
    if (!REDUCED) sim.update(dt, time);
    else for (const [, c] of chars) c.animate(0, c.poseName, 0);
    // pipes in the den follow their room's real status
    const den = world.rooms.get('den');
    for (const p of den?.pipes || []) {
      const a = state?.agents?.find(x => x.room === p.roomId && x.kind === 'agent');
      const st = a?.status;
      const base = st === 'working' ? 0.45 + Math.sin(time * 4) * 0.35 : st === 'blocked' ? (Math.sin(time * 6) > 0 ? 0.9 : 0.15) : st === 'waiting_review' ? 0.5 : 0.18;
      p.mat.emissive.set(st === 'blocked' ? '#d64545' : st === 'waiting_review' ? '#e0a23a' : p.mat.color);
      p.mat.emissiveIntensity = REDUCED ? 0.4 : base;
    }
    if (den?.holo && !REDUCED) den.holo.rotation.y += dt * 0.4;
    if (!REDUCED && !CAP && (sfxIn -= dt) < 0) { sfxIn = 7 + Math.random() * 10; audio.office(Math.random() < 0.2 ? 'bell' : 'keys'); }
  }

  function frame() {
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!frozen) step(dt);
    if (mode === 'inside') inside.update(dt); else overview.update(frozen ? 1 : dt);
    renderer.render(scene, cam);
    ui.updateLabels(cam, world, mode, innerWidth, innerHeight);
  }

  // ── capture mode + debug handle ───────────────────────────────────────────
  window.__hq = {
    get state() { return state; }, cfg, world, chars, sim,
    snap(i) { overview.targetYaw = overview.yaw = Math.PI / 4 + i * Math.PI / 2; world.setCutaway(overview.yaw); },
    freeze(b = true) { frozen = b; },
    frame(t) { frozen = true; for (let k = 0; k < Math.round(t * 30); k++) step(1 / 30); },
    jump(id) { selectRoom(id); overview.instant = true; overview.update(1); overview.instant = REDUCED; },
    basement(b) { setBasement(b); }, inside: stepInside, exitInside,
    inject(s) { window.__hqInjected = true; applyState(s, { fetchFailed: false }); },
    zoom(z) { overview.zoom = overview.targetZoom = z; },
  };
  if (CAP) {
    const f = parseFloat(CAP);
    window.__hq.frame(12);
    if (!Number.isNaN(f)) { overview.yaw = overview.targetYaw = Math.PI / 4 + f * Math.PI * 2; world.setCutaway(overview.yaw); }
    else if (CAP === 'basement') setBasement(true);
    else if (world.rooms.has(CAP)) window.__hq.jump(CAP);
    overview.instant = true;
  }
  document.body.classList.add('ready');
  frame();
}

function noWebGL(cfg) {
  const f = document.getElementById('fallback');
  f.hidden = false;
  f.querySelector('p').textContent = 'WebGL is unavailable, so the 3D office cannot render. Room status is listed below.';
  fetch('data/state.json', { cache: 'no-store' }).then(r => r.ok ? r.json() : fetch('data/sample-state.json').then(x => x.json()))
    .then(s => {
      const ul = f.querySelector('ul');
      for (const r of cfg.rooms.filter(x => x.agent)) {
        const a = s.agents.find(x => x.id === r.agent.id);
        const li = document.createElement('li');
        li.textContent = `${r.name} — ${a ? (STATUS[a.status]?.label + ': ' + a.reason) : 'no status'}`;
        ul.appendChild(li);
      }
    }).catch(() => {});
}
