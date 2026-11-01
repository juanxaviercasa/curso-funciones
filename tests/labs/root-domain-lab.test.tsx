import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RootDomainLab } from '../../apps/web/src/labs/RootDomainLab';

describe('contrato independiente de RootDomainLab', () => {
  it('renderiza sin props con controles etiquetados, tabla y explicación de dominio', () => {
    const html = renderToStaticMarkup(createElement(RootDomainLab));
    const labels = [...html.matchAll(/for="([^"]+)"/g)].map(match => match[1]);
    expect(labels).toHaveLength(3);
    for (const id of labels) expect(html).toContain(`id="${id}"`);
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Sin valor real: fuera del dominio');
    expect(html).toContain('El extremo x = 0 está incluido');
    expect(html).toContain('no limita el dominio ni el rango');
    expect(html).not.toMatch(/NaN|Infinity/);
  });
  it('admite dos instancias con IDs únicos y estilos locales', () => {
    const html = renderToStaticMarkup(createElement('div', null, createElement(RootDomainLab), createElement(RootDomainLab)));
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    const classes = [...html.matchAll(/class="([^"]+)"/g)].flatMap(match => match[1].split(' '));
    expect(classes.every(name => name.startsWith('zenit-lab-root-domain-'))).toBe(true);
  });
});
