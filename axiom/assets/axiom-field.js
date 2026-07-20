/* AXIOM — signature texture: the bronze particle field (Brand Guidelines §09·2).
   Additive points advected by curl-like noise, drifting upward as a "longevity
   current", coloured #7C4C24 → #E7B173 by depth, gently reactive to the pointer.
   Generalised: runs as the hero canvas (#field inside #hero) on landing pages,
   or as a fixed ambient background (canvas.bg-field) on document pages.
   Replaced by a static gradient under reduced motion / coarse pointers. */
(function () {
  var THREE = window.THREE;
  var canvas = document.getElementById('field');
  if (!canvas || !THREE) return;

  var hero = document.getElementById('hero');          // present only on landing pages
  var host = hero || canvas;                            // element whose class carries the static fallback
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  var small = innerWidth < 700;

  if (reduced || coarse) {
    host.classList.add('is-static');
    window.__axiom = { mode: 'static', snap: function () {}, pause: function () {}, resume: function () {} };
    return;
  }
  boot();

  function boot() {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(60, 1, 1, 200);
    camera.position.z = 60;

    var COUNT = small ? 2200 : 5200;
    var SPREAD = { x: 110, y: 70, z: 55 };

    var pos = new Float32Array(COUNT * 3);
    var seed = new Float32Array(COUNT * 3);
    var size = new Float32Array(COUNT);
    for (var i = 0; i < COUNT; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * SPREAD.x;
      pos[i * 3 + 1] = (Math.random() - 0.5) * SPREAD.y;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SPREAD.z;
      seed[i * 3 + 0] = Math.random() * 100;
      seed[i * 3 + 1] = 0.35 + Math.random() * 0.9;    // rise speed
      seed[i * 3 + 2] = Math.random() * Math.PI * 2;   // phase
      size[i] = 0.7 + Math.random() * 1.9;
    }

    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

    var mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(9999, 9999) },
        uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
        uDeep: { value: new THREE.Color('#7C4C24') },
        uBright: { value: new THREE.Color('#E7B173') },
        uSpread: { value: new THREE.Vector3(SPREAD.x, SPREAD.y, SPREAD.z) }
      },
      vertexShader:
        'attribute vec3 aSeed; attribute float aSize;' +
        'uniform float uTime; uniform vec2 uMouse; uniform float uPixelRatio; uniform vec3 uSpread;' +
        'varying float vDepth; varying float vFade;' +
        'vec3 drift(vec3 p, float t, vec3 s){' +
        '  float a = t*0.11 + s.x;' +
        '  return vec3(' +
        '    sin(p.y*0.055 + a) + 0.55*sin(p.z*0.09 + a*1.7),' +
        '    cos(p.x*0.05 + a*0.8)*0.4,' +
        '    cos(p.y*0.07 + a*1.3) + 0.4*sin(p.x*0.06 + a));' +
        '}' +
        'void main(){' +
        '  vec3 p = position;' +
        '  float rise = uTime*aSeed.y*1.35;' +
        '  p.y = mod(p.y + rise + uSpread.y*0.5, uSpread.y) - uSpread.y*0.5;' +
        '  p += drift(p, uTime, aSeed)*2.6;' +
        '  p.x += sin(uTime*0.14 + aSeed.z)*1.2;' +
        '  vec2 d = p.xy - uMouse;' +
        '  float dist = length(d);' +
        '  float push = smoothstep(16.0, 0.0, dist)*5.5;' +
        '  p.xy += normalize(d + 0.0001)*push;' +
        '  vec4 mv = modelViewMatrix*vec4(p,1.0);' +
        '  gl_Position = projectionMatrix*mv;' +
        '  vDepth = clamp(p.z/uSpread.z + 0.5, 0.0, 1.0);' +
        '  float edge = abs(p.y)/(uSpread.y*0.5);' +
        '  vFade = 1.0 - smoothstep(0.82, 1.0, edge);' +
        '  float twinkle = 0.75 + 0.25*sin(uTime*(0.6+aSeed.y) + aSeed.z);' +
        '  gl_PointSize = aSize*twinkle*uPixelRatio*(86.0/-mv.z);' +
        '}',
      fragmentShader:
        'uniform vec3 uDeep; uniform vec3 uBright; varying float vDepth; varying float vFade;' +
        'void main(){' +
        '  vec2 uv = gl_PointCoord - 0.5;' +
        '  float r = length(uv);' +
        '  if (r > 0.5) discard;' +
        '  float glow = smoothstep(0.5, 0.0, r); glow *= glow;' +
        '  vec3 col = mix(uDeep, uBright, vDepth);' +
        '  gl_FragColor = vec4(col, glow*0.62*vFade);' +
        '}'
    });

    var points = new THREE.Points(geo, mat);
    scene.add(points);

    var targetMouse = new THREE.Vector2(9999, 9999);
    addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) { targetMouse.set(9999, 9999); return; }
      var ndcX = ((e.clientX - r.left) / r.width) * 2 - 1;
      var ndcY = -(((e.clientY - r.top) / r.height) * 2 - 1);
      var halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      targetMouse.set(ndcX * halfH * camera.aspect, ndcY * halfH);
    }, { passive: true });
    addEventListener('pointerleave', function () { targetMouse.set(9999, 9999); }, { passive: true });

    function resize() {
      var w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    addEventListener('resize', resize, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

    var clock = new THREE.Clock();
    var elapsed = 0, visible = true, paused = false, raf = 0;

    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible && !paused) start();
    }, { threshold: 0.01 }).observe(canvas);
    document.addEventListener('visibilitychange', function () {
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

    window.__axiom = {
      mode: 'field',
      snap: function (t) { if (t == null) t = 10; paused = true; cancelAnimationFrame(raf); raf = 0; render(t); },
      pause: function () { paused = true; },
      resume: function () { paused = false; clock.getDelta(); start(); }
    };
  }
})();
