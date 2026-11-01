export type RootDomainParameters = { a: number; h: number; k: number };
export type RootDomainFeatures = {
  domain: { minimum: number; included: true };
  endpoint: { x: number; y: number };
  range: { kind: 'minimum' | 'maximum' | 'singleton'; boundary: number };
};

const valid = ({ a, h, k }: RootDomainParameters) => [a, h, k].every(Number.isFinite);

/** Null means no finite real result; never extends the original domain when a=0. */
export function evaluateRootDomain(x: number, p: RootDomainParameters): number | null {
  if (!Number.isFinite(x) || !valid(p) || x < p.h) return null;
  if (p.a === 0) return p.k;
  const y = p.a * Math.sqrt(x - p.h) + p.k;
  return Number.isFinite(y) ? y : null;
}

export function rootDomainFeatures(p: RootDomainParameters): RootDomainFeatures | null {
  if (!valid(p)) return null;
  return {
    domain: { minimum: p.h, included: true },
    endpoint: { x: p.h, y: p.k },
    range: { kind: p.a === 0 ? 'singleton' : p.a > 0 ? 'minimum' : 'maximum', boundary: p.k },
  };
}
