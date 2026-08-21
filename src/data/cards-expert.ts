// Jeux de cartes de qualification de la deuxième saison. Données fictives.
//
// Les cartes d'Onboarding opposaient des cas nets. Ici les travaux sont
// plausibles des deux côtés de la frontière : c'est l'indice, et lui seul, qui
// tranche entre recherche, innovation et développement courant.

import type { Cardset } from '../engine/types';

export const EXPERT_CARDSETS: Cardset[] = [
  {
    id: 'cards_exp_ovalis',
    clientId: 'cli_exp_ovalis',
    cards: [
      { id: 'ov1', title: 'Enrobage résistant à la fois à la chaleur et à l’acidité', description: 'Aucun enrobage publié ne tient les deux contraintes ; l’équipe explore des matrices lipidiques inédites.', clues: ['État de l’art épuisé', 'Incertitude sur l’aboutissement'], verdict: 'RD', explanation: 'Deux contraintes contradictoires qu’aucune solution connue ne concilie : verrou caractérisé.', codexRef: 'cdx_verrou' },
      { id: 'ov2', title: 'Campagne d’essais de survie des ferments', description: 'Plans d’expériences successifs, hypothèses écrites, résultats négatifs archivés.', clues: ['Protocole', 'Échecs conservés'], verdict: 'RD', explanation: 'Démarche expérimentale tracée, échecs compris : R&D éligible.', codexRef: 'cdx_demarche' },
      { id: 'ov3', title: 'Modèle prédictif de dégradation en rayon', description: 'Construction d’un modèle de cinétique validé par confrontation à des mesures.', clues: ['Hypothèses testées', 'Validation expérimentale'], verdict: 'RD', explanation: 'Modélisation sous incertitude validée expérimentalement : R&D.', codexRef: 'cdx_incertitude' },
      { id: 'ov4', title: 'Premier lot pilote d’une gamme senior', description: 'Fabrication d’un premier lot d’un produit nouveau pour le marché, avec des procédés maîtrisés.', clues: ['Produit nouveau', 'Techniques connues'], verdict: 'CII', explanation: 'Produit nouveau sans verrou de recherche : crédit innovation, pas CIR.', codexRef: 'cdx_cii' },
      { id: 'ov5', title: 'Prototype de doseur pour la ligne pilote', description: 'Conception d’un premier exemplaire de doseur à partir de composants du commerce.', clues: ['Prototype', 'Aucune incertitude scientifique'], verdict: 'CII', explanation: 'Prototype d’un matériel nouveau sans incertitude : CII.', codexRef: 'cdx_cii' },
      { id: 'ov6', title: 'Constitution des dossiers d’homologation', description: 'Rédaction des dossiers réglementaires pour la mise sur le marché des références existantes.', clues: ['Application d’un cadre existant'], verdict: 'NONE', explanation: 'Démarche réglementaire : aucune incertitude scientifique.', codexRef: 'cdx_dev_courant' },
      { id: 'ov7', title: 'Plan de contrôle qualité des lots commerciaux', description: 'Prélèvements et analyses de routine sur la production courante.', clues: ['Contrôle de routine'], verdict: 'NONE', explanation: 'Contrôle qualité de production : hors R&D.' },
      { id: 'ov8', title: 'Transposition d’une recette sur un second site', description: 'Reproduction d’un procédé maîtrisé sur un équipement identique.', clues: ['Procédé déjà maîtrisé', 'Duplication'], verdict: 'NONE', explanation: 'Transposition d’un procédé connu : développement courant.', codexRef: 'cdx_nouveaute' },
    ],
  },
  {
    id: 'cards_exp_fluxym',
    clientId: 'cli_exp_fluxym',
    cards: [
      { id: 'fx1', title: 'Convergence d’un solveur d’ordonnancement à grande échelle', description: 'Aucun solveur publié ne garantit la convergence sur la taille de problème visée.', clues: ['Verrou algorithmique', 'État de l’art dépassé'], verdict: 'RD', explanation: 'Objectif hors de portée de l’état de l’art : R&D éligible.', codexRef: 'cdx_etat_art' },
      { id: 'fx2', title: 'Étude d’une heuristique abandonnée après six mois', description: 'Piste explorée, mesurée, documentée, puis fermée faute de résultats.', clues: ['Projet abandonné', 'Résultats consignés'], verdict: 'RD', explanation: 'Un projet R&D abandonné reste éligible : l’échec matérialise l’incertitude.', codexRef: 'cdx_echecs_eligibles' },
      { id: 'fx3', title: 'Protocole de comparaison à l’état de l’art publié', description: 'Mise en place d’un banc de mesure reproductible face aux méthodes de référence.', clues: ['Comparaison à l’état de l’art', 'Reproductibilité'], verdict: 'RD', explanation: 'Situer les travaux face au publié fait partie de la démarche de recherche.', codexRef: 'cdx_etat_art' },
      { id: 'fx4', title: 'Première version d’un module de simulation client', description: 'Fonction nouvelle sur le marché, construite avec des briques logicielles éprouvées.', clues: ['Nouveauté produit', 'Briques éprouvées'], verdict: 'CII', explanation: 'Nouveauté produit sans incertitude scientifique : CII.', codexRef: 'cdx_cii' },
      { id: 'fx5', title: 'Prototype d’interface de pilotage temps réel', description: 'Maquette fonctionnelle d’un produit nouveau, sans obstacle scientifique identifié.', clues: ['Prototype', 'Pas de verrou'], verdict: 'CII', explanation: 'Prototype de produit nouveau : crédit innovation.', codexRef: 'cdx_cii' },
      { id: 'fx6', title: 'Migration de la base vers une nouvelle version majeure', description: 'Montée de version d’un moteur de base de données du commerce.', clues: ['Migration', 'Procédure documentée'], verdict: 'NONE', explanation: 'Migration technique : développement courant.', codexRef: 'cdx_dev_courant' },
      { id: 'fx7', title: 'Correction d’anomalies remontées par le support', description: 'Traitement de tickets clients sur des fonctions existantes.', clues: ['Maintenance corrective'], verdict: 'NONE', explanation: 'Maintenance : aucune incertitude scientifique.', codexRef: 'cdx_dev_courant' },
      { id: 'fx8', title: 'Mise en conformité RGPD du portail client', description: 'Adaptation des écrans et des traitements à une obligation réglementaire.', clues: ['Conformité réglementaire'], verdict: 'NONE', explanation: 'Mise en conformité : hors R&D.' },
    ],
  },
  {
    id: 'cards_exp_neoregen',
    clientId: 'cli_exp_neoregen',
    cards: [
      { id: 'ng1', title: 'Différenciation cellulaire au rendement visé', description: 'Aucun protocole publié n’atteint le rendement nécessaire ; l’équipe teste des cocktails de facteurs.', clues: ['Verrou biologique', 'Incertitude sur l’aboutissement'], verdict: 'RD', explanation: 'Objectif inatteignable avec les protocoles connus : R&D.', codexRef: 'cdx_verrou' },
      { id: 'ng2', title: 'Essais précliniques sur modèle animal', description: 'Campagne d’essais menée pour lever l’incertitude d’efficacité, protocoles et résultats archivés.', clues: ['Protocole expérimental', 'Incertitude d’efficacité'], verdict: 'RD', explanation: 'Essais destinés à lever une incertitude scientifique : R&D.', codexRef: 'cdx_demarche' },
      { id: 'ng3', title: 'Recherche d’un marqueur de qualité du greffon', description: 'Exploration de marqueurs candidats sans certitude qu’un seul soit prédictif.', clues: ['Exploration', 'Aboutissement incertain'], verdict: 'RD', explanation: 'Recherche exploratoire sous incertitude : éligible.', codexRef: 'cdx_incertitude' },
      { id: 'ng4', title: 'Kit de prélèvement nouveau pour les centres partenaires', description: 'Conception d’un premier exemplaire de kit à partir de consommables existants.', clues: ['Produit nouveau', 'Composants du commerce'], verdict: 'CII', explanation: 'Prototype de produit nouveau sans verrou : CII.', codexRef: 'cdx_cii' },
      { id: 'ng5', title: 'Prototype de conteneur de transport réfrigéré', description: 'Premier exemplaire d’un contenant nouveau, conçu avec des techniques éprouvées.', clues: ['Prototype', 'Techniques connues'], verdict: 'CII', explanation: 'Nouveau produit sans incertitude scientifique : innovation.', codexRef: 'cdx_cii' },
      { id: 'ng6', title: 'Production des lots cliniques de série', description: 'Fabrication répétée de lots selon un procédé déjà validé.', clues: ['Procédé validé', 'Répétition'], verdict: 'NONE', explanation: 'Production en aval de la recherche : hors assiette.' },
      { id: 'ng7', title: 'Rédaction du dossier réglementaire d’essai clinique', description: 'Constitution du dossier d’autorisation auprès de l’autorité compétente.', clues: ['Démarche administrative'], verdict: 'NONE', explanation: 'Formalité réglementaire : aucune incertitude scientifique.', codexRef: 'cdx_dev_courant' },
      { id: 'ng8', title: 'Qualification annuelle de la salle blanche', description: 'Requalification périodique des équipements selon un référentiel existant.', clues: ['Référentiel existant', 'Opération périodique'], verdict: 'NONE', explanation: 'Maintien en conformité d’une installation : hors R&D.' },
    ],
  },
  {
    id: 'cards_exp_forgeal',
    clientId: 'cli_exp_forgeal',
    cards: [
      { id: 'fg1', title: 'Essais de tenue d’un alliage réfractaire inédit', description: 'Le seul chantier de l’année où le résultat n’était pas connu d’avance : essais et rebuts conservés.', clues: ['Incertitude', 'Rebuts documentés'], verdict: 'RD', explanation: 'Incertitude réelle et essais tracés : la seule ligne défendable du dossier.', codexRef: 'cdx_incertitude' },
      { id: 'fg2', title: 'Recherche d’un paramètre de coupe hors des abaques', description: 'Aucune donnée publiée ne couvre le couple matière-outil visé.', clues: ['Hors abaques publiées', 'État de l’art'], verdict: 'RD', explanation: 'Progrès face à l’état de l’art documenté : R&D.', codexRef: 'cdx_etat_art' },
      { id: 'fg3', title: 'Campagne d’essais destructifs sur éprouvettes', description: 'Série d’essais menés pour trancher entre deux hypothèses de rupture.', clues: ['Hypothèses concurrentes', 'Protocole'], verdict: 'RD', explanation: 'Démarche expérimentale pour lever une incertitude : R&D.', codexRef: 'cdx_demarche' },
      { id: 'fg4', title: 'Bâti de maintien conçu en interne', description: 'Premier exemplaire d’un matériel nouveau, faute d’équivalent dans le commerce.', clues: ['Matériel nouveau', 'Aucune incertitude'], verdict: 'CII', explanation: 'L’indisponibilité commerciale n’est pas un verrou : crédit innovation.', codexRef: 'cdx_cii' },
      { id: 'fg5', title: 'Prototype de préhenseur pour l’îlot robotisé', description: 'Premier exemplaire d’un outillage nouveau, réalisé avec des techniques standard.', clues: ['Prototype', 'Techniques standard'], verdict: 'CII', explanation: 'Prototype d’un outillage nouveau sans incertitude : CII.', codexRef: 'cdx_cii' },
      { id: 'fg6', title: 'Usinage en série des pièces réfractaires', description: 'Production récurrente sur une gamme désormais stabilisée.', clues: ['Série', 'Gamme stabilisée'], verdict: 'NONE', explanation: 'Production courante : hors R&D, malgré la technicité.', codexRef: 'cdx_dev_courant' },
      { id: 'fg7', title: 'Rédaction des gammes et des modes opératoires', description: 'Formalisation des méthodes pour l’atelier, à partir de pratiques éprouvées.', clues: ['Formalisation', 'Pratiques éprouvées'], verdict: 'NONE', explanation: 'Industrialisation en aval de la recherche : hors assiette.' },
      { id: 'fg8', title: 'Savoir-faire d’usinage rare dans la région', description: 'Compétence peu répandue localement, largement documentée dans la littérature technique.', clues: ['Rareté locale', 'Connu ailleurs'], verdict: 'NONE', explanation: 'Nouveau pour l’entreprise ou pour la région ≠ nouveau pour l’état de l’art.', codexRef: 'cdx_nouveaute' },
    ],
  },
];
