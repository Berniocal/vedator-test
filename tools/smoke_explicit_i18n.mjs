import { chromium } from 'playwright';

const base = process.env.VEDATOR_BASE || 'http://127.0.0.1:8000';
const browser = await chromium.launch({ headless: true });
const failures = [];

for (const lang of ['sk', 'cs']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });
  page.on('pageerror', error => failures.push(`${lang}: pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !/favicon|media|audio/i.test(message.text())) {
      failures.push(`${lang}: console: ${message.text()}`);
    }
  });

  await page.goto(`${base}/${lang}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#episodes article', { timeout: 20000 });

  const htmlLang = await page.locator('html').getAttribute('lang');
  if (htmlLang !== lang) failures.push(`${lang}: html lang is ${htmlLang}`);

  const expectedHeader = lang === 'sk' ? 'Vedátorský podcast podľa tém' : 'Vedátorský podcast podle témat';
  const header = (await page.locator('h1').first().textContent())?.trim();
  if (header !== expectedHeader) failures.push(`${lang}: unexpected header ${JSON.stringify(header)}`);

  const switcher = page.locator('.vedator-language-switch');
  if (await switcher.count() !== 1) failures.push(`${lang}: language switch missing or duplicated`);

  const theme = page.locator('#themeToggle');
  if (await theme.count()) {
    await theme.click({ force: true });
    await page.waitForTimeout(100);
  }

  const readText = lang === 'sk' ? /Čítať viac/i : /Číst více/i;
  const readMore = page.getByRole('button', { name: readText }).first();
  if (await readMore.count()) {
    await readMore.click();
    await page.waitForTimeout(100);
  }

  for (const view of ['series', 'questions', 'playlists', 'data']) {
    const tab = page.locator(`.tab[data-view="${view}"]`);
    if (await tab.count()) {
      await tab.click();
      await page.waitForTimeout(150);
    }
  }

  const episodesTab = page.locator('.tab[data-view="episodes"]');
  if (await episodesTab.count()) await episodesTab.click();
  await page.waitForTimeout(100);

  const play = page.locator('#episodes article .links .primary').first();
  if (await play.count()) {
    await play.click();
    await page.waitForTimeout(300);
    const modal = page.locator('.vedator-audio-modal');
    if (await modal.count() && await modal.isVisible()) {
      const close = modal.getByRole('button').filter({ hasText: lang === 'sk' ? /Zavrieť/ : /Zavřít/ }).first();
      if (await close.count()) await close.click();
    }
  }

  await page.close();
}

await browser.close();
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('Mobile smoke tests passed for sk and cs.');
