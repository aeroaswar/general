/* AXIOM — catalogue + cart.
   Peptide Science entries follow the AXIOM Price List v1.0 (research catalogue,
   IDR) verbatim. Edit PRODUCTS freely — everything renders from this one array.
   WhatsApp number and per-SKU stock below are placeholders (see WA_NUMBER /
   STOCK_OVERRIDE). */
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
    // 01 · GLP-1s & Weight Loss
    { id: 'pep-cagri-10',   pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Cagrilintide',            spec: '10 mg lot · lyophilate', price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-reta-5',     pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Retatrutide',             spec: '5 mg lot · lyophilate',  price: 2700000, ruo: true, art: 'vial' },
    { id: 'pep-reta-10',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Retatrutide',             spec: '10 mg lot · lyophilate', price: 3100000, ruo: true, art: 'vial' },
    { id: 'pep-reta-15',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Retatrutide',             spec: '15 mg lot · lyophilate', price: 3500000, ruo: true, art: 'vial' },
    { id: 'pep-reta-20',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Retatrutide',             spec: '20 mg lot · lyophilate', price: 3900000, ruo: true, art: 'vial' },
    { id: 'pep-reta-30',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Retatrutide',             spec: '30 mg lot · lyophilate', price: 5100000, ruo: true, art: 'vial' },
    { id: 'pep-reta-60',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Retatrutide',             spec: '60 mg lot · lyophilate', price: 8300000, ruo: true, art: 'vial' },
    { id: 'pep-tirz-10',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Tirzepatide',             spec: '10 mg lot · lyophilate', price: 2400000, ruo: true, art: 'vial' },
    { id: 'pep-tirz-30',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Tirzepatide',             spec: '30 mg lot · lyophilate', price: 3800000, ruo: true, art: 'vial' },
    { id: 'pep-tirz-40',    pillar: 'peptide', cat: 'GLP-1s & Weight Loss', name: 'Tirzepatide',             spec: '40 mg lot · lyophilate', price: 4500000, ruo: true, art: 'vial' },
    // 02 · GH Secretagogues
    { id: 'pep-cjcipa-10',  pillar: 'peptide', cat: 'GH Secretagogues', name: 'CJC-1295 (No DAC) + Ipamorelin', spec: '10 mg lot · blend',  price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-cjcipa-20',  pillar: 'peptide', cat: 'GH Secretagogues', name: 'CJC-1295 (No DAC) + Ipamorelin', spec: '20 mg lot · blend',  price: 4300000, ruo: true, art: 'vial' },
    { id: 'pep-hgh-36',     pillar: 'peptide', cat: 'GH Secretagogues', name: 'HGH 191AA (Somatropin)',      spec: '36 IU lot',              price: 3200000, ruo: true, art: 'vial' },
    { id: 'pep-hgh-40',     pillar: 'peptide', cat: 'GH Secretagogues', name: 'HGH 191AA (Somatropin)',      spec: '40 IU lot',              price: 3600000, ruo: true, art: 'vial' },
    { id: 'pep-ipam-10',    pillar: 'peptide', cat: 'GH Secretagogues', name: 'Ipamorelin',                  spec: '10 mg lot · lyophilate', price: 2800000, ruo: true, art: 'vial' },
    { id: 'pep-ipatesa-18', pillar: 'peptide', cat: 'GH Secretagogues', name: 'Ipamorelin + Tesamorelin',    spec: '18 mg lot · blend',      price: 5000000, ruo: true, art: 'vial' },
    { id: 'pep-tesa-10',    pillar: 'peptide', cat: 'GH Secretagogues', name: 'Tesamorelin',                 spec: '10 mg lot · lyophilate', price: 3600000, ruo: true, art: 'vial' },
    { id: 'pep-tesa-20',    pillar: 'peptide', cat: 'GH Secretagogues', name: 'Tesamorelin',                 spec: '20 mg lot · lyophilate', price: 4700000, ruo: true, art: 'vial' },
    // 03 · Healing & Repair
    { id: 'pep-bpc157-10',  pillar: 'peptide', cat: 'Healing & Repair', name: 'BPC-157',                     spec: '10 mg lot · lyophilate', price: 2700000, ruo: true, art: 'vial' },
    { id: 'pep-wolv-20',    pillar: 'peptide', cat: 'Healing & Repair', name: 'BPC-157 + TB-500 (Wolverine)', spec: '20 mg lot · blend',     price: 3900000, ruo: true, art: 'vial' },
    { id: 'pep-ghkcu-50',   pillar: 'peptide', cat: 'Healing & Repair', name: 'GHK-Cu',                      spec: '50 mg lot · copper peptide', price: 2100000, ruo: true, art: 'vial' },
    { id: 'pep-ghkcu-100',  pillar: 'peptide', cat: 'Healing & Repair', name: 'GHK-Cu',                      spec: '100 mg lot · copper peptide', price: 2300000, ruo: true, art: 'vial' },
    { id: 'pep-kpv-10',     pillar: 'peptide', cat: 'Healing & Repair', name: 'KPV',                         spec: '10 mg lot · lyophilate', price: 2600000, ruo: true, art: 'vial' },
    { id: 'pep-klow-80',    pillar: 'peptide', cat: 'Healing & Repair', name: 'KLOW (BPC+TB+GHK+KPV)',       spec: '80 mg lot · blend',      price: 4400000, ruo: true, art: 'vial' },
    { id: 'pep-ll37-5',     pillar: 'peptide', cat: 'Healing & Repair', name: 'LL-37',                       spec: '5 mg lot · lyophilate',  price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-pegmgf-2',   pillar: 'peptide', cat: 'Healing & Repair', name: 'Peg MGF',                     spec: '2 mg lot · lyophilate',  price: 3100000, ruo: true, art: 'vial' },
    { id: 'pep-tb500-10',   pillar: 'peptide', cat: 'Healing & Repair', name: 'TB-500',                      spec: '10 mg lot · lyophilate', price: 2900000, ruo: true, art: 'vial' },
    // 04 · Brain Health & Nootropics
    { id: 'pep-adamax-10',  pillar: 'peptide', cat: 'Brain Health & Nootropics', name: 'Adamax',             spec: '10 mg lot · lyophilate', price: 3100000, ruo: true, art: 'vial' },
    { id: 'pep-cere-60',    pillar: 'peptide', cat: 'Brain Health & Nootropics', name: 'Cerebrolysin',       spec: '60 mg lot',              price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-pine-20',    pillar: 'peptide', cat: 'Brain Health & Nootropics', name: 'Pinealon',           spec: '20 mg lot · lyophilate', price: 3600000, ruo: true, art: 'vial' },
    { id: 'pep-selank-10',  pillar: 'peptide', cat: 'Brain Health & Nootropics', name: 'Selank',             spec: '10 mg lot · lyophilate', price: 2300000, ruo: true, art: 'vial' },
    { id: 'pep-semax-10',   pillar: 'peptide', cat: 'Brain Health & Nootropics', name: 'Semax',              spec: '10 mg lot · lyophilate', price: 2300000, ruo: true, art: 'vial' },
    { id: 'pep-selsem-20',  pillar: 'peptide', cat: 'Brain Health & Nootropics', name: 'Selank + Semax',     spec: '20 mg lot · blend',      price: 3200000, ruo: true, art: 'vial' },
    // 05 · Energy & Endurance
    { id: 'pep-5amino-50',  pillar: 'peptide', cat: 'Energy & Endurance', name: '5-Amino-1MQ',               spec: '50 mg lot',              price: 3200000, ruo: true, art: 'vial' },
    { id: 'pep-aicar-50',   pillar: 'peptide', cat: 'Energy & Endurance', name: 'AICAR',                     spec: '50 mg lot · lyophilate', price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-lcar-5000',  pillar: 'peptide', cat: 'Energy & Endurance', name: 'L-Carnitine (Injectable)',  spec: '5 000 mg lot',           price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-motsc-10',   pillar: 'peptide', cat: 'Energy & Endurance', name: 'MOTS-c',                    spec: '10 mg lot · lyophilate', price: 2400000, ruo: true, art: 'vial' },
    { id: 'pep-motsc-40',   pillar: 'peptide', cat: 'Energy & Endurance', name: 'MOTS-c',                    spec: '40 mg lot · lyophilate', price: 4300000, ruo: true, art: 'vial' },
    { id: 'pep-slupp-5',    pillar: 'peptide', cat: 'Energy & Endurance', name: 'SLU-PP-332 (Injectable)',   spec: '5 mg lot',               price: 2700000, ruo: true, art: 'vial' },
    // 06 · Immunity
    { id: 'pep-ta1-10',     pillar: 'peptide', cat: 'Immunity', name: 'Thymosin Alpha-1',                    spec: '10 mg lot · lyophilate', price: 3600000, ruo: true, art: 'vial' },
    // 07 · Sexual Health
    { id: 'pep-hcg-10000',  pillar: 'peptide', cat: 'Sexual Health', name: 'HCG',                            spec: '10 000 IU lot',          price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-hmg-75',     pillar: 'peptide', cat: 'Sexual Health', name: 'HMG',                            spec: '75 IU lot',              price: 2700000, ruo: true, art: 'vial' },
    { id: 'pep-kiss-10',    pillar: 'peptide', cat: 'Sexual Health', name: 'Kisspeptin',                     spec: '10 mg lot · lyophilate', price: 3200000, ruo: true, art: 'vial' },
    { id: 'pep-oxy-10',     pillar: 'peptide', cat: 'Sexual Health', name: 'Oxytocin Acetate',               spec: '10 mg lot · lyophilate', price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-pt141-10',   pillar: 'peptide', cat: 'Sexual Health', name: 'PT-141',                         spec: '10 mg lot · lyophilate', price: 2600000, ruo: true, art: 'vial' },
    // 08 · Longevity & Cellular Repair
    { id: 'pep-dsip-5',     pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'DSIP',             spec: '5 mg lot · lyophilate',  price: 2100000, ruo: true, art: 'vial' },
    { id: 'pep-dsip-10',    pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'DSIP',             spec: '10 mg lot · lyophilate', price: 2600000, ruo: true, art: 'vial' },
    { id: 'pep-epi-50',     pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'Epithalon',        spec: '50 mg lot · lyophilate', price: 3400000, ruo: true, art: 'vial' },
    { id: 'pep-hum-10',     pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'Humanin',          spec: '10 mg lot · lyophilate', price: 4500000, ruo: true, art: 'vial' },
    { id: 'pep-nad-500',    pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'NAD+',             spec: '500 mg lot',             price: 2600000, ruo: true, art: 'vial' },
    { id: 'pep-nad-1000',   pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'NAD+',             spec: '1 000 mg lot',           price: 3000000, ruo: true, art: 'vial' },
    { id: 'pep-ss31-50',    pillar: 'peptide', cat: 'Longevity & Cellular Repair', name: 'SS-31',            spec: '50 mg lot · lyophilate', price: 4500000, ruo: true, art: 'vial' },
    // Research supplies
    { id: 'pep-kit',        pillar: 'peptide', cat: 'Research Supplies', name: 'BAC Water & Research Kit',   spec: '10 ml bacteriostatic · sterile kit', price: 250000, ruo: true, art: 'kit' },
    // Therapy & Recovery
    { id: 'thr-mask',     pillar: 'therapy',  name: 'Red Light Therapy Mask',   spec: 'Face · LED array · 660 + 850 nm',      price: 2400000, art: 'mask' },
    { id: 'thr-panel',    pillar: 'therapy',  name: 'Red Light Half-Panel',     spec: 'Torso · 300 LED · 660 + 850 nm',       price: 4800000, art: 'panel' },
    { id: 'thr-mat',      pillar: 'therapy',  name: 'Red Light Full-Body Mat',  spec: 'Full body · 1 200 LED · 660 + 850 nm', price: 6500000, art: 'mat' },
    { id: 'thr-boots',    pillar: 'therapy',  name: 'Compression Recovery Boots', spec: 'Sequential · 4 chamber · pair',      price: 3900000, art: 'boots' },
    { id: 'thr-sleeve',   pillar: 'therapy',  name: 'Targeted Compression Sleeve', spec: 'Knee / elbow · 2 chamber',          price: 1400000, art: 'sleeve' },
    // Wellness
    { id: 'wel-nad',      pillar: 'wellness', name: 'NAD⁺ Precursor',       spec: '60 capsules · cellular energy',            price: 650000,  art: 'jar' },
    { id: 'wel-antiox',   pillar: 'wellness', name: 'Antioxidant Complex',  spec: '60 capsules · daily baseline',             price: 420000,  art: 'jar' },
    { id: 'wel-energy',   pillar: 'wellness', name: 'Cellular Energy',      spec: '60 capsules · CoQ10 + PQQ',                price: 480000,  art: 'jar' },
    { id: 'wel-mag',      pillar: 'wellness', name: 'Magnesium Complex',    spec: '90 capsules · three forms',                price: 350000,  art: 'jar' },
    // Longevity (consumer)
    { id: 'lon-nmn',      pillar: 'longevity', name: 'NMN Capsules',        spec: '60 capsules · 500 mg',                     price: 850000,  art: 'jar' },
    // Apparel
    { id: 'app-tee',      pillar: 'apparel',  name: 'Standard Tee',         spec: 'Heavyweight cotton · bone / canvas',       price: 380000,  art: 'tee' },
    { id: 'app-crew',     pillar: 'apparel',  name: 'Performance Crewneck', spec: 'Brushed loopback · canvas',                price: 680000,  art: 'tee' },
    { id: 'app-shorts',   pillar: 'apparel',  name: 'Training Shorts',      spec: '4-way stretch · 7-inch',                   price: 450000,  art: 'shorts' },
    { id: 'app-cap',      pillar: 'apparel',  name: 'Field Cap',            spec: 'Unstructured · embroidered mark',          price: 280000,  art: 'cap' },
    { id: 'app-tote',     pillar: 'apparel',  name: 'Everyday Tote',        spec: '14 oz canvas · internal sleeve',           price: 520000,  art: 'tote' },
  ];

  // Stock is illustrative (deterministic per SKU) until wired to real inventory.
  // Force a specific state with STOCK_OVERRIDE[id] = 'in' | 'low' | 'made'.
  var STOCK_OVERRIDE = {};

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

  var STOCK = {
    in:   { label: 'In stock' },
    low:  { label: 'Low stock — reserve your lot' },
    made: { label: 'Made to order' },
  };

  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var fmt = function (n) { return 'Rp ' + n.toLocaleString('id-ID'); };
  var byId = {};
  PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  function hashId(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h; }
  function stockKey(id) {
    if (STOCK_OVERRIDE[id]) return STOCK_OVERRIDE[id];
    var m = hashId(id) % 10;
    return m < 7 ? 'in' : (m < 9 ? 'low' : 'made');
  }
  function lotLabel(p) { var m = p.spec.match(/^([\d\s]+(?:mg|IU|ml|g))/); return m ? m[1].trim() : p.spec; }

  /* ── group variants of the same compound (grid shows one card per line) ── */
  var GROUPS = [], gmap = {}, groupByVariant = {};
  PRODUCTS.forEach(function (p) {
    var key = p.pillar + '|' + p.name + '|' + (p.cat || '');
    if (!gmap[key]) { gmap[key] = { rep: p, variants: [], name: p.name, cat: p.cat, pillar: p.pillar, ruo: p.ruo, art: p.art }; GROUPS.push(gmap[key]); }
    gmap[key].variants.push(p);
    groupByVariant[p.id] = gmap[key];
  });
  function singleGroup(p) { return { rep: p, variants: [p], name: p.name, cat: p.cat, pillar: p.pillar, ruo: p.ruo, art: p.art }; }
  function groupOf(id) { return groupByVariant[id]; }
  function minPrice(g) { return Math.min.apply(null, g.variants.map(function (v) { return v.price; })); }
  function maxPrice(g) { return Math.max.apply(null, g.variants.map(function (v) { return v.price; })); }

  /* ── analytics stubs (push to dataLayer; wire GA/GTM later) ── */
  window.dataLayer = window.dataLayer || [];
  function track(event, data) { try { var o = { event: 'axiom_' + event }; if (data) for (var k in data) o[k] = data[k]; window.dataLayer.push(o); } catch (e) {} }
  track('page_view', { page: (document.body.dataset.page || 'home') });

  /* ── cart state ── */
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('axiom-cart') || '{}') || {}; } catch (e) { cart = {}; }
  Object.keys(cart).forEach(function (id) { if (!byId[id]) delete cart[id]; });
  var orderRef = null;

  function saveCart() { localStorage.setItem('axiom-cart', JSON.stringify(cart)); }
  function cartCount() { return Object.values(cart).reduce(function (a, b) { return a + b; }, 0); }
  function cartTotal() { return Object.keys(cart).reduce(function (a, id) { return a + byId[id].price * cart[id]; }, 0); }
  function cartHasRuo() { return Object.keys(cart).some(function (id) { return byId[id].ruo; }); }
  function ensureRef() {
    if (!orderRef) orderRef = 'AX-' + (Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36)).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-5);
    return orderRef;
  }

  /* ── render: grid ── */
  var grid = document.getElementById('shop-grid');
  var activePillar = 'all', activeCat = 'all', searchTerm = '', sortMode = 'featured';
  var CATS = ['GLP-1s & Weight Loss', 'GH Secretagogues', 'Healing & Repair', 'Brain Health & Nootropics', 'Energy & Endurance', 'Immunity', 'Sexual Health', 'Longevity & Cellular Repair', 'Research Supplies'];
  var params = new URLSearchParams(location.search);
  var pillarParam = params.get('pillar');
  if (pillarParam && PILLARS[pillarParam]) activePillar = pillarParam;

  function artSvg(p) { return '<svg class="prod-art-svg" viewBox="0 0 120 120" aria-hidden="true">' + ART[p.art] + '</svg>'; }
  function stockHtml(id) { var k = stockKey(id); return '<span class="prod-stock stock-' + k + '" data-stock><i></i>' + STOCK[k].label + '</span>'; }

  function cardHtml(g) {
    var sel = g.variants[0], pil = PILLARS[g.pillar], label = g.cat || pil.name, multi = g.variants.length > 1;
    var lotRow = multi
      ? '<div class="lot-row" role="group" aria-label="Lot size">' + g.variants.map(function (v, i) {
          return '<button class="lot-btn' + (i === 0 ? ' is-active' : '') + '" data-variant-id="' + v.id + '" type="button">' + esc(lotLabel(v)) + '</button>';
        }).join('') + '</div>'
      : '';
    var specTxt = multi ? (g.variants.length + ' lot sizes · ' + lotLabel(g.variants[0]) + '–' + lotLabel(g.variants[g.variants.length - 1])) : g.rep.spec;
    return '<article class="prod-card" data-sel="' + sel.id + '">' +
      '<button class="prod-art" data-detail="' + sel.id + '" aria-label="View ' + esc(g.name) + '">' + artSvg(g.rep) + '</button>' +
      '<div class="prod-tags"><span class="prod-pillar"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + pil.icon + '"/></svg>' + esc(label) + '</span>' +
      (g.ruo ? '<span class="pill pill-ruo">RUO</span>' : '') + '</div>' +
      '<h3 class="prod-name">' + esc(g.name) + '</h3>' +
      '<p class="prod-spec">' + esc(specTxt) + '</p>' +
      stockHtml(sel.id) + lotRow +
      '<div class="prod-foot"><span class="prod-price tab">' + fmt(sel.price) + '</span>' +
      '<div class="prod-actions">' +
      '<button class="btn btn-line btn-sm" data-detail="' + sel.id + '">Details</button>' +
      '<button class="btn btn-solid btn-sm" data-add="' + sel.id + '">Add</button>' +
      '</div></div></article>';
  }

  function renderSubchips() {
    var bar = document.getElementById('shop-subbar');
    if (!bar) return;
    if (activePillar !== 'peptide') { bar.innerHTML = ''; bar.hidden = true; return; }
    bar.hidden = false;
    bar.innerHTML = ['all'].concat(CATS).map(function (c) {
      return '<button class="shop-subchip' + (c === activeCat ? ' is-active' : '') + '" data-cat="' + esc(c) + '" type="button">' + (c === 'all' ? 'All compounds' : esc(c)) + '</button>';
    }).join('');
  }

  function groupMatches(g) {
    if (activePillar !== 'all' && g.pillar !== activePillar) return false;
    if (activePillar === 'peptide' && activeCat !== 'all' && g.cat !== activeCat) return false;
    if (searchTerm) { var t = searchTerm.toLowerCase(); if (g.name.toLowerCase().indexOf(t) < 0 && (g.cat || '').toLowerCase().indexOf(t) < 0) return false; }
    return true;
  }

  function renderGrid(animate) {
    if (!grid) return;
    var list = GROUPS.filter(groupMatches);
    if (sortMode === 'price-asc') list.sort(function (a, b) { return minPrice(a) - minPrice(b); });
    else if (sortMode === 'price-desc') list.sort(function (a, b) { return maxPrice(b) - maxPrice(a); });
    else if (sortMode === 'name') list.sort(function (a, b) { return a.name.localeCompare(b.name); });
    renderSubchips();
    grid.innerHTML = list.length ? list.map(cardHtml).join('') : '<p class="shop-empty">No products match that search. Clear the filters to see the full range.</p>';
    var count = document.getElementById('shop-count');
    if (count) count.textContent = list.length + (list.length === 1 ? ' product' : ' products');
    if (animate && window.gsap && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.from(grid.children, { opacity: 0, y: 14, duration: 0.5, ease: 'expo.out', stagger: 0.03, clearProps: 'all' });
    }
  }

  /* ── filters, search, sort ── */
  document.querySelectorAll('.shop-chip').forEach(function (chip) {
    chip.classList.toggle('is-active', chip.dataset.pillar === activePillar);
    chip.addEventListener('click', function () {
      activePillar = chip.dataset.pillar; activeCat = 'all';
      document.querySelectorAll('.shop-chip').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      track('filter', { pillar: activePillar }); renderGrid(true);
    });
  });
  document.addEventListener('click', function (e) {
    var sub = e.target.closest('.shop-subchip'); if (!sub) return;
    activeCat = sub.dataset.cat; track('filter', { category: activeCat }); renderGrid(true);
  });
  var searchEl = document.getElementById('shop-search');
  if (searchEl) {
    var searchT = 0;
    searchEl.addEventListener('input', function () {
      searchTerm = searchEl.value.trim();
      clearTimeout(searchT);
      searchT = setTimeout(function () { renderGrid(true); if (searchTerm) track('search', { q: searchTerm }); }, 140);
    });
  }
  var sortEl = document.getElementById('shop-sort');
  if (sortEl) sortEl.addEventListener('change', function () { sortMode = sortEl.value; track('sort', { mode: sortMode }); renderGrid(true); });

  /* lot-size switch on a grid card */
  document.addEventListener('click', function (e) {
    var lb = e.target.closest('.lot-btn'); if (!lb) return;
    var card = lb.closest('.prod-card'), id = lb.dataset.variantId, v = byId[id];
    card.dataset.sel = id;
    card.querySelectorAll('.lot-btn').forEach(function (b) { b.classList.toggle('is-active', b === lb); });
    card.querySelector('.prod-price').textContent = fmt(v.price);
    var se = card.querySelector('[data-stock]'), k = stockKey(id);
    se.className = 'prod-stock stock-' + k; se.innerHTML = '<i></i>' + STOCK[k].label;
    card.querySelectorAll('[data-detail]').forEach(function (b) { b.dataset.detail = id; });
    card.querySelector('[data-add]').dataset.add = id;
  });

  /* ── featured strip (home) ── */
  var FEATURED = ['thr-mask', 'pep-bpc157-10', 'pep-reta-10', 'thr-mat', 'wel-nad', 'app-crew'];
  var featured = document.getElementById('featured-grid');
  if (featured) featured.innerHTML = FEATURED.map(function (id) { return cardHtml(singleGroup(byId[id])); }).join('');

  /* ── toast + live region ── */
  var toast = document.getElementById('toast');
  var toastTimer = 0;
  function showToast(msg) { if (!toast) return; toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2000); }

  /* ── cart drawer ── */
  var drawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('shop-overlay');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function renderCart() {
    var ids = Object.keys(cart);
    var badge = document.getElementById('cart-count');
    var n = cartCount();
    badge.textContent = n; badge.classList.toggle('is-on', n > 0);
    if (!ids.length) orderRef = null;

    var body = document.getElementById('cart-items');
    if (!ids.length) {
      body.innerHTML = '<p class="cart-empty">Your cart is empty. Browse the range and add what you need.</p>';
    } else {
      body.innerHTML = ids.map(function (id) {
        var p = byId[id];
        return '<div class="cart-row" data-id="' + id + '">' +
          '<div class="cart-row-art">' + artSvg(p) + '</div>' +
          '<div class="cart-row-main"><span class="cart-row-name">' + esc(p.name) + (p.ruo ? ' <span class="pill pill-ruo">RUO</span>' : '') + '</span>' +
          '<span class="cart-row-spec">' + esc(p.spec) + '</span>' +
          '<div class="cart-controls">' +
          '<div class="cart-qty"><button data-dec="' + id + '" aria-label="Decrease quantity">−</button><span class="tab">' + cart[id] + '</span><button data-inc="' + id + '" aria-label="Increase quantity">+</button></div>' +
          '<button class="cart-remove" data-remove="' + id + '" type="button" aria-label="Remove ' + esc(p.name) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-trash"/></svg></button>' +
          '</div></div>' +
          '<span class="cart-row-price tab">' + fmt(p.price * cart[id]) + '</span></div>';
      }).join('');
    }
    document.getElementById('cart-total').textContent = fmt(cartTotal());
    document.getElementById('cart-ruo').hidden = !cartHasRuo();
    var refEl = document.getElementById('cart-ref');
    if (refEl) refEl.textContent = ids.length ? ensureRef() : '—';
    var wa = document.getElementById('cart-wa');
    wa.classList.toggle('is-disabled', !ids.length);
    wa.href = ids.length ? waLink() : '#';
  }

  function waLink() {
    var lines = ['AXIOM — Order request · Ref ' + ensureRef(), ''];
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
    renderCart();
    drawer.classList.add('is-open'); overlay.classList.add('is-on'); document.body.classList.add('is-locked');
    if (window.AXTrap) AXTrap.activate(drawer);
    if (window.gsap && !reduced) gsap.fromTo(drawer, { x: 40, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); overlay.classList.remove('is-on');
    if (window.AXTrap) AXTrap.release(drawer);
    if (!modal.classList.contains('is-open')) document.body.classList.remove('is-locked');
  }

  /* ── product modal (with lot switching, stock, representative CoA, share) ── */
  var modal = document.getElementById('prod-modal');

  function coaCardHtml(p) {
    return '<figure class="mcoa">' +
      '<figcaption class="mcoa-head"><svg class="coa-mark" viewBox="0 0 486 396" aria-hidden="true"><use href="#i-axiom-x"/></svg>' +
      '<div><span class="mcoa-brand">Certificate of Analysis</span><span class="mcoa-sub">Representative specimen</span></div>' +
      '<span class="coa-pass">Pass</span></figcaption>' +
      '<dl class="mcoa-fields"><div><dt>Compound</dt><dd>' + esc(p.name) + '</dd></div>' +
      '<div><dt>Method</dt><dd>HPLC / MS</dd></div>' +
      '<div><dt>Purity</dt><dd class="tab">≥ 98%</dd></div>' +
      '<div><dt>Lot</dt><dd>Issued per order</dd></div></dl>' +
      '<p class="coa-ruo">Research Use Only · in-vitro laboratory use. A Certificate of Analysis ships with every lot.</p></figure>';
  }

  function productURL(id) {
    var base = location.origin + location.pathname;
    return base + '?product=' + encodeURIComponent(id);
  }

  function openModal(id) {
    if (!byId[id]) return;
    var g = groupOf(id) || singleGroup(byId[id]);
    var pil = PILLARS[g.pillar];
    var curId = id, q = 1;

    function render() {
      var cp = byId[curId], k = stockKey(curId);
      var multi = g.variants.length > 1;
      var lotRow = multi
        ? '<div class="lot-row modal-lots" role="group" aria-label="Lot size">' + g.variants.map(function (v) {
            return '<button class="lot-btn' + (v.id === curId ? ' is-active' : '') + '" data-mlot="' + v.id + '" type="button">' + esc(lotLabel(v)) + '</button>';
          }).join('') + '</div>'
        : '';
      document.getElementById('modal-body').innerHTML =
        '<div class="modal-art">' + artSvg(cp) + '</div>' +
        '<div class="modal-info">' +
        '<div class="prod-tags"><span class="prod-pillar"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + pil.icon + '"/></svg>' + esc(g.cat || pil.name) + '</span>' +
        (g.ruo ? '<span class="pill pill-ruo">Research Use Only</span>' : '') + '</div>' +
        '<h3 class="modal-name">' + esc(g.name) + '</h3>' +
        '<p class="modal-spec">' + esc(cp.spec) + '</p>' +
        '<span class="prod-stock stock-' + k + '"><i></i>' + STOCK[k].label + '</span>' +
        lotRow +
        '<ul class="modal-proof">' + PROOF[g.pillar].map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        (g.pillar === 'peptide' ? '<button class="btn btn-line btn-sm coa-toggle" type="button" aria-expanded="false">View representative CoA</button><div class="modal-coa" hidden>' + coaCardHtml(cp) + '</div>' : '') +
        (g.ruo ? '<p class="modal-ruo">Research Use Only — in-vitro laboratory use. Not for human or veterinary consumption. No dosing or usage guidance is provided.</p>' : '') +
        '<div class="modal-buy"><div class="cart-qty modal-qty"><button id="mq-dec" aria-label="Decrease quantity">−</button><span class="tab" id="mq-val">' + q + '</span><button id="mq-inc" aria-label="Increase quantity">+</button></div>' +
        '<span class="prod-price tab" id="mq-price">' + fmt(cp.price * q) + '</span>' +
        '<button class="btn btn-solid" id="mq-add">Add to cart</button></div>' +
        '<button class="btn btn-ghost btn-sm modal-share" type="button">Copy product link</button>' +
        '</div>';

      var val = document.getElementById('mq-val'), price = document.getElementById('mq-price');
      document.getElementById('mq-dec').onclick = function () { q = Math.max(1, q - 1); val.textContent = q; price.textContent = fmt(byId[curId].price * q); };
      document.getElementById('mq-inc').onclick = function () { q = Math.min(99, q + 1); val.textContent = q; price.textContent = fmt(byId[curId].price * q); };
      document.getElementById('mq-add').onclick = function () { add(curId, q); closeModal(); openDrawer(); };
      var share = document.querySelector('.modal-share');
      if (share) share.onclick = function () {
        var url = productURL(curId);
        (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
          function () { showToast('Product link copied'); }, function () { showToast(url); });
      };
      var toggle = document.querySelector('.coa-toggle');
      if (toggle) toggle.onclick = function () {
        var panel = document.querySelector('.modal-coa'), open = panel.hidden;
        panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = open ? 'Hide representative CoA' : 'View representative CoA';
      };
      document.querySelectorAll('[data-mlot]').forEach(function (b) {
        b.onclick = function () { curId = b.dataset.mlot; render(); };
      });
    }

    render();
    modal.classList.add('is-open'); overlay.classList.add('is-on'); document.body.classList.add('is-locked');
    if (window.AXTrap) AXTrap.activate(modal.querySelector('.modal-card'));
    if (window.gsap && !reduced) gsap.fromTo(modal.querySelector('.modal-card'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
    track('view_item', { id: curId, name: g.name });
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    if (window.AXTrap) AXTrap.release(modal.querySelector('.modal-card'));
    if (!drawer.classList.contains('is-open')) { overlay.classList.remove('is-on'); document.body.classList.remove('is-locked'); }
  }

  /* ── actions ── */
  function add(id, qty) {
    cart[id] = Math.min(99, (cart[id] || 0) + (qty || 1));
    saveCart(); renderCart();
    var p = byId[id];
    showToast('Added — ' + p.name);
    if (window.axAnnounce) axAnnounce('Added ' + p.name + '. Cart now ' + cartCount() + ' items, ' + fmt(cartTotal()) + '.');
    track('add_to_cart', { id: id, name: p.name, value: p.price * (qty || 1) });
    var nav = document.getElementById('nav');
    if (nav) nav.classList.remove('is-hidden');
    window.__axiomNavHold = Date.now() + 1200;
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-detail],[data-inc],[data-dec],[data-remove]');
    if (!t) return;
    if (t.dataset.add) add(t.dataset.add);
    else if (t.dataset.detail) openModal(t.dataset.detail);
    else if (t.dataset.inc) { cart[t.dataset.inc] = Math.min(99, cart[t.dataset.inc] + 1); saveCart(); renderCart(); }
    else if (t.dataset.dec) { var id = t.dataset.dec; cart[id] -= 1; if (cart[id] <= 0) delete cart[id]; saveCart(); renderCart(); }
    else if (t.dataset.remove) { delete cart[t.dataset.remove]; saveCart(); renderCart(); }
  });

  document.getElementById('cart-open').addEventListener('click', function () { openDrawer(); });
  document.getElementById('cart-close').addEventListener('click', closeDrawer);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', function () { closeDrawer(); closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeDrawer(); } });

  document.getElementById('cart-wa').addEventListener('click', function () {
    if (!cartCount()) return;
    track('request_quote', { value: cartTotal(), items: cartCount(), ref: ensureRef() });
  });
  document.getElementById('cart-copy').addEventListener('click', function () {
    var text = decodeURIComponent(waLink().split('?text=')[1]);
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
      function () { showToast('Order copied to clipboard'); },
      function () { showToast('Copy failed — use the WhatsApp button'); });
  });

  /* ── init ── */
  renderGrid(false);
  renderCart();

  var productParam = params.get('product');
  if (productParam && byId[productParam]) setTimeout(function () { openModal(productParam); }, 60);

  window.__axiomShop = { cart: cart, products: PRODUCTS, groups: GROUPS, waLink: waLink, total: cartTotal, open: openModal };
})();
