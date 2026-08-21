import { useEffect } from 'react';
import { useStore } from '../state/store';
import { TopBar } from '../components/TopBar';
import { Toasts } from '../components/Toasts';
import { HomeScreen } from '../screens/HomeScreen';
import { ModeScreen } from '../screens/ModeScreen';
import { DayScreen } from '../screens/DayScreen';
import { NightScreen } from '../screens/NightScreen';
import { DialogueScreen } from '../screens/DialogueScreen';
import { QualificationScreen } from '../screens/QualificationScreen';
import { BaseScreen } from '../screens/BaseScreen';
import { JustifScreen } from '../screens/JustifScreen';
import { BilanScreen } from '../screens/BilanScreen';
import { AuditScreen } from '../screens/AuditScreen';
import { EndScreen } from '../screens/EndScreen';
import { CodexScreen } from '../screens/CodexScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { OptionsScreen } from '../screens/OptionsScreen';
import { FreeModeScreen } from '../screens/FreeModeScreen';
import { ClientScreen } from '../screens/ClientScreen';
import { QuizScreen } from '../screens/QuizScreen';

const TEXT_SCALE = { normal: '1', large: '1.25', xlarge: '1.5' };

export function App() {
  const boot = useStore((s) => s.boot);
  const view = useStore((s) => s.view);
  const save = useStore((s) => s.save);
  const options = useStore((s) => s.options);

  useEffect(() => {
    boot();
  }, [boot]);

  // Thème jour/nuit + taille de texte sur <html>
  useEffect(() => {
    const root = document.documentElement;
    const phase = save && (view === 'night' || view === 'audit') ? 'NIGHT' : save?.phase ?? 'DAY';
    root.setAttribute('data-phase', view === 'home' ? 'DAY' : phase);
    root.style.setProperty('--text-scale', TEXT_SCALE[options.textSize]);
  }, [save, view, options.textSize]);

  const chromeless = view === 'home' || view === 'mode' || view === 'end' || view === 'quiz';

  return (
    <div className="app-shell">
      {!chromeless && save && <TopBar />}
      <Toasts />
      <main style={{ flex: 1 }}>
        {view === 'home' && <HomeScreen />}
        {view === 'mode' && <ModeScreen />}
        {view === 'day' && <DayScreen />}
        {view === 'night' && <NightScreen />}
        {view === 'dialogue' && <DialogueScreen />}
        {view === 'qualification' && <QualificationScreen />}
        {view === 'base' && <BaseScreen />}
        {view === 'justif' && <JustifScreen />}
        {view === 'bilan' && <BilanScreen />}
        {view === 'audit' && <AuditScreen />}
        {view === 'end' && <EndScreen />}
        {view === 'codex' && <CodexScreen />}
        {view === 'leaderboard' && <LeaderboardScreen />}
        {view === 'options' && <OptionsScreen />}
        {view === 'freemode' && <FreeModeScreen />}
        {view === 'client' && <ClientScreen />}
        {view === 'quiz' && <QuizScreen />}
      </main>
    </div>
  );
}
