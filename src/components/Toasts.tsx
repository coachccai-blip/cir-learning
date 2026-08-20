import { useStore } from '../state/store';

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.badge ? <span className="badge-name">🏅 </span> : null}
          {t.text}
        </div>
      ))}
    </div>
  );
}
