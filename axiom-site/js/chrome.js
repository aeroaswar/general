/* AXIOM — shared page chrome (svg defs, gate, sting, cursor, progress, nav,
   cart drawer, product modal, toast, footer), injected on every page from one
   source. The active nav item comes from <body data-page="...">. */
(function () {
  'use strict';

  var WORD_D = 'M175 42 175 42.8 189.8 57.2 191 59.5 199.2 67.8 212.8 67.5 212.8 66.2 191 44.5 188.8 41.2 187.2 41 182.5 36 181.2 36Z M170.8 42.2 164.5 36 161.2 37 132 66.2 132 67.5 145.5 67.8Z M497 2.2 497.2 67.8 508.8 66.5 508.2 20.8 539 59 569.2 19.8 570 67.5 581.8 66.8 580.5 2 569.2 2 539.5 41 508.5 2Z M280.2 2 279 3.2 279 66.5 280.2 67.8 290.5 67.8 290.8 2.2Z M211.5 2 198.2 2 181.8 18.5 180.8 20.2 175 25.2 175 26.5 181.2 32.8 182.5 32.8 211.8 3.5Z M0 67.8 11.5 67.8 40.8 16.8 68 66.5 82 67 45.5 2 35 2.2Z M132 2 162.2 32.8 163.5 32.8 169.8 26.8 167.8 23.2 146.5 2Z M395 70.3A35.2 42.7 89.9 1 0 394.8 -0.2A35.2 42.7 89.9 1 0 395 70.3Z M394.5 58.7A23.8 29.8 91.1 1 0 395.4 11.2A23.8 29.8 91.1 1 0 394.5 58.7Z';
  var BLADES = '<path class="blade blade-tl" d="M0 0 86 0 229 149 186 186Z"/><path class="blade blade-tr" d="M486 0 400 0 257 149 300 186Z"/><path class="blade blade-bl" d="M0 396 86 396 229 247 186 210Z"/><path class="blade blade-br" d="M486 396 400 396 257 247 300 210Z"/>';

  var HEAD_CHROME =
'<svg style="display:none" aria-hidden="true">' +
'  <symbol id="i-axiom-x" viewBox="0 0 486 396"><path d="M0 0 86 0 229 149 186 186Z"/><path d="M486 0 400 0 257 149 300 186Z"/><path d="M0 396 86 396 229 247 186 210Z"/><path d="M486 396 400 396 257 247 300 210Z"/></symbol>' +
'  <symbol id="i-axiom-word" viewBox="0 0 582 70"><path fill-rule="evenodd" d="' + WORD_D + '"/></symbol>' +
'  <symbol id="i-flask" viewBox="0 0 24 24"><path d="M9.5 3h5M10 3.2v5.1l-5.2 9.4a2 2 0 0 0 1.8 2.9h10.8a2 2 0 0 0 1.8-2.9L14 8.3V3.2"/><path d="M7.6 15h8.8"/></symbol>' +
'  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"/></symbol>' +
'  <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3.2c3.4 4 5.8 6.9 5.8 9.8a5.8 5.8 0 0 1-11.6 0c0-2.9 2.4-5.8 5.8-9.8z"/><path d="M12 7.4v11.4"/></symbol>' +
'  <symbol id="i-infinity" viewBox="0 0 24 24"><path d="M6 8.5c-2 0-3.5 1.6-3.5 3.5S4 15.5 6 15.5c4 0 8-7 12-7 2 0 3.5 1.6 3.5 3.5s-1.5 3.5-3.5 3.5c-4 0-8-7-12-7z"/></symbol>' +
'  <symbol id="i-tshirt" viewBox="0 0 24 24"><path d="M8.2 4 4 6.2l1.6 3.6L8 8.9V20h8V8.9l2.4.9L20 6.2 15.8 4a3.8 3.8 0 0 1-7.6 0z"/></symbol>' +
'  <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 8h14l-1 12.2a1.8 1.8 0 0 1-1.8 1.6H7.8A1.8 1.8 0 0 1 6 20.2Z"/><path d="M8.6 10.5V6.9a3.4 3.4 0 0 1 6.8 0v3.6"/></symbol>' +
'</svg>' +

'<div class="gate" id="gate" role="dialog" aria-modal="true" aria-labelledby="gate-title">' +
'  <div class="gate-inner">' +
'    <div class="gate-langs" role="group" aria-label="Language">' +
'      <button class="gate-lang is-active" data-lang="en" type="button">EN</button>' +
'      <button class="gate-lang" data-lang="id" type="button">ID</button>' +
'    </div>' +
'    <div class="gate-mark" aria-hidden="true"><svg viewBox="0 0 486 396">' + BLADES + '</svg></div>' +
'    <svg class="gate-word" viewBox="0 0 582 70" aria-hidden="true" role="img"><use href="#i-axiom-word"/></svg>' +
'    <div class="gate-copy" data-gate="en">' +
'      <p class="gate-kicker">Before you enter</p>' +
'      <h1 id="gate-title" class="gate-title">One house, one standard.</h1>' +
'      <p class="gate-body">AXIOM offers therapy devices, wellness and apparel alongside research peptides. Those peptides are sold strictly for in-vitro laboratory and research use — not for human or veterinary consumption. By entering you confirm that you are 18 or older and that, for any peptide purchase, you are a qualified researcher or institutional buyer who accepts the research-use and compliance terms. No medical, dosing, or usage guidance is provided.</p>' +
'    </div>' +
'    <div class="gate-copy" data-gate="id" hidden>' +
'      <p class="gate-kicker">Sebelum Anda masuk</p>' +
'      <h1 class="gate-title">Satu rumah, satu standar.</h1>' +
'      <p class="gate-body">AXIOM menghadirkan perangkat terapi, produk wellness, dan apparel berdampingan dengan peptida riset. Peptida tersebut dijual khusus untuk penggunaan laboratorium dan riset in-vitro — bukan untuk konsumsi manusia maupun hewan. Dengan masuk, Anda menyatakan berusia 18 tahun ke atas dan, untuk setiap pembelian peptida, Anda adalah peneliti yang kompeten atau pembeli institusional yang menerima ketentuan Research Use Only serta kepatuhan yang berlaku.</p>' +
'    </div>' +
'    <div class="gate-actions">' +
'      <button class="btn btn-solid magnetic" id="gate-confirm" type="button"><span data-gate-btn="en">I Confirm — Enter</span><span data-gate-btn="id" hidden>Saya Konfirmasi — Masuk</span></button>' +
'      <a class="btn btn-ghost magnetic" href="about:blank"><span data-gate-btn="en">Leave</span><span data-gate-btn="id" hidden>Keluar</span></a>' +
'    </div>' +
'  </div>' +
'</div>' +

'<div class="sting" id="sting" aria-hidden="true">' +
'  <svg viewBox="0 0 486 396">' + BLADES + '</svg>' +
'  <svg class="sting-word" viewBox="0 0 582 70" aria-hidden="true"><use href="#i-axiom-word"/></svg>' +
'</div>' +

'<div class="cursor-dot" id="cursor-dot" aria-hidden="true"></div>' +
'<div class="cursor-ring" id="cursor-ring" aria-hidden="true"></div>' +
'<div class="progress" aria-hidden="true"><div class="progress-fill" id="progress-fill"></div></div>' +

'<header class="nav" id="nav">' +
'  <a class="nav-brand" href="index.html" aria-label="AXIOM — home">' +
'    <svg class="nav-mark" viewBox="0 0 486 396" aria-hidden="true"><use href="#i-axiom-x"/></svg>' +
'    <svg class="nav-word-svg" viewBox="0 0 582 70" aria-hidden="true"><use href="#i-axiom-word"/></svg>' +
'  </a>' +
'  <nav class="nav-links" aria-label="Pages">' +
'    <a href="index.html" data-nav="home">Home</a>' +
'    <a href="shop.html" data-nav="shop">Shop</a>' +
'    <a href="proof.html" data-nav="proof">Proof</a>' +
'    <a href="contact.html" data-nav="contact">Contact</a>' +
'  </nav>' +
'  <button class="nav-cart" id="cart-open" type="button" aria-label="Open cart">' +
'    <svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-bag"/></svg>' +
'    <span class="nav-cart-count tab" id="cart-count">0</span>' +
'  </button>' +
'</header>';

  var TAIL_CHROME =
'<div class="shop-overlay" id="shop-overlay" aria-hidden="true"></div>' +

'<aside class="cart-drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Cart">' +
'  <div class="cart-head">' +
'    <span class="cart-title">Your cart</span>' +
'    <button class="cart-x" id="cart-close" type="button" aria-label="Close cart">✕</button>' +
'  </div>' +
'  <div class="cart-items" id="cart-items"></div>' +
'  <div class="cart-foot">' +
'    <p class="cart-ruo" id="cart-ruo" hidden>Cart contains Research Use Only items — in-vitro laboratory use, qualified researchers and institutional buyers only. No dosing or usage guidance is provided.</p>' +
'    <div class="cart-total-row"><span>Subtotal</span><span class="tab" id="cart-total">Rp 0</span></div>' +
'    <p class="cart-note">Quotes are itemised with live stock and confirmed by a person — the proof named before the price.</p>' +
'    <a class="btn btn-solid btn-lg cart-wa" id="cart-wa" href="#" rel="noopener" target="_blank">Request quote on WhatsApp</a>' +
'    <button class="btn btn-ghost cart-copy" id="cart-copy" type="button">Copy order</button>' +
'  </div>' +
'</aside>' +

'<div class="prod-modal" id="prod-modal" role="dialog" aria-modal="true" aria-label="Product details">' +
'  <div class="modal-card">' +
'    <button class="cart-x modal-x" id="modal-close" type="button" aria-label="Close">✕</button>' +
'    <div class="modal-body" id="modal-body"></div>' +
'  </div>' +
'</div>' +

'<div class="toast" id="toast" role="status" aria-live="polite"></div>' +

'<footer class="footer">' +
'  <div class="wrap">' +
'    <div class="footer-top">' +
'      <div class="footer-brand">' +
'        <svg class="footer-mark" viewBox="0 0 486 396" aria-hidden="true"><use href="#i-axiom-x"/></svg>' +
'        <svg class="footer-word-svg" viewBox="0 0 582 70" aria-hidden="true"><use href="#i-axiom-word"/></svg>' +
'        <span class="footer-sub">Human Performance &amp; Longevity · Jakarta</span>' +
'      </div>' +
'      <nav class="footer-links" aria-label="Footer">' +
'        <a href="index.html">Home</a>' +
'        <a href="shop.html">Shop</a>' +
'        <a href="proof.html">Proof</a>' +
'        <a href="contact.html">Contact</a>' +
'      </nav>' +
'    </div>' +
'    <p class="footer-ruo">Peptides referenced on this site are Research Use Only, intended exclusively for in-vitro laboratory research — not for human or veterinary consumption, diagnosis, or treatment. No dosing or usage guidance is provided. Devices, wellness and apparel are consumer products. Prices in Indonesian Rupiah.</p>' +
'    <p class="footer-fine tab">AXIOM · Documented, not promised · v1.0</p>' +
'  </div>' +
'</footer>';

  document.body.insertAdjacentHTML('afterbegin', HEAD_CHROME);
  document.body.insertAdjacentHTML('beforeend', TAIL_CHROME);

  // active nav item
  var page = document.body.dataset.page || 'home';
  var link = document.querySelector('.nav-links a[data-nav="' + page + '"]');
  if (link) link.classList.add('is-active');
})();
