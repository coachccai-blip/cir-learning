// Mini-courbe de tendance d'une jauge sur la saison (échelle fixe 0-100,
// une seule série par graphe — le titre porte l'identité, pas de légende).

interface SparklineProps {
  values: number[];
  color: string;
  label: string;
}

export function Sparkline({ values, color, label }: SparklineProps) {
  const W = 160;
  const H = 36;
  const PAD = 4;
  if (values.length < 2) {
    return (
      <div className="muted" style={{ fontSize: '0.75rem' }}>
        {label} — tendance disponible dès la semaine 2
      </div>
    );
  }
  const x = (i: number) => PAD + (i / (values.length - 1)) * (W - PAD * 2);
  const y = (v: number) => H - PAD - (Math.max(0, Math.min(100, v)) / 100) * (H - PAD * 2);
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const last = values[values.length - 1];
  const first = values[0];
  const delta = last - first;

  return (
    <div role="img" aria-label={`${label} : de ${first} à ${last} sur la saison`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        <span className="muted">{label}</span>
        <span style={{ fontWeight: 700 }}>
          {last}
          <span className={delta >= 0 ? 'delta-pos' : 'delta-neg'} style={{ marginLeft: 4 }}>
            {delta >= 0 ? '+' : ''}
            {delta}
          </span>
        </span>
      </div>
      <svg className="sparkline" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        {/* repère médian discret */}
        <line x1={PAD} x2={W - PAD} y1={y(50)} y2={y(50)} stroke="currentColor" opacity="0.12" strokeDasharray="3 4" />
        <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(values.length - 1)} cy={y(last)} r="3.5" fill={color} stroke="var(--bg-elevated)" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
