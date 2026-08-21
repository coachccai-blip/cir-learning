import { useEffect, useMemo } from 'react';
import { useStore } from '../state/store';
import { rngFromSeed } from '../engine/rng';

// Célébration plein écran : confettis + bandeau. Déclenchée sur les moments
// forts (badge, montée de grade, assiette exacte, contrôle passé).
// Respecte prefers-reduced-motion : le bandeau reste, les confettis sautent.
export function Celebration() {
  const celebration = useStore((s) => s.celebration);
  const clearCelebration = useStore((s) => s.clearCelebration);

  const pieces = useMemo(() => {
    if (!celebration) return [];
    const rng = rngFromSeed(celebration.id);
    const colors = ['#ff6633', '#1fa9ba', '#5da83c', '#f0c419', '#ffffff'];
    return Array.from({ length: 42 }, (_, i) => ({
      i,
      left: rng() * 100,
      delay: rng() * 0.45,
      duration: 1.5 + rng() * 1.1,
      color: colors[Math.floor(rng() * colors.length)],
      rotate: rng() * 360,
      size: 6 + rng() * 7,
    }));
  }, [celebration]);

  useEffect(() => {
    if (!celebration) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(clearCelebration, reduced ? 900 : 2400);
    return () => clearTimeout(t);
  }, [celebration, clearCelebration]);

  if (!celebration) return null;
  const bad = celebration.tone === 'bad';

  return (
    <div className="celebration" aria-live="polite">
      {!bad &&
        pieces.map((p) => (
          <span
            key={p.i}
            className="confetti"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.6,
              background: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      <div className={`celebration-banner${bad ? ' is-bad' : ''}`}>
        <div className="celebration-icon">{celebration.icon}</div>
        <div>
          <div className="celebration-title">{celebration.title}</div>
          {celebration.subtitle && <div className="celebration-sub">{celebration.subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
