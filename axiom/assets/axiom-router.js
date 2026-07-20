/* AXIOM — in-page router for the Performance page.
   Toggles the four <main data-pagemain> views (home · shop · proof · contact)
   from hash links (#/home, #/shop, #/proof, #/contact) so the whole shop lives
   in one file. It deliberately does NOT touch the top-level site nav active
   state — <body data-page="performance"> stays lit across every sub-view. */
(function () {
  'use strict';
  var mains = document.querySelectorAll('main[data-pagemain]');
  if (!mains.length) return;

  function show(name) {
    var found = false;
    mains.forEach(function (m) { var on = m.dataset.pagemain === name; m.hidden = !on; if (on) found = true; });
    if (!found) { mains[0].hidden = false; name = mains[0].dataset.pagemain; }
    document.body.dataset.spa = name;
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    var m = href.match(/^#\/(\w+)/);
    if (!m) return;
    e.preventDefault();
    if (location.hash === href) show(m[1]);
    else location.hash = href;
  });
  addEventListener('hashchange', function () { show((location.hash.match(/^#\/(\w+)/) || [])[1] || 'home'); });
  show((location.hash.match(/^#\/(\w+)/) || [])[1] || 'home');
})();
