// QA for a local harness rendering FamilyExplorerLab twice, then TrigonometryLab twice.
// node scripts/source-b/check-preuniversity.mjs <Playwright-entry> [URL]
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
  await page.goto(process.argv[3] || 'http://127.0.0.1:4184/', { waitUntil: 'networkidle' });
  const labs = page.locator('.zenit-lab-explore-root');
  assert.equal(await labs.count(), 4);
  const family = labs.nth(0), otherFamily = labs.nth(1), trig = labs.nth(2), otherTrig = labs.nth(3);
  const facts = (lab, term) => lab.locator('.zenit-lab-explore-fact').filter({ has: page.locator('dt', { hasText: term }) }).locator('dd');
  const a = family.getByLabel('Factor vertical (a):');
  await a.focus(); await page.keyboard.press('Home'); assert.equal(await a.inputValue(), '-3');
  await page.keyboard.press('End'); assert.equal(await a.inputValue(), '3');
  await page.keyboard.press('ArrowLeft'); assert.equal(await a.inputValue(), '2.5');
  for (const name of ['affine', 'quadratic', 'absolute', 'root', 'reciprocal', 'exponential', 'logarithmic']) {
    await family.getByLabel('Familia', { exact: true }).selectOption(name);
    assert.doesNotMatch(await family.innerText(), /NaN|Infinity/);
    assert.ok((await facts(family, 'Dominio de g').innerText()).length > 0);
  }
  await family.getByLabel('Base (positiva').selectOption('0.5');
  await a.fill('1'); await family.getByLabel('Factor horizontal (b):').fill('1');
  assert.match(await facts(family, 'Monotonía').innerText(), /Decreciente/);
  await family.getByLabel('Factor horizontal (b):').fill('0');
  assert.equal(await facts(family, 'Dominio de g').innerText(), '∅');
  await a.fill('0'); assert.equal(await family.locator('.zenit-lab-explore-transformed').count(), 0);
  const activities = family.locator('.zenit-lab-explore-activity');
  assert.equal(await activities.nth(0).getByRole('button').isDisabled(), true);
  await activities.nth(0).getByLabel('Tu predicción').fill('x≤2 y rango {1}; no admite 3');
  await activities.nth(0).getByRole('button').click();
  assert.equal(await facts(family, 'Dominio de g').innerText(), '(−∞, 2]');
  assert.equal(await facts(family, 'Rango de g').innerText(), '{1}');
  assert.match(await family.locator('tbody').innerText(), /Sin valor real finito/);
  await activities.nth(0).getByLabel('¿Qué confirma').fill('La tabla excluye x=3 y conserva x=2.');
  await family.getByLabel('Factor vertical (a):').fill('1');
  assert.match(await activities.nth(0).getByRole('status').innerText(), /pudo cambiar/);
  await activities.nth(1).getByLabel('Tu predicción').fill('x>1, corte 1.5, decrece');
  await activities.nth(1).getByRole('button').click();
  assert.equal(await facts(family, 'Dominio de g').innerText(), '(1, +∞)');
  assert.match(await facts(family, 'Cortes con los ejes').innerText(), /1[.,]5/);
  assert.equal(await otherFamily.getByLabel('Familia', { exact: true }).inputValue(), 'affine');
  await family.getByRole('button', { name: 'Restablecer parámetros' }).click();
  assert.equal(await family.getByLabel('Factor horizontal (b):').inputValue(), '1');

  const trigActivities = trig.locator('.zenit-lab-explore-activity');
  await trigActivities.nth(0).getByLabel('Tu predicción').fill('Período pi, rango -1 a 3');
  await trigActivities.nth(0).getByRole('button').click();
  assert.match(await facts(trig, 'Período').innerText(), /3[.,]142/);
  assert.equal(await facts(trig, 'Rango de g').innerText(), '[-1, 3]');
  await trig.getByLabel('Factor horizontal (b):').fill('0');
  assert.match(await facts(trig, 'Amplitud').innerText(), /No hay oscilación/);
  await trig.getByLabel('Familia', { exact: true }).selectOption('cosine');
  assert.equal(await facts(trig, 'Rango de g').innerText(), '{3}');
  await trigActivities.nth(1).getByLabel('Tu predicción').fill('Hay huecos en pi/2+npi');
  await trigActivities.nth(1).getByRole('button').click();
  assert.match(await facts(trig, 'Amplitud').innerText(), /No aplica/);
  assert.equal(await facts(trig, 'Rango de g').innerText(), '{2}');
  assert.ok(await trig.locator('.zenit-lab-explore-hole').count() > 0);
  assert.match(await trig.locator('tbody').innerText(), /Sin valor real finito/);
  assert.equal(await otherTrig.getByLabel('Factor vertical (a):').inputValue(), '1');
  await trig.getByRole('button', { name: 'Restablecer parámetros' }).click();
  assert.ok(await trig.locator('.zenit-lab-explore-pole').count() > 0);
  const h = trig.getByLabel('Desplazamiento (h), rad:');
  await h.focus(); await page.keyboard.press('End');
  assert.equal(await h.inputValue(), '4');
  assert.match(await h.getAttribute('aria-valuetext'), /π radianes/);
  const ids = await page.locator('[id]').evaluateAll(nodes => nodes.map(node => node.id));
  assert.equal(new Set(ids).size, ids.length);
  await mkdir('.local-sources', { recursive: true });
  await family.screenshot({ path: '.local-sources/preuni-family-desktop.png' });
  await trig.screenshot({ path: '.local-sources/preuni-trig-desktop.png' });
  await page.setViewportSize({ width: 360, height: 780 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.addStyleTag({ path: 'apps/web/src/style.css' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await family.screenshot({ path: '.local-sources/preuni-family-mobile.png' });
  await trig.screenshot({ path: '.local-sources/preuni-trig-mobile.png' });
  assert.deepEqual(errors, []);
  console.log('PASS: 7 familias, 3 trigonométricas, cero a/b, dominio, actividades, comparación, teclado, cuatro instancias, móvil360 y CSS global; sin errores JS.');
} finally { await browser.close(); }
