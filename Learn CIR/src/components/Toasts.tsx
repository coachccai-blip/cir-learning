import { useStore } from '../state/store';
import { Icon } from '../ui/Icon';

export function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          {t.badge ? (
            <span className="badge-name">
              <Icon name="medal" size={15} />
            </span>
          ) : null}
          {t.text}
        </div>
      ))}
    </div>
  );
}
