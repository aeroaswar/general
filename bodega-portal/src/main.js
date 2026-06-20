import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/inter";
import "./styles.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { createAurora } from "./aurora.js";
import { icon, hydrateIcons } from "./icons.js";
import * as C from "./content.js";

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const setHTML = (sel, html) => { const n = $(sel); if (n) n.innerHTML = html; };

// ── aurora mood palettes per section (aurora-glass, on deep ink) ──────────
const MOODS = {
  hero:     { colA: "#137a68", colB: "#2bd4c0", colC: "#bdf5e6", intensity: 1.05, motion: 1.0 },
  marquee:  { colA: "#11707f", colB: "#2bc6da", colC: "#c8f4ff", intensity: 0.9,  motion: 0.85 },
  work:     { colA: "#0e6e8c", colB: "#33b7e0", colC: "#cdeeff", intensity: 1.0,  motion: 0.95 },
  services: { colA: "#283a9c", colB: "#5b8cff", colC: "#d2e2ff", intensity: 0.95, motion: 0.9 },
  portal:   { colA: "#3a2f9e", colB: "#7c6bff", colC: "#e6ddff", intensity: 1.15, motion: 1.05 },
  why:      { colA: "#157a5e", colB: "#34d39e", colC: "#ccf6e6", intensity: 1.0,  motion: 0.9 },
  proof:    { colA: "#1f7e86", colB: "#36d0c0", colC: "#ffe6a8", intensity: 1.12, motion: 1.0 },
  process:  { colA: "#34349e", colB: "#8a76ff", colC: "#ddd6ff", intensity: 0.95, motion: 0.9 },
  contact:  { colA: "#115e54", colB: "#2bbf9f", colC: "#bdeede", intensity: 0.82, motion: 0.7 },
};

// hue sweep used along the pinned portal spine
const PORTAL_SWEEP = [
  "#2bd4c0", "#2bc6da", "#5b8cff", "#7c6bff",
  "#a06bff", "#c061e8", "#e06bd0",
];

// ── build dynamic content ─────────────────────────────────────────────────
function buildMarquee() {
  const chip = (t) => `<span class="mq-item">${t}<i class="mq-dot"></i></span>`;
  const row = C.industries.map(chip).join("");
  setHTML("#mqA", row + row);
  setHTML("#mqB", row + row);
}

function buildWork() {
  const cards = C.work
    .map(
      (w, i) => `
    <article class="work-card glass ${w.featured ? "is-featured" : ""} reveal" style="--hue:${w.hue}">
      <div class="work-media" aria-hidden="true">
        <div class="work-orb"></div>
        <span class="work-ic">${icon(w.icon, { size: 22 })}</span>
        <span class="work-index">0${i + 1}</span>
      </div>
      <div class="work-body">
        <div class="work-tags">${w.tags.map((t) => `<span>${t}</span>`).join("")}</div>
        <h3 class="work-title">${w.title}</h3>
        <p class="work-sub">${w.sub}</p>
        <div class="work-foot">
          <span class="work-metric">${w.metric}<small>${w.metricLabel}</small></span>
          <span class="work-go">${icon("arrow-up-right", { size: 20 })}</span>
        </div>
      </div>
    </article>`
    )
    .join("");
  setHTML("#workGrid", cards);
}

function buildServices() {
  const rows = C.services
    .map(
      (s, i) => `
    <div class="acc-item glass reveal ${i === 0 ? "is-open" : ""}">
      <button class="acc-head" aria-expanded="${i === 0}">
        <span class="acc-n">${s.n}</span>
        <span class="acc-ic">${icon(s.icon, { size: 22 })}</span>
        <span class="acc-title">${s.title}</span>
        <span class="acc-chev">${icon("arrow-down", { size: 20 })}</span>
      </button>
      <div class="acc-panel"><p>${s.body}</p></div>
    </div>`
    )
    .join("");
  setHTML("#accordion", rows);

  $$("#accordion .acc-head").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      const open = item.classList.contains("is-open");
      $$("#accordion .acc-item").forEach((it) => {
        it.classList.remove("is-open");
        it.querySelector(".acc-head").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function buildPortal() {
  const nodes = C.portal
    .map(
      (s, i) => `
    <li class="pnode ${i % 2 ? "right" : "left"}" data-i="${i}">
      <div class="pnode-card glass">
        <span class="pnode-ic">${icon(s.icon, { size: 22 })}</span>
        <div class="pnode-text">
          <span class="pnode-step">Step ${i + 1}</span>
          <h4>${s.k}</h4>
          <p>${s.body}</p>
        </div>
      </div>
      <span class="pnode-dot"></span>
    </li>`
    )
    .join("");
  setHTML("#portalSpine", `<span class="spine-rail"><i class="spine-fill"></i></span><ul class="pnode-list">${nodes}</ul>`);

  const rolesRow = C.roles
    .map(
      (r) => `
    <div class="role glass reveal">
      <span class="role-ic">${icon(r.icon, { size: 20 })}</span>
      <h5>${r.name}</h5>
      <p>${r.body}</p>
    </div>`
    )
    .join("");
  setHTML("#rolesRow", rolesRow);
}

function buildWhy() {
  const cards = C.why
    .map(
      (w) => `
    <article class="why-card glass reveal">
      <span class="why-ic">${icon(w.icon, { size: 24 })}</span>
      <h3>${w.title}</h3>
      <p>${w.body}</p>
    </article>`
    )
    .join("");
  setHTML("#whyGrid", cards);
}

function buildProof() {
  const cards = C.proof
    .map(
      (p) => `
    <div class="proof-card glass reveal">
      <span class="proof-ic">${icon(p.icon, { size: 20 })}</span>
      <span class="proof-num" data-value="${p.value}" data-prefix="${p.prefix || ""}" data-suffix="${p.suffix || ""}">${p.prefix || ""}0${p.suffix || ""}</span>
      <span class="proof-label">${p.label}</span>
    </div>`
    )
    .join("");
  setHTML("#proofGrid", cards);
}

function buildProcess() {
  const steps = C.process
    .map(
      (s) => `
    <div class="step reveal">
      <span class="step-n">${s.n}</span>
      <div class="step-body"><h3>${s.title}</h3><p>${s.body}</p></div>
    </div>`
    )
    .join("");
  setHTML("#steps", steps);
}

function buildTeam() {
  const chips = C.team
    .map(
      (t) => `<span class="team-chip" title="${t.name} · ${t.role}"><b>${t.name[0]}</b>${t.name}</span>`
    )
    .join("");
  setHTML("#teamRow", chips);
}

// ── animations / scroll ─────────────────────────────────────────────────
function setMoodFor(name) {
  if (MOODS[name]) aurora.setMood(MOODS[name]);
}

let aurora;

function initScroll() {
  // section → aurora mood
  $$("main section[data-mood]").forEach((sec) => {
    const mood = sec.getAttribute("data-mood");
    ScrollTrigger.create({
      trigger: sec,
      start: "top 60%",
      end: "bottom 40%",
      onEnter: () => setMoodFor(mood),
      onEnterBack: () => setMoodFor(mood),
    });
  });

  // reveals
  if (REDUCED) {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  } else {
    ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "expo.out",
          stagger: 0.08,
          overwrite: true,
        }),
    });

    // hero word stagger
    gsap.set(".hero-title .w", { yPercent: 115 });
    gsap.to(".hero-title .w", {
      yPercent: 0,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.06,
      delay: 0.15,
    });
  }

  // marquee
  if (!REDUCED) {
    gsap.to("#mqA", { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
    gsap.fromTo("#mqB", { xPercent: -50 }, { xPercent: 0, duration: 42, ease: "none", repeat: -1 });
  }

  // scroll progress rail
  gsap.to("#scrollrail-fill", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  initPortalSpine();
  initCounters();
}

function initPortalSpine() {
  const stage = $(".portal-inner");
  const fill = $(".spine-fill");
  const nodes = $$(".pnode");
  if (!stage || !nodes.length) return;

  const activate = (p) => {
    if (fill) fill.style.transform = `scaleY(${p})`;
    nodes.forEach((n, i) => {
      const on = p >= (i + 0.6) / nodes.length;
      n.classList.toggle("on", on);
    });
    // sweep aurora hue along the spine
    const f = Math.min(0.999, Math.max(0, p)) * (PORTAL_SWEEP.length - 1);
    const a = PORTAL_SWEEP[Math.floor(f)];
    const b = PORTAL_SWEEP[Math.min(PORTAL_SWEEP.length - 1, Math.floor(f) + 1)];
    aurora.setMood({ colA: a, colB: b, intensity: 1.05 + p * 0.25, motion: 1.05 });
  };

  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  if (REDUCED || isMobile) {
    nodes.forEach((n) => n.classList.add("on"));
    if (fill) fill.style.transform = "scaleY(1)";
    return;
  }

  ScrollTrigger.create({
    trigger: stage,
    start: "top top",
    end: () => "+=" + window.innerHeight * (nodes.length * 0.62),
    pin: true,
    scrub: 0.6,
    onUpdate: (self) => activate(self.progress),
    onRefreshInit: () => activate(0),
  });
}

function initCounters() {
  $$(".proof-num").forEach((el) => {
    const value = parseFloat(el.dataset.value);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const isInt = Number.isInteger(value);
    const obj = { n: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          n: value,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = prefix + (isInt ? Math.round(obj.n) : obj.n.toFixed(1)) + suffix;
          },
        }),
    });
  });
}

// ── nav / menu / smooth scroll ───────────────────────────────────────────
function initNav(lenis) {
  const nav = $("#nav");
  const toggle = $("#menuToggle");
  const links = $("#navlinks");

  ScrollTrigger.create({
    start: "top -40",
    end: 99999,
    onUpdate: (self) => nav.classList.toggle("scrolled", self.scroll() > 40),
    onToggle: (self) => nav.classList.toggle("scrolled", self.isActive),
  });
  nav.classList.toggle("scrolled", window.scrollY > 40);

  const closeMenu = () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = icon("menu", { size: 24 });
  };
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.innerHTML = icon(open ? "close" : "menu", { size: 24 });
  });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.2 });
      else target.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth" });
    });
  });
}

function initForm() {
  const form = $("#briefForm");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = $("#formNote");
    form.querySelector('button[type="submit"]').disabled = true;
    if (note) note.hidden = false;
    gsap.fromTo(note, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5 });
  });
}

// ── boot ───────────────────────────────────────────────────────────────────
function boot() {
  hydrateIcons();
  buildMarquee();
  buildWork();
  buildServices();
  buildPortal();
  buildWhy();
  buildProof();
  buildProcess();
  buildTeam();
  hydrateIcons(); // hydrate any icons injected above that used [data-icon]

  aurora = createAurora($("#aurora"));
  setMoodFor("hero");

  let lenis = null;
  if (!REDUCED) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      aurora.setVelocity(e.velocity / 40);
      aurora.setScroll((e.scroll || 0) / 1400);
    });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  initNav(lenis);
  initScroll();
  initForm();
  ScrollTrigger.refresh();

  window.addEventListener("load", () => ScrollTrigger.refresh());

  // debug handle (per workspace convention)
  window.__bodega = {
    aurora,
    lenis,
    setMood: (n) => setMoodFor(n),
    moods: MOODS,
    goTo: (sel) => (lenis ? lenis.scrollTo(sel) : $(sel)?.scrollIntoView()),
    snap: (t) => aurora.snap(t),
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
