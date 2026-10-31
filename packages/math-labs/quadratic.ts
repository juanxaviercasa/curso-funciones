export type QuadraticParameters = { a: number; h: number; k: number };
export type QuadraticFeatures = {
  kind: 'constant' | 'up' | 'down';
  vertex: { x: number; y: number } | null;
  symmetryAxis: number | null;
  range: { kind: 'singleton' | 'minimum' | 'maximum'; boundary: number };
};

const valid = ({ a, h, k }: QuadraticParameters) => [a, h, k].every(Number.isFinite);

export function evaluateQuadratic(x: number, p: QuadraticParameters): number {
  if (!Number.isFinite(x) || !valid(p)) return NaN;
  // Avoid an artificial 0 * Infinity when the constant function has distant inputs.
  if (p.a === 0) return p.k;
  const offset = x - p.h;
  const y = p.a * offset * offset + p.k;
  return Number.isFinite(y) ? y : NaN;
}

export function quadraticFeatures(p: QuadraticParameters): QuadraticFeatures | null {
  if (!valid(p)) return null;
  if (p.a === 0) return {
    kind: 'constant', vertex: null, symmetryAxis: null,
    range: { kind: 'singleton', boundary: p.k },
  };
  return {
    kind: p.a > 0 ? 'up' : 'down', vertex: { x: p.h, y: p.k }, symmetryAxis: p.h,
    range: { kind: p.a > 0 ? 'minimum' : 'maximum', boundary: p.k },
  };
}
