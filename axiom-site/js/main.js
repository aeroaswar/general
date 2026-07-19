/* AXIOM — interaction layer (Brand Guidelines §10).
   One signature ease, 700ms reveals, ≤18px rise, 65ms stagger, play once.
   Gate → sting → hero. Nav hides on scroll-down. Cursor + magnetic on fine
   pointers only. Everything static under prefers-reduced-motion. */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var EASE = 'expo.out';                    // ≈ cubic-bezier(.16,1,.3,1)
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var params = new URLSearchParams(location.search);

  /* ══ Gate ══ */
  var gate = document.getElementById('gate');
  var sting = document.getElementById('sting');
  var skipGate = params.has('nogate') || sessionStorage.getItem('axiom-gate') === '1';

  document.querySelectorAll('.gate-lang').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.dataset.lang;
      document.querySelectorAll('.gate-lang').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      document.querySelectorAll('[data-gate]').forEach(function (el) { el.hidden = el.dataset.gate !== lang; });
      document.querySelectorAll('[data-gate-btn]').forEach(function (el) { el.hidden = el.dataset.gateBtn !== lang; });
    });
  });

  function removeGate() {
    gate.remove();
    document.body.classList.remove('is-gated');
  }

  function playSting(done) {
    if (reduced) { done(); return; }
    sting.classList.add('is-active');
    var blades = sting.querySelectorAll('.blade');
    // four blades travel in along their own diagonals — 900ms, 80ms stagger,
    // ≥400ms hold, no bounce, play once (§10·5)
    var travel = 15;
    var dirs = [{ x: 0, y: -travel }, { x: travel, y: 0 }, { x: 0, y: travel }, { x: -travel, y: 0 }];
    var tl = gsap.timeline({ onComplete: function () { sting.classList.remove('is-active'); done(); } });
    blades.forEach(function (b, i) {
      tl.from(b, { x: dirs[i].x, y: dirs[i].y, opacity: 0, duration: 0.9, ease: EASE }, i * 0.08);
    });
    tl.to(sting, { opacity: 0, duration: 0.6, ease: EASE }, '+=0.4');
    tl.set(sting, { clearProps: 'opacity' });
  }

  function enter() {
    sessionStorage.setItem('axiom-gate', '1');
    gate.classList.add('is-leaving');
    if (reduced) { removeGate(); heroIn(); return; }
    gsap.to(gate, {
      opacity: 0, duration: 0.5, ease: EASE,
      onComplete: function () { removeGate(); playSting(heroIn); }
    });
  }

  /* ══ Hero reveal ══ */
  var heroTitle = document.getElementById('hero-title');
  // split headline into words, keeping the muted <em> treatment
  (function splitWords() {
    function split(node) {
      var words = node.textContent.split(/\s+/).filter(Boolean);
      node.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w + (i < words.length - 1 ? ' ' : '');
        node.appendChild(s);
      });
    }
    var em = heroTitle.querySelector('em');
    var lead = document.createElement('span');
    lead.textContent = heroTitle.firstChild.textContent;
    heroTitle.replaceChild(lead, heroTitle.firstChild);
    split(lead);
    if (em) split(em);
  })();

  var heroPlayed = false;
  function heroIn() {
    if (heroPlayed) return;
    heroPlayed = true;
    if (reduced) return;
    var words = heroTitle.querySelectorAll('.w');
    var rest = document.querySelectorAll('[data-hero]');
    var tl = gsap.timeline();
    tl.from(words, { opacity: 0, y: 18, duration: 0.7, ease: EASE, stagger: 0.045 }, 0.05);
    tl.from(rest, { opacity: 0, y: 18, duration: 0.7, ease: EASE, stagger: 0.065 }, 0.25);
  }

  if (skipGate) {
    removeGate();
    heroIn();
  } else {
    document.body.classList.add('is-gated');
    document.getElementById('gate-confirm').addEventListener('click', enter);
  }

  /* ══ Nav hide/show + progress ══ */
  var nav = document.getElementById('nav');
  var fill = document.getElementById('progress-fill');
  var lastY = 0;
  addEventListener('scroll', function () {
    var y = scrollY;
    var max = document.documentElement.scrollHeight - innerHeight;
    fill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (y > 90 && y > lastY + 4) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 90) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  /* ══ Scroll reveals — 700ms, 18px, 65ms stagger, once ══ */
  if (!reduced) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 18, duration: 0.7, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    gsap.utils.toArray('[data-stagger]').forEach(function (group) {
      gsap.from(group.children, {
        opacity: 0, y: 18, duration: 0.7, ease: EASE, stagger: 0.065,
        scrollTrigger: { trigger: group, start: 'top 84%', once: true }
      });
    });
    gsap.utils.toArray('.sec-head').forEach(function (el) {
      gsap.from(el.children, {
        opacity: 0, y: 18, duration: 0.7, ease: EASE, stagger: 0.065,
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
  }

  /* ══ 01 · The Standard — pinned scrub on desktop ══ */
  var rows = gsap.utils.toArray('.std-row');
  if (!reduced) {
    ScrollTrigger.matchMedia({
      '(min-width: 900px)': function () {
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.sec-standard', start: 'top top', end: '+=' + rows.length * 420,
            pin: true, scrub: 0.6,
          }
        });
        rows.forEach(function (row, i) {
          tl.from(row, { opacity: 0.12, x: 26, duration: 1, ease: 'none' }, i);
          tl.call(function () { row.classList.add('is-lit'); }, null, i + 0.55);
        });
        tl.to({}, { duration: 0.5 }); // settle beat before unpin
      },
      '(max-width: 899px)': function () {
        rows.forEach(function (row) {
          gsap.from(row, {
            opacity: 0, y: 18, duration: 0.7, ease: EASE,
            scrollTrigger: {
              trigger: row, start: 'top 86%', once: true,
              onEnter: function () { row.classList.add('is-lit'); }
            }
          });
        });
      }
    });
  } else {
    rows.forEach(function (r) { r.classList.add('is-lit'); });
  }

  /* ══ Counters ══ */
  function countUp(el, target, opts) {
    var decimals = opts.decimals || 0;
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: opts.duration || 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      onUpdate: function () { el.textContent = prefix + obj.v.toFixed(decimals) + suffix; }
    });
  }
  if (!reduced) {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      countUp(el, parseFloat(el.dataset.count), { decimals: 0 });
    });
    var purity = document.getElementById('coa-purity');
    var meter = document.getElementById('coa-meter');
    var pObj = { v: 0 };
    gsap.to(pObj, {
      v: 99.2, duration: 1.8, ease: 'power2.out',
      scrollTrigger: { trigger: '#coa', start: 'top 78%', once: true },
      onUpdate: function () {
        purity.textContent = pObj.v.toFixed(1) + '%';
        meter.style.width = pObj.v + '%';
      }
    });
  } else {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || '');
    });
    document.getElementById('coa-purity').textContent = '99.2%';
    document.getElementById('coa-meter').style.width = '99.2%';
  }

  /* ══ Cursor — lagging ring + fast dot, difference blend (§10·3) ══ */
  if (fine && !reduced) {
    document.body.classList.add('has-cursor');
    var dot = document.getElementById('cursor-dot');
    var ring = document.getElementById('cursor-ring');
    var mx = innerWidth / 2, my = innerHeight / 2;
    var dx = mx, dy = my, rx = mx, ry = my;
    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() {
      dx += (mx - dx) * 0.35; dy += (my - dy) * 0.35;   // fast dot 35%/frame
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;   // lagging ring 16%/frame
      dot.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      if (e.target.closest('a,button')) ring.classList.add('is-on');
    });
    document.addEventListener('pointerout', function (e) {
      if (e.target.closest('a,button')) ring.classList.remove('is-on');
    });
  }

  /* ══ Magnetic hover — pull 0.32, release on signature ease ══ */
  if (fine && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.32,
          y: (e.clientY - r.top - r.height / 2) * 0.32,
          duration: 0.35, ease: 'power2.out'
        });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: EASE });
      });
    });
  }

  /* ══ ?cap=<section-id> — deterministic static capture (house convention) ══ */
  var cap = params.get('cap');
  if (cap) {
    removeGate && gate && gate.parentNode && removeGate();
    gsap.globalTimeline.progress(1);
    ScrollTrigger.getAll().forEach(function (st) { st.progress(1); });
    var target = document.getElementById(cap);
    if (target) target.scrollIntoView({ behavior: 'auto' });
    if (window.__axiom && window.__axiom.snap) window.__axiom.snap(10);
  }
})();
