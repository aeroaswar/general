/* AXIOM — interaction layer (Brand Guidelines §10).
   One signature ease, 700ms reveals, ≤18px rise, 65ms stagger, play once.
   Gate → sting → hero (shop page). Nav hides on scroll-down. Magnetic hover on
   fine pointers. Everything static under prefers-reduced-motion.
   The custom dot/ring cursor has been removed — normal cursor only. */
(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  var EASE = 'expo.out';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var params = new URLSearchParams(location.search);

  /* ══ Gate (present only where injected) ══ */
  var gate = document.getElementById('gate');
  var sting = document.getElementById('sting');
  var skipGate = !gate || params.has('nogate') || sessionStorage.getItem('axiom-gate') === '1';

  document.querySelectorAll('.gate-lang').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var lang = btn.dataset.lang;
      document.querySelectorAll('.gate-lang').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
      document.querySelectorAll('[data-gate]').forEach(function (el) { el.hidden = el.dataset.gate !== lang; });
      document.querySelectorAll('[data-gate-btn]').forEach(function (el) { el.hidden = el.dataset.gateBtn !== lang; });
    });
  });

  function removeGate() {
    if (!gate) return;
    if (window.AXTrap) AXTrap.release(gate);
    gate.remove();
    document.body.classList.remove('is-gated');
  }

  function playSting(done) {
    if (reduced || !sting) { done(); return; }
    sting.classList.add('is-active');
    var blades = sting.querySelectorAll('path');
    var mark = sting.querySelector('svg:not(.sting-word)');
    var word = sting.querySelector('.sting-word');
    var dirs = [{ x: -73, y: -59 }, { x: 73, y: -59 }, { x: -73, y: 59 }, { x: 73, y: 59 }];
    var tl = gsap.timeline({ onComplete: function () { sting.classList.remove('is-active'); done(); } });
    blades.forEach(function (b, i) { tl.from(b, { x: dirs[i].x, y: dirs[i].y, opacity: 0, duration: 0.9, ease: EASE }, i * 0.08); });
    tl.to(mark, { opacity: 0, duration: 0.4, ease: EASE }, '+=0.4');
    tl.fromTo(word, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE });
    tl.to(sting, { opacity: 0, duration: 0.5, ease: EASE }, '+=0.5');
    tl.set(sting, { clearProps: 'opacity' });
  }

  function enter() {
    sessionStorage.setItem('axiom-gate', '1');
    gate.classList.add('is-leaving');
    if (reduced) { removeGate(); heroIn(); return; }
    gsap.to(gate, { opacity: 0, duration: 0.5, ease: EASE, onComplete: function () { removeGate(); playSting(heroIn); } });
  }

  /* ══ Hero reveal (present only on landing pages) ══ */
  var heroTitle = document.getElementById('hero-title');
  if (heroTitle) (function splitWords() {
    function split(node, keepTrail) {
      var words = node.textContent.split(/\s+/).filter(Boolean);
      node.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'w';
        s.textContent = w + (i < words.length - 1 ? ' ' : (keepTrail ? ' ' : ''));
        node.appendChild(s);
      });
    }
    var em = heroTitle.querySelector('em');
    var lead = document.createElement('span');
    lead.textContent = heroTitle.firstChild.textContent;
    heroTitle.replaceChild(lead, heroTitle.firstChild);
    split(lead, !!em);   // preserve the space before the muted <em> clause
    if (em) split(em, false);
  })();

  var heroPlayed = false;
  function heroIn() {
    if (heroPlayed || !heroTitle) return;
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
    var confirm = document.getElementById('gate-confirm');
    if (confirm) confirm.addEventListener('click', enter);
    if (window.AXTrap) AXTrap.activate(gate);
  }

  /* ══ Nav hide/show + progress ══ */
  var nav = document.getElementById('ax-nav');
  var fill = document.getElementById('progress-fill');
  var lastY = null;
  addEventListener('scroll', function () {
    var y = scrollY;
    var max = document.documentElement.scrollHeight - innerHeight;
    if (fill) fill.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (!nav) return;
    if (lastY === null) { lastY = y; return; }
    var held = window.__axiomNavHold && Date.now() < window.__axiomNavHold;
    if (y > 90 && y > lastY + 4 && !held) nav.classList.add('is-hidden');
    else if (y < lastY - 4 || y <= 90) nav.classList.remove('is-hidden');
    lastY = y;
  }, { passive: true });

  /* ══ Scroll reveals ══ */
  if (!reduced) {
    gsap.utils.toArray('[data-reveal]').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 18, duration: 0.7, ease: EASE, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    gsap.utils.toArray('[data-stagger]').forEach(function (group) {
      gsap.from(group.children, { opacity: 0, y: 18, duration: 0.7, ease: EASE, stagger: 0.065, scrollTrigger: { trigger: group, start: 'top 86%', once: true } });
    });
    gsap.utils.toArray('.sec-head').forEach(function (el) {
      gsap.from(el.children, { opacity: 0, y: 18, duration: 0.7, ease: EASE, stagger: 0.065, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
  }

  /* ══ .reveal / .stagger — the document pages' own convention (Plan, Brand).
     Their bespoke reveal script was removed; drive the same CSS with a reliable
     IntersectionObserver so content reveals on scroll and can never stay
     permanently invisible. Failsafe reveals everything if IO is unavailable. ══ */
  (function () {
    var els = document.querySelectorAll('.reveal, .stagger');
    if (!els.length) return;
    var reveal = function (el) { el.classList.add('in'); };
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
    // failsafe: nothing should remain invisible after the page has settled
    setTimeout(function () {
      document.querySelectorAll('.reveal:not(.in), .stagger:not(.in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) reveal(el);
      });
    }, 1200);
  })();

  /* ══ The Standard — pinned scrub on desktop (shop page) ══ */
  var rows = gsap.utils.toArray('.std-row');
  if (!rows.length) {
    /* not on this page */
  } else if (!reduced) {
    ScrollTrigger.matchMedia({
      '(min-width: 900px)': function () {
        var tl = gsap.timeline({ scrollTrigger: { trigger: '.sec-standard', start: 'top top', end: '+=' + rows.length * 420, pin: true, scrub: 0.6 } });
        rows.forEach(function (row, i) {
          tl.from(row, { opacity: 0.12, x: 26, duration: 1, ease: 'none' }, i);
          tl.call(function () { row.classList.add('is-lit'); }, null, i + 0.55);
        });
        tl.to({}, { duration: 0.5 });
      },
      '(max-width: 899px)': function () {
        rows.forEach(function (row) {
          gsap.from(row, { opacity: 0, y: 18, duration: 0.7, ease: EASE, scrollTrigger: { trigger: row, start: 'top 88%', once: true, onEnter: function () { row.classList.add('is-lit'); } } });
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
    gsap.to(obj, { v: target, duration: opts.duration || 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: function () { el.textContent = prefix + obj.v.toFixed(decimals) + suffix; } });
  }
  if (!reduced) {
    document.querySelectorAll('[data-count]').forEach(function (el) { countUp(el, parseFloat(el.dataset.count), { decimals: 0 }); });
    var purity = document.getElementById('coa-purity');
    var meter = document.getElementById('coa-meter');
    if (purity) {
      var pObj = { v: 0 };
      gsap.to(pObj, { v: 99.2, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: '#coa', start: 'top 82%', once: true }, onUpdate: function () { purity.textContent = pObj.v.toFixed(1) + '%'; if (meter) meter.style.width = pObj.v + '%'; } });
    }
  } else {
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = (el.dataset.prefix || '') + el.dataset.count + (el.dataset.suffix || ''); });
    var sp = document.getElementById('coa-purity');
    if (sp) { sp.textContent = '99.2%'; var m2 = document.getElementById('coa-meter'); if (m2) m2.style.width = '99.2%'; }
  }

  /* ══ Magnetic hover — pull 0.32, release on signature ease (fine pointers) ══ */
  if (fine && !reduced) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.32, y: (e.clientY - r.top - r.height / 2) * 0.32, duration: 0.35, ease: 'power2.out' });
      });
      el.addEventListener('pointerleave', function () { gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: EASE }); });
    });
  }

  /* ══ ?cap=<section-id> — deterministic static capture (house convention) ══ */
  var cap = params.get('cap');
  if (cap) {
    if (gate && gate.parentNode) removeGate();
    gsap.globalTimeline.progress(1);
    ScrollTrigger.getAll().forEach(function (st) { st.progress(1); });
    var capTarget = document.getElementById(cap);
    if (capTarget) capTarget.scrollIntoView({ behavior: 'auto' });
    if (window.__axiom && window.__axiom.snap) window.__axiom.snap(10);
  }
})();
