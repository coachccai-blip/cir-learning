// Types partagés du moteur — AUCUN import React ici (règle d'architecture §14.3).

// ---------- Ruleset fiscal ----------

export interface RateBracket {
  upTo: number | null;
  rate: number;
}

export interface Ruleset {
  version: string;
  effectiveFrom: string;
  asOf: string;
  legalBasis: string;
  cir: {
    rates: RateBracket[];
    ratesDom: RateBracket[];
    operatingAllowance: { onPersonnel: number; onAmortization: number };
    subcontracting: {
      agreementRequired: boolean;
      proportionalCapMultiplier: number;
      annualCapRelated: number;
      annualCapUnrelated: number;
      maxTier: number;
      operatingAllowanceApplies: boolean;
    };
    removedItems: { id: string; label: string; removedFrom: string }[];
    deductions: string[];
  };
  cii: { rate: number; expenseCap: number; smeOnly: boolean; expiresOn: string };
}

// ---------- Cas d'assiette ----------

export interface PersonnelLine {
  id: string;
  name: string;
  role: string;
  grossCost: number;
  /** Ratio déclaré par le client (ce que le joueur voit par défaut). */
  claimedRdRatio: number;
  /** Ratio réel, révélé par les pièces collectées. */
  trueRdRatio: number;
  evidence?: string;
  trap?: string;
}

export interface AmortizationLine {
  id: string;
  asset: string;
  annualDepreciation: number;
  rdRatio: number;
  trueRdRatio?: number;
  trap?: string;
}

export interface SubcontractingLine {
  id: string;
  provider: string;
  amount: number;
  hasMesrAgreement: boolean;
  related: boolean;
  tier: number;
  trap?: string;
}

export interface GrantLine {
  id: string;
  source: string;
  amount: number;
  rdAllocationRatio: number;
  type: 'grant' | 'repayableAdvance';
  trap?: string;
}

export interface DecoyLine {
  id: string;
  label: string;
  amount: number;
  removedItemId: 'patents' | 'techWatch' | 'youngDoctorBonus';
  reason: string;
}

export interface AssietteCase {
  id: string;
  clientId: string;
  fiscalYear: number;
  narrative: string;
  personnel: PersonnelLine[];
  amortization: AmortizationLine[];
  subcontracting: SubcontractingLine[];
  grants: GrantLine[];
  decoys: DecoyLine[];
}

// Saisie du joueur pour un cas d'assiette.
export interface AssietteInput {
  personnelRatios: Record<string, number>; // id → ratio retenu (0 pour exclu)
  amortizationIncluded: Record<string, boolean>;
  subcontractingIncluded: Record<string, boolean>;
  grantsDeducted: Record<string, boolean>;
  decoysIncluded: Record<string, boolean>;
}

export interface CirBreakdown {
  personnel: number;
  amortization: number;
  operatingAllowance: number;
  subcontractingRaw: number;
  subcontractingRetained: number;
  subcontractingCapHit: 'none' | 'proportional' | 'annual';
  grantsDeducted: number;
  decoysIncluded: number;
  base: number;
  cir: number;
  warnings: string[];
}

export interface AssietteScore {
  playerCir: number;
  trueCir: number;
  precision: number; // 1 − |écart| / juste
  withinTolerance: boolean;
  deviations: { label: string; delta: number; cause: string }[];
}

// ---------- Dialogue ----------

export type ChoiceRole = 'optimal' | 'acceptable' | 'tempting' | 'poor';
export type Register =
  | 'preuve'
  | 'synthese'
  | 'empathie'
  | 'technique'
  | 'fermete'
  | 'commercial';

export interface GaugeEffects {
  relation?: number;
  security?: number;
  profitability?: number;
  mood?: number;
  trust?: number;
}

export interface PromiseSpec {
  kind: 'range' | 'precise';
  min: number;
  max: number;
}

export interface DialogueChoice {
  id: string;
  role: ChoiceRole;
  register: Register;
  text: string;
  effects: GaugeEffects;
  flags?: string[];
  promise?: PromiseSpec;
  feedback: { what: string; why: string; rule: string; codexUnlock?: string };
  next: string | null; // null = fin du scénario
}

export type Expression = 'neutre' | 'satisfait' | 'agace' | 'ferme' | 'enthousiaste';

export interface DialogueNode {
  id: string;
  speaker: string;
  /**
   * Portrait à afficher sur ce nœud. Par défaut c'est celui du client ; un
   * nœud le surcharge quand la parole passe à quelqu'un d'autre (un technicien
   * qui contredit sa direction, par exemple).
   */
  avatarSeed?: string;
  expression: Expression;
  text: string;
  choices: DialogueChoice[];
}

export type ScenarioType =
  | 'DISCOVERY'
  | 'KICKOFF'
  | 'FOLLOWUP'
  | 'CLOSING'
  | 'PROSPECT'
  | 'EVENT'
  | 'AUDIT'
  | 'INTERNAL';

export interface Scenario {
  id: string;
  type: ScenarioType;
  clientId?: string;
  title: string;
  context: string;
  objectives?: string[];
  entryNode: string;
  nodes: DialogueNode[];
  outcome?: {
    scoreThresholds: { excellent: number; good: number };
    unlocks: { excellent: string[]; good: string[]; poor: string[] };
  };
}

// ---------- Clients ----------

export type Archetype = 'SCEPTIC' | 'RUSHED' | 'GEEK' | 'CFO' | 'DREAMER' | 'SILENT';
export type Sector = 'SAAS' | 'INDUS' | 'BIOTECH' | 'AGRI' | 'GREENTECH' | 'SERVICES';

export interface ClientDef {
  id: string;
  name: string;
  sector: Sector;
  sectorLabel: string;
  profileDifficulty: 1 | 2 | 3;
  headcount: number;
  isSme: boolean;
  /** Cycle d'arrivée du lead dans le CRM. */
  leadCycle: number;
  contact: {
    name: string;
    /** Pilote la voix de la lecture à haute voix. */
    gender: 'F' | 'M';
    role: string;
    archetype: Archetype;
    avatarSeed: string;
    initialMood: number;
    initialTrust: number;
  };
  fees: { successRate: number; negotiable: boolean; floorRate: number };
  caseId: string;
  scenarios: { discovery: string; kickoff: string; followup: string; closing: string };
  cardsetId: string;
  /** Fourchette réaliste du CIR pour les promesses. */
  cirEstimate: [number, number];
  pitch: string;
}

// ---------- Cartes de qualification ----------

export type CardVerdict = 'RD' | 'CII' | 'NONE' | 'INVESTIGATE';

export interface WorkCard {
  id: string;
  title: string;
  description: string;
  clues: string[];
  verdict: Exclude<CardVerdict, 'INVESTIGATE'>;
  /** INVESTIGATE est toujours accepté, mais fatigue au cycle suivant. */
  explanation: string;
  codexRef?: string;
}

export interface Cardset {
  id: string;
  clientId: string;
  cards: WorkCard[];
}

// ---------- Justificatif technique ----------

export interface JustifBlockOption {
  id: string;
  role: ChoiceRole;
  text: string;
  critique: string;
}

export interface JustifBlock {
  id: string;
  title: string;
  hint: string;
  options: JustifBlockOption[];
}

export interface JustifSet {
  id: string;
  clientId: string;
  blocks: JustifBlock[];
}

// ---------- Codex ----------

export interface CodexEntry {
  id: string;
  category:
    | 'dispositif'
    | 'eligibilite'
    | 'assiette'
    | 'soustraitance'
    | 'financements'
    | 'posture'
    | 'controle';
  title: string;
  body: string;
  example: string;
  source: string;
}

// ---------- Calendrier ----------

export interface CalendarMilestone {
  cycle: number;
  date: string;
  label: string;
  consequence: string;
  id: string;
  /**
   * L'échéance mérite-t-elle l'alerte pulsante du bandeau ? Le coup d'envoi de
   * saison n'a aucune sanction : le signaler en rouge dès le premier écran
   * apprend au joueur à ignorer l'alerte.
   */
  alert?: boolean;
}

export interface ChapterDef {
  num: number;
  title: string;
  fromCycle: number;
  toCycle: number;
  notion: string;
  objective: string;
}

// ---------- Événements ----------

export interface GameEvent {
  id: string;
  minCycle: number;
  maxCycle: number;
  /** Requiert au moins un client signé. */
  needsClient?: boolean;
  node: DialogueNode;
  title: string;
}

// ---------- Prospection ----------

export type EligibilityProfile = 'ELIGIBLE' | 'BORDERLINE' | 'NOT_ELIGIBLE';

export interface ProspectTemplate {
  id: string;
  companyPool: string[];
  sectorPool: Sector[];
  sizeRange: [number, number];
  eligibilityProfile: EligibilityProfile;
  hooks: string[];
  estimatedCirRange: [number, number];
}

export interface GeneratedProspect {
  id: string;
  company: string;
  sector: Sector;
  contactName: string;
  /** Genre de l'interlocuteur — pilote la silhouette anonyme au téléphone. */
  gender: 'F' | 'M';
  size: number;
  eligibility: EligibilityProfile;
  hook: string;
  estimatedCir: number;
  avatarSeed: string;
  /** Portrait générique attribué s'il devient client (prospect-f-01 … prospect-m-04). */
  portraitId: string;
  /** Situation d'appel tirée pour ce prospect (barrage, objection, referral…). */
  callScenarioId: string;
  /**
   * Client écrit derrière cette fiche, s'il y en a un. Décrocher un rendez-vous
   * avec lui ouvre son dossier rédigé à la main plutôt qu'un dossier généré.
   */
  scriptedClientId?: string;
  status: 'NEW' | 'SIGNED' | 'DECLINED' | 'LOST';
  /** CA encaissé si la mission conseil a été signée. */
  revenue?: number;
  /**
   * Client ouvert par cette signature, s'il y en a un. Une signature qui a
   * donné un vrai dossier n'est pas une mission conseil : elle se suit au
   * portefeuille, et la lister deux fois faisait mentir les deux listes.
   */
  becameClientId?: string;
}

// ---------- Sauvegarde / état ----------

export type GameMode = 'onboarding' | 'expert';
export type Phase = 'DAY' | 'NIGHT';

export type DossierState =
  | 'LEAD'
  | 'QUALIFIED'
  | 'SIGNED'
  | 'KICKED_OFF'
  | 'CARDS_DONE'
  | 'BASE_DONE'
  | 'JUSTIFIED'
  | 'CLOSED'
  | 'DEPOSITED'
  | 'LOST';

export interface ClientState {
  clientId: string;
  mood: number;
  trust: number;
  flags: string[];
  dossierState: DossierState;
  feeRate: number;
  promise: { min: number; max: number; cycle: number; kind: 'range' | 'precise' } | null;
  piecesCollected: string[];
  scores: {
    discovery: number | null;
    kickoff: number | null;
    qualification: number | null; // % de cartes justes
    base: number | null; // précision d'assiette
    justification: number | null;
  };
  /** Cartes placées en « à investiguer » → fatigue due au cycle suivant. */
  investigateDebt: number;
  /** Le suivi de mission n'est jouable qu'une fois par client. */
  followupDone: boolean;
  /**
   * Dernier cycle où le joueur a travaillé ce dossier. Un client laissé sans
   * nouvelles trop longtemps finit par partir : c'est ce qui oblige à choisir
   * qui l'on sert quand le portefeuille dépasse le budget d'actions.
   */
  lastTouchedCycle: number;
  cardPlacements: Record<string, CardVerdict>;
  /**
   * Rang de ce dossier dans la courbe de progression, figé à la première
   * ouverture de l'assiette. Sans ce repère, un dossier repris plus tard
   * changerait de postes et de tolérance en cours de route.
   */
  baseStep: number | null;
  assietteInput: AssietteInput | null;
  playerCir: number | null;
  trueCir: number | null;
  justifChoices: Record<string, string>;
  auditOutcome: 'none' | 'validated' | 'partial' | 'total' | null;
  signedRevenue: number;
  collectedRevenue: number;
}

export interface HistoryEntry {
  cycle: number;
  scenarioId: string;
  nodeId: string;
  choiceId: string;
  role: ChoiceRole;
  clientId?: string;
  /** Texte du choix, figé au moment où il est joué (pour flashbacks et débrief). */
  text: string;
  /** Somme des deltas de jauges du choix (négatif = décision coûteuse). */
  impact: number;
  rule: string;
}

export interface Gauges {
  relation: number;
  security: number;
  profitability: number;
}

export interface DeltaLogEntry {
  gauge: 'relation' | 'security' | 'profitability' | 'xp' | 'revenue';
  delta: number;
  cause: string;
}

/** Dossier complet fabriqué pour un prospect signé, persisté dans la sauvegarde. */
export interface GeneratedClientBundle {
  client: ClientDef;
  case: AssietteCase;
  cardset: Cardset;
}

export interface SaveGame {
  schemaVersion: number;
  mode: GameMode;
  seed: string;
  createdAt: string;
  cycle: number;
  phase: Phase;
  gauges: Gauges;
  xp: number;
  revenue: { signed: number; collected: number };
  portfolio: ClientState[];
  prospects: GeneratedProspect[];
  codexUnlocked: string[];
  codexRead: string[];
  badges: string[];
  history: HistoryEntry[];
  cycleLog: DeltaLogEntry[];
  missedDeadlines: string[];
  stats: {
    cardsCorrect: number;
    cardsTotal: number;
    verrousOk: number;
    refusedMissions: number;
    exactBases: number;
    noJargonStreak: number;
    prospectsSigned: number;
    prospectsDeclined: number;
  };
  tutorialDone: boolean;
  /**
   * Le joueur a vu la proposition de sortie après ses deux premières missions
   * et a choisi de continuer : on ne la lui repropose plus en grand.
   */
  graduationAcknowledged: boolean;
  finished: boolean;
  /** Événements aléatoires déjà déclenchés (pas de répétition). */
  firedEvents: string[];
  /** Réponses au quiz d'entrée et de sortie (index d'option par question). */
  quizPre: number[];
  quizPost: number[];
  /** Mails lus dans la boîte de réception du jour. */
  mailsRead: string[];
  /** Valeurs des jauges en fin de chaque cycle (sparklines du bilan). */
  gaugeHistory: { cycle: number; relation: number; security: number; profitability: number }[];
  /**
   * Dossiers fabriqués en cours de partie pour les prospects convertis en
   * clients. Persistés avec la sauvegarde : sans eux, un rechargement ne
   * saurait plus résoudre `clientId` / `caseId` / `cardsetId`.
   */
  generatedClients: GeneratedClientBundle[];
}


// ---------- Contrôle fiscal ----------

export interface AuditFinding {
  id: string;
  clientId: string;
  label: string;
  /** Le joueur possède-t-il la pièce / l'argument pour se défendre ? */
  defensible: boolean;
  question: string;
  goodAnswer: string;
  weakAnswers: string[];
  reassessment: number; // montant de rappel si non défendu
  /**
   * Relance du vérificateur en séance contradictoire (deuxième saison) : une
   * fois le constat posé, il demande ce que le conseil propose. Une
   * rectification honnête n'efface pas le rappel, elle l'atténue.
   */
  followUp?: { question: string; goodAnswer: string; weakAnswers: string[] };
}

export interface AuditResult {
  outcome: 'validated' | 'partial' | 'total';
  findings: { finding: AuditFinding; defended: boolean; mitigated: boolean }[];
  reassessedAmount: number;
  feesRefunded: number;
}
