import { useId, useState } from 'react';
import { evaluateRootDomain, rootDomainFeatures } from '../../../../packages/math-labs/root-domain';
import { sampleSegments } from '../../../../packages/math-labs';
import './root-domain-lab.css';

const format = (value: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(value);
const ticks = [-6, -4, -2, 0, 2, 4, 6];
const offsets = [-1, 0, 1, 4, 9];
const toX = (x: number) => 30 + (x + 6) * 25;
const toY = (y: number) => 330 - (y + 6) * 25;

/** Standalone free exploration; state is scoped to this instance. */
export function RootDomainLab() {
  const id = useId();
  const [a, setA] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const p = { a, h, k };
  const features = rootDomainFeatures(p)!;
  const formula = `f(x) = ${format(a)}√(x ${h < 0 ? '+' : '−'} ${format(Math.abs(h))}) ${k < 0 ? '−' : '+'} ${format(Math.abs(k))}`;
  const domain = `[${format(features.domain.minimum)}, +∞)`;
  const range = features.range.kind === 'singleton' ? `{${format(k)}}`
    : features.range.kind === 'minimum' ? `[${format(k)}, +∞)` : `(−∞, ${format(k)}]`;
  const description = a === 0
    ? `Con a = 0 el valor es constante, ${format(k)}, solo para x ≥ ${format(h)}. El dominio original se conserva: no se puede evaluar la raíz si x < ${format(h)}.`
    : `La curva ${a > 0 ? 'crece' : 'decrece'} desde el extremo incluido (${format(h)}; ${format(k)}). La raíz exige x − h ≥ 0; por eso x ≥ ${format(h)}.`;
  // Start exactly at the domain boundary, including the closed endpoint.
  const segments = sampleSegments(x => evaluateRootDomain(x, p) ?? NaN, h, 6, 0.04, 6);

  return <section className="zenit-lab-root-domain-root" aria-labelledby={`${id}-heading`}>
    <div className="zenit-lab-root-domain-header">
      <p className="zenit-lab-root-domain-eyebrow">Laboratorio · muestra gratuita</p>
      <h2 className="zenit-lab-root-domain-heading" id={`${id}-heading`}>Descubre el dominio de una raíz</h2>
      <p className="zenit-lab-root-domain-intro">¿Dónde tiene sentido la función? Cambia los parámetros y compara el dominio con la parte visible de la gráfica.</p>
    </div>
    <div className="zenit-lab-root-domain-layout">
      <div className="zenit-lab-root-domain-controls">
        <p className="zenit-lab-root-domain-formula" aria-live="polite" aria-atomic="true">{formula}</p>
        {[
          { key: 'a', label: 'Factor vertical (a)', value: a, set: setA, min: -3, max: 3 },
          { key: 'h', label: 'Inicio del dominio (h)', value: h, set: setH, min: -4, max: 4 },
          { key: 'k', label: 'Traslación vertical (k)', value: k, set: setK, min: -4, max: 4 },
        ].map(control => <div className="zenit-lab-root-domain-control" key={control.key}>
          <label className="zenit-lab-root-domain-label" htmlFor={`${id}-${control.key}`}>{control.label}: {format(control.value)}</label>
          <input className="zenit-lab-root-domain-slider" id={`${id}-${control.key}`} type="range" min={control.min} max={control.max} step="0.5"
            value={control.value} aria-valuetext={format(control.value)} aria-describedby={`${id}-keyboard`}
            onChange={event => control.set(Number(event.currentTarget.value))} />
        </div>)}
        <p className="zenit-lab-root-domain-help" id={`${id}-keyboard`}>Con teclado: usa las flechas para ajustar; Inicio y Fin van a los extremos.</p>
        <p className="zenit-lab-root-domain-description">{description}</p>
        <div className="zenit-lab-root-domain-sets">
          <p className="zenit-lab-root-domain-domain">Dominio: {domain}. El extremo x = {format(h)} está incluido.</p>
          <p className="zenit-lab-root-domain-range">Rango: {range}.</p>
        </div>
        <button className="zenit-lab-root-domain-reset" type="button" onClick={() => { setA(1); setH(0); setK(0); }}>Restablecer valores</button>
      </div>
      <figure className="zenit-lab-root-domain-figure">
        <svg className="zenit-lab-root-domain-graph" viewBox="0 0 370 370" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>Gráfica de {formula}</title>
          <desc id={`${id}-desc`}>{description} Dominio {domain}; rango {range}. La franja sombreada x menor que {format(h)} queda fuera del dominio. La tabla incluye una entrada sin valor real.</desc>
          <rect className="zenit-lab-root-domain-excluded" x="30" y="30" width={toX(h) - 30} height="300" />
          {ticks.map(tick => <g key={tick}>
            <line className="zenit-lab-root-domain-grid" x1={toX(tick)} y1="30" x2={toX(tick)} y2="330" />
            <line className="zenit-lab-root-domain-grid" x1="30" y1={toY(tick)} x2="330" y2={toY(tick)} />
            <text className="zenit-lab-root-domain-tick" x={toX(tick)} y="350" textAnchor="middle">{tick}</text>
            <text className="zenit-lab-root-domain-tick" x="23" y={toY(tick) + 4} textAnchor="end">{tick}</text>
          </g>)}
          <line className="zenit-lab-root-domain-axis" x1="30" y1="180" x2="338" y2="180" />
          <line className="zenit-lab-root-domain-axis" x1="180" y1="330" x2="180" y2="22" />
          <text className="zenit-lab-root-domain-axis-label" x="344" y="175">x</text>
          <text className="zenit-lab-root-domain-axis-label" x="188" y="20">y</text>
          <line className="zenit-lab-root-domain-boundary" x1={toX(h)} y1="30" x2={toX(h)} y2="330" />
          {segments.map((segment, index) => <polyline key={index} className="zenit-lab-root-domain-curve"
            points={segment.map(point => `${toX(point.x)},${toY(point.y)}`).join(' ')} />)}
          <circle className="zenit-lab-root-domain-endpoint" cx={toX(features.endpoint.x)} cy={toY(features.endpoint.y)} r="5" />
        </svg>
        <figcaption className="zenit-lab-root-domain-caption">El punto lleno marca el extremo incluido ({format(h)}; {format(k)}). La franja sombreada queda fuera del dominio. Ventana: −6 ≤ x ≤ 6, −6 ≤ y ≤ 6; no limita el dominio ni el rango.</figcaption>
      </figure>
    </div>
    <table className="zenit-lab-root-domain-table">
      <caption className="zenit-lab-root-domain-table-caption">Entradas y valores: comprueba x ≥ {format(h)}</caption>
      <thead><tr><th className="zenit-lab-root-domain-cell" scope="col">Entrada x</th><th className="zenit-lab-root-domain-cell" scope="col">f(x)</th></tr></thead>
      <tbody>{offsets.map(offset => {
        const x = h + offset;
        const value = evaluateRootDomain(x, p);
        return <tr className={value === null ? 'zenit-lab-root-domain-invalid-row' : 'zenit-lab-root-domain-valid-row'} key={offset}>
          <th className="zenit-lab-root-domain-cell" scope="row">{format(x)}{offset === 0 ? ' (extremo)' : ''}</th>
          <td className="zenit-lab-root-domain-cell">{value === null ? 'Sin valor real: fuera del dominio' : format(value)}</td>
        </tr>;
      })}</tbody>
    </table>
    <p className="zenit-lab-root-domain-help">La tabla puede incluir entradas fuera de la ventana visible. Exploración gratuita sin guardar progreso.</p>
  </section>;
}
