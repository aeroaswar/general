import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────────────
// Aurora — a full-screen GLSL aurora field that the scroll timeline "tunes".
// Section transitions lerp the palette / intensity / motion; scroll velocity
// stretches the curtains; pointer adds parallax. No textures, no CDN.
// ─────────────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime, uIntensity, uMotion, uVelocity, uScroll;
  uniform vec2  uResolution, uMouse;
  uniform vec3  uColA, uColB, uColC, uBgTop, uBgBot;

  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
    vec2 u=f*f*(3.-2.*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){
    float v=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6);
    for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=.5; }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 asp = vec2(uResolution.x/max(uResolution.y,1.), 1.0);
    vec2 p = (uv-0.5)*asp + uMouse*0.05;
    float t = uTime*0.05*uMotion;

    // domain-warped flow
    vec2 q = vec2(fbm(p*1.5 + t), fbm(p*1.5 - t + 5.2));
    float flow = fbm(p*2.1 + q*1.4 + vec2(t*1.2, -t*0.8));

    // vertical curtains, stretched by scroll velocity
    float vstretch = 1.0 + uVelocity*3.0;
    float bands = fbm(vec2(p.x*2.0 + q.x*1.1, p.y*vstretch*0.85 - t*1.4 - uScroll*0.6));

    float aurora = smoothstep(0.22, 0.95, flow*0.62 + bands*0.6);
    aurora *= smoothstep(1.15, 0.05, length(vec2(p.x*0.62, p.y*1.05)));

    // colour grade
    vec3 col = mix(uColA, uColB, clamp(flow*1.15, 0.0, 1.0));
    col = mix(col, uColC, smoothstep(0.62, 1.0, bands));
    vec3 bg = mix(uBgBot, uBgTop, smoothstep(-0.1, 1.1, uv.y));
    vec3 outc = bg + col*aurora*uIntensity;

    // micro glints
    float gl = pow(max(bands-0.72,0.0)/0.28, 3.0);
    outc += col*gl*0.5*uIntensity;

    // grain + vignette
    float g = (hash(uv*uResolution + uTime) - 0.5)*0.03;
    outc += g;
    float vig = smoothstep(1.3, 0.35, length((uv-0.5)*vec2(1.08,1.22)));
    outc *= mix(0.80, 1.0, vig);

    gl_FragColor = vec4(max(outc, 0.0), 1.0);
  }
`;

const C = (hex) => new THREE.Color(hex);

export function createAurora(canvas) {
  const reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();

  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 1.0 },
    uMotion: { value: 1.0 },
    uVelocity: { value: 0 },
    uScroll: { value: 0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColA: { value: C("#1f8f7a") },
    uColB: { value: C("#2bd4c0") },
    uColC: { value: C("#bff3e6") },
    uBgTop: { value: C("#0a1018") },
    uBgBot: { value: C("#05070d") },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  scene.add(quad);

  // target/current mood for smooth section transitions
  const target = {
    colA: C("#1f8f7a"),
    colB: C("#2bd4c0"),
    colC: C("#bff3e6"),
    intensity: 1.0,
    motion: 1.0,
  };
  const mouseTarget = new THREE.Vector2(0, 0);
  let velTarget = 0;

  function setMood({ colA, colB, colC, intensity, motion }) {
    if (colA) target.colA.set(colA);
    if (colB) target.colB.set(colB);
    if (colC) target.colC.set(colC);
    if (intensity != null) target.intensity = intensity;
    if (motion != null) target.motion = motion;
  }
  function setScroll(v) {
    uniforms.uScroll.value = v;
  }
  function setVelocity(v) {
    // normalized scroll velocity; clamp so streaks stay tasteful
    if (!Number.isFinite(v)) return;
    velTarget = Math.max(-1, Math.min(1, v));
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    uniforms.uResolution.value.set(
      w * renderer.getPixelRatio(),
      h * renderer.getPixelRatio()
    );
  }

  function onPointer(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    mouseTarget.set(x, -y);
  }

  const clock = new THREE.Clock();
  let running = true;
  let raf = 0;

  function frame() {
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    uniforms.uTime.value += dt * (reduced ? 0.15 : 1);

    const k = 1 - Math.pow(0.001, dt); // frame-rate independent lerp
    uniforms.uColA.value.lerp(target.colA, k);
    uniforms.uColB.value.lerp(target.colB, k);
    uniforms.uColC.value.lerp(target.colC, k);
    uniforms.uIntensity.value += (target.intensity - uniforms.uIntensity.value) * k;
    uniforms.uMotion.value += (target.motion - uniforms.uMotion.value) * k;
    uniforms.uMouse.value.lerp(mouseTarget, k * 0.6);
    uniforms.uVelocity.value += (velTarget - uniforms.uVelocity.value) * k;
    velTarget *= 0.9; // decay toward rest

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (!running) running = true;
    cancelAnimationFrame(raf);
    clock.getDelta();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function dispose() {
    stop();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointer);
    document.removeEventListener("visibilitychange", onVis);
    quad.geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  function onVis() {
    if (document.hidden) stop();
    else start();
  }

  // render a single deterministic frame at time t (debug / capture)
  function snap(t = 1.2) {
    uniforms.uTime.value = t;
    renderer.render(scene, camera);
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  if (reduced) {
    // static, calm field for reduced-motion users
    target.motion = 0.0;
    uniforms.uMotion.value = 0.0;
    snap(1.4);
  } else {
    start();
  }

  return { setMood, setScroll, setVelocity, resize, dispose, snap, uniforms, renderer };
}
