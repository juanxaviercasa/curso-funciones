import { describe, expect, it } from 'vitest';
import { argumentInDomain, canonicalValue, evaluateExploration, explorationFacts, explorationSegments, initialTransform, numberText, type ExplorerFamily } from '../../packages/math-labs/exploration';

const families: ExplorerFamily[] = ['affine', 'quadratic', 'absolute', 'root', 'reciprocal', 'exponential', 'logarithmic', 'sine', 'cosine', 'tangent'];
describe('transformación y dominio original', () => {
  it.each(families)('compara base y transformación en %s', family => {
    const p = { a: -2, b: -0.5, h: 2, k: 3, base: 2 };
    const expected = canonicalValue(family, 1, 2)!;
    expect(evaluateExploration(family, 0, p)).toBeCloseTo(-2 * expected + 3);
  });
  it.each(['root', 'logarithmic', 'reciprocal', 'tangent'] as const)('a=0 no cancela exclusiones de %s', family => {
    const x = family === 'root' ? -1 : family === 'tangent' ? Math.PI / 2 : 0;
    expect(evaluateExploration(family, x, { ...initialTransform, a: 0, k: 2 })).toBeNull();
    expect(evaluateExploration(family, 1, { ...initialTransform, a: 0, k: 2 })).toBe(2);
  });
  it.each(['logarithmic', 'reciprocal'] as const)('b=0 deja vacío el dominio de %s aunque a=0', family => {
    expect(evaluateExploration(family, 3, { ...initialTransform, a: 0, b: 0 })).toBeNull();
    expect(explorationFacts(family, { ...initialTransform, b: 0 })?.domain).toBe('∅');
  });
  it('b=0 evalúa f(0), no siempre k; h no afecta', () => {
    expect(evaluateExploration('cosine', 100, { ...initialTransform, a: 2, b: 0, h: -3, k: 1 })).toBe(3);
    expect(evaluateExploration('exponential', 100, { ...initialTransform, a: 2, b: 0, k: 1 })).toBe(3);
    expect(evaluateExploration('root', -100, { ...initialTransform, b: 0, h: 3, k: 2 })).toBe(2);
    expect(explorationFacts('root', { ...initialTransform, b: 0 })?.domain).toBe('ℝ');
  });
  it('b negativo invierte dominio y monotonía de raíz y log', () => {
    expect(explorationFacts('root', { ...initialTransform, b: -1, h: 2 })?.domain).toBe('(−∞, 2]');
    expect(explorationFacts('logarithmic', { ...initialTransform, b: -1, h: -2 })?.domain).toBe('(−∞, -2)');
    expect(explorationFacts('logarithmic', { ...initialTransform, base: 0.5 })?.monotonicity).toMatch(/Decreciente/);
    expect(evaluateExploration('root', 2, { ...initialTransform, b: -1, h: 2, k: -1 })).toBe(-1);
  });
  it.each([0, 1, -2, Infinity, NaN])('rechaza base exponencial/log inválida %s', base => {
    expect(evaluateExploration('exponential', 2, { ...initialTransform, base })).toBeNull();
    expect(canonicalValue('logarithmic', 1, base)).toBeNull();
    expect(explorationFacts('logarithmic', { ...initialTransform, base })).toBeNull();
  });
  it.each([NaN, Infinity, -Infinity])('rechaza no finitos %s en cada parámetro', value => {
    expect(evaluateExploration('affine', value, initialTransform)).toBeNull();
    for (const key of ['a', 'b', 'h', 'k'] as const) {
      expect(evaluateExploration('root', 1, { ...initialTransform, [key]: value })).toBeNull();
      expect(explorationFacts('root', { ...initialTransform, [key]: value })).toBeNull();
    }
  });
  it('log argumento no positivo y frontera de raíz', () => {
    expect(canonicalValue('logarithmic', 0)).toBeNull();
    expect(canonicalValue('logarithmic', -1)).toBeNull();
    expect(canonicalValue('root', 0)).toBe(0);
    expect(canonicalValue('root', -1)).toBeNull();
    expect(canonicalValue('exponential', 3, 0.5)).toBe(0.125);
  });
});

describe('características de familias y trigonometría', () => {
  it('no presenta cero negativo ni redondea exponenciales pequeñas a cero', () => {
    expect(numberText(Math.sin(-Math.PI))).not.toBe('-0');
    expect(numberText(3 ** -27)).toMatch(/E/);
    expect(numberText(-0)).toBe('0');
  });
  it('dominio y rango no se reducen a la ventana visible', () => {
    expect(explorationFacts('reciprocal', { ...initialTransform, a: -1, h: 2, k: -3 })?.range).toBe('ℝ ∖ {-3}');
    expect(explorationFacts('exponential', { ...initialTransform, a: -1, k: -3 })?.range).toBe('(−∞, -3)');
    expect(explorationFacts('quadratic', { ...initialTransform, a: -1, k: 2 })?.range).toBe('(−∞, 2]');
    expect(evaluateExploration('affine', 1000, initialTransform)).toBe(1000);
  });
  it('describe cortes, asíntotas y simetrías sin borrar huecos', () => {
    const facts = explorationFacts('logarithmic', { ...initialTransform, a: -1, b: 2, h: 1 })!;
    expect(facts.intercepts).toMatch(/1[.,]5/);
    expect(facts.asymptotes).toMatch(/x = 1/);
    expect(explorationFacts('reciprocal', { ...initialTransform, a: 0 })?.asymptotes).toMatch(/hueco/);
    expect(explorationFacts('absolute', { ...initialTransform, h: 2 })?.symmetry).toMatch(/x = 2/);
  });
  it('amplitud y período con signos; tangente sin amplitud', () => {
    expect(explorationFacts('sine', { ...initialTransform, a: -2, b: -2, k: 1 })?.range).toBe('[-1, 3]');
    expect(explorationFacts('sine', { ...initialTransform, a: -2, b: -2 })?.period).toMatch(/3[.,]142/);
    expect(explorationFacts('cosine', { ...initialTransform, a: -2 })?.amplitude).toMatch(/2/);
    expect(explorationFacts('tangent', initialTransform)?.amplitude).toMatch(/No aplica/);
    expect(explorationFacts('tangent', { ...initialTransform, b: 2 })?.period).toMatch(/1[.,]571/);
    expect(explorationFacts('sine', { ...initialTransform, a: 0 })?.period).toMatch(/no tiene período fundamental/);
  });
  it('los polos de tangente se conservan con a=0 y se trasladan con b/h', () => {
    for (const b of [-2, 0.5, 1, 3]) for (const n of [-2, -1, 0, 1, 2]) {
      const p = { ...initialTransform, a: 0, b, h: 1 };
      expect(evaluateExploration('tangent', 1 + (Math.PI / 2 + n * Math.PI) / b, p)).toBeNull();
    }
    expect(argumentInDomain('tangent', Math.PI / 2 - 1e-5)).toBe(true);
  });
});

describe('segmentación explícita de ramas', () => {
  it.each([-2, 0.5, 3])('no conecta polos entre muestras aun con a=0: b=%s', b => {
    for (const a of [0, 1, -1]) {
      const p = { ...initialTransform, a, b, h: 0.13 };
      const tangent = explorationSegments('tangent', p, -6, 6, 6, 517);
      expect(tangent.length).toBeGreaterThan(1);
      for (const segment of tangent) {
        const branch = (x: number) => Math.floor((b * (x - p.h) + Math.PI / 2) / Math.PI);
        expect(segment.every(point => branch(point.x) === branch(segment[0].x))).toBe(true);
      }
      for (const segment of explorationSegments('reciprocal', p, -6, 6, 6, 517)) {
        expect(segment.every(point => Math.sign(b * (point.x - p.h)) === Math.sign(b * (segment[0].x - p.h)))).toBe(true);
      }
    }
  });
  it('incluye la frontera de raíz y no toma log fuera de dominio', () => {
    const p = { ...initialTransform, h: 0.13, b: -1 };
    const root = explorationSegments('root', p, -6, 6).flat();
    expect(root.some(point => point.x === p.h && point.y === 0)).toBe(true);
    expect(root.every(point => point.x <= p.h)).toBe(true);
    expect(explorationSegments('logarithmic', p, -6, 6).flat().every(point => point.x < p.h)).toBe(true);
  });
  it('acota presupuesto y rechaza ventanas inválidas', () => {
    expect(() => explorationSegments('affine', initialTransform, 0, 0)).toThrow(RangeError);
    expect(() => explorationSegments('affine', initialTransform, -6, 6, 6, 100000)).toThrow(RangeError);
    expect(() => explorationSegments('affine', initialTransform, -Infinity, 6)).toThrow(RangeError);
    expect(explorationSegments('exponential', initialTransform, -6, 6).flat().every(p => Number.isFinite(p.y) && Math.abs(p.y) <= 6)).toBe(true);
  });
});
