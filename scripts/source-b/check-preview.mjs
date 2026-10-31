// Optional browser QA using an existing Playwright installation; no install required by the lab.
// node scripts/source-b/check-preview.mjs <absolute-path-to-playwright-entry> [preview-url]
import { pathToFileURL } from 'node:url';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

if (!process.argv[2]) throw new Error('Indica la ruta a una instalación existente de Playwright.');
const { chromium } = await import(pathToFileURL(process.argv[2]).href);
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.argv[3] || 'http://127.0.0.1:4176/', { waitUntil: 'networkidle' });
  const slope = page.getByLabel('Pendiente (m):');
  await slope.focus();
  await page.keyboard.press('Home');
  assert.equal(await slope.inputValue(), '-4');
  await page.keyboard.press('End');
  assert.equal(await slope.inputValue(), '4');
  await page.keyboard.press('ArrowLeft');
  assert.equal(await slope.inputValue(), '3.5');
  const intercept = page.getByLabel('Corte vertical (b):');
  await intercept.fill('2');
  await slope.fill('0');
  assert.match(await page.locator('.zenit-lab-description').innerText(), /constante/);
  assert.equal(await page.locator('tbody td').first().innerText(), '2');
  await page.getByRole('button', { name: 'Restablecer valores' }).click();
  assert.equal(await slope.inputValue(), '1');
  assert.equal(await intercept.inputValue(), '0');
  await mkdir('.local-sources', { recursive: true });
  await page.screenshot({ path: '.local-sources/lab-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 360, height: 780 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({ path: '.local-sources/lab-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  console.log('QA navegador: teclado, pendiente cero, tabla, restauración, ancho móvil y errores JS aprobados.');
} finally {
  await browser.close();
}
