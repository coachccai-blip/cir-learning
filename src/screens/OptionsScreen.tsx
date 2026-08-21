import { useRef } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { persistSave } from '../state/persistence';
import type { Options } from '../state/persistence';
import type { SaveGame } from '../engine/types';

export function OptionsScreen() {
  const go = useStore((s) => s.go);
  const options = useStore((s) => s.options);
  const setOptions = useStore((s) => s.setOptions);
  const resetSave = useStore((s) => s.resetSave);
  const resetJourney = useStore((s) => s.resetJourney);
  const toast = useStore((s) => s.toast);
  const save = useStore((s) => s.save);
  const fileRef = useRef<HTMLInputElement>(null);

  const sizes: Options['textSize'][] = ['normal', 'large', 'xlarge'];

  function exportSave() {
    if (!save) return;
    const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learn-cir-partie.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSave(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as SaveGame;
        if (typeof data.schemaVersion === 'number') {
          persistSave(data);
          useStore.setState({ save: data });
        }
      } catch {
        /* ignoré */
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="container">
      <div className="row">
        <h1>{STR.options.title}</h1>
        <span className="spacer" />
        <button className="btn" onClick={() => go('home')}>
          {STR.common.back}
        </button>
      </div>

      <div className="panel stack" style={{ marginTop: 16 }}>
        <div className="row">
          <strong style={{ width: 200 }}>{STR.options.reduceMotion}</strong>
          <input
            type="checkbox"
            checked={options.reduceMotion}
            onChange={(e) => setOptions({ reduceMotion: e.target.checked })}
          />
        </div>
        <div className="row">
          <strong style={{ width: 200 }}>{STR.options.textSize}</strong>
          {sizes.map((s) => (
            <button
              key={s}
              className={`btn btn-sm${options.textSize === s ? ' btn-primary' : ''}`}
              onClick={() => setOptions({ textSize: s })}
            >
              {STR.options.textSizes[s]}
            </button>
          ))}
        </div>
        <div className="row">
          <strong style={{ width: 200 }}>{STR.options.volume}</strong>
          <input
            type="range"
            min={0}
            max={100}
            value={options.volume}
            onChange={(e) => setOptions({ volume: parseInt(e.target.value, 10) })}
          />
          <span className="muted">{options.volume}%</span>
        </div>
        <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          {STR.options.volumeHint}
        </p>
      </div>

      <div className="panel stack" style={{ marginTop: 16 }}>
        <div className="row">
          <button className="btn" onClick={exportSave} disabled={!save}>
            {STR.options.exportSave}
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            {STR.options.importSave}
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importSave} />
        </div>
        <button
          className="btn"
          style={{ borderColor: 'var(--gauge-security-bad)', color: 'var(--gauge-security-bad)' }}
          onClick={() => {
            if (confirm(STR.options.confirmReset)) resetSave();
          }}
        >
          {STR.options.resetSave}
        </button>
      </div>

      {/* Usage formateur : refaire jouer le parcours entier à quelqu'un
          d'autre suppose de reverrouiller la deuxième saison. */}
      <div className="panel stack" style={{ marginTop: 16 }}>
        <strong>{STR.journey.resetTitle}</strong>
        <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          {STR.journey.resetHelp}
        </p>
        <button
          className="btn"
          onClick={() => {
            resetJourney();
            toast(STR.journey.resetDone);
          }}
        >
          {STR.journey.resetTitle}
        </button>
      </div>
    </div>
  );
}
