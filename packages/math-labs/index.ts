/** Pure, bounded graph utilities. No evaluation of strings or external state. */
export type Point = { x: number; y: number };
export type LinearParameters = { slope: number; intercept: number };

export function evaluateLinear(x: number, { slope, intercept }: LinearParameters): number {
  if (![x, slope, intercept].every(Number.isFinite)) return NaN;
  const y = slope * x + intercept;
  return Number.isFinite(y) ? y : NaN;
}

/** Non-finite and out-of-window samples break the path instead of bridging gaps.
 * Sampling alone cannot identify an arbitrary mathematical discontinuity.
 */
export function sampleSegments(
  evaluate: (x: number) => number,
  min = -6,
  max = 6,
  step = 0.1,
  maxAbsY = 6,
): Point[][] {
  if (![min, max, step, maxAbsY].every(Number.isFinite) ||
      max <= min || step <= 0 || maxAbsY <= 0) {
    throw new RangeError('La ventana y el paso deben ser finitos y válidos.');
  }
  const count = Math.ceil((max - min) / step) + 1;
  if (!Number.isFinite(count) || count > 5000) {
    throw new RangeError('La gráfica admite un máximo de 5000 muestras.');
  }
  const segments: Point[][] = [];
  let current: Point[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.min(max, min + i * step);
    const y = evaluate(x);
    if (Number.isFinite(y) && Math.abs(y) <= maxAbsY) {
      current.push({ x, y });
    } else if (current.length) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length) segments.push(current);
  return segments;
}
