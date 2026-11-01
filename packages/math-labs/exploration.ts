import { evaluateLinear } from './index';
import { evaluateQuadratic } from './quadratic';
import { evaluateRootDomain } from './root-domain';

export const familyNames = {
  affine: 'Afín', quadratic: 'Cuadrática', absolute: 'Valor absoluto', root: 'Raíz cuadrada',
  reciprocal: 'Racional 1/x', exponential: 'Exponencial', logarithmic: 'Logarítmica',
  sine: 'Seno', cosine: 'Coseno', tangent: 'Tangente',
} as const;
export type ExplorerFamily = keyof typeof familyNames;
export type Transform = { a: number; b: number; h: number; k: number; base: number };
export const initialTransform: Transform = { a: 1, b: 1, h: 0, k: 0, base: 2 };
export const isTrig = (family: ExplorerFamily) => ['sine', 'cosine', 'tangent'].includes(family);
export const numberText = (x: number) => {
  const value = Object.is(x, -0) ? 0 : x;
  // Preserve small nonzero values: an exponential never reaches its asymptote.
  return value !== 0 && Math.abs(value) < 0.0005
    ? new Intl.NumberFormat('es-PE', { notation: 'scientific', maximumSignificantDigits: 3 }).format(value)
    : new Intl.NumberFormat('es-PE', { maximumFractionDigits: 3 }).format(value);
};
export const validTransform = (p: Transform) => [p.a, p.b, p.h, p.k, p.base].every(Number.isFinite) && p.base > 0 && p.base !== 1;

export function argumentInDomain(family: ExplorerFamily, u: number): boolean {
  if (!Number.isFinite(u)) return false;
  if (family === 'root') return u >= 0;
  if (family === 'logarithmic') return u > 0;
  if (family === 'reciprocal') return u !== 0;
  // Floating point pi/2 is approximate; reject numerical representations of poles.
  if (family === 'tangent') return Math.abs(Math.cos(u)) > 1e-12;
  return true;
}

export function canonicalValue(family: ExplorerFamily, u: number, base = 2): number | null {
  if (!Number.isFinite(base) || base <= 0 || base === 1 || !argumentInDomain(family, u)) return null;
  let y: number | null;
  switch (family) {
    case 'affine': y = evaluateLinear(u, { slope: 1, intercept: 0 }); break;
    case 'quadratic': y = evaluateQuadratic(u, { a: 1, h: 0, k: 0 }); break;
    case 'root': y = evaluateRootDomain(u, { a: 1, h: 0, k: 0 }); break;
    case 'absolute': y = Math.abs(u); break;
    case 'reciprocal': y = 1 / u; break;
    case 'exponential': y = base ** u; break;
    case 'logarithmic': y = Math.log(u) / Math.log(base); break;
    case 'sine': y = Math.sin(u); break;
    case 'cosine': y = Math.cos(u); break;
    case 'tangent': y = Math.tan(u); break;
  }
  return y !== null && Number.isFinite(y) ? y : null;
}

export function evaluateExploration(family: ExplorerFamily, x: number, p: Transform): number | null {
  if (!validTransform(p) || !Number.isFinite(x)) return null;
  const u = p.b === 0 ? 0 : p.b * (x - p.h);
  if (!argumentInDomain(family, u)) return null;
  // Domain first: a=0 never removes exclusions of the original expression.
  if (p.a === 0) return p.k;
  const f = canonicalValue(family, u, p.base);
  if (f === null) return null;
  const y = p.a * f + p.k;
  return Number.isFinite(y) ? y : null;
}

export function baseFormula(family: ExplorerFamily, base: number): string {
  return ({ affine: 'x', quadratic: 'x²', absolute: '|x|', root: '√x', reciprocal: '1/x',
    exponential: `${numberText(base)}ˣ`, logarithmic: `log de base ${numberText(base)} de x`,
    sine: 'sen(x)', cosine: 'cos(x)', tangent: 'tan(x)' })[family];
}

export type ExplorationFacts = { domain: string; range: string; intercepts: string; symmetry: string; monotonicity: string; asymptotes: string; period: string; amplitude: string };

export function explorationFacts(family: ExplorerFamily, p: Transform): ExplorationFacts | null {
  if (!validTransform(p)) return null;
  const { a, b, h, k, base } = p;
  const H = numberText(h), K = numberText(k);
  const facts: ExplorationFacts = { domain: 'ℝ', range: 'ℝ', intercepts: '', symmetry: 'Sin simetría axial o central general.', monotonicity: '', asymptotes: 'Ninguna.', period: 'No periódica.', amplitude: 'No aplica.' };
  if (b === 0 && !argumentInDomain(family, 0)) return { ...facts, domain: '∅', range: '∅', intercepts: 'Ninguno: expresión no definida para ningún x.', symmetry: 'No aplica: dominio vacío.', monotonicity: 'No aplica: dominio vacío.', period: 'No aplica: dominio vacío.' };
  if (b !== 0) {
    if (family === 'root') facts.domain = b > 0 ? `[${H}, +∞)` : `(−∞, ${H}]`;
    if (family === 'logarithmic') facts.domain = b > 0 ? `(${H}, +∞)` : `(−∞, ${H})`;
    if (family === 'reciprocal') facts.domain = `ℝ ∖ {${H}}`;
    if (family === 'tangent') facts.domain = `ℝ ∖ {${H} + (π/2 + nπ)/${numberText(b)} : n ∈ ℤ}`;
  }
  const constant = a === 0 || b === 0;
  if (constant) {
    const value = a === 0 ? k : evaluateExploration(family, 0, p)!;
    facts.range = `{${numberText(value)}}`;
    facts.monotonicity = 'Constante en su dominio original.';
    facts.symmetry = b === 0 ? 'Recta constante: cualquier eje vertical es eje de simetría.' : family === 'root' || family === 'logarithmic'
      ? 'El dominio es una semirrecta; no extender la simetría de una recta completa.'
      : `Simétrica respecto de x = ${H}; no hay eje exclusivo.`;
    facts.period = isTrig(family) ? (b === 0 || family !== 'tangent' ? 'Constante: no tiene período fundamental positivo.' : `El dominio perforado se repite cada ${numberText(Math.PI / Math.abs(b))}; no es una tangente oscilante.`) : 'Constante en el dominio indicado.';
    facts.amplitude = family === 'sine' || family === 'cosine' ? 'No hay oscilación.' : 'No aplica.';
    facts.intercepts = `Eje x: ${value === 0 ? 'todos los x del dominio' : 'ninguno'}. Eje y: ${evaluateExploration(family, 0, p) === null ? 'no existe' : `(0; ${numberText(value)})`}.`;
    if (b !== 0 && family === 'reciprocal') facts.asymptotes = `Sin asíntota vertical: hueco en (${H}; ${K}).`;
    if (b !== 0 && family === 'tangent') facts.asymptotes = 'Sin asíntotas verticales: las exclusiones del dominio son huecos.';
    return facts;
  }
  if (['quadratic', 'absolute', 'root'].includes(family)) facts.range = a > 0 ? `[${K}, +∞)` : `(−∞, ${K}]`;
  if (family === 'exponential') facts.range = a > 0 ? `(${K}, +∞)` : `(−∞, ${K})`;
  if (family === 'reciprocal') facts.range = `ℝ ∖ {${K}}`;
  if (family === 'sine' || family === 'cosine') facts.range = `[${numberText(k - Math.abs(a))}, ${numberText(k + Math.abs(a))}]`;
  if (['quadratic', 'absolute', 'cosine'].includes(family)) facts.symmetry = `Eje de simetría: x = ${H}${family === 'cosine' ? ' (entre otros ejes periódicos)' : ''}.`;
  if (['affine', 'reciprocal', 'sine', 'tangent'].includes(family)) facts.symmetry = `Simetría central respecto de (${H}; ${K}).`;
  const sign = a * b * (family === 'reciprocal' ? -1 : family === 'exponential' || family === 'logarithmic' ? Math.log(base) : 1);
  facts.monotonicity = `${sign > 0 ? 'Creciente' : 'Decreciente'} en cada intervalo de su dominio.`;
  if (family === 'quadratic' || family === 'absolute') facts.monotonicity = `${a > 0 ? 'Decreciente' : 'Creciente'} hasta x = ${H}; ${a > 0 ? 'creciente' : 'decreciente'} después.`;
  if (family === 'sine') facts.monotonicity = 'Por tramos: el signo de a·b·cos(b(x−h)) determina crecimiento o decrecimiento.';
  if (family === 'cosine') facts.monotonicity = 'Por tramos: el signo de −a·b·sen(b(x−h)) determina crecimiento o decrecimiento.';
  if (family === 'reciprocal') facts.asymptotes = `Vertical: x = ${H}. Horizontal: y = ${K}.`;
  if (family === 'exponential') facts.asymptotes = `Horizontal: y = ${K}.`;
  if (family === 'logarithmic') facts.asymptotes = `Vertical: x = ${H}.`;
  if (family === 'tangent') facts.asymptotes = `Verticales: x = ${H} + (π/2 + nπ)/${numberText(b)}, n ∈ ℤ.`;
  if (isTrig(family)) {
    facts.period = `${family === 'tangent' ? 'π' : '2π'}/|b| = ${numberText((family === 'tangent' ? Math.PI : 2 * Math.PI) / Math.abs(b))} rad.`;
    facts.amplitude = family === 'tangent' ? 'No aplica a tangente: no tiene extremos acotados.' : `|a| = ${numberText(Math.abs(a))}.`;
  }
  const target = -k / a;
  const argumentsAtZero: number[] = [];
  let periodic = '';
  switch (family) {
    case 'affine': argumentsAtZero.push(target); break;
    case 'quadratic': if (target >= 0) argumentsAtZero.push(Math.sqrt(target), -Math.sqrt(target)); break;
    case 'absolute': if (target >= 0) argumentsAtZero.push(target, -target); break;
    case 'root': if (target >= 0) argumentsAtZero.push(target * target); break;
    case 'reciprocal': if (target !== 0) argumentsAtZero.push(1 / target); break;
    case 'exponential': if (target > 0) argumentsAtZero.push(Math.log(target) / Math.log(base)); break;
    case 'logarithmic': argumentsAtZero.push(base ** target); break;
    case 'sine': if (Math.abs(target) <= 1) periodic = `x = ${H} + (${numberText(Math.asin(target))} + 2nπ)/${numberText(b)} o ${H} + (π − ${numberText(Math.asin(target))} + 2nπ)/${numberText(b)}, n ∈ ℤ`; break;
    case 'cosine': if (Math.abs(target) <= 1) periodic = `x = ${H} + (±${numberText(Math.acos(target))} + 2nπ)/${numberText(b)}, n ∈ ℤ`; break;
    case 'tangent': periodic = `x = ${H} + (${numberText(Math.atan(target))} + nπ)/${numberText(b)}, n ∈ ℤ`; break;
  }
  const roots = [...new Set(argumentsAtZero.map(u => h + u / b))].filter(Number.isFinite);
  const y0 = evaluateExploration(family, 0, p);
  facts.intercepts = `Eje x: ${periodic || (roots.length ? roots.map(x => `x ≈ ${numberText(x)}`).join('; ') : 'ninguno')}. Eje y: ${y0 === null ? 'no existe' : `(0; ≈${numberText(y0)})`}.`;
  return facts;
}

export type GraphPoint = { x: number; y: number };
/** Explicit branch keys prevent bridges even when no sample lands on a pole. */
export function explorationSegments(family: ExplorerFamily, p: Transform, min: number, max: number, maxY = 6, count = 600): GraphPoint[][] {
  if (!validTransform(p) || ![min, max, maxY, count].every(Number.isFinite) || max <= min || maxY <= 0 || !Number.isInteger(count) || count < 2 || count > 4000) throw new RangeError('Ventana o presupuesto de muestras inválido.');
  const xs = Array.from({ length: count + 1 }, (_, i) => min + (max - min) * i / count);
  if (p.h > min && p.h < max) xs.push(p.h);
  xs.sort((a, b) => a - b);
  const segments: GraphPoint[][] = [];
  let current: GraphPoint[] = [];
  let previousBranch: number | null = null;
  const flush = () => { if (current.length) segments.push(current); current = []; };
  for (const x of xs) {
    const u = p.b * (x - p.h);
    const branch = family === 'tangent' ? Math.floor((u + Math.PI / 2) / Math.PI) : family === 'reciprocal' ? Math.sign(u) : 0;
    if (previousBranch !== null && branch !== previousBranch) flush();
    previousBranch = branch;
    const y = evaluateExploration(family, x, p);
    if (y === null || Math.abs(y) > maxY) { flush(); continue; }
    current.push({ x, y });
  }
  flush();
  return segments;
}
