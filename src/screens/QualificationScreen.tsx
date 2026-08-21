import { useState } from 'react';
import { STR } from '../i18n/fr';
import { Icon } from '../ui/Icon';
import { useStore } from '../state/store';
import { clientById } from '../data/clients';
import { cardsetById } from '../data/cards';
import { codexById } from '../data/codex';
import type { CardVerdict } from '../engine/types';

const COLS: { key: CardVerdict; label: string }[] = [
  { key: 'RD', label: STR.qualification.columns.RD },
  { key: 'CII', label: STR.qualification.columns.CII },
  { key: 'NONE', label: STR.qualification.columns.NONE },
  { key: 'INVESTIGATE', label: STR.qualification.columns.INVESTIGATE },
];

export function QualificationScreen() {
  const clientId = useStore((s) => s.activeClientId);
  const commit = useStore((s) => s.commitQualification);
  const go = useStore((s) => s.go);
  const markCodexRead = useStore((s) => s.markCodexRead);
  const [placements, setPlacements] = useState<Record<string, CardVerdict>>({});
  const [feedbackId, setFeedbackId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!clientId) return null;
  const c = clientById(clientId);
  const cardset = cardsetById(c.cardsetId);

  const placedCount = Object.keys(placements).length;
  const allPlaced = placedCount === cardset.cards.length;

  function place(cardId: string, col: CardVerdict) {
    setPlacements((p) => ({ ...p, [cardId]: col }));
    setFeedbackId(cardId);
  }

  const feedbackCard = feedbackId ? cardset.cards.find((c) => c.id === feedbackId) : null;
  const feedbackPlaced = feedbackId ? placements[feedbackId] : null;
  const correct = feedbackCard && feedbackPlaced ? feedbackPlaced === feedbackCard.verdict || feedbackPlaced === 'INVESTIGATE' : false;

  function validate() {
    commit(clientId!, placements);
    setDone(true);
  }

  if (done) {
    let correctN = 0;
    let invest = 0;
    for (const card of cardset.cards) {
      const p = placements[card.id];
      if (p === 'INVESTIGATE') invest++;
      else if (p === card.verdict) correctN++;
    }
    const pct = Math.round((correctN / cardset.cards.length) * 100);
    return (
      <div className="container">
        <h1>{STR.qualification.result}</h1>
        <div className="panel" style={{ marginTop: 16 }}>
          <p className="assiette-total">{pct}%</p>
          <p>
            {correctN} / {cardset.cards.length} cartes correctement classées, {invest} à investiguer.
          </p>
          <p className="muted">{STR.qualification.investigateNote}</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => go('night')}>
            {STR.common.back}
          </button>
        </div>
      </div>
    );
  }

  const unplaced = cardset.cards.filter((c) => !placements[c.id]);

  return (
    <div className="container">
      <div className="row">
        <div>
          <h1>{STR.qualification.title}</h1>
          <p className="muted">
            {c.name} — {STR.qualification.intro}
          </p>
        </div>
        <span className="spacer" />
        <span className="tag">
          {unplaced.length} {STR.qualification.remaining}
        </span>
      </div>

      {feedbackCard && (
        <div className="feedback" style={{ marginTop: 12 }}>
          <div className="panel-title" style={{ marginBottom: 6 }}>
            <Icon name={correct ? 'check' : 'cross'} size={19} className={correct ? 'ink-ok' : 'ink-bad'} />
            <h3>{feedbackCard.title}</h3>
          </div>
          <div>{feedbackCard.explanation}</div>
          {feedbackCard.codexRef && codexById(feedbackCard.codexRef) && (
            <button
              className="btn btn-sm"
              style={{ marginTop: 8 }}
              onClick={() => markCodexRead(feedbackCard.codexRef!)}
            >
              <Icon name="doc" size={15} /> {STR.qualification.readSheet(codexById(feedbackCard.codexRef)!.title)}
            </button>
          )}
        </div>
      )}

      <div className="panel" style={{ marginTop: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Travaux à classer</h3>
        {unplaced.length === 0 ? (
          <p className="muted">Toutes les cartes sont classées.</p>
        ) : (
          <div className="work-card">
            <strong>{unplaced[0].title}</strong>
            <p style={{ fontSize: '0.9rem', margin: '6px 0' }}>{unplaced[0].description}</p>
            <div className="clues">
              {unplaced[0].clues.map((cl, i) => (
                <span className="clue" key={i}>
                  {cl}
                </span>
              ))}
            </div>
            <div className="card-actions">
              {COLS.map((col) => (
                <button key={col.key} onClick={() => place(unplaced[0].id, col.key)}>
                  {col.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="qual-board" style={{ marginTop: 16 }}>
        {COLS.map((col) => (
          <div className="qual-col" key={col.key}>
            <h4>{col.label}</h4>
            {cardset.cards
              .filter((c) => placements[c.id] === col.key)
              .map((c) => (
                <div className="work-card" key={c.id} style={{ fontSize: '0.78rem' }}>
                  {c.title}
                </div>
              ))}
          </div>
        ))}
      </div>

      <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
        <button className="btn" onClick={() => go('night')}>
          {STR.common.back}
        </button>
        <button className="btn btn-primary" onClick={validate} disabled={!allPlaced}>
          {STR.qualification.validate}
        </button>
      </div>
    </div>
  );
}
