import { describe, expect, it } from 'vitest';
import { evaluateLinear, sampleSegments } from '../../packages/math-labs';

describe('función lineal', () => {
  it('evalúa pendiente, corte y valores negativos', () => {
    expect(evaluateLinear(-2, { slope: -3, intercept: 1 })).toBe(7);
    expect(evaluateLinear(0, { slope: 3, intercept: -2 })).toBe(-2);
  });
  it('admite pendiente cero y la función cero', () => {
    expect(evaluateLinear(100, { slope: 0, intercept: 4 })).toBe(4);
    expect(evaluateLinear(-100, { slope: 0, intercept: 0 })).toBe(0);
  });
  it.each([NaN, Infinity, -Infinity])('rechaza entradas no finitas %s', value => {
    expect(evaluateLinear(value, { slope: 1, intercept: 0 })).toBeNaN();
    expect(evaluateLinear(0, { slope: value, intercept: 0 })).toBeNaN();
    expect(evaluateLinear(0, { slope: 1, intercept: value })).toBeNaN();
  });
  it('no devuelve infinito por desbordamiento', () => {
    expect(evaluateLinear(2, { slope: Number.MAX_VALUE, intercept: 0 })).toBeNaN();
  });
});

describe('muestreo segmentado y acotado', () => {
  it('no conecta a través de un punto fuera del dominio', () => {
    const segments = sampleSegments(x => x < 0 ? NaN : Math.sqrt(x), -2, 2, 1, 6);
    expect(segments).toEqual([[{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: Math.sqrt(2) }]]);
    expect(sampleSegments(x => 1 / x, -2, 2, 1, 6)).toHaveLength(2);
  });
  it('rompe la curva al salir de la ventana', () => {
    expect(sampleSegments(x => x === 0 ? 10 : 0, -1, 1, 1, 6)).toHaveLength(2);
    expect(sampleSegments(() => NaN)).toEqual([]);
  });
  it('incluye ambos extremos sin superar el máximo', () => {
    const points = sampleSegments(x => x, -1, 1, 0.3)[0];
    expect(points[0].x).toBe(-1);
    expect(points.at(-1)?.x).toBe(1);
    expect(points.every(point => point.x <= 1)).toBe(true);
  });
  it.each([
    [0, 0, 1, 6], [-1, 1, 0, 6], [-1, 1, -1, 6],
    [-Infinity, 1, 1, 6], [-1, 1, NaN, 6], [-1, 1, 1, 0],
    [-1, 1, 1e-12, 6], [-Number.MAX_VALUE, Number.MAX_VALUE, 1, 6],
  ])('rechaza límites o tamaños peligrosos (%s, %s, %s, %s)', (min, max, step, maxAbsY) => {
    expect(() => sampleSegments(x => x, min, max, step, maxAbsY)).toThrow(RangeError);
  });
});
