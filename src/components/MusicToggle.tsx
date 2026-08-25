import { useEffect } from 'react';
import { Icon } from '../ui/Icon';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { armMusic, setMusicEnabled } from '../app/music';

/**
 * Coupe-musique, en haut à droite de tous les écrans.
 *
 * Il vit hors des écrans plutôt que dans le bandeau : l'accueil, le quiz et le
 * bilan n'ont pas de bandeau, et une musique qu'on ne peut couper que sur
 * certaines pages est une musique qu'on subit. Le choix est mémorisé avec les
 * autres options.
 */
export function MusicToggle() {
  const music = useStore((s) => s.options.music);
  const setOptions = useStore((s) => s.setOptions);

  // Les navigateurs refusent de démarrer un contexte audio tant que le joueur
  // n'a rien touché : on retient l'intention, le premier clic la réalise.
  useEffect(() => armMusic(), []);
  useEffect(() => setMusicEnabled(music), [music]);

  const label = music ? STR.music.on : STR.music.off;
  return (
    <button
      type="button"
      className={`music-toggle${music ? '' : ' is-muted'}`}
      onClick={() => setOptions({ music: !music })}
      aria-pressed={!music}
      aria-label={label}
      title={label}
    >
      <Icon name={music ? 'speaker' : 'speakerOff'} size={18} />
    </button>
  );
}
