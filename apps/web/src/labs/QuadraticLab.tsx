import { useId, useState } from 'react';
import { evaluateQuadratic, quadraticFeatures } from '../../../../packages/math-labs/quadratic';
import { sampleSegments } from '../../../../packages/math-labs';
import './quadratic-lab.css';

const format = (value: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(value);
const samples = [-2, -1, 0, 1, 2];
const ticks = [-6, -4, -2, 0, 2, 4, 6];
const toX = (x: number) => 30 + (x + 6) * 25;
const toY = (y: number) => 330 - (y + 6) * 25;

/** Free standalone exploration; does not read identity or record progress. */
export function QuadraticLab() {
  const id = useId();
  const [a, setA] = useState(1);
  const [h, setH] = useState(0);
  const [k, setK] = useState(0);
  const p = { a, h, k };
  const features = quadraticFeatures(p)!;
  const formula = `f(x) = ${format(a)}(x ${h < 0 ? '+' : '−'} ${format(Math.abs(h))})² ${k < 0 ? '−' : '+'} ${format(Math.abs(k))}`;
  const range = a === 0 ? `{${format(k)}}` : a > 0 ? `[${format(k)}, +∞)` : `(−∞, ${format(k)}]`;
  const description = features.kind === 'constant'
    ? `Con a = 0 la función es constante: f(x) = ${format(k)}. No tiene un vértice único ni un eje de simetría exclusivo; h no cambia la gráfica.`
    : `La parábola abre hacia ${a > 0 ? 'arriba' : 'abajo'}. Su vértice es (${format(h)}; ${format(k)}), su ${a > 0 ? 'mínimo' : 'máximo'} vale ${format(k)} y su eje de simetría es x = ${format(h)}.`;
  const segments = sampleSegments(x => evaluateQuadratic(x, p), -6, 6, 0.04, 6);

  return <section className="zenit-lab-quadratic-root" aria-labelledby={`${id}-heading`}>
    <div className="zenit-lab-quadratic-header">
      <p className="zenit-lab-quadratic-eyebrow">Laboratorio · muestra gratuita</p>
      <h2 className="zenit-lab-quadratic-heading" id={`${id}-heading`}>Explora una función cuadrática</h2>
      <p className="zenit-lab-quadratic-intro">Cambia la apertura y traslada la parábola. Compara la gráfica con sus valores.</p>
    </div>
    <div className="zenit-lab-quadratic-layout">
      <div className="zenit-lab-quadratic-controls">
        <p className="zenit-lab-quadratic-formula" aria-live="polite" aria-atomic="true">{formula}</p>
        {[
          { key: 'a', label: 'Apertura (a)', value: a, set: setA, min: -3, max: 3 },
          { key: 'h', label: 'Traslación horizontal (h)', value: h, set: setH, min: -4, max: 4 },
          { key: 'k', label: 'Traslación vertical (k)', value: k, set: setK, min: -4, max: 4 },
        ].map(control => <div className="zenit-lab-quadratic-control" key={control.key}>
          <label className="zenit-lab-quadratic-label" htmlFor={`${id}-${control.key}`}>{control.label}: {format(control.value)}</label>
          <input className="zenit-lab-quadratic-slider" id={`${id}-${control.key}`} type="range" min={control.min} max={control.max} step="0.5"
            value={control.value} aria-valuetext={format(control.value)} aria-describedby={`${id}-keyboard`}
            onChange={event => control.set(Number(event.currentTarget.value))} />
        </div>)}
        <p className="zenit-lab-quadratic-help" id={`${id}-keyboard`}>Con teclado: usa las flechas para ajustar; Inicio y Fin van a los extremos.</p>
        <p className="zenit-lab-quadratic-description">{description}</p>
        <p className="zenit-lab-quadratic-domain">Dominio: todos los números reales (ℝ). Rango: {range}.</p>
        <button className="zenit-lab-quadratic-reset" type="button" onClick={() => { setA(1); setH(0); setK(0); }}>Restablecer valores</button>
      </div>
      <figure className="zenit-lab-quadratic-figure">
        <svg className="zenit-lab-quadratic-graph" viewBox="0 0 370 370" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>Gráfica de {formula}</title>
          <desc id={`${id}-desc`}>{description} Dominio real; rango {range}. Ventana de −6 a 6 en ambos ejes. Consulta también la tabla.</desc>
          {ticks.map(tick => <g key={tick}>
            <line className="zenit-lab-quadratic-grid" x1={toX(tick)} y1="30" x2={toX(tick)} y2="330" />
            <line className="zenit-lab-quadratic-grid" x1="30" y1={toY(tick)} x2="330" y2={toY(tick)} />
            <text className="zenit-lab-quadratic-tick" x={toX(tick)} y="350" textAnchor="middle">{tick}</text>
            <text className="zenit-lab-quadratic-tick" x="23" y={toY(tick) + 4} textAnchor="end">{tick}</text>
          </g>)}
          <line className="zenit-lab-quadratic-axis" x1="30" y1="180" x2="338" y2="180" />
          <line className="zenit-lab-quadratic-axis" x1="180" y1="330" x2="180" y2="22" />
          <text className="zenit-lab-quadratic-axis-label" x="344" y="175">x</text>
          <text className="zenit-lab-quadratic-axis-label" x="188" y="20">y</text>
          {features.symmetryAxis !== null && <line className="zenit-lab-quadratic-symmetry" x1={toX(h)} y1="30" x2={toX(h)} y2="330" />}
          {segments.map((segment, index) => <polyline key={index} className="zenit-lab-quadratic-curve"
            points={segment.map(point => `${toX(point.x)},${toY(point.y)}`).join(' ')} />)}
          {features.vertex && <circle className="zenit-lab-quadratic-vertex" cx={toX(features.vertex.x)} cy={toY(features.vertex.y)} r="5" />}
        </svg>
        <figcaption className="zenit-lab-quadratic-caption">Ventana: −6 ≤ x ≤ 6, −6 ≤ y ≤ 6. La función continúa fuera de esta vista.{a !== 0 && ' El punto marca el vértice; la línea discontinua indica el eje de simetría.'}</figcaption>
      </figure>
    </div>
    <table className="zenit-lab-quadratic-table">
      <caption className="zenit-lab-quadratic-table-caption">Valores alrededor de h = {format(h)}</caption>
      <thead><tr><th className="zenit-lab-quadratic-cell" scope="col">x</th>{samples.map(offset => <th className="zenit-lab-quadratic-cell" scope="col" key={offset}>{format(h + offset)}</th>)}</tr></thead>
      <tbody><tr><th className="zenit-lab-quadratic-cell" scope="row">f(x)</th>{samples.map(offset => <td className="zenit-lab-quadratic-cell" key={offset}>{format(evaluateQuadratic(h + offset, p))}</td>)}</tr></tbody>
    </table>
    <p className="zenit-lab-quadratic-help">Exploración gratuita sin guardar progreso. La tabla incluye valores que pueden quedar fuera de la ventana gráfica.</p>
  </section>;
}
