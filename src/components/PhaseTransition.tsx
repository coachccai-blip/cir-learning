import { useEffect } from 'react';
import { useStore } from '../state/store';

// Transition jour/nuit ritualisée (§12.1) : plein écran ~900 ms, la signature
// visuelle du jeu. Respecte prefers-reduced-motion via la règle CSS globale.
export function PhaseTransition() {
  const transition = useStore((s) => s.transition);
  const clearTransition = useStore((s) => s.clearTransition);

  useEffect(() => {
    if (!transition) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(clearTransition, reduced ? 150 : 1100);
    return () => clearTimeout(t);
  }, [transition, clearTransition]);

  if (!transition) return null;
  return (
    <div className={`phase-transition ${transition.phase === 'NIGHT' ? 'to-night' : 'to-day'}`} aria-hidden>
      <div className="phase-transition-label">
        <span className="phase-icon">{transition.phase === 'NIGHT' ? '☾' : '☀'}</span>
        {transition.label}
      </div>
    </div>
  );
}
