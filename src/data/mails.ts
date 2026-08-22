// Boîte mail de la phase Relation client (§6.1) : texture de vraie semaine de
// travail et canal narratif léger. Certains mails débloquent une fiche codex.
//
// Deux jeux distincts. En première saison, le cabinet accueille un nouveau et
// lui explique le métier. En seconde, il s'adresse à quelqu'un qui a déjà
// déposé une campagne : on ne lui souhaite plus la bienvenue, on lui confie des
// dossiers et on lui demande de relire ceux des autres.
//
// Les fenêtres de diffusion suivent les six cycles de la saison. Elles
// couvraient auparavant vingt-trois semaines, héritées d'un calendrier plus
// long : la moitié des messages n'apparaissait jamais.

import type { GameMode } from '../engine/types';

export interface GameMail {
  id: string;
  fromCycle: number;
  toCycle: number;
  sender: string;
  subject: string;
  body: string;
  codexUnlock?: string;
  /** Saison concernée. Absent = les deux. */
  mode?: GameMode;
}

const ONBOARDING_MAILS: GameMail[] = [
  {
    id: 'mail_bienvenue',
    mode: 'onboarding',
    fromCycle: 1,
    toCycle: 2,
    sender: 'Sophie Meyer — Directrice de BU',
    subject: 'Bienvenue dans l’équipe',
    body: 'Bienvenue ! Objectif de saison : 300 k€ de CA signé et au moins 4 dossiers déposés. Mais retenez ceci : un dossier redressé coûte plus cher que dix dossiers jamais signés. La sécurité d’abord. — S.',
  },
  {
    id: 'mail_methodo',
    mode: 'onboarding',
    fromCycle: 1,
    toCycle: 3,
    sender: 'Karim Bensaïd — Consultant senior',
    subject: 'Mon conseil pour tes premiers RDV',
    body: 'Petit conseil de vieux routier : en découverte, ne lâche JAMAIS un chiffre précis. Une fourchette prudente, toujours. Le client retient le chiffre, jamais tes réserves. Tu me remercieras au bilan.',
    codexUnlock: 'cdx_estimer',
  },
  {
    id: 'mail_timesheets',
    mode: 'onboarding',
    fromCycle: 3,
    toCycle: 4,
    sender: 'Amélie Roux — Manager',
    subject: 'Feuilles de temps : c’est maintenant',
    body: 'Rappel : la collecte des feuilles de temps chez tous tes clients, c’est cette semaine. Une feuille signée aujourd’hui vaut dix attestations reconstituées au printemps. Relance en suivi de mission.',
    codexUnlock: 'cdx_pieces',
  },
  {
    id: 'mail_cloture',
    mode: 'onboarding',
    fromCycle: 4,
    toCycle: 5,
    sender: 'Amélie Roux — Manager',
    subject: 'Clôture des exercices clients',
    body: 'Les exercices de tes clients se clôturent. Tout ce qui n’est pas collecté maintenant sera difficile à reconstituer. Vérifie les pièces manquantes de chaque dossier avant la fin du mois.',
  },
  {
    id: 'mail_rescrit',
    mode: 'onboarding',
    fromCycle: 4,
    toCycle: 5,
    sender: 'Karim Bensaïd — Consultant senior',
    subject: 'Fenêtre de rescrit',
    body: 'Si tu as un dossier à la frontière R&D/CII, c’est la fenêtre pour un rescrit. Sécuriser a priori coûte quelques heures ; un redressement coûte une année. À toi de voir.',
    codexUnlock: 'cdx_rescrit',
  },
  {
    id: 'mail_rush',
    mode: 'onboarding',
    fromCycle: 5,
    toCycle: 6,
    sender: 'Sophie Meyer — Directrice de BU',
    subject: 'Dernière ligne droite',
    body: 'Le 2069-A-SD se dépose fin avril. Priorisez : mieux vaut 4 dossiers solides déposés que 6 dossiers bancals. Un dossier non déposé, c’est zéro CA sur ce client. Je compte sur vous.',
  },
];

const EXPERT_MAILS: GameMail[] = [
  {
    id: 'mail_exp_rentree',
    mode: 'expert',
    fromCycle: 1,
    toCycle: 2,
    sender: 'Sophie Meyer — Directrice de BU',
    subject: 'Votre portefeuille de la saison',
    body: 'Vos dossiers de l’an dernier sont déposés, aucun n’est revenu. C’est pour ça que je vous confie ceux-là. Objectif : 220 k€ de CA signé — volontairement plus bas que l’an dernier, parce que ces dossiers-ci se défendent au lieu de se monter. — S.',
  },
  {
    id: 'mail_exp_taux_ronds',
    mode: 'expert',
    fromCycle: 1,
    toCycle: 3,
    sender: 'Karim Bensaïd — Consultant senior',
    subject: 'Entre nous : les taux trop ronds',
    body: 'Tu vas voir passer des tableaux préparés par les clients, avec des taux d’affectation ronds et identiques sur toute une équipe. Ce n’est pas une négligence, c’est une moyenne de confort. Demande le relevé qui a servi à la calculer : il n’existe pas.',
    codexUnlock: 'cdx_personnel',
  },
  {
    id: 'mail_exp_agrements',
    mode: 'expert',
    fromCycle: 2,
    toCycle: 4,
    sender: 'Amélie Roux — Manager',
    subject: 'La liste des organismes agréés a bougé',
    body: 'Deux prestataires que nous retenions l’an dernier ne sont plus agréés cette année. Reprends les attestations de tous tes sous-traitants, y compris les partenaires historiques : c’est la première chose qu’un vérificateur recoupe, et elle est publique.',
    codexUnlock: 'cdx_st_agrement',
  },
  {
    id: 'mail_exp_relecture',
    mode: 'expert',
    fromCycle: 3,
    toCycle: 5,
    sender: 'Amélie Roux — Manager',
    subject: 'Relecture d’un dossier junior',
    body: 'Je te confie la relecture du dossier d’un nouveau. Regarde d’abord les taux de personnel et les aides publiques : c’est là que se logent les erreurs de première année. Signale-lui ce qui manque, ne le corrige pas à sa place — il ne l’apprendrait pas.',
  },
  {
    id: 'mail_exp_contradictoire',
    mode: 'expert',
    fromCycle: 4,
    toCycle: 6,
    sender: 'Sophie Meyer — Directrice de BU',
    subject: 'Préparez la séance contradictoire',
    body: 'La vérification en cours passera en séance contradictoire. Un rappel de méthode : on ne nie pas un constat établi, on propose la rectification et on la chiffre. Reconnaître tôt limite la portée ; s’entêter la multiplie. — S.',
    codexUnlock: 'cdx_controle_deroule',
  },
];

/** Messages communs aux deux saisons. */
const SHARED_MAILS: GameMail[] = [
  {
    id: 'mail_newsletter_piege',
    fromCycle: 2,
    toCycle: 5,
    sender: 'Newsletter FiscalitéPlus',
    subject: '« Doublez votre CIR grâce aux jeunes docteurs ! »',
    body: 'Cette newsletter recommande de doubler l’assiette des jeunes docteurs. Attention : elle date d’avant 2025. La majoration jeune docteur est supprimée pour les dépenses exposées depuis le 15/02/2025. Le salaire reste éligible, au taux normal. Méfiez-vous des sources non datées. ⚠️',
    codexUnlock: 'cdx_jeune_docteur',
  },
  {
    id: 'mail_apres_depot',
    fromCycle: 6,
    toCycle: 6,
    sender: 'Amélie Roux — Manager',
    subject: 'Et maintenant ?',
    body: 'Dossiers déposés. Pour les PME, pense à la demande de remboursement immédiat du solde non imputé — c’est de la trésorerie que tes clients attendent. Et garde les classeurs de preuves à portée de main : on ne sait jamais qui frappe à la porte.',
    codexUnlock: 'cdx_controle_deroule',
  },
];

export const MAILS: GameMail[] = [...ONBOARDING_MAILS, ...EXPERT_MAILS, ...SHARED_MAILS];

export function mailsForCycle(cycle: number, mode: GameMode): GameMail[] {
  return MAILS.filter(
    (m) => (m.mode === undefined || m.mode === mode) && cycle >= m.fromCycle && cycle <= m.toCycle,
  );
}
