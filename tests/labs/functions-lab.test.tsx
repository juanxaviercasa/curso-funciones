import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FunctionsLab } from '../../apps/web/src/labs/FunctionsLab';

describe('contrato de laboratorio independiente', () => {
  it('renderiza sin props ni servicios y conecta controles con etiquetas', () => {
    const html = renderToStaticMarkup(createElement(FunctionsLab));
    expect(html).toContain('Explora una función lineal');
    const labels = [...html.matchAll(/for="([^"]+)"/g)].map(match => match[1]);
    expect(labels).toHaveLength(2);
    for (const id of labels) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('type="range"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Valores de la función actual');
    expect(html).not.toMatch(/(?:NaN|Infinity)/);
  });
  it('permite dos instancias sin duplicar identificadores accesibles', () => {
    const html = renderToStaticMarkup(createElement('div', null,
      createElement(FunctionsLab), createElement(FunctionsLab)));
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
