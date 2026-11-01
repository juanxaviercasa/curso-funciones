import { describe, expect, it } from 'vitest';
import { evaluateRootDomain, rootDomainFeatures } from '../../packages/math-labs/root-domain';
import { sampleSegments } from '../../packages/math-labs';

describe('dominio original de raíz cuadrada', () => {
  it.each([-2, 0, 2])('incluye x=h y excluye x<h para a=%s', a => {
    const p = { a, h: -3, k: -2 };
    expect(evaluateRootDomain(-3, p)).toBe(-2);
    expect(evaluateRootDomain(-3.5, p)).toBeNull();
    expect(evaluateRootDomain(1, p)).toBe(a * 2 - 2);
    expect(rootDomainFeatures(p)?.domain).toEqual({ minimum: -3, included: true });
  });
  it('a=0 conserva dominio y extremo; no simplifica a constante en todo ℝ', () => {
    const p = { a: 0, h: 2, k: 4 };
    expect(evaluateRootDomain(1, p)).toBeNull();
    expect(evaluateRootDomain(2, p)).toBe(4);
    expect(evaluateRootDomain(Number.MAX_VALUE, p)).toBe(4);
    expect(rootDomainFeatures(p)).toEqual({ domain: { minimum: 2, included: true }, endpoint: { x: 2, y: 4 }, range: { kind: 'singleton', boundary: 4 } });
  });
  it('distingue el rango por el signo de a y traslada h/k negativos', () => {
    expect(rootDomainFeatures({ a: 2, h: -4, k: -3 })?.range).toEqual({ kind: 'minimum', boundary: -3 });
    expect(rootDomainFeatures({ a: -2, h: -4, k: -3 })?.range).toEqual({ kind: 'maximum', boundary: -3 });
    expect(evaluateRootDomain(5, { a: -2, h: -4, k: -3 })).toBe(-9);
  });
  it('el dominio no depende de la ventana ni del recorte de y', () => {
    const p = { a: 3, h: 4, k: 4 };
    expect(evaluateRootDomain(104, p)).toBe(34);
    expect(rootDomainFeatures(p)?.domain.minimum).toBe(4);
    const segments = sampleSegments(x => evaluateRootDomain(x, p) ?? NaN, 4, 6, 0.1, 6);
    expect(segments[0][0]).toEqual({ x: 4, y: 4 });
    expect(segments.flat().every(point => point.x >= 4 && point.y <= 6)).toBe(true);
    expect(sampleSegments(x => evaluateRootDomain(x, { a: 0, h: 2, k: 1 }) ?? NaN, -6, 6, 1)[0][0]).toEqual({ x: 2, y: 1 });
  });
  it.each([NaN, Infinity, -Infinity])('rechaza no finitos en cada entrada: %s', value => {
    expect(evaluateRootDomain(value, { a: 0, h: 0, k: 0 })).toBeNull();
    for (const key of ['a', 'h', 'k'] as const) {
      const p = { a: 1, h: 0, k: 0, [key]: value };
      expect(evaluateRootDomain(2, p)).toBeNull();
      expect(rootDomainFeatures(p)).toBeNull();
    }
  });
  it('no devuelve infinito por desbordamiento', () => {
    expect(evaluateRootDomain(Number.MAX_VALUE, { a: Number.MAX_VALUE, h: 0, k: 0 })).toBeNull();
  });
});
