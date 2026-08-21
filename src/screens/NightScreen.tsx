import { STR } from '../i18n/fr';
import { Icon } from '../ui/Icon';
import { useStore } from '../state/store';
import { GaugesBar } from '../components/Gauges';
import { clientById } from '../data/clients';
import type { ClientState, DossierState } from '../engine/types';

function nightAction(cs: ClientState): { label: string; view: 'qualification' | 'base' | 'justif'; cost: number } | null {
  const map: Partial<Record<DossierState, { label: string; view: 'qualification' | 'base' | 'justif'; cost: number }>> = {
    KICKED_OFF: { label: STR.activities.qualification, view: 'qualification', cost: 2 },
    SIGNED: { label: STR.activities.qualification, view: 'qualification', cost: 2 },
    CARDS_DONE: { label: STR.activities.base, view: 'base', cost: 2 },
    BASE_DONE: { label: STR.activities.justification, view: 'justif', cost: 2 },
  };
  return map[cs.dossierState] ?? null;
}

export function NightScreen() {
  const save = useStore((s) => s.save);
  const spendPA = useStore((s) => s.spendPA);
  const go = useStore((s) => s.go);
  const applyEnergy = useStore((s) => s.applyEnergy);
  const lastDeltas = useStore((s) => s.lastDeltas);
  const toast = useStore((s) => s.toast);
  if (!save) return null;

  const dossiers = save.portfolio.filter(
    (cs) => cs.dossierState !== 'LEAD' && cs.dossierState !== 'QUALIFIED' && cs.dossierState !== 'LOST',
  );

  function openMinigame(cs: ClientState) {
    const a = nightAction(cs);
    if (!a) return;
    if (!spendPA(a.cost)) {
      toast('Pas assez de PA.');
      return;
    }
    useStore.setState({ activeClientId: cs.clientId });
    go(a.view);
  }

  function overtime() {
    if (save?.overtimeUsedThisNight) {
      toast('Heures sup déjà utilisées cette nuit.');
      return;
    }
    applyEnergy(-20, STR.activities.overtime);
    useStore.setState({ save: save ? { ...save, actionPoints: save.actionPoints + 2, overtimeUsedThisNight: true } : save });
    toast('+2 PA, −20 énergie');
  }

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 8 }}>
        <div>
          <h1>{STR.night.title}</h1>
          <p className="muted">{STR.night.subtitle}</p>
        </div>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={() => go('codex')}>
          <Icon name="book" size={17} /> {STR.menu.codex}
        </button>
        <button className="btn btn-sm" onClick={overtime} disabled={save.overtimeUsedThisNight}>
          <Icon name="clock" size={15} /> {STR.activities.overtime}
        </button>
        <button className="btn btn-brand" onClick={() => go('bilan')}>
          <Icon name="arrowRight" size={17} /> {STR.hud.toBilan}
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <GaugesBar gauges={save.gauges} deltas={lastDeltas} />
      </div>

      <div className="panel-title">
        <Icon name="doc" size={19} />
        <h3>{STR.night.dossiers}</h3>
      </div>
      {dossiers.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 'var(--sp-6)' }}>
          <Icon name="technique" size={40} className="empty-icon" />
          <p className="muted">{STR.night.noDossiers}</p>
          {(() => {
            const lead = save.portfolio.find((cs) => cs.dossierState === 'LEAD' || cs.dossierState === 'QUALIFIED');
            const tip = lead
              ? lead.dossierState === 'LEAD'
                ? STR.night.tipDiscovery(clientById(lead.clientId).name)
                : STR.night.tipProposal(clientById(lead.clientId).name)
              : STR.night.tipCodex;
            return (
              <div className="note note-info" style={{ marginTop: 12, textAlign: 'left' }}>
                <Icon name="bulb" size={16} />
                <span>{tip}</span>
              </div>
            );
          })()}
        </div>
      )}
      <div className="stack">
        {dossiers.map((cs) => {
          const c = clientById(cs.clientId);
          const a = nightAction(cs);
          return (
            <div className="list-item" key={cs.clientId}>
              <div className="list-main">
                <strong>{c.name}</strong>
                <div className="muted" style={{ fontSize: '0.82rem' }}>
                  {c.sectorLabel} · {dossierLabel(cs.dossierState)}
                </div>
                <div className="row" style={{ gap: 6, marginTop: 6 }}>
                  {cs.scores.qualification !== null && (
                    <span className="tag">
                      <Icon name="cards" size={13} /> {STR.night.scoreQualif(cs.scores.qualification)}
                    </span>
                  )}
                  {cs.scores.base !== null && (
                    <span className="tag">
                      <Icon name="euro" size={13} /> {STR.night.scoreBase(Math.round(cs.scores.base * 100))}
                    </span>
                  )}
                  {cs.scores.justification !== null && (
                    <span className="tag">
                      <Icon name="doc" size={13} /> {STR.night.scoreJustif(cs.scores.justification)}
                    </span>
                  )}
                  {cs.piecesCollected.length > 0 && (
                    <span className="tag tag-accent">
                      <Icon name="shield" size={13} /> {STR.night.pieces(cs.piecesCollected.length)}
                    </span>
                  )}
                </div>
              </div>
              <div className="list-actions">
              {a ? (
                <button className="btn btn-primary" onClick={() => openMinigame(cs)} disabled={save.actionPoints < a.cost}>
                  <Icon name="play" size={15} /> {a.label} ({a.cost})
                </button>
              ) : (
                <span className="tag tag-ok">
                  <Icon name="check" size={13} /> {STR.night.ready}
                </span>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function dossierLabel(s: DossierState): string {
  const map: Record<DossierState, string> = {
    LEAD: 'Lead',
    QUALIFIED: 'Qualifié',
    SIGNED: 'Signé — à cadrer',
    KICKED_OFF: 'Cadré — à qualifier',
    CARDS_DONE: 'Qualifié — assiette à monter',
    BASE_DONE: 'Assiette faite — justificatif à rédiger',
    JUSTIFIED: 'Dossier complet',
    CLOSED: 'Bilan fait',
    DEPOSITED: 'Déposé',
    LOST: 'Perdu',
  };
  return map[s];
}
