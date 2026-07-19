/* AXIOM — catalogue + cart.
   Product data composed from the Business Proposal v0.1 price ladder
   (Entry 180k–900k · Core 1.4M–6.5M · High-ticket 1.6M+) and the SKUs named
   across the brand artifacts. Edit PRODUCTS freely — everything renders
   from this one array. WhatsApp number below is a placeholder. */
(function () {
  'use strict';

  var WA_NUMBER = '6200000000000'; // ← replace with the real concierge number

  var PILLARS = {
    peptide:  { name: 'Peptide Science',    icon: 'i-flask' },
    therapy:  { name: 'Therapy & Recovery', icon: 'i-sun' },
    wellness: { name: 'Wellness',           icon: 'i-drop' },
    longevity:{ name: 'Longevity',          icon: 'i-infinity' },
    apparel:  { name: 'Apparel',            icon: 'i-tshirt' },
  };

  var PROOF = {
    peptide:  ['HPLC/MS verified ≥ 98% purity', 'Certificate of Analysis per lot', 'Cold-chain dispatch, insured & tracked', 'BAC water & research kit available'],
    therapy:  ['True 660 + 850 nm, verified irradiance', 'Hardware warranty + spec-match replacement', '30-day return window', 'Clinic supply terms available'],
    wellness: ['Documented sourcing, identity-tested', 'Same standard as the lab lines', 'Satisfaction return window', 'Member reorder pricing'],
    longevity:['Research-grade material, verified', 'Documentation on request', 'Cold-chain where required', 'Framed for the decade game'],
    apparel:  ['Neutral, precise make quality', 'Same mark, lab to label', 'Standard consumer returns', 'Identity worn quietly'],
  };

  var PRODUCTS = [
    { id: 'pep-bpc157',   pillar: 'peptide',  name: 'BPC-157',              spec: '5 mg · lyophilate · repair pathway',       price: 1600000, ruo: true,  art: 'vial' },
    { id: 'pep-tb500',    pillar: 'peptide',  name: 'TB-500',               spec: '5 mg · lyophilate · repair pathway',       price: 1900000, ruo: true,  art: 'vial' },
    { id: 'pep-ipam',     pillar: 'peptide',  name: 'Ipamorelin',           spec: '5 mg · lyophilate · growth pathway',       price: 1800000, ruo: true,  art: 'vial' },
    { id: 'pep-cjc',      pillar: 'peptide',  name: 'CJC-1295 (no DAC)',    spec: '5 mg · lyophilate · growth pathway',       price: 2100000, ruo: true,  art: 'vial' },
    { id: 'pep-semax',    pillar: 'peptide',  name: 'Semax',                spec: '30 mg · lyophilate · neuro pathway',       price: 1700000, ruo: true,  art: 'vial' },
    { id: 'pep-selank',   pillar: 'peptide',  name: 'Selank',               spec: '30 mg · lyophilate · neuro pathway',       price: 1700000, ruo: true,  art: 'vial' },
    { id: 'pep-kit',      pillar: 'peptide',  name: 'BAC Water & Research Kit', spec: '10 ml bacteriostatic · sterile kit',   price: 250000,  ruo: true,  art: 'kit' },
    { id: 'thr-mask',     pillar: 'therapy',  name: 'Red Light Therapy Mask',   spec: 'Face · LED array · 660 + 850 nm',      price: 2400000, art: 'mask' },
    { id: 'thr-panel',    pillar: 'therapy',  name: 'Red Light Half-Panel',     spec: 'Torso · 300 LED · 660 + 850 nm',       price: 4800000, art: 'panel' },
    { id: 'thr-mat',      pillar: 'therapy',  name: 'Red Light Full-Body Mat',  spec: 'Full body · 1 200 LED · 660 + 850 nm', price: 6500000, art: 'mat' },
    { id: 'thr-boots',    pillar: 'therapy',  name: 'Compression Recovery Boots', spec: 'Sequential · 4 chamber · pair',      price: 3900000, art: 'boots' },
    { id: 'thr-sleeve',   pillar: 'therapy',  name: 'Targeted Compression Sleeve', spec: 'Knee / elbow · 2 chamber',          price: 1400000, art: 'sleeve' },
    { id: 'wel-nad',      pillar: 'wellness', name: 'NAD⁺ Precursor',       spec: '60 capsules · cellular energy',            price: 650000,  art: 'jar' },
    { id: 'wel-antiox',   pillar: 'wellness', name: 'Antioxidant Complex',  spec: '60 capsules · daily baseline',             price: 420000,  art: 'jar' },
    { id: 'wel-energy',   pillar: 'wellness', name: 'Cellular Energy',      spec: '60 capsules · CoQ10 + PQQ',                price: 480000,  art: 'jar' },
    { id: 'wel-mag',      pillar: 'wellness', name: 'Magnesium Complex',    spec: '90 capsules · three forms',                price: 350000,  art: 'jar' },
    { id: 'lon-ghkcu',    pillar: 'longevity', name: 'GHK-Cu',              spec: '50 mg · copper peptide',                   price: 2200000, ruo: true, art: 'vial' },
    { id: 'lon-epi',      pillar: 'longevity', name: 'Epithalon',           spec: '10 mg · lyophilate',                       price: 2000000, ruo: true, art: 'vial' },
    { id: 'lon-nmn',      pillar: 'longevity', name: 'NMN Capsules',        spec: '60 capsules · 500 mg',                     price: 850000,  art: 'jar' },
    { id: 'app-tee',      pillar: 'apparel',  name: 'Standard Tee',         spec: 'Heavyweight cotton · bone / canvas',       price: 380000,  art: 'tee' },
    { id: 'app-crew',     pillar: 'apparel',  name: 'Performance Crewneck', spec: 'Brushed loopback · canvas',                price: 680000,  art: 'tee' },
    { id: 'app-shorts',   pillar: 'apparel',  name: 'Training Shorts',      spec: '4-way stretch · 7-inch',                   price: 450000,  art: 'shorts' },
    { id: 'app-cap',      pillar: 'apparel',  name: 'Field Cap',            spec: 'Unstructured · embroidered mark',          price: 280000,  art: 'cap' },
    { id: 'app-tote',     pillar: 'apparel',  name: 'Everyday Tote',        spec: '14 oz canvas · internal sleeve',           price: 520000,  art: 'tote' },
  ];

  /* ── product line art (hairline, bronze) ── */
  var ART = {
    vial:  '<rect x="45" y="38" width="30" height="56" rx="4"/><rect x="48" y="26" width="24" height="10" rx="2"/><line x1="45" y1="72" x2="75" y2="72"/><line x1="51" y1="80" x2="69" y2="80" opacity=".45"/>',
    kit:   '<rect x="28" y="46" width="52" height="40" rx="3"/><line x1="28" y1="58" x2="80" y2="58"/><rect x="86" y="42" width="14" height="34" rx="3"/><rect x="88" y="35" width="10" height="6" rx="1"/>',
    mask:  '<rect x="28" y="40" width="64" height="40" rx="20"/><circle cx="48" cy="58" r="5"/><circle cx="72" cy="58" r="5"/><path d="M28 55 H14 M92 55 h14" opacity=".45"/>',
    panel: '<rect x="36" y="28" width="48" height="64" rx="4"/>' + (function(){var s='';for(var r=0;r<4;r++)for(var c=0;c<3;c++)s+='<circle cx="'+(48+c*12)+'" cy="'+(40+r*13.5)+'" r="1.6" opacity=".7"/>';return s;})() + '<line x1="52" y1="98" x2="68" y2="98"/>',
    mat:   '<rect x="22" y="42" width="76" height="34" rx="6"/><line x1="41" y1="42" x2="41" y2="76" opacity=".45"/><line x1="60" y1="42" x2="60" y2="76" opacity=".45"/><line x1="79" y1="42" x2="79" y2="76" opacity=".45"/>',
    boots: '<rect x="36" y="26" width="20" height="66" rx="9"/><rect x="64" y="26" width="20" height="66" rx="9"/><line x1="36" y1="48" x2="56" y2="48" opacity=".45"/><line x1="64" y1="48" x2="84" y2="48" opacity=".45"/><line x1="36" y1="70" x2="56" y2="70" opacity=".45"/><line x1="64" y1="70" x2="84" y2="70" opacity=".45"/>',
    sleeve:'<rect x="47" y="26" width="26" height="66" rx="13"/><path d="M50 48 60 43 70 48 M50 62 60 57 70 62 M50 76 60 71 70 76" opacity=".55"/>',
    jar:   '<rect x="41" y="42" width="38" height="48" rx="5"/><rect x="44" y="32" width="32" height="10" rx="2"/><line x1="48" y1="60" x2="72" y2="60" opacity=".55"/><line x1="48" y1="68" x2="72" y2="68" opacity=".35"/>',
    tee:   '<path d="M48 30 34 38l5 12 7-3v43h28V47l7 3 5-12-14-8a12 12 0 0 1-24 0z"/>',
    shorts:'<path d="M38 36 H82 L86 84 H66 L60 56 54 84 H34 Z"/><line x1="38" y1="44" x2="82" y2="44" opacity=".45"/>',
    cap:   '<path d="M34 62a26 24 0 0 1 52 0"/><path d="M30 62h72q4 0 2 5l-2 3H34z" opacity=".8"/><circle cx="60" cy="40" r="1.6"/>',
    tote:  '<rect x="34" y="50" width="52" height="42" rx="2"/><path d="M46 50a14 16 0 0 1 28 0" fill="none"/><line x1="34" y1="62" x2="86" y2="62" opacity=".45"/>',
  };

  var fmt = function (n) { return 'Rp ' + n.toLocaleString('id-ID'); };
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  /* ── cart state ── */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('axiom-cart') || '{}') || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(function (id) { if (!byId[id]) delete cart[id]; });

  function saveCart() { localStorage.setItem('axiom-cart', JSON.stringify(cart)); }
  function cartCount() { return Object.values(cart).reduce(function (a, b) { return a + b; }, 0); }
  function cartTotal() { return Object.keys(cart).reduce(function (a, id) { return a + byId[id].price * cart[id]; }, 0); }
  function cartHasRuo() { return Object.keys(cart).some(function (id) { return byId[id].ruo; }); }

  /* ── render: grid ── */
  var grid = document.getElementById('shop-grid');
  var activePillar = 'all';
  var pillarParam = new URLSearchParams(location.search).get('pillar');
  if (pillarParam && PILLARS[pillarParam]) activePillar = pillarParam;

  function artSvg(p) {
    return '<svg class="prod-art-svg" viewBox="0 0 120 120" aria-hidden="true">' + ART[p.art] + '</svg>';
  }

  function cardHtml(p) {
    var pil = PILLARS[p.pillar];
    return '<article class="prod-card" data-id="' + p.id + '">' +
      '<button class="prod-art" data-detail="' + p.id + '" aria-label="View ' + p.name + '">' + artSvg(p) + '</button>' +
      '<div class="prod-tags"><span class="prod-pillar"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + pil.icon + '"/></svg>' + pil.name + '</span>' +
      (p.ruo ? '<span class="pill pill-ruo">RUO</span>' : '') + '</div>' +
      '<h3 class="prod-name">' + p.name + '</h3>' +
      '<p class="prod-spec">' + p.spec + '</p>' +
      '<div class="prod-foot"><span class="prod-price tab">' + fmt(p.price) + '</span>' +
      '<div class="prod-actions">' +
      '<button class="btn btn-line btn-sm" data-detail="' + p.id + '">Details</button>' +
      '<button class="btn btn-solid btn-sm" data-add="' + p.id + '">Add</button>' +
      '</div></div></article>';
  }

  function renderGrid(animate) {
    if (!grid) return;
    var list = PRODUCTS.filter(function (p) { return activePillar === 'all' || p.pillar === activePillar; });
    grid.innerHTML = list.map(cardHtml).join('');
    document.getElementById('shop-count').textContent = list.length + (list.length === 1 ? ' product' : ' products');
    if (animate && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.from(grid.children, { opacity: 0, y: 14, duration: 0.5, ease: 'expo.out', stagger: 0.03, clearProps: 'all' });
    }
  }

  /* ── filter chips ── */
  document.querySelectorAll('.shop-chip').forEach(function (chip) {
    chip.classList.toggle('is-active', chip.dataset.pillar === activePillar);
    chip.addEventListener('click', function () {
      activePillar = chip.dataset.pillar;
      document.querySelectorAll('.shop-chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      renderGrid(true);
    });
  });

  /* ── featured strip (home) ── */
  var FEATURED = ['thr-mask', 'pep-bpc157', 'lon-ghkcu', 'thr-mat', 'wel-nad', 'app-crew'];
  var featured = document.getElementById('featured-grid');
  if (featured) featured.innerHTML = FEATURED.map(function (id) { return cardHtml(byId[id]); }).join('');

  /* ── toast ── */
  var toast = document.getElementById('toast');
  var toastTimer = 0;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2000);
  }

  /* ── cart drawer ── */
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('shop-overlay');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderCart() {
    var ids = Object.keys(cart);
    var badge = document.getElementById('cart-count');
    var n = cartCount();
    badge.textContent = n;
    badge.classList.toggle('is-on', n > 0);

    var body = document.getElementById('cart-items');
    if (!ids.length) {
      body.innerHTML = '<p class="cart-empty">Your cart is empty. The range is one section up.</p>';
    } else {
      body.innerHTML = ids.map(function (id) {
        var p = byId[id];
        return '<div class="cart-row" data-id="' + id + '">' +
          '<div class="cart-row-art">' + artSvg(p) + '</div>' +
          '<div class="cart-row-main"><span class="cart-row-name">' + p.name + (p.ruo ? ' <span class="pill pill-ruo">RUO</span>' : '') + '</span>' +
          '<span class="cart-row-spec">' + p.spec + '</span>' +
          '<div class="cart-qty"><button data-dec="' + id + '" aria-label="Decrease">−</button><span class="tab">' + cart[id] + '</span><button data-inc="' + id + '" aria-label="Increase">+</button>' +
          '<button class="cart-remove" data-remove="' + id + '">Remove</button></div></div>' +
          '<span class="cart-row-price tab">' + fmt(p.price * cart[id]) + '</span></div>';
      }).join('');
    }
    document.getElementById('cart-total').textContent = fmt(cartTotal());
    document.getElementById('cart-ruo').hidden = !cartHasRuo();
    document.getElementById('cart-wa').classList.toggle('is-disabled', !ids.length);
    document.getElementById('cart-wa').href = ids.length ? waLink() : '#';
  }

  function waLink() {
    var lines = ['AXIOM — Order request', ''];
    Object.keys(cart).forEach(function (id) {
      var p = byId[id];
      lines.push('- ' + p.name + ' (' + p.spec + ') x' + cart[id] + ' — ' + fmt(p.price * cart[id]) + (p.ruo ? ' [RUO]' : ''));
    });
    lines.push('', 'Subtotal: ' + fmt(cartTotal()));
    if (cartHasRuo()) lines.push('', 'RUO items: I confirm I am a qualified researcher or institutional buyer and accept the Research Use Only / in-vitro terms.');
    lines.push('', 'Please send an itemised quote with live stock.');
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-on');
    document.body.classList.add('is-locked');
    if (window.gsap && !reduced) gsap.fromTo(drawer, { x: 40, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-on');
    if (!modal.classList.contains('is-open')) document.body.classList.remove('is-locked');
  }

  /* ── product modal ── */
  var modal = document.getElementById('prod-modal');

  function openModal(id) {
    var p = byId[id];
    var pil = PILLARS[p.pillar];
    document.getElementById('modal-body').innerHTML =
      '<div class="modal-art">' + artSvg(p) + '</div>' +
      '<div class="modal-info">' +
      '<div class="prod-tags"><span class="prod-pillar"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + pil.icon + '"/></svg>' + pil.name + '</span>' +
      (p.ruo ? '<span class="pill pill-ruo">Research Use Only</span>' : '') + '</div>' +
      '<h3 class="modal-name">' + p.name + '</h3>' +
      '<p class="modal-spec">' + p.spec + '</p>' +
      '<ul class="modal-proof">' + PROOF[p.pillar].map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
      (p.ruo ? '<p class="modal-ruo">Research Use Only — in-vitro laboratory use. Not for human or veterinary consumption. No dosing or usage guidance is provided.</p>' : '') +
      '<div class="modal-buy"><div class="cart-qty modal-qty"><button id="mq-dec" aria-label="Decrease">−</button><span class="tab" id="mq-val">1</span><button id="mq-inc" aria-label="Increase">+</button></div>' +
      '<span class="prod-price tab" id="mq-price">' + fmt(p.price) + '</span>' +
      '<button class="btn btn-solid" data-madd="' + id + '">Add to cart</button></div></div>';
    modal.classList.add('is-open');
    overlay.classList.add('is-on');
    document.body.classList.add('is-locked');
    if (window.gsap && !reduced) gsap.fromTo(modal.querySelector('.modal-card'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });

    var q = 1;
    var val = document.getElementById('mq-val');
    var price = document.getElementById('mq-price');
    document.getElementById('mq-dec').onclick = function () { q = Math.max(1, q - 1); val.textContent = q; price.textContent = fmt(p.price * q); };
    document.getElementById('mq-inc').onclick = function () { q = Math.min(99, q + 1); val.textContent = q; price.textContent = fmt(p.price * q); };
    modal.querySelector('[data-madd]').onclick = function () {
      add(id, q);
      closeModal();
      openDrawer();
    };
  }
  function closeModal() {
    modal.classList.remove('is-open');
    if (!drawer.classList.contains('is-open')) { overlay.classList.remove('is-on'); document.body.classList.remove('is-locked'); }
  }

  /* ── actions ── */
  function add(id, qty) {
    cart[id] = Math.min(99, (cart[id] || 0) + (qty || 1));
    saveCart(); renderCart();
    showToast('Added — ' + byId[id].name);
    var nav = document.getElementById('nav');
    if (nav) nav.classList.remove('is-hidden'); // surface the cart badge
    window.__axiomNavHold = Date.now() + 1200;  // scroll handler won't re-hide during the hold
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-detail],[data-inc],[data-dec],[data-remove]');
    if (!t) return;
    if (t.dataset.add) add(t.dataset.add);
    else if (t.dataset.detail) openModal(t.dataset.detail);
    else if (t.dataset.inc) { cart[t.dataset.inc] = Math.min(99, cart[t.dataset.inc] + 1); saveCart(); renderCart(); }
    else if (t.dataset.dec) {
      var id = t.dataset.dec;
      cart[id] -= 1;
      if (cart[id] <= 0) delete cart[id];
      saveCart(); renderCart();
    }
    else if (t.dataset.remove) { delete cart[t.dataset.remove]; saveCart(); renderCart(); }
  });

  document.getElementById('cart-open').addEventListener('click', function () { renderCart(); openDrawer(); });
  document.getElementById('cart-close').addEventListener('click', closeDrawer);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function () { closeDrawer(); closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); closeModal(); } });

  document.getElementById('cart-copy').addEventListener('click', function () {
    var text = decodeURIComponent(waLink().split('?text=')[1]);
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      function () { showToast('Order copied to clipboard'); },
      function () { showToast('Copy failed — use the WhatsApp button'); }
    );
  });

  /* ── init ── */
  renderGrid(false);
  renderCart();

  window.__axiomShop = { cart: cart, products: PRODUCTS, waLink: waLink, total: cartTotal };
})();
