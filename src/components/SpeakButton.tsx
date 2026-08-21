import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { STR } from '../i18n/fr';
import { onVoicesReady, speak, speechAvailable, stopSpeaking, type Gender } from '../app/speech';

/**
 * Écoute une réplique au lieu de la lire. Le bouton ne s'affiche que si le
 * système du joueur propose une voix française : mieux vaut pas de bouton
 * qu'un bouton qui lit du français avec un accent anglais.
 */
export function SpeakButton({ text, gender }: { text: string; gender: Gender }) {
  const [available, setAvailable] = useState(speechAvailable);
  const [speaking, setSpeaking] = useState(false);

  // Chrome charge ses voix de façon asynchrone : la première liste est vide.
  useEffect(() => onVoicesReady(() => setAvailable(speechAvailable())), []);

  // Changer de réplique (ou quitter l'écran) coupe la lecture en cours.
  useEffect(() => {
    setSpeaking(false);
    return () => stopSpeaking();
  }, [text]);

  if (!available) return null;

  const toggle = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(text, gender, () => setSpeaking(false));
  };

  return (
    <button
      type="button"
      className={`speak-btn${speaking ? ' is-speaking' : ''}`}
      onClick={toggle}
      aria-label={speaking ? STR.dialogue.stopReading : STR.dialogue.readAloud}
      title={speaking ? STR.dialogue.stopReading : STR.dialogue.readAloud}
    >
      <Icon name={speaking ? 'stop' : 'speaker'} size={16} />
      <span className="speak-waves" aria-hidden>
        <i /><i /><i />
      </span>
    </button>
  );
}
