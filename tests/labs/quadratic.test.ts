import { describe, expect, it } from 'vitest';
import { evaluateQuadratic, quadraticFeatures } from '../../packages/math-labs/quadratic';

describe('familia cuadrática', () => {
  it.each([2, -2, 0])('evalúa signos y vértice para a=%s', a => {
    const p = { a, h: 3, k: -4 };
    expect(evaluateQuadratic(3, p)).toBe(-4);
    expect(evaluateQuadratic(5, p)).toBe(a * 4 - 4);
    expect(evaluateQuadratic(1, p)).toBe(evaluateQuadratic(5, p));
  });
  it('conserva simetría a ambos lados de h y traslaciones', () => {
    for (const a of [-3, -0.5, 0, 0.5, 3]) for (const h of [-4, 0, 2.5]) for (const offset of [0, 0.5, 2]) {
      const p = { a, h, k: 1.5 };
      expect(evaluateQuadratic(h + offset, p)).toBe(evaluateQuadratic(h - offset, p));
      expect(evaluateQuadratic(h + offset, p)).toBe(evaluateQuadratic(offset, { a, h: 0, k: 0 }) + 1.5);
    }
  });
  it('describe el rango y el extremo según el signo', () => {
    expect(quadraticFeatures({ a: 2, h: -1, k: 3 })).toEqual({ kind: 'up', vertex: { x: -1, y: 3 }, symmetryAxis: -1, range: { kind: 'minimum', boundary: 3 } });
    expect(quadraticFeatures({ a: -2, h: 1, k: -3 })?.range).toEqual({ kind: 'maximum', boundary: -3 });
  });
  it('a=0 no tiene vértice ni eje exclusivo y no depende de h', () => {
    expect(quadraticFeatures({ a: 0, h: 4, k: 2 })).toEqual({ kind: 'constant', vertex: null, symmetryAxis: null, range: { kind: 'singleton', boundary: 2 } });
    expect(evaluateQuadratic(Number.MAX_VALUE, { a: 0, h: -Number.MAX_VALUE, k: 2 })).toBe(2);
    expect(evaluateQuadratic(3, { a: 0, h: 0, k: 0 })).toBe(0);
  });
  it.each([NaN, Infinity, -Infinity])('rechaza todas las entradas no finitas: %s', value => {
    expect(evaluateQuadratic(value, { a: 0, h: 0, k: 2 })).toBeNaN();
    for (const key of ['a', 'h', 'k'] as const) {
      const p = { a: 1, h: 0, k: 0, [key]: value };
      expect(evaluateQuadratic(2, p)).toBeNaN();
      expect(quadraticFeatures(p)).toBeNull();
    }
  });
  it('no expone infinito cuando la evaluación desborda', () => {
    expect(evaluateQuadratic(Number.MAX_VALUE, { a: 1, h: 0, k: 0 })).toBeNaN();
  });
});
