// Cartes « travaux » du mini-jeu de qualification (§7.3). Données fictives.
// verdict : RD (R&D éligible CIR) | CII (innovation) | NONE (non éligible).
// « À investiguer » est toujours accepté par le moteur, mais coûteux.

import type { Cardset } from '../engine/types';

export const CARDSETS: Cardset[] = [
  {
    id: 'cards_agri',
    clientId: 'cli_agri_dupuis',
    cards: [
      { id: 'ag1', title: 'Stabiliser une émulsion végétale sans additif', description: 'Aucune solution connue ne tient au-delà de 40 °C ; l’équipe teste des combinaisons de protéines.', clues: ['Verrou physico-chimique', 'Incertitude sur l’aboutissement', 'Démarche expérimentale'], verdict: 'RD', explanation: 'Verrou caractérisé + incertitude scientifique + itérations : R&D éligible.', codexRef: 'cdx_verrou' },
      { id: 'ag2', title: 'Refaire l’étiquetage réglementaire des packs', description: 'Mise en conformité avec une nouvelle réglementation d’affichage.', clues: ['Application d’une norme existante', 'Aucune incertitude'], verdict: 'NONE', explanation: 'Mise en conformité réglementaire : aucune incertitude scientifique.', codexRef: 'cdx_dev_courant' },
      { id: 'ag3', title: 'Nouvelle recette de sauce à partir d’ingrédients connus', description: 'Assemblage de composants maîtrisés pour un nouveau goût.', clues: ['Nouveauté commerciale', 'Pas de verrou technique'], verdict: 'NONE', explanation: 'Nouveauté pour l’entreprise ≠ R&D : pas de verrou ni d’incertitude.', codexRef: 'cdx_nouveaute' },
      { id: 'ag4', title: 'Prototype de ligne pilote de séchage doux', description: 'Conception d’un pilote pour un procédé de séchage préservant les nutriments — nouveau produit.', clues: ['Prototype de nouveau produit', 'PME'], verdict: 'CII', explanation: 'Prototype/installation pilote de nouveau produit sans verrou de recherche : CII.', codexRef: 'cdx_cii' },
      { id: 'ag5', title: 'Modéliser la cinétique de déstabilisation', description: 'Développement d’un modèle prédictif validé par plans d’expériences.', clues: ['Hypothèses testées', 'Résultats négatifs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale documentée : R&D.', codexRef: 'cdx_demarche' },
      { id: 'ag6', title: 'Contrôle qualité des lots de production', description: 'Vérification routinière de conformité des lots.', clues: ['Activité de production courante'], verdict: 'NONE', explanation: 'Contrôle qualité de production : hors R&D.' },
      { id: 'ag7', title: 'Portage du logiciel de recettes sur tablette', description: 'Adaptation d’un logiciel interne existant à un nouvel écran.', clues: ['Portage', 'Techniques standard'], verdict: 'NONE', explanation: 'Portage : développement courant.', codexRef: 'cdx_dev_courant' },
      { id: 'ag8', title: 'Essais de conservation sous atmosphère modifiée', description: 'Campagne d’essais avec plusieurs mélanges gazeux pour lever une incertitude de tenue.', clues: ['Incertitude', 'Protocole expérimental'], verdict: 'RD', explanation: 'Incertitude + protocole : R&D.', codexRef: 'cdx_incertitude' },
      { id: 'ag9', title: 'Formation de l’équipe à un nouvel outil', description: 'Montée en compétence sur un logiciel du marché.', clues: ['Formation'], verdict: 'NONE', explanation: 'Formation : hors assiette.' },
      { id: 'ag10', title: 'Étude de faisabilité d’un emballage compostable', description: 'Recherche sur un matériau d’emballage aux propriétés non atteintes par l’état de l’art.', clues: ['État de l’art dépassé', 'Verrou matériau'], verdict: 'RD', explanation: 'Progrès par rapport à l’état de l’art : R&D.', codexRef: 'cdx_etat_art' },
    ],
  },
  {
    id: 'cards_saas',
    clientId: 'cli_saas_nexalog',
    cards: [
      { id: 'sa1', title: 'Algorithme de prédiction sous forte incertitude', description: 'Recherche d’un modèle capable de prédire des flux avec des données très bruitées, aucune méthode connue ne converge.', clues: ['Verrou algorithmique', 'Incertitude scientifique'], verdict: 'RD', explanation: 'Verrou + incertitude sur l’aboutissement : R&D.', codexRef: 'cdx_verrou' },
      { id: 'sa2', title: 'Intégration d’une API de paiement', description: 'Branchement d’un prestataire de paiement documenté.', clues: ['API documentée', 'Pas d’incertitude'], verdict: 'NONE', explanation: 'Intégration standard : développement courant.', codexRef: 'cdx_dev_courant' },
      { id: 'sa3', title: 'Refonte graphique de l’interface', description: 'Nouveau design system, mêmes fonctionnalités.', clues: ['UI', 'Aucun verrou'], verdict: 'NONE', explanation: 'Refonte UI : hors R&D.' },
      { id: 'sa4', title: 'Prototype d’un module de visualisation inédit', description: 'Nouveau produit de visualisation temps réel, pas de verrou de recherche mais réelle nouveauté produit.', clues: ['Prototype produit', 'PME'], verdict: 'CII', explanation: 'Prototype de nouveau produit : CII.', codexRef: 'cdx_cii' },
      { id: 'sa5', title: 'Optimisation < 20 ms sur réseau contraint', description: 'Conception d’un algorithme de compression pour lever une latence sous contrainte réseau jamais atteinte.', clues: ['Objectif technique non atteint par l’état de l’art', 'Itérations'], verdict: 'RD', explanation: 'Verrou de performance non résolu par l’état de l’art : R&D.', codexRef: 'cdx_etat_art' },
      { id: 'sa6', title: 'Migration de la base vers PostgreSQL', description: 'Migration technique vers une techno mature.', clues: ['Migration', 'Techno éprouvée'], verdict: 'NONE', explanation: 'Migration : développement courant.', codexRef: 'cdx_dev_courant' },
      { id: 'sa7', title: 'Mise à jour du site vitrine', description: 'Rafraîchissement du site marketing.', clues: ['Vitrine'], verdict: 'NONE', explanation: 'Site vitrine : hors R&D.' },
      { id: 'sa8', title: 'Expérimentation d’une architecture de streaming', description: 'Tests d’une architecture distribuée aux limites connues, résultats incertains, échecs conservés.', clues: ['Incertitude', 'Résultats négatifs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale : R&D.', codexRef: 'cdx_demarche' },
      { id: 'sa9', title: 'Ajout d’un thème sombre', description: 'Nouvelle option d’affichage.', clues: ['Fonctionnalité standard'], verdict: 'NONE', explanation: 'Fonctionnalité standard : hors R&D.' },
      { id: 'sa10', title: 'Nouveau connecteur pour un ERP client', description: 'Adaptation à un ERP spécifique, effort mais pas d’incertitude scientifique.', clues: ['Nouveau pour l’entreprise', 'Pas de verrou'], verdict: 'NONE', explanation: 'Nouveauté interne ≠ R&D.', codexRef: 'cdx_nouveaute' },
    ],
  },
  {
    id: 'cards_indus',
    clientId: 'cli_indus_verdier',
    cards: [
      { id: 'in1', title: 'Usiner un alliage réfractaire non maîtrisé', description: 'Mise au point d’un procédé d’usinage d’un alliage dont le comportement thermique est inconnu.', clues: ['Verrou procédé', 'Incertitude'], verdict: 'RD', explanation: 'Verrou de procédé + incertitude : R&D.', codexRef: 'cdx_verrou' },
      { id: 'in2', title: 'Produire en série une pièce validée', description: 'Fabrication série d’une pièce déjà qualifiée.', clues: ['Production série'], verdict: 'NONE', explanation: 'Production série : hors R&D.' },
      { id: 'in3', title: 'Banc d’essais pour caractériser la fatigue', description: 'Conception d’un banc pour mesurer un phénomène de fatigue non documenté.', clues: ['Démarche expérimentale', 'Incertitude'], verdict: 'RD', explanation: 'Instrumentation d’une démarche expérimentale : R&D.', codexRef: 'cdx_demarche' },
      { id: 'in4', title: 'Prototype d’un nouvel outillage produit', description: 'Prototype d’un outil nouveau pour le marché, sans verrou de recherche.', clues: ['Prototype produit', 'PME'], verdict: 'CII', explanation: 'Prototype de nouveau produit : CII.', codexRef: 'cdx_cii' },
      { id: 'in5', title: 'Maintenance des machines de l’atelier', description: 'Entretien courant du parc machine.', clues: ['Maintenance'], verdict: 'NONE', explanation: 'Maintenance : hors R&D.' },
      { id: 'in6', title: 'Optimiser un paramètre de coupe connu', description: 'Réglage fin d’un procédé maîtrisé.', clues: ['Optimisation de routine'], verdict: 'NONE', explanation: 'Optimisation sans incertitude : développement courant.', codexRef: 'cdx_dev_courant' },
      { id: 'in7', title: 'Simulation numérique d’un comportement inconnu', description: 'Modélisation d’un phénomène thermo-mécanique non prévu par l’état de l’art.', clues: ['État de l’art dépassé'], verdict: 'RD', explanation: 'Progrès sur l’état de l’art : R&D.', codexRef: 'cdx_etat_art' },
      { id: 'in8', title: 'Achat d’une machine du commerce', description: 'Acquisition d’un équipement standard.', clues: ['Achat standard'], verdict: 'NONE', explanation: 'Achat courant : hors assiette R&D.' },
      { id: 'in9', title: 'Réduire de 30 % un défaut sans cause connue', description: 'Campagne d’essais pour identifier et lever un défaut dont la cause est inconnue.', clues: ['Incertitude', 'Protocole'], verdict: 'RD', explanation: 'Incertitude scientifique + essais : R&D.', codexRef: 'cdx_incertitude' },
      { id: 'in10', title: 'Documentation commerciale d’un produit', description: 'Rédaction de fiches produit.', clues: ['Marketing'], verdict: 'NONE', explanation: 'Documentation commerciale : hors R&D.' },
    ],
  },
  {
    id: 'cards_biotech',
    clientId: 'cli_biotech_cellvia',
    cards: [
      { id: 'bi1', title: 'Essais pré-cliniques d’une molécule candidate', description: 'Évaluation in vivo d’une molécule dont l’efficacité est incertaine.', clues: ['Incertitude scientifique', 'Protocole'], verdict: 'RD', explanation: 'Recherche pré-clinique sous incertitude : R&D.', codexRef: 'cdx_demarche' },
      { id: 'bi2', title: 'Criblage de composés sur cible thérapeutique', description: 'Recherche de touches sur une cible, résultats imprévisibles.', clues: ['Verrou biologique', 'Résultats négatifs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale : R&D.', codexRef: 'cdx_verrou' },
      { id: 'bi3', title: 'Production d’un lot GMP pour la vente', description: 'Fabrication d’un lot commercial selon procédé validé.', clues: ['Production'], verdict: 'NONE', explanation: 'Production : hors R&D.' },
      { id: 'bi4', title: 'Étude réglementaire pour l’AMM', description: 'Dossier réglementaire de mise sur le marché.', clues: ['Réglementaire'], verdict: 'NONE', explanation: 'Démarche réglementaire : hors R&D.' },
      { id: 'bi5', title: 'Développement d’un biomarqueur inédit', description: 'Mise au point d’un marqueur non décrit dans la littérature.', clues: ['État de l’art dépassé'], verdict: 'RD', explanation: 'Progrès sur l’état de l’art : R&D.', codexRef: 'cdx_etat_art' },
      { id: 'bi6', title: 'Prototype d’un dispositif d’administration', description: 'Prototype d’un dispositif médical nouveau produit, sans verrou de recherche.', clues: ['Prototype produit', 'PME'], verdict: 'CII', explanation: 'Prototype de nouveau produit : CII.', codexRef: 'cdx_cii' },
      { id: 'bi7', title: 'Maintenance de la plateforme de criblage', description: 'Entretien des équipements.', clues: ['Maintenance'], verdict: 'NONE', explanation: 'Maintenance : hors R&D.' },
      { id: 'bi8', title: 'Optimisation d’un protocole publié', description: 'Application d’un protocole existant sans incertitude.', clues: ['Protocole connu'], verdict: 'NONE', explanation: 'Application de l’état de l’art : hors R&D.', codexRef: 'cdx_dev_courant' },
      { id: 'bi9', title: 'Modèle animal original pour la pathologie', description: 'Construction d’un modèle non disponible, résultat incertain.', clues: ['Incertitude', 'Nouveauté scientifique'], verdict: 'RD', explanation: 'Incertitude scientifique : R&D.', codexRef: 'cdx_incertitude' },
      { id: 'bi10', title: 'Veille bibliographique concurrentielle', description: 'Suivi des publications concurrentes.', clues: ['Veille'], verdict: 'NONE', explanation: 'Veille technologique : supprimée de l’assiette depuis 2025.', codexRef: 'cdx_supprimes' },
    ],
  },
  {
    id: 'cards_green',
    clientId: 'cli_green_solterra',
    cards: [
      { id: 'gr1', title: 'Isolant biosourcé aux propriétés non atteintes', description: 'Recherche d’un matériau dépassant les performances de l’état de l’art.', clues: ['État de l’art dépassé', 'Verrou matériau'], verdict: 'RD', explanation: 'Progrès sur l’état de l’art : R&D.', codexRef: 'cdx_etat_art' },
      { id: 'gr2', title: 'Ligne pilote d’un nouveau matériau', description: 'Installation pilote d’un produit nouveau, sans verrou de recherche résiduel.', clues: ['Installation pilote', 'PME... 110 salariés'], verdict: 'CII', explanation: 'Installation pilote de nouveau produit : CII (attention au seuil PME).', codexRef: 'cdx_cii' },
      { id: 'gr3', title: 'Essais de vieillissement accéléré', description: 'Campagne d’essais pour lever une incertitude de durabilité.', clues: ['Incertitude', 'Protocole'], verdict: 'RD', explanation: 'Démarche expérimentale : R&D.', codexRef: 'cdx_demarche' },
      { id: 'gr4', title: 'Mise aux normes du bâtiment', description: 'Travaux de conformité du site.', clues: ['Conformité'], verdict: 'NONE', explanation: 'Mise aux normes : hors R&D.' },
      { id: 'gr5', title: 'Formulation testée par plans d’expériences', description: 'Optimisation d’une formulation aux propriétés incertaines.', clues: ['Hypothèses', 'Résultats négatifs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale documentée : R&D.', codexRef: 'cdx_incertitude' },
      { id: 'gr6', title: 'Déploiement commercial du produit', description: 'Lancement marché.', clues: ['Commercial'], verdict: 'NONE', explanation: 'Commercialisation : hors R&D.' },
      { id: 'gr7', title: 'Adaptation du produit à un client', description: 'Ajustement sans incertitude scientifique.', clues: ['Nouveauté interne'], verdict: 'NONE', explanation: 'Nouveauté interne ≠ R&D.', codexRef: 'cdx_nouveaute' },
      { id: 'gr8', title: 'Caractérisation d’un phénomène de prise inconnu', description: 'Étude d’un mécanisme physico-chimique non décrit.', clues: ['Verrou', 'Incertitude'], verdict: 'RD', explanation: 'Verrou + incertitude : R&D.', codexRef: 'cdx_verrou' },
      { id: 'gr9', title: 'Reporting extra-financier RSE', description: 'Rédaction du rapport RSE.', clues: ['Reporting'], verdict: 'NONE', explanation: 'Reporting : hors R&D.' },
      { id: 'gr10', title: 'Prototype d’un procédé de recyclage', description: 'Prototype produit nouveau pour le marché.', clues: ['Prototype produit'], verdict: 'CII', explanation: 'Prototype de nouveau produit : CII.', codexRef: 'cdx_cii' },
    ],
  },
  {
    id: 'cards_services',
    clientId: 'cli_services_datao',
    cards: [
      { id: 'se1', title: 'Développement d’un dashboard client', description: 'Tableau de bord sur mesure avec des briques existantes.', clues: ['Prestation standard'], verdict: 'NONE', explanation: 'Prestation client courante : hors R&D.', codexRef: 'cdx_dev_courant' },
      { id: 'se2', title: 'Intégration d’un outil BI du marché', description: 'Mise en place d’un outil existant.', clues: ['Intégration'], verdict: 'NONE', explanation: 'Intégration : hors R&D.' },
      { id: 'se3', title: 'Recherche interne sur un algorithme d’anonymisation', description: 'Projet interne visant à lever une incertitude réelle sur l’anonymisation robuste.', clues: ['Verrou', 'Incertitude', 'Projet interne'], verdict: 'RD', explanation: 'Rare vraie R&D interne : verrou + incertitude.', codexRef: 'cdx_verrou' },
      { id: 'se4', title: 'Migration cloud d’un client', description: 'Prestation de migration.', clues: ['Migration'], verdict: 'NONE', explanation: 'Migration : hors R&D.' },
      { id: 'se5', title: 'Rédaction de spécifications fonctionnelles', description: 'Cadrage d’un projet client.', clues: ['Cadrage'], verdict: 'NONE', explanation: 'Cadrage : hors R&D.' },
      { id: 'se6', title: 'Paramétrage d’un CRM', description: 'Configuration d’un outil existant.', clues: ['Paramétrage'], verdict: 'NONE', explanation: 'Paramétrage : hors R&D.' },
      { id: 'se7', title: 'Prototype interne d’un moteur de recommandation inédit', description: 'Prototype produit interne pour un futur SaaS.', clues: ['Prototype produit', 'PME'], verdict: 'CII', explanation: 'Prototype de nouveau produit interne : CII possible.', codexRef: 'cdx_cii' },
      { id: 'se8', title: 'Support et maintenance applicative', description: 'TMA pour un client.', clues: ['Support'], verdict: 'NONE', explanation: 'Support : hors R&D.' },
      { id: 'se9', title: 'Veille sur les frameworks front', description: 'Suivi technologique.', clues: ['Veille'], verdict: 'NONE', explanation: 'Veille technologique : supprimée de l’assiette depuis 2025.', codexRef: 'cdx_supprimes' },
      { id: 'se10', title: 'Formation interne des consultants', description: 'Montée en compétence des équipes.', clues: ['Formation'], verdict: 'NONE', explanation: 'Formation : hors R&D.' },
    ],
  },
];

export function cardsetById(id: string): Cardset {
  const c = CARDSETS.find((c) => c.id === id);
  if (!c) throw new Error(`Jeu de cartes inconnu : ${id}`);
  return c;
}
