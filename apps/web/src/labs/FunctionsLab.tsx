import { useId, useState } from 'react';
import { evaluateLinear, sampleSegments } from '../../../../packages/math-labs';
import './functions-lab.css';

const format = (value: number) => new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 }).format(value);

/** Standalone free demonstration. No progress, identity or purchase integration. */
export function FunctionsLab() {
  const id = useId();
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);
  const parameters = { slope, intercept };
  const segments = sampleSegments(x => evaluateLinear(x, parameters));
  const formula = `f(x) = ${format(slope)}x ${intercept < 0 ? '−' : '+'} ${format(Math.abs(intercept))}`;
  const description = slope === 0
    ? `La función es constante: siempre vale ${format(intercept)}.`
    : `La recta es ${slope > 0 ? 'creciente' : 'decreciente'}. Por cada unidad que aumenta x, f(x) cambia ${format(slope)} unidades.`;
  const ticks = [-6, -4, -2, 0, 2, 4, 6];
  const toX = (x: number) => 30 + (x + 6) * 25;
  const toY = (y: number) => 330 - (y + 6) * 25;

  return <section className="zenit-lab-root" aria-labelledby={`${id}-heading`}>
    <header className="zenit-lab-header">
      <p className="zenit-lab-eyebrow">Laboratorio · muestra gratuita</p>
      <h2 className="zenit-lab-heading" id={`${id}-heading`}>Explora una función lineal</h2>
      <p className="zenit-lab-intro">Mueve la pendiente y el corte con el eje vertical. Observa cómo cambia la recta.</p>
    </header>
    <div className="zenit-lab-layout">
      <div className="zenit-lab-controls">
        <p className="zenit-lab-formula" aria-live="polite" aria-atomic="true">{formula}</p>
        <label className="zenit-lab-label" htmlFor={`${id}-slope`}>Pendiente (m): {format(slope)}</label>
        <input className="zenit-lab-slider" id={`${id}-slope`} type="range" min="-4" max="4" step="0.5" value={slope}
          aria-valuetext={format(slope)} aria-describedby={`${id}-keyboard`}
          onChange={event => setSlope(Number(event.currentTarget.value))} />
        <label className="zenit-lab-label" htmlFor={`${id}-intercept`}>Corte vertical (b): {format(intercept)}</label>
        <input className="zenit-lab-slider" id={`${id}-intercept`} type="range" min="-4" max="4" step="0.5" value={intercept}
          aria-valuetext={format(intercept)} aria-describedby={`${id}-keyboard`}
          onChange={event => setIntercept(Number(event.currentTarget.value))} />
        <p className="zenit-lab-help" id={`${id}-keyboard`}>Con teclado: usa las flechas para ajustar; Inicio y Fin van a los extremos.</p>
        <p className="zenit-lab-description">{description} Cruza el eje vertical en (0; {format(intercept)}).</p>
        <button className="zenit-lab-reset" type="button" onClick={() => { setSlope(1); setIntercept(0); }}>Restablecer valores</button>
      </div>
      <figure className="zenit-lab-figure">
        <svg className="zenit-lab-graph" viewBox="0 0 370 370" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
          <title id={`${id}-title`}>Gráfica de {formula}</title>
          <desc id={`${id}-desc`}>{description} Ventana de −6 a 6 en ambos ejes. La tabla ofrece valores de la misma función.</desc>
          {ticks.map(tick => <g key={tick}>
            <line className="zenit-lab-grid" x1={toX(tick)} y1="30" x2={toX(tick)} y2="330" />
            <line className="zenit-lab-grid" x1="30" y1={toY(tick)} x2="330" y2={toY(tick)} />
            <text className="zenit-lab-tick" x={toX(tick)} y="350" textAnchor="middle">{tick}</text>
            <text className="zenit-lab-tick" x="23" y={toY(tick) + 4} textAnchor="end">{tick}</text>
          </g>)}
          <line className="zenit-lab-axis" x1="30" y1="180" x2="338" y2="180" />
          <line className="zenit-lab-axis" x1="180" y1="330" x2="180" y2="22" />
          <text className="zenit-lab-axis-label" x="344" y="175">x</text>
          <text className="zenit-lab-axis-label" x="188" y="20">y</text>
          {segments.map((segment, index) => <polyline key={index} className="zenit-lab-curve"
            points={segment.map(point => `${toX(point.x)},${toY(point.y)}`).join(' ')} />)}
          <circle className="zenit-lab-marker" cx={toX(0)} cy={toY(intercept)} r="5" />
        </svg>
        <figcaption className="zenit-lab-caption">Ventana: −6 ≤ x ≤ 6, −6 ≤ y ≤ 6. La recta continúa fuera de esta vista.</figcaption>
      </figure>
    </div>
    <table className="zenit-lab-table">
      <caption className="zenit-lab-table-caption">Valores de la función actual</caption>
      <thead><tr><th className="zenit-lab-cell" scope="col">x</th>{[-2, -1, 0, 1, 2].map(x => <th className="zenit-lab-cell" scope="col" key={x}>{x}</th>)}</tr></thead>
      <tbody><tr><th className="zenit-lab-cell" scope="row">f(x)</th>{[-2, -1, 0, 1, 2].map(x => <td className="zenit-lab-cell" key={x}>{format(evaluateLinear(x, parameters))}</td>)}</tr></tbody>
    </table>
    <p className="zenit-lab-help">Exploración libre sin guardar progreso. Si m = 0, obtienes una función constante, caso particular de la familia f(x) = mx + b.</p>
  </section>;
}
