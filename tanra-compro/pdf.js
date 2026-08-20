const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  await p.goto('file:///home/user/general/tanra-compro/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  require('fs').mkdirSync('/home/user/general/tanra-compro/build', { recursive: true });
  await p.pdf({
    path: '/home/user/general/tanra-compro/build/PT_TANRA_DAYA_JAYA_COMPRO_2026.pdf',
    format: 'A4',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  await b.close();
  console.log('pdf done');
})().catch(e => { console.error(e); process.exit(1); });
