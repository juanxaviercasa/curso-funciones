import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QuadraticLab } from '../../apps/web/src/labs/QuadraticLab';

describe('contrato independiente de QuadraticLab', () => {
  it('renderiza sin props y relaciona sus tres controles con etiquetas', () => {
    const html = renderToStaticMarkup(createElement(QuadraticLab));
    const labels = [...html.matchAll(/for="([^"]+)"/g)].map(match => match[1]);
    expect(labels).toHaveLength(3);
    for (const id of labels) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Dominio: todos los números reales');
    expect(html).toContain('Valores alrededor de h');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  it('admite dos instancias con IDs independientes y clases locales', () => {
    const html = renderToStaticMarkup(createElement('div', null, createElement(QuadraticLab), createElement(QuadraticLab)));
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(' '));
    expect(classes.every(name => name.startsWith('zenit-lab-quadratic-'))).toBe(true);
  });
});
