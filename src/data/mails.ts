// Boîte mail de la phase Relation client (§6.1) : texture de vraie semaine de travail
// et canal narratif léger. Certains mails débloquent une fiche codex.

export interface GameMail {
  id: string;
  fromCycle: number;
  toCycle: number;
  sender: string;
  subject: string;
  body: string;
  codexUnlock?: string;
}

export const MAILS: GameMail[] = [
  {
    id: 'mail_bienvenue',
    fromCycle: 1,
    toCycle: 2,
    sender: 'Sophie Meyer — Directrice de BU',
    subject: 'Bienvenue dans l’équipe',
    body: 'Bienvenue ! Objectif de saison : 300 k€ de CA signé et au moins 4 dossiers déposés. Mais retenez ceci : un dossier redressé coûte plus cher que dix dossiers jamais signés. La sécurité d’abord. — S.',
  },
  {
    id: 'mail_methodo',
    fromCycle: 1,
    toCycle: 3,
    sender: 'Karim Bensaïd — Consultant senior',
    subject: 'Mon conseil pour tes premiers RDV',
    body: 'Petit conseil de vieux routier : en découverte, ne lâche JAMAIS un chiffre précis. Une fourchette prudente, toujours. Le client retient le chiffre, jamais tes réserves. Tu me remercieras au bilan.',
    codexUnlock: 'cdx_estimer',
  },
  {
    id: 'mail_newsletter_piege',
    fromCycle: 3,
    toCycle: 6,
    sender: 'Newsletter FiscalitéPlus',
    subject: '« Doublez votre CIR grâce aux jeunes docteurs ! »',
    body: 'Cette newsletter recommande de doubler l’assiette des jeunes docteurs. ⚠️ Attention : elle date d’avant 2025. La majoration jeune docteur est SUPPRIMÉE pour les dépenses exposées depuis le 15/02/2025. Le salaire reste éligible, au taux normal. Méfiez-vous des sources non datées.',
    codexUnlock: 'cdx_jeune_docteur',
  },
  {
    id: 'mail_timesheets',
    fromCycle: 10,
    toCycle: 12,
    sender: 'Amélie Roux — Manager',
    subject: 'Feuilles de temps : c’est maintenant',
    body: 'Rappel : la collecte des feuilles de temps chez tous les clients, c’est cette période. Une feuille de temps signée en novembre vaut dix attestations reconstituées en avril. Relance tes clients en suivi de mission.',
    codexUnlock: 'cdx_pieces',
  },
  {
    id: 'mail_cloture',
    fromCycle: 14,
    toCycle: 15,
    sender: 'Amélie Roux — Manager',
    subject: 'Clôture des exercices clients',
    body: 'Les exercices de tes clients se clôturent. Tout ce qui n’est pas collecté maintenant sera difficile à reconstituer. Vérifie les pièces manquantes de chaque dossier avant la fin du mois.',
  },
  {
    id: 'mail_rescrit',
    fromCycle: 16,
    toCycle: 17,
    sender: 'Karim Bensaïd — Consultant senior',
    subject: 'Fenêtre de rescrit',
    body: 'Si tu as un dossier à la frontière R&D/CII, c’est la fenêtre pour un rescrit. Sécuriser a priori coûte quelques heures ; un redressement coûte une année. À toi de voir.',
    codexUnlock: 'cdx_rescrit',
  },
  {
    id: 'mail_rush',
    fromCycle: 19,
    toCycle: 21,
    sender: 'Sophie Meyer — Directrice de BU',
    subject: 'Dernière ligne droite',
    body: 'Le 2069-A-SD se dépose fin avril. Priorise : mieux vaut 4 dossiers solides déposés que 6 dossiers bancals. Un dossier non déposé = zéro CA sur ce client. Je compte sur toi.',
  },
  {
    id: 'mail_apres_depot',
    fromCycle: 22,
    toCycle: 23,
    sender: 'Amélie Roux — Manager',
    subject: 'Et maintenant ?',
    body: 'Dossiers déposés. Pour les PME, pense à la demande de remboursement immédiat du solde non imputé — c’est de la trésorerie que tes clients attendent. Et garde les classeurs de preuves à portée de main : on ne sait jamais qui frappe à la porte.',
    codexUnlock: 'cdx_controle_deroule',
  },
];

export function mailsForCycle(cycle: number): GameMail[] {
  return MAILS.filter((m) => cycle >= m.fromCycle && cycle <= m.toCycle);
}
