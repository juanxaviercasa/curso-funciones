import { useId, useState } from 'react';
import { baseFormula, canonicalValue, evaluateExploration, explorationFacts, explorationSegments, familyNames, initialTransform, numberText, type ExplorerFamily, type Transform } from '../../../../packages/math-labs/exploration';
import './exploration-labs.css';

type Activity = { title: string; prompt: string; family: ExplorerFamily; p: Transform; explanation: string };
const families: ExplorerFamily[] = ['affine', 'quadratic', 'absolute', 'root', 'reciprocal', 'exponential', 'logarithmic'];
const trigFamilies: ExplorerFamily[] = ['sine', 'cosine', 'tangent'];
const activitySet = (trig: boolean): Activity[] => trig ? [
  { title: '1. Anticipa período y rango', prompt: 'Para g(x)=2·sen(2(x−π/2))+1, predice período y rango. Explica por qué el desplazamiento horizontal no altera ninguno de ellos.', family: 'sine', p: { a: 2, b: 2, h: Math.PI / 2, k: 1, base: 2 }, explanation: 'El período es 2π/2=π rad y el rango [−1,3]. h traslada la gráfica; |a| cambia la amplitud y k su altura central. Comprueba máximos y mínimos.' },
  { title: '2. Una constante con exclusiones', prompt: 'Para g(x)=0·tan(x)+2, ¿la gráfica puede contener x=π/2? Predice dominio y rango antes de contrastar.', family: 'tangent', p: { ...initialTransform, a: 0, k: 2 }, explanation: 'La expresión conserva los polos originales x=π/2+nπ. El rango es {2}; son huecos, no asíntotas verticales de la función constante restringida. Observa los círculos abiertos y la tabla.' },
] : [
  { title: '1. El cero no borra el dominio', prompt: 'Para g(x)=0·√(−(x−2))+1, predice dominio y rango. ¿Se admite x=3? Justifica desde el argumento de la raíz.', family: 'root', p: { a: 0, b: -1, h: 2, k: 1, base: 2 }, explanation: '−(x−2)≥0 exige x≤2, incluso con a=0. Dominio (−∞,2], rango {1}; x=3 no tiene valor real. El punto extremo está incluido.' },
  { title: '2. Lee la expresión antes de la curva', prompt: 'Para g(x)=−log₂(2(x−1)), predice dominio, corte con el eje x y sentido de variación. ¿La línea x=1 pertenece a la gráfica?', family: 'logarithmic', p: { a: -1, b: 2, h: 1, k: 0, base: 2 }, explanation: 'El argumento debe ser positivo: x>1. El corte cumple 2(x−1)=1, por tanto x=1,5. Es decreciente y tiene asíntota vertical x=1, que está excluida.' },
];

/** Internal shared presentation; exported public labs remain prop-free. */
export function ExplorationPanel({ trig }: { trig: boolean }) {
  const id = useId();
  const [family, setFamily] = useState<ExplorerFamily>(trig ? 'sine' : 'affine');
  const [p, setP] = useState<Transform>({ ...initialTransform });
  const [predictions, setPredictions] = useState(['', '']);
  const [compared, setCompared] = useState([false, false]);
  const [activeActivity, setActiveActivity] = useState<number | null>(null);
  const facts = explorationFacts(family, p)!;
  const limit = trig ? 2 * Math.PI : 6;
  const toX = (x: number) => 38 + (x + limit) / (2 * limit) * 320;
  const toY = (y: number) => 338 - (y + 6) / 12 * 300;
  const ticks = trig ? [-2 * Math.PI, -Math.PI, 0, Math.PI, 2 * Math.PI] : [-6, -3, 0, 3, 6];
  const xText = (x: number) => trig && Math.abs(x / Math.PI * 2 - Math.round(x / Math.PI * 2)) < 1e-8
    ? (x === 0 ? '0' : `${x < 0 ? '−' : ''}${Math.abs(x) === Math.PI ? '' : Math.abs(x) === Math.PI / 2 ? '' : numberText(Math.abs(x) / Math.PI)}π${Math.abs(x) === Math.PI / 2 ? '/2' : ''}`)
    : numberText(x);
  const base = explorationSegments(family, { ...initialTransform, base: p.base }, -limit, limit);
  const transformed = explorationSegments(family, p, -limit, limit);
  const tableX = p.b === 0 ? [-2, -1, 0, 1, 2] : (trig ? [-Math.PI, -Math.PI / 2, 0, Math.PI / 2, Math.PI] : [-1, 0, 1, 4]).map(u => p.h + u / p.b).sort((a, b) => a - b);
  const poles: number[] = [];
  if (p.b !== 0 && (family === 'reciprocal' || family === 'logarithmic')) poles.push(p.h);
  if (p.b !== 0 && family === 'tangent') {
    for (let n = -20; n <= 20; n++) { const x = p.h + (Math.PI / 2 + n * Math.PI) / p.b; if (x >= -limit && x <= limit) poles.push(x); }
  }
  const setParameter = (key: keyof Transform, value: number) => { setP(previous => ({ ...previous, [key]: value })); setActiveActivity(null); };
  const formula = `g(x) = ${numberText(p.a)} · f(${numberText(p.b)} · (x − (${numberText(p.h)}))) + (${numberText(p.k)})`;
  const reset = () => { setP({ ...initialTransform }); setActiveActivity(null); };

  return <section className="zenit-lab-explore-root" aria-labelledby={`${id}-heading`}>
    <div className="zenit-lab-explore-header">
      <p className="zenit-lab-explore-eyebrow">Exploración preuniversitaria · gratuita</p>
      <h2 className="zenit-lab-explore-heading" id={`${id}-heading`}>{trig ? 'Trigonometría: predice y contrasta' : 'Familias de funciones: compara y explica'}</h2>
      <p className="zenit-lab-explore-intro">Relaciona expresión, tabla y gráfica. Practica dominio, transformaciones y justificación; sin afiliación ni alineación oficial con UNMSM, UNI o PUCP.</p>
    </div>
    <div className="zenit-lab-explore-layout">
      <div className="zenit-lab-explore-controls">
        <label className="zenit-lab-explore-label" htmlFor={`${id}-family`}>Familia</label>
        <select className="zenit-lab-explore-select" id={`${id}-family`} value={family} onChange={event => { setFamily(event.target.value as ExplorerFamily); setActiveActivity(null); }}>
          {(trig ? trigFamilies : families).map(value => <option value={value} key={value}>{familyNames[value]}</option>)}
        </select>
        {(family === 'exponential' || family === 'logarithmic') && <>
          <label className="zenit-lab-explore-label" htmlFor={`${id}-base`}>Base (positiva y distinta de 1)</label>
          <select className="zenit-lab-explore-select" id={`${id}-base`} value={p.base} onChange={event => setParameter('base', Number(event.target.value))}>
            <option value="2">2</option><option value="3">3</option><option value="0.5">0,5</option>
          </select>
        </>}
        <p className="zenit-lab-explore-formula" aria-live="polite" aria-atomic="true">f(x) = {baseFormula(family, p.base)}<br />{formula}</p>
        {(['a', 'b', 'h', 'k'] as const).map(key => <div className="zenit-lab-explore-control" key={key}>
          <label className="zenit-lab-explore-label" htmlFor={`${id}-${key}`}>{({ a: 'Factor vertical (a)', b: 'Factor horizontal (b)', h: trig ? 'Desplazamiento (h), rad' : 'Desplazamiento (h)', k: 'Traslación vertical (k)' })[key]}: {trig && key === 'h' ? xText(p[key]) : numberText(p[key])}</label>
          <input className="zenit-lab-explore-slider" id={`${id}-${key}`} type="range" min={trig && key === 'h' ? -4 : -3} max={trig && key === 'h' ? 4 : 3} step={trig && key === 'h' ? 1 : 0.5} value={trig && key === 'h' ? p.h / (Math.PI / 4) : p[key]}
            aria-valuetext={trig && key === 'h' ? `${xText(p[key])} radianes` : numberText(p[key])} aria-describedby={`${id}-keyboard`}
            onChange={event => setParameter(key, Number(event.currentTarget.value) * (trig && key === 'h' ? Math.PI / 4 : 1))} />
        </div>)}
        <p className="zenit-lab-explore-help" id={`${id}-keyboard`}>Teclado: flechas para ajustar; Inicio y Fin para los extremos. {trig ? 'Todos los ángulos se miden en radianes.' : 'b negativo refleja horizontalmente la función.'}</p>
        <button className="zenit-lab-explore-button" type="button" onClick={reset}>Restablecer parámetros</button>
      </div>
      <div className="zenit-lab-explore-visual">
        <figure className="zenit-lab-explore-figure">
          <svg className="zenit-lab-explore-graph" viewBox="0 0 396 385" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
            <title id={`${id}-title`}>{familyNames[family]}: comparación de f y g</title>
            <desc id={`${id}-desc`}>Base azul discontinua, transformada naranja continua. Dominio de g: {facts.domain}. Rango: {facts.range}. Los polos separan ramas; la ventana no limita el dominio. Valores también disponibles en tabla.</desc>
            {ticks.map(tick => <g key={tick}>
              <line className="zenit-lab-explore-grid" x1={toX(tick)} x2={toX(tick)} y1="38" y2="338" />
              <text className="zenit-lab-explore-tick" x={toX(tick)} y="358" textAnchor="middle">{xText(tick)}</text>
            </g>)}
            {[-6, -3, 0, 3, 6].map(tick => <g key={tick}>
              <line className="zenit-lab-explore-grid" x1="38" x2="358" y1={toY(tick)} y2={toY(tick)} />
              <text className="zenit-lab-explore-tick" x="29" y={toY(tick) + 4} textAnchor="end">{tick}</text>
            </g>)}
            <line className="zenit-lab-explore-axis" x1="38" x2="366" y1={toY(0)} y2={toY(0)} />
            <line className="zenit-lab-explore-axis" x1={toX(0)} x2={toX(0)} y1="30" y2="338" />
            <text className="zenit-lab-explore-tick" x="372" y={toY(0) - 5}>x</text>
            <text className="zenit-lab-explore-tick" x={toX(0) + 8} y="28">y</text>
            {base.map((segment, index) => <polyline className="zenit-lab-explore-base" key={`base-${index}`} points={segment.map(point => `${toX(point.x)},${toY(point.y)}`).join(' ')} />)}
            {transformed.map((segment, index) => <polyline className="zenit-lab-explore-transformed" key={`g-${index}`} points={segment.map(point => `${toX(point.x)},${toY(point.y)}`).join(' ')} />)}
            {poles.filter(x => x >= -limit && x <= limit).map((x, i) => p.a === 0
              ? <circle className="zenit-lab-explore-hole" key={i} cx={toX(x)} cy={toY(p.k)} r="4" />
              : <line className="zenit-lab-explore-pole" key={i} x1={toX(x)} x2={toX(x)} y1="38" y2="338" />)}
            {family === 'root' && p.b !== 0 && <circle className="zenit-lab-explore-endpoint" cx={toX(p.h)} cy={toY(p.k)} r="4" />}
          </svg>
          <figcaption className="zenit-lab-explore-caption">Azul discontinua: f. Naranja continua: g. Ventana x∈[{trig ? '−2π,2π' : '−6,6'}], y∈[−6,6]. Líneas verticales punteadas: polos de g; círculos abiertos: huecos cuando a=0. Punto lleno: extremo incluido de raíz. Dominio y rango pueden continuar fuera de esta vista.</figcaption>
        </figure>
        <dl className="zenit-lab-explore-facts">
          {([['Dominio de g', facts.domain], ['Rango de g', facts.range], ['Cortes con los ejes', facts.intercepts], ['Simetría', facts.symmetry], ['Monotonía', facts.monotonicity], ['Asíntotas', facts.asymptotes], ...(trig ? [['Período', facts.period], ['Amplitud', facts.amplitude]] : [])]).map(([term, value]) => <div className="zenit-lab-explore-fact" key={term}><dt className="zenit-lab-explore-term">{term}</dt><dd className="zenit-lab-explore-definition">{value}</dd></div>)}
        </dl>
      </div>
    </div>
    <p className="zenit-lab-explore-help">a=0 conserva las restricciones originales. b=0 evalúa f(0): si f(0) no existe, el dominio es vacío. Los valores numéricos se muestran aproximados; E indica potencia de 10. Cerca de ceros trigonométricos puede haber residuos numéricos diminutos.</p>
    <table className="zenit-lab-explore-table"><caption className="zenit-lab-explore-table-caption">Contrasta valores en la misma entrada x</caption>
      <thead><tr>{['x', 'f(x)', 'g(x)'].map(label => <th className="zenit-lab-explore-cell" scope="col" key={label}>{label}</th>)}</tr></thead>
      <tbody>{tableX.map((x, i) => { const f = canonicalValue(family, x, p.base); const g = evaluateExploration(family, x, p); return <tr key={i}><th className="zenit-lab-explore-cell" scope="row">{trig ? xText(x) : numberText(x)}</th><td className="zenit-lab-explore-cell">{f === null ? 'Sin valor real finito' : numberText(f)}</td><td className="zenit-lab-explore-cell">{g === null ? 'Sin valor real finito' : numberText(g)}</td></tr>; })}</tbody>
    </table>
    <div className="zenit-lab-explore-activities" aria-labelledby={`${id}-activities`}>
      <h3 className="zenit-lab-explore-subheading" id={`${id}-activities`}>Predice, contrasta y justifica</h3>
      {activitySet(trig).map((activity, i) => <article className="zenit-lab-explore-activity" key={activity.title}>
        <h4 className="zenit-lab-explore-activity-title">{activity.title}</h4><p className="zenit-lab-explore-prompt">{activity.prompt}</p>
        <label className="zenit-lab-explore-label" htmlFor={`${id}-prediction-${i}`}>Tu predicción</label>
        <textarea className="zenit-lab-explore-textarea" id={`${id}-prediction-${i}`} maxLength={1500} value={predictions[i]} onChange={event => setPredictions(previous => previous.map((text, index) => index === i ? event.target.value : text))} />
        <button className="zenit-lab-explore-button" type="button" disabled={!predictions[i].trim()} onClick={() => { setP({ ...activity.p }); setFamily(activity.family); setCompared(previous => previous.map((value, index) => index === i ? true : value)); setActiveActivity(i); }}>Contrastar en la gráfica</button>
        {compared[i] && <div className="zenit-lab-explore-feedback">
          <p className="zenit-lab-explore-status" role="status">{activeActivity === i ? 'Escenario de esta actividad cargado en la gráfica.' : 'La gráfica actual pudo cambiar. Pulsa Contrastar para volver a este escenario.'}</p>
          <p className="zenit-lab-explore-explanation">{activity.explanation}</p>
          <label className="zenit-lab-explore-label" htmlFor={`${id}-explain-${i}`}>¿Qué confirma o corrige tu predicción? Justifica usando tabla, gráfica y expresión.</label>
          <textarea className="zenit-lab-explore-textarea" id={`${id}-explain-${i}`} maxLength={1500} />
        </div>}
      </article>)}
    </div>
    <p className="zenit-lab-explore-help">Actividades originales de muestra, sin calificación automática. Tus textos y parámetros no se guardan ni se envían. No otorgan acceso ni modifican progreso.</p>
  </section>;
}
