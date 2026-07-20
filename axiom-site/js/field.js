/* AXIOM — signature texture: the bronze particle field (Brand Guidelines §09·2).
   Additive points advected by curl-like noise, drifting upward as a "longevity
   current", colored #7C4C24 → #E7B173 by depth, gently reactive to the cursor.
   Replaced by the static fallback under reduced motion / coarse pointers. */

import * as THREE from '../vendor/three.module.min.js';

const hero = document.getElementById('hero');
const canvas = document.getElementById('field');

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const small = innerWidth < 700;

if (reduced || coarse) {
  hero.classList.add('is-static');
  window.__axiom = { mode: 'static', snap: () => {}, pause: () => {}, resume: () => {} };
} else {
  boot();
}

function boot() {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 1, 200);
  camera.position.z = 60;

  const COUNT = small ? 2200 : 5200;
  const SPREAD = { x: 110, y: 70, z: 55 };

  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT * 3);
  const size = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * SPREAD.x;
    pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD.y;
    pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD.z;
    seed[i * 3 + 0] = Math.random() * 100;
    seed[i * 3 + 1] = 0.35 + Math.random() * 0.9;   // rise speed
    seed[i * 3 + 2] = Math.random() * Math.PI * 2;  // phase
    size[i] = 0.7 + Math.random() * 1.9;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(9999, 9999) },
      uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
      uDeep: { value: new THREE.Color('#7C4C24') },
      uBright: { value: new THREE.Color('#E7B173') },
      uSpread: { value: new THREE.Vector3(SPREAD.x, SPREAD.y, SPREAD.z) },
    },
    vertexShader: /* glsl */`
      attribute vec3 aSeed;
      attribute float aSize;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uPixelRatio;
      uniform vec3 uSpread;
      varying float vDepth;
      varying float vFade;

      // cheap curl-like drift from layered sines
      vec3 drift(vec3 p, float t, vec3 s) {
        float a = t * 0.11 + s.x;
        return vec3(
          sin(p.y * 0.055 + a) + 0.55 * sin(p.z * 0.09 + a * 1.7),
          cos(p.x * 0.05  + a * 0.8) * 0.4,
          cos(p.y * 0.07  + a * 1.3) + 0.4 * sin(p.x * 0.06 + a)
        );
      }

      void main() {
        vec3 p = position;

        // longevity current — slow upward advection, wrapped
        float rise = uTime * aSeed.y * 1.35;
        p.y = mod(p.y + rise + uSpread.y * 0.5, uSpread.y) - uSpread.y * 0.5;
        p += drift(p, uTime, aSeed) * 2.6;
        p.x += sin(uTime * 0.14 + aSeed.z) * 1.2;

        // gentle cursor repulsion (world xy at z≈0 plane)
        vec2 d = p.xy - uMouse;
        float dist = length(d);
        float push = smoothstep(16.0, 0.0, dist) * 5.5;
        p.xy += normalize(d + 0.0001) * push;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        vDepth = clamp(p.z / uSpread.z + 0.5, 0.0, 1.0);
        // fade near vertical wrap edges to hide re-entry
        float edge = abs(p.y) / (uSpread.y * 0.5);
        vFade = 1.0 - smoothstep(0.82, 1.0, edge);

        float twinkle = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed.y) + aSeed.z);
        gl_PointSize = aSize * twinkle * uPixelRatio * (86.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uDeep;
      uniform vec3 uBright;
      varying float vDepth;
      varying float vFade;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float r = length(uv);
        if (r > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, r);
        glow *= glow;
        vec3 col = mix(uDeep, uBright, vDepth);
        gl_FragColor = vec4(col, glow * 0.62 * vFade);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── mouse → world plane at z=0 ──
  const targetMouse = new THREE.Vector2(9999, 9999);
  addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    if (e.clientY < r.top || e.clientY > r.bottom) { targetMouse.set(9999, 9999); return; }
    const ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    targetMouse.set(ndcX * halfH * camera.aspect, ndcY * halfH);
  }, { passive: true });
  addEventListener('pointerleave', () => targetMouse.set(9999, 9999), { passive: true });

  // ── sizing ──
  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize, { passive: true });

  // ── loop, paused off-screen / hidden tab ──
  const clock = new THREE.Clock();
  let elapsed = 0;
  let visible = true;
  let paused = false;
  let raf = 0;

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !paused) start();
  }, { threshold: 0.01 }).observe(hero);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible && !paused) start();
  });

  function frame() {
    raf = 0;
    if (!visible || paused || document.hidden) return;
    elapsed += Math.min(clock.getDelta(), 0.05);
    render(elapsed);
    start();
  }
  function start() { if (!raf) raf = requestAnimationFrame(frame); }

  function render(t) {
    mat.uniforms.uTime.value = t;
    mat.uniforms.uMouse.value.lerp(targetMouse, 0.08);
    renderer.render(scene, camera);
  }

  clock.getDelta();
  start();

  // deterministic capture handle (house convention)
  window.__axiom = {
    mode: 'field',
    snap(t = 10) { paused = true; cancelAnimationFrame(raf); raf = 0; render(t); },
    pause() { paused = true; },
    resume() { paused = false; clock.getDelta(); start(); },
  };
}
