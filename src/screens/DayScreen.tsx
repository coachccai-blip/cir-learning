import { STR } from '../i18n/fr';
import { useStore } from '../state/store';
import { useState } from 'react';
import { GaugesBar } from '../components/Gauges';
import { Avatar } from '../avatars/Avatar';
import { AnonymousAvatar } from '../avatars/AnonymousAvatar';
import { clientById } from '../data/clients';
import { mailsForCycle } from '../data/mails';
import { codexById } from '../data/codex';
import type { ClientState } from '../engine/types';
import { nextClientAction, type ClientActionKind } from '../engine/activities';

type DayAction = { label: string; kind: ClientActionKind; cost: number };

/** Libellé FR de l'action moteur : le chrome d'UI reste dans l'i18n. */
function clientAction(cs: ClientState): DayAction | null {
  const action = nextClientAction(cs);
  return action && { ...action, label: STR.activities[action.kind] };
}

export function DayScreen() {
  const save = useStore((s) => s.save);
  const spendPA = useStore((s) => s.spendPA);
  const applyEnergy = useStore((s) => s.applyEnergy);
  const applyGauges = useStore((s) => s.applyGauges);
  const generateProspects = useStore((s) => s.generateProspects);
  const openClientDialogue = useStore((s) => s.openClientDialogue);
  const signClient = useStore((s) => s.signClient);
  const startDialogue = useStore((s) => s.startDialogue);
  const switchPhase = useStore((s) => s.switchPhase);
  const go = useStore((s) => s.go);
  const lastDeltas = useStore((s) => s.lastDeltas);
  const toast = useStore((s) => s.toast);
  const readMail = useStore((s) => s.readMail);
  const unlockCodex = useStore((s) => s.unlockCodex);
  const playSfx = useStore((s) => s.playSfx);
  const [openMail, setOpenMail] = useState<string | null>(null);
  if (!save) return null;

  const mails = mailsForCycle(save.cycle);
  const unreadMails = mails.filter((m) => !save.mailsRead.includes(m.id)).length;

  function doClientAction(cs: ClientState) {
    const a = clientAction(cs);
    if (!a) return;
    if (!spendPA(a.cost)) {
      toast('Pas assez de PA.');
      return;
    }
    if (a.kind === 'proposal') {
      signClient(cs.clientId);
    } else {
      openClientDialogue(cs.clientId, a.kind);
    }
  }

  function rest() {
    if (!spendPA(1)) return;
    applyEnergy(15, STR.activities.rest);
    toast('+15 énergie');
  }

  function networking() {
    if (!spendPA(2)) return;
    generateProspects(3);
    applyGauges({ relation: 4 }, STR.activities.networking);
    toast('3 prospects tièdes ajoutés');
  }

  function callProspect(prospectId: string) {
    if (!spendPA(1)) {
      toast('Pas assez de PA.');
      return;
    }
    playSfx('ring');
    const p = save?.prospects.find((x) => x.id === prospectId);
    startDialogue({
      scenarioId: p?.callScenarioId ?? 'sc_call_curieux',
      kind: 'prospect',
      prospectId,
      returnTo: 'day',
    });
  }

  function toggleMail(id: string) {
    setOpenMail((cur) => (cur === id ? null : id));
    readMail(id);
    const mail = mails.find((m) => m.id === id);
    if (mail?.codexUnlock) unlockCodex(mail.codexUnlock);
  }

  const newProspects = save.prospects.filter((p) => p.status === 'NEW');
  const signedProspects = save.prospects.filter((p) => p.status === 'SIGNED');

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 8 }}>
        <div>
          <h1>{STR.day.title}</h1>
          <p className="muted">{STR.day.subtitle}</p>
        </div>
        <span className="spacer" />
        <button className="btn btn-ghost" onClick={() => go('codex')}>
          {STR.menu.codex}
        </button>
        <button className="btn btn-brand" onClick={switchPhase}>
          {STR.hud.toNight} →
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 20 }}>
        <GaugesBar gauges={save.gauges} deltas={lastDeltas} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)' }}>
        <section className="stack">
          <h3>{STR.day.crm}</h3>
          {save.portfolio.map((cs) => {
            const c = clientById(cs.clientId);
            const action = clientAction(cs);
            return (
              <div className="list-item" key={cs.clientId}>
                <div
                  className="avatar"
                  title={`${STR.common.mood} ${Math.round(cs.mood)}/100`}
                  role="meter"
                  aria-valuenow={Math.round(cs.mood)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Humeur de ${c.contact.name} : ${Math.round(cs.mood)} sur 100`}
                >
                  <Avatar seed={c.contact.avatarSeed} mood={cs.mood} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{c.name}</strong>
                    <span className="tag">{c.sectorLabel}</span>
                    <span className="tag">{'★'.repeat(c.profileDifficulty)}</span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.82rem' }}>
                    {c.contact.name} · {c.contact.role} — {STR.common.trust} {Math.round(cs.trust)}
                  </div>
                  {cs.promise && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-text)' }}>
                      {STR.common.promise} : {cs.promise.min.toLocaleString('fr-FR')}–{cs.promise.max.toLocaleString('fr-FR')} €
                    </div>
                  )}
                </div>
                <div className="stack" style={{ gap: 6 }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => {
                      useStore.setState({ activeClientId: cs.clientId });
                      go('client');
                    }}
                  >
                    {STR.common.client}
                  </button>
                  {action ? (
                    <button className="btn btn-sm btn-primary" onClick={() => doClientAction(cs)} disabled={save.actionPoints < action.cost}>
                      {action.label} ({action.cost})
                    </button>
                  ) : (
                    <span className="tag" title="Rien à faire de jour sur ce dossier">
                      {cs.dossierState === 'CLOSED' || cs.dossierState === 'DEPOSITED'
                        ? 'Mission terminée'
                        : STR.day.handledInTech}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="stack">
          <h3>
            📬 Boîte de réception{' '}
            {unreadMails > 0 && <span className="tag tag-accent">{unreadMails} non lu{unreadMails > 1 ? 's' : ''}</span>}
          </h3>
          {mails.length === 0 && (
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              Rien de nouveau cette semaine.
            </p>
          )}
          {mails.map((m) => {
            const unread = !save.mailsRead.includes(m.id);
            const open = openMail === m.id;
            return (
              <div
                className={`mail-item${unread ? ' unread' : ''}`}
                key={m.id}
                onClick={() => toggleMail(m.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleMail(m.id)}
              >
                <div className="mail-head">
                  <strong style={{ fontSize: '0.85rem' }}>{m.sender}</strong>
                </div>
                <div style={{ fontWeight: unread ? 700 : 500, fontSize: '0.9rem' }}>{m.subject}</div>
                {open && (
                  <div className="mail-body">
                    {m.body}
                    {m.codexUnlock && codexById(m.codexUnlock) && (
                      <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--accent-text)' }}>
                        📄 Fiche liée : « {codexById(m.codexUnlock)!.title} »
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <h3 style={{ marginTop: 8 }}>{STR.day.prospects}</h3>
          <div className="row">
            <button className="btn btn-sm" onClick={networking} disabled={save.actionPoints < 2}>
              {STR.activities.networking} (2)
            </button>
            <button className="btn btn-sm" onClick={rest} disabled={save.actionPoints < 1}>
              {STR.activities.rest} (1)
            </button>
          </div>
          {newProspects.length === 0 && <p className="muted">{STR.day.noProspects}</p>}
          {newProspects.slice(0, 6).map((p) => (
            <div className="list-item" key={p.id}>
              <div className="avatar" title="Interlocuteur au téléphone — visage inconnu avant signature">
                <AnonymousAvatar gender={p.gender} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong>{p.company}</strong>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {p.contactName} · {p.size} sal. — {p.hook}
                </div>
                <div style={{ fontSize: '0.78rem' }}>
                  {STR.common.estimatedCir} : {p.estimatedCir.toLocaleString('fr-FR')} €
                </div>
              </div>
              <button className="btn btn-sm btn-primary" onClick={() => callProspect(p.id)} disabled={save.actionPoints < 1}>
                {STR.activities.prospection} (1)
              </button>
            </div>
          ))}

          {signedProspects.length > 0 && (
            <>
              <h3 style={{ marginTop: 8 }}>🤝 Missions conseil signées</h3>
              {signedProspects.map((p) => (
                <div className="list-item" key={p.id}>
                  <div className="avatar" title={`${p.contactName} — mission conseil`}>
                    <Avatar seed={p.portraitId} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong>{p.company}</strong>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {p.contactName} · {p.size} sal.
                    </div>
                    <div style={{ fontSize: '0.78rem' }} className={p.eligibility === 'NOT_ELIGIBLE' ? 'delta-neg' : 'delta-pos'}>
                      {p.eligibility === 'NOT_ELIGIBLE'
                        ? '⚠ Mission toxique — rien d’éligible'
                        : `CA : ${(p.revenue ?? 0).toLocaleString('fr-FR')} €`}
                    </div>
                  </div>
                  <span className="tag tag-accent">{STR.common.signed}</span>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
