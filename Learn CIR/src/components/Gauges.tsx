import { STR } from '../i18n/fr';
import type { Gauges } from '../engine/types';

const GAUGE_META: { key: keyof Gauges; label: string; color: (v: number) => string }[] = [
  { key: 'relation', label: STR.gauges.relation, color: () => 'var(--gauge-relation)' },
  {
    key: 'security',
    label: STR.gauges.security,
    color: (v) => {
      // Vert = sûr, rouge foncé = danger
      const t = v / 100;
      return t > 0.6 ? 'var(--gauge-security-good)' : t > 0.35 ? '#d9a441' : 'var(--gauge-security-bad)';
    },
  },
  { key: 'profitability', label: STR.gauges.profitability, color: () => 'var(--gauge-profitability)' },
];

export function GaugesBar({ gauges, deltas }: { gauges: Gauges; deltas?: Partial<Gauges> | null }) {
  return (
    <div className="gauges" role="group" aria-label="Jauges métier">
      {GAUGE_META.map((g) => {
        const v = gauges[g.key];
        const d = deltas?.[g.key];
        return (
          <div
            className={`gauge${d && d < 0 && Math.abs(d) >= 8 ? ' shake' : ''}`}
            key={g.key}
            role="meter"
            aria-valuenow={v}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${g.label} : ${v} sur 100`}
          >
            <div className="gauge-head">
              <span>{g.label}</span>
              <span className="val">
                {v}
                {d ? <span className={`gauge-delta ${d > 0 ? 'delta-pos' : 'delta-neg'}`}>{d > 0 ? `+${d}` : d}</span> : null}
              </span>
            </div>
            <div className="gauge-track">
              <div className="gauge-fill" style={{ width: `${v}%`, background: g.color(v) }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
