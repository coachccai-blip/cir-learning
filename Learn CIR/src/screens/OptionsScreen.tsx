import { useEffect, useRef, useState } from 'react';
import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { persistSave } from '../state/persistence';
import type { Options } from '../state/persistence';
import type { SaveGame } from '../engine/types';
import { frenchVoices, onVoicesReady, speak, type Gender } from '../app/speech';
import { Icon } from '../ui/Icon';

export function OptionsScreen() {
  const go = useStore((s) => s.go);
  const options = useStore((s) => s.options);
  const setOptions = useStore((s) => s.setOptions);
  const resetSave = useStore((s) => s.resetSave);
  const save = useStore((s) => s.save);
  const fileRef = useRef<HTMLInputElement>(null);

  const sizes: Options['textSize'][] = ['normal', 'large', 'xlarge'];

  // Les voix arrivent de façon asynchrone dans Chrome : la première liste est
  // souvent vide, il faut réécouter.
  const [voices, setVoices] = useState(() => frenchVoices().map((v) => v.name));
  useEffect(() => onVoicesReady(() => setVoices(frenchVoices().map((v) => v.name))), []);

  function voiceRow(gender: Gender) {
    const key = gender === 'F' ? 'voiceF' : 'voiceM';
    const current = options[key] ?? '';
    return (
      <div className="row" key={key}>
        <strong style={{ width: 200 }}>
          {gender === 'F' ? STR.voices.female : STR.voices.male}
        </strong>
        <select
          value={current}
          onChange={(e) => setOptions({ [key]: e.target.value || undefined } as Partial<Options>)}
          style={{
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-elevated)',
            color: 'var(--text)',
            maxWidth: 320,
          }}
        >
          <option value="">{STR.voices.auto}</option>
          {voices.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          className="btn btn-sm"
          onClick={() =>
            speak(gender === 'F' ? STR.voices.sampleF : STR.voices.sampleM, gender, undefined, options[key])
          }
        >
          <Icon name="speaker" size={15} /> {STR.voices.test}
        </button>
      </div>
    );
  }

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

      {/* Une seule voix française installée, et tous les personnages se
          ressemblent : la déduction par le nom ne peut alors rien. Ce réglage
          est la porte de sortie. */}
      <div className="panel stack" style={{ marginTop: 16 }}>
        <strong>{STR.voices.title}</strong>
        <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          {STR.voices.help}
        </p>
        {voices.length === 0 ? (
          <div className="note note-locked">
            <Icon name="info" size={16} />
            <span>{STR.voices.none}</span>
          </div>
        ) : (
          <>
            {voiceRow('F')}
            {voiceRow('M')}
          </>
        )}
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

    </div>
  );
}
