import { STR } from '../i18n/fr';
import { GraduationBanner, GraduationButton } from '../components/Graduation';
import { Icon } from '../ui/Icon';
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
import BALANCE from '../data/balance.json';

type DayAction = { label: string; kind: ClientActionKind };

/** Libellé FR de l'action moteur : le chrome d'UI reste dans l'i18n. */
function clientAction(cs: ClientState): DayAction | null {
  const action = nextClientAction(cs);
  return action && { ...action, label: STR.activities[action.kind] };
}

export function DayScreen() {
  const save = useStore((s) => s.save);
  const spendEnergy = useStore((s) => s.spendEnergy);
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

  const mails = mailsForCycle(save.cycle, save.mode);
  const unreadMails = mails.filter((m) => !save.mailsRead.includes(m.id)).length;

  function doClientAction(cs: ClientState) {
    const a = clientAction(cs);
    if (!a) return;
    spendEnergy(a.label);
    if (a.kind === 'proposal') {
      signClient(cs.clientId);
    } else {
      openClientDialogue(cs.clientId, a.kind);
    }
  }

  // Souffler ne coûte plus rien, mais ne se prend qu'une fois par jour : sans
  // cette limite, l'énergie se remonterait à volonté et ne dirait plus rien.
  function rest() {
    if (save?.restUsedThisDay) {
      toast(STR.activities.restDone);
      return;
    }
    useStore.setState({ save: save ? { ...save, restUsedThisDay: true } : save });
    applyEnergy(BALANCE.energy.rest, STR.activities.rest);
    toast(`+${BALANCE.energy.rest} énergie`);
  }

  function networking() {
    spendEnergy(STR.activities.networking);
    generateProspects(3);
    applyGauges({ relation: 4 }, STR.activities.networking);
    toast('3 prospects tièdes ajoutés');
  }

  function callProspect(prospectId: string) {
    spendEnergy(STR.activities.prospection);
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
  // Les pistes écrites signées ne sont pas des missions conseil : elles ont
  // donné un rendez-vous, et se suivent désormais dans le portefeuille.
  const signedProspects = save.prospects.filter((p) => p.status === 'SIGNED' && !p.scriptedClientId);

  return (
    <div className="container">
      <div className="row" style={{ marginBottom: 8 }}>
        <div>
          <h1>{STR.day.title}</h1>
          <p className="muted lede">{STR.season[save.mode].daySubtitle}</p>
        </div>
        <span className="spacer" />
        <GraduationButton />
        <button className="btn btn-ghost" data-sfx="nav" onClick={() => go('codex')}>
          <Icon name="book" size={17} /> {STR.menu.codex}
        </button>
        <button className="btn btn-brand" data-sfx="phase-tech" onClick={switchPhase}>
          <Icon name="technique" size={17} /> {STR.hud.toNight}
        </button>
      </div>

      <GraduationBanner />

      <div className="panel" style={{ marginBottom: 20 }}>
        <GaugesBar gauges={save.gauges} deltas={lastDeltas} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)' }}>
        <section className="stack">
          <div className="panel-title">
            <Icon name="users" size={19} />
            <h3>{STR.day.crm}</h3>
          </div>
          {save.portfolio.length === 0 && <p className="muted">{STR.day.noClients}</p>}
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
                <div className="list-main">
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{c.name}</strong>
                    <span className="tag" title={c.sectorLabel}>
                      {c.sectorLabel}
                    </span>
                    <span className="tag" title={`${STR.common.difficulty} ${c.profileDifficulty}/3`}>
                      {[1, 2, 3].map((k) => (
                        <Icon key={k} name="star" size={13} filled={k <= c.profileDifficulty} />
                      ))}
                    </span>
                  </div>
                  <div className="muted" style={{ fontSize: '0.82rem' }}>
                    {c.contact.name} · {c.contact.role} — {STR.common.trust} {Math.round(cs.trust)}
                  </div>
                  {cs.promise && (
                    <div className="inline-note">
                      <Icon name="target" size={14} />
                      <span>
                        {STR.common.promise} : {cs.promise.min.toLocaleString('fr-FR')}–
                        {cs.promise.max.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                  )}
                </div>
                <div className="list-actions is-stacked">
                  <button
                    className="btn btn-sm"
                    data-sfx="open"
                    onClick={() => {
                      useStore.setState({ activeClientId: cs.clientId });
                      go('client');
                    }}
                  >
                    {STR.common.client}
                  </button>
                  {action ? (
                    <button className="btn btn-sm btn-primary" onClick={() => doClientAction(cs)}>
                      {action.label}
                    </button>
                  ) : (
                    <span className="tag" title={STR.day.nothingToday}>
                      <Icon name={cs.dossierState === 'CLOSED' || cs.dossierState === 'DEPOSITED' ? 'check' : 'technique'} size={13} />
                      {cs.dossierState === 'CLOSED' || cs.dossierState === 'DEPOSITED'
                        ? STR.day.missionDone
                        : STR.day.handledInTech}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section className="stack">
          <div className="panel-title">
            <Icon name="inbox" size={19} />
            <h3>{STR.day.inbox}</h3>
            {unreadMails > 0 && <span className="tag tag-accent">{STR.day.unread(unreadMails)}</span>}
          </div>
          {mails.length === 0 && (
            <p className="muted" style={{ fontSize: '0.85rem' }}>
              {STR.day.noMail}
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
                      <div className="inline-note" style={{ marginTop: 8 }}>
                        <Icon name="doc" size={14} />
                        <span>{STR.day.linkedSheet(codexById(m.codexUnlock)!.title)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="panel-title" style={{ marginTop: 8 }}>
            <Icon name="phone" size={19} />
            <h3>{STR.day.prospects}</h3>
          </div>
          <div className="row">
            <button className="btn btn-sm" onClick={networking}>
              <Icon name="users" size={15} /> {STR.activities.networking}
            </button>
            <button className="btn btn-sm" onClick={rest} disabled={save.restUsedThisDay}>
              <Icon name="bolt" size={15} /> {STR.activities.rest}
            </button>
          </div>
          {newProspects.length === 0 && <p className="muted">{STR.day.noProspects}</p>}
          {newProspects.slice(0, 6).map((p) => (
            <div className="list-item" key={p.id}>
              <div className="avatar" title="Interlocuteur au téléphone — visage inconnu avant signature">
                <AnonymousAvatar gender={p.gender} />
              </div>
              <div className="list-main">
                <strong>{p.company}</strong>
                <div className="muted" style={{ fontSize: '0.8rem' }}>
                  {p.contactName} · {p.size} sal. — {p.hook}
                </div>
                <div style={{ fontSize: '0.78rem' }}>
                  {STR.common.estimatedCir} : {p.estimatedCir.toLocaleString('fr-FR')} €
                </div>
              </div>
              <div className="list-actions">
                <button
                  className="btn btn-sm btn-primary"
                  data-sfx="call"
                  onClick={() => callProspect(p.id)}
                >
                  <Icon name="phone" size={15} /> {STR.activities.prospection}
                </button>
              </div>
            </div>
          ))}

          {signedProspects.length > 0 && (
            <>
              <div className="panel-title" style={{ marginTop: 8 }}>
                <Icon name="briefcase" size={19} />
                <h3>{STR.day.signedMissions}</h3>
              </div>
              {signedProspects.map((p) => (
                <div className="list-item" key={p.id}>
                  <div className="avatar" title={`${p.contactName} — mission conseil`}>
                    <Avatar seed={p.portraitId} />
                  </div>
                  <div className="list-main">
                    <strong>{p.company}</strong>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>
                      {p.contactName} · {p.size} sal.
                    </div>
                    <div className="inline-note">
                      <Icon name={p.eligibility === 'NOT_ELIGIBLE' ? 'alert' : 'euro'} size={14}
                        className={p.eligibility === 'NOT_ELIGIBLE' ? 'ink-bad' : 'ink-ok'} />
                      <span>
                        {p.eligibility === 'NOT_ELIGIBLE'
                          ? STR.day.toxicMission
                          : `${STR.hud.revenue} : ${(p.revenue ?? 0).toLocaleString('fr-FR')} €`}
                      </span>
                    </div>
                  </div>
                  <span className="tag tag-ok">
                    <Icon name="check" size={13} /> {STR.common.signed}
                  </span>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
