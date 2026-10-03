// Overview camera (orthographic iso: zoom, rotate with 90° snaps, right-drag pan, touch) and Step-Inside camera.
import * as THREE from 'three';

const ELEV = THREE.MathUtils.degToRad(33);
const DIST = 80;
const SNAP = a => Math.PI / 4 + Math.round((a - Math.PI / 4) / (Math.PI / 2)) * (Math.PI / 2);

export class Overview {
  constructor(camera, dom, { onTap, onDoubleTap, onYaw }) {
    Object.assign(this, { camera, dom, onTap, onDoubleTap, onYaw });
    this.yaw = Math.PI / 4; this.targetYaw = this.yaw;
    this.zoom = 1; this.targetZoom = 1;
    this.target = new THREE.Vector3(0, 0, 0); this.goal = this.target.clone();
    this.enabled = true; this.instant = false;
    this.pointers = new Map(); this.drag = null; this.lastTap = 0;
    dom.addEventListener('pointerdown', e => this.down(e));
    dom.addEventListener('pointermove', e => this.move(e));
    dom.addEventListener('pointerup', e => this.up(e));
    dom.addEventListener('pointercancel', e => this.up(e, true));
    dom.addEventListener('wheel', e => { if (!this.enabled) return; e.preventDefault(); this.zoomBy(Math.exp(-e.deltaY * 0.0015)); }, { passive: false });
    dom.addEventListener('contextmenu', e => e.preventDefault());
  }

  zoomBy(f) { this.targetZoom = THREE.MathUtils.clamp(this.targetZoom * f, 0.35, 4.5); }
  rotateBy(rad) { this.targetYaw = SNAP(this.targetYaw + rad); }
  focus(p, zoom) { this.goal.set(p.x, p.y, p.z); if (zoom) this.targetZoom = zoom; }

  worldPerPixel() {
    const cam = this.camera;
    return (cam.top - cam.bottom) / cam.zoom / this.dom.clientHeight;
  }

  pan(dx, dy) {
    const k = this.worldPerPixel();
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.goal.addScaledVector(right, -dx * k).addScaledVector(fwd, dy * k / Math.sin(ELEV));
    this.goal.x = THREE.MathUtils.clamp(this.goal.x, -30, 30);
    this.goal.z = THREE.MathUtils.clamp(this.goal.z, -22, 22);
  }

  down(e) {
    if (!this.enabled) return;
    this.dom.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), button: e.button });
    if (this.pointers.size === 2) this.pinch = this.pinchState();
  }

  pinchState() {
    const [a, b] = [...this.pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
  }

  move(e) {
    const p = this.pointers.get(e.pointerId);
    if (!p || !this.enabled) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (this.pointers.size === 2) {
      const s = this.pinchState();
      if (this.pinch.d > 0) this.zoomBy(s.d / this.pinch.d);
      this.pan(s.mx - this.pinch.mx, s.my - this.pinch.my);
      this.pinch = s; p.moved = true;
      return;
    }
    if (Math.hypot(e.clientX - p.sx, e.clientY - p.sy) > 6) p.moved = true;
    if (!p.moved) return;
    if (p.button === 2 || e.shiftKey) this.pan(dx, dy);
    else { this.targetYaw -= dx * 0.008; this.rotating = true; }
  }

  up(e, cancel) {
    const p = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    if (this.rotating && this.pointers.size === 0) { this.targetYaw = SNAP(this.targetYaw); this.rotating = false; }
    if (!p || cancel || p.moved || this.pointers.size) return;
    if (performance.now() - p.t > 500) return;
    const now = performance.now();
    const dbl = now - this.lastTap < 320;
    this.lastTap = dbl ? 0 : now;
    (dbl ? this.onDoubleTap : this.onTap)?.(e.clientX, e.clientY);
  }

  update(dt) {
    const k = this.instant ? 1 : 1 - Math.exp(-dt * 9);
    const prevYaw = this.yaw;
    this.yaw += (this.targetYaw - this.yaw) * k;
    this.zoom += (this.targetZoom - this.zoom) * k;
    this.target.lerp(this.goal, k);
    const cam = this.camera;
    cam.position.set(this.target.x + Math.sin(this.yaw) * Math.cos(ELEV) * DIST,
                     this.target.y + Math.sin(ELEV) * DIST,
                     this.target.z + Math.cos(this.yaw) * Math.cos(ELEV) * DIST);
    cam.zoom = this.zoom; cam.updateProjectionMatrix();
    cam.lookAt(this.target);
    if (Math.abs(prevYaw - this.yaw) > 1e-4 || this.firstFrame !== false) { this.onYaw?.(this.yaw); this.firstFrame = false; }
  }
}

/** First-person-ish view inside one room: WASD/arrows or D-pad to move, drag to look. */
export class Inside {
  constructor(camera, dom) {
    Object.assign(this, { camera, dom });
    this.active = false; this.keys = new Set(); this.pad = new Set();
    this.yaw = 0; this.pitch = -0.08;
    addEventListener('keydown', e => { if (this.active) this.keys.add(e.key.toLowerCase()); });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    dom.addEventListener('pointerdown', e => { if (this.active) this.look = { x: e.clientX, y: e.clientY }; });
    dom.addEventListener('pointermove', e => {
      if (!this.active || !this.look) return;
      this.yaw -= (e.clientX - this.look.x) * 0.005; this.pitch -= (e.clientY - this.look.y) * 0.004;
      this.pitch = THREE.MathUtils.clamp(this.pitch, -0.8, 0.5);
      this.look = { x: e.clientX, y: e.clientY };
    });
    dom.addEventListener('pointerup', () => { this.look = null; });
  }

  enter(R) {
    this.R = R; this.active = true;
    const r = R.rect;
    this.pos = new THREE.Vector3(R.doorIn ? R.doorIn.x : r.cx, R.y + 1.55, R.doorIn ? R.doorIn.z : r.cz);
    const toC = new THREE.Vector3(r.cx - this.pos.x, 0, r.cz - this.pos.z);
    this.yaw = Math.atan2(-toC.x, -toC.z); this.pitch = -0.12;
  }

  exit() { this.active = false; this.keys.clear(); this.pad.clear(); }

  update(dt) {
    if (!this.active) return;
    const k = this.keys, p = this.pad;
    const f = (k.has('w') || k.has('arrowup') || p.has('up') ? 1 : 0) - (k.has('s') || k.has('arrowdown') || p.has('down') ? 1 : 0);
    const s = (k.has('d') || k.has('arrowright') || p.has('right') ? 1 : 0) - (k.has('a') || k.has('arrowleft') || p.has('left') ? 1 : 0);
    if (k.has('q')) this.yaw += dt * 1.6;
    if (k.has('e')) this.yaw -= dt * 1.6;
    const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    this.pos.addScaledVector(fwd, f * dt * 2.6).addScaledVector(right, s * dt * 2.6);
    const r = this.R.rect;
    this.pos.x = THREE.MathUtils.clamp(this.pos.x, r.x0 + 0.5, r.x1 - 0.5);
    this.pos.z = THREE.MathUtils.clamp(this.pos.z, r.z0 + 0.5, r.z1 - 0.5);
    const cam = this.camera;
    cam.position.copy(this.pos);
    cam.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
