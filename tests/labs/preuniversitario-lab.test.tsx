import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FamilyExplorerLab } from '../../apps/web/src/labs/FamilyExplorerLab';
import { TrigonometryLab } from '../../apps/web/src/labs/TrigonometryLab';

describe.each([['familias', FamilyExplorerLab], ['trigonometría', TrigonometryLab]] as const)('contrato %s', (_, Lab) => {
  it('renderiza sin props ni servicios y pide predicción antes de contrastar', () => {
    const html = renderToStaticMarkup(createElement(Lab));
    expect(html).not.toMatch(/NaN|Infinity/);
    expect(html).toContain('Tu predicción');
    expect(html).toContain('sin calificación automática');
    expect((html.match(/disabled=""/g) || []).length).toBe(2);
    const labels = [...html.matchAll(/for="([^"]+)"/g)].map(match => match[1]);
    for (const id of labels) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('Dominio de g');
    expect(html).toContain('Contrasta valores');
  });
  it('dos instancias tienen IDs distintos y solo clases locales', () => {
    const html = renderToStaticMarkup(createElement('div', null, createElement(Lab), createElement(Lab)));
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...html.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(' ')).every(name => name.startsWith('zenit-lab-explore-'))).toBe(true);
  });
});
