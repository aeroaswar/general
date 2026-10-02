#!/usr/bin/env node
// Drives Aero HQ in Chromium: console/network errors, layouts at 1440/768/390, panel, basement,
// step-inside, reduced motion, and a frame-rate sample. Screenshots land in scratch_shots/.
//
//   npm i --no-save playwright-core     (once)
//   python3 -m http.server 4199 &       (from agent-hq/)
//   node scripts/verify.cjs [http://localhost:4199]
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:4199';
const OUT = path.join(__dirname, '..', 'scratch_shots');
const EXE = process.env.CHROMIUM || ['/opt/pw-browsers/chromium', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome']
  .find(p => fs.existsSync(p) && fs.statSync(p).isFile());

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const problems = [];
  const results = {};

  async function open(name, { width, height, query = '', reduced = false, mobile = false }) {
    const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile,
                                          reducedMotion: reduced ? 'reduce' : 'no-preference' });
    const page = await ctx.newPage();
    page.on('console', m => { if (m.type() === 'error') problems.push(`[${name}] console: ${m.text()}`); });
    page.on('pageerror', e => problems.push(`[${name}] pageerror: ${e.message}`));
    page.on('requestfailed', r => problems.push(`[${name}] request failed: ${r.url()} ${r.failure()?.errorText}`));
    page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/data/state.json') && !r.url().includes('state.json?ts')) problems.push(`[${name}] HTTP ${r.status()} ${r.url()}`); });
    await page.goto(`${BASE}/${query}`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.body.classList.contains('ready') && window.__hq, null, { timeout: 30000 });
    await page.waitForTimeout(600);
    return { ctx, page };
  }
  const shot = (page, n) => page.screenshot({ path: path.join(OUT, n + '.png') });

  // desktop overview, deterministic
  {
    const { ctx, page } = await open('desktop', { width: 1440, height: 900, query: '?cap=0' });
    await shot(page, '01-overview-1440');
    results.labelsVisible = await page.$$eval('.label', ls => ls.filter(l => l.style.display !== 'none').length);
    results.agents = await page.evaluate(() => window.__hq.state?.agents?.map(a => `${a.id}:${a.status}`));
    results.mode = await page.evaluate(() => window.__hq.state?.mode);
    // routines: step the simulation 60 s and check people actually walk somewhere, with no NaNs
    results.routines = await page.evaluate(() => {
      const before = window.__hq.sim.actors.map(a => a.char.root.position.clone());
      window.__hq.frame(60);
      const after = window.__hq.sim.actors.map(a => a.char.root.position);
      return { moved: after.filter((p, i) => p.distanceTo(before[i]) > 0.5).length, actors: after.length,
               nan: after.filter(p => !Number.isFinite(p.x + p.y + p.z)).length };
    });
    await page.click('.label[data-room="mmi"]');
    await page.waitForTimeout(500);
    await page.evaluate(() => window.__hq.frame(0.5));
    await shot(page, '02-mmi-panel-1440');
    results.panelHasSource = await page.$eval('#panel-body', el => /source:/.test(el.textContent));
    await page.evaluate(() => { document.querySelector('#panel-close').click(); window.__hq.basement(true); });
    await page.waitForTimeout(900);
    await shot(page, '03-basement-1440');
    await page.evaluate(() => { window.__hq.basement(false); window.__hq.inside('mmi'); });
    await page.waitForTimeout(300);
    await page.keyboard.down('w'); await page.waitForTimeout(400); await page.keyboard.up('w');
    await shot(page, '04-inside-mmi-1440');
    await page.evaluate(() => window.__hq.exitInside());
    for (const [i, f] of [[1, 0.25], [2, 0.5]]) {
      await page.evaluate(k => window.__hq.snap(k), i);
      await page.waitForTimeout(200);
      await shot(page, `05-rotate-${i}`);
    }
    await page.evaluate(() => { window.__hq.snap(0); window.__hq.jump('axiom'); });
    await page.waitForTimeout(300);
    await shot(page, '06-axiom-zoom');
    await page.evaluate(() => { document.querySelector('#panel-close').click(); window.__hq.jump('office'); });
    await page.waitForTimeout(300);
    await shot(page, '07-office-zoom');
    await ctx.close();
  }
  // live animation frame-rate sample (software GL here, so treat as a floor, not a target)
  {
    const { ctx, page } = await open('fps', { width: 1440, height: 900 });
    results.fps = await page.evaluate(() => new Promise(res => {
      let n = 0; const t0 = performance.now();
      const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(Math.round(n / 3)); };
      requestAnimationFrame(f);
    }));
    await page.waitForTimeout(4000);
    await shot(page, '08-live-after-7s');
    await ctx.close();
  }
  for (const [name, w, h, mobile] of [['tablet-768', 768, 1024, true], ['phone-390', 390, 844, true]]) {
    const { ctx, page } = await open(name, { width: w, height: h, query: '?cap=0', mobile });
    await shot(page, `09-${name}`);
    await page.click('.label[data-room="ijba"]');
    await page.waitForTimeout(400);
    await shot(page, `10-${name}-sheet`);
    results[`${name}-overflow`] = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await ctx.close();
  }
  {
    const { ctx, page } = await open('reduced', { width: 1280, height: 800, reduced: true });
    await page.waitForTimeout(800);
    await shot(page, '11-reduced-motion');
    results.reducedPanelWorks = await page.evaluate(() => { document.querySelector('.label[data-room="axiom"]').click(); return !document.querySelector('#panel').hidden; });
    await ctx.close();
  }
  {
    const { ctx, page } = await open('night', { width: 1440, height: 900, query: '?cap=0&hour=21' });
    await shot(page, '12-night');
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
  if (problems.length) { console.log('\nPROBLEMS:\n' + problems.join('\n')); process.exit(1); }
  console.log('\nverify ok · 0 console errors · 0 failed requests');
})().catch(e => { console.error(e); process.exit(2); });
