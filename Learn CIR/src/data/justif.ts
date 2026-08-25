// Mini-jeu de rédaction du justificatif technique (§7.5).
//
// Un jeu par secteur : les cinq blocs sont universels — c'est la structure
// attendue par l'administration — mais les formulations parlent du métier du
// client. Un justificatif rédigé à l'identique pour une biotech et pour une ESN
// apprendrait au joueur que le contenu du dossier n'a pas d'importance, ce qui
// est exactement l'inverse de la leçon.

import type { JustifSet, Sector } from '../engine/types';

export const JUSTIF_SETS: Record<Sector, JustifSet> = {
  SAAS: {
    id: 'justif_saas',
    clientId: '*',
    blocks: [
      {
        id: 'etat_art',
        title: 'État de l’art',
        hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
        options: [
          { id: 'jsaas1a', role: 'optimal', text: 'Les publications et brevets sur la prédiction de flux plafonnent 15 points sous notre cible.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
          { id: 'jsaas1b', role: 'acceptable', text: 'Une revue des travaux publiés a été menée ; aucun ne couvre notre volumétrie.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
          { id: 'jsaas1c', role: 'tempting', text: 'Aucun éditeur du marché ne propose l’équivalent, à notre connaissance à ce jour.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
          { id: 'jsaas1d', role: 'poor', text: 'Notre moteur est une technologie totalement inédite sur son marché.', critique: 'Affirmation vague et invérifiable : sans valeur au contrôle.' },
        ],
      },
      {
        id: 'verrou',
        title: 'Verrou technique',
        hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
        options: [
          { id: 'jsaas2a', role: 'optimal', text: 'Le verrou : tenir 20 ms de latence sous charge réseau dégradée, qu’aucune méthode ne garantit.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
          { id: 'jsaas2b', role: 'acceptable', text: 'Nous avons buté sur un obstacle de performance que les outils standard ne résolvent pas.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
          { id: 'jsaas2c', role: 'tempting', text: 'Le projet était particulièrement ambitieux et complexe pour une équipe de notre taille.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
          { id: 'jsaas2d', role: 'poor', text: 'C’était très difficile à écrire et cela nous a pris énormément de temps de travail.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
        ],
      },
      {
        id: 'incertitude',
        title: 'Incertitude scientifique',
        hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
        options: [
          { id: 'jsaas3a', role: 'optimal', text: 'Au démarrage, rien ne garantissait la convergence : deux familles de modèles en lice.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
          { id: 'jsaas3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu des contraintes de volumétrie.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
          { id: 'jsaas3c', role: 'tempting', text: 'Nous n’étions pas certains de tenir les délais annoncés à nos clients.', critique: 'Incertitude de planning : hors champ du CIR.' },
          { id: 'jsaas3d', role: 'poor', text: 'On savait bien que ça finirait par marcher, il fallait juste s’y mettre.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
        ],
      },
      {
        id: 'demarche',
        title: 'Démarche expérimentale',
        hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
        options: [
          { id: 'jsaas4a', role: 'optimal', text: 'Cinq itérations documentées, protocoles versionnés et résultats négatifs archivés.', critique: 'Démarche tracée : la preuve par excellence.' },
          { id: 'jsaas4b', role: 'acceptable', text: 'Nous avons procédé par essais successifs jusqu’à obtenir un modèle satisfaisant.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
          { id: 'jsaas4c', role: 'tempting', text: 'L’équipe a beaucoup travaillé et a fini par trouver la bonne architecture.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
          { id: 'jsaas4d', role: 'poor', text: 'Nous avons appliqué la méthode d’ingénierie habituelle de l’équipe.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
        ],
      },
      {
        id: 'progres',
        title: 'Résultat et progrès',
        hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
        options: [
          { id: 'jsaas5a', role: 'optimal', text: '+35 % de précision par rapport au meilleur modèle publié, mesures à l’appui.', critique: 'Progrès mesuré et référencé : impeccable.' },
          { id: 'jsaas5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement notre moteur précédent.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
          { id: 'jsaas5c', role: 'tempting', text: 'C’est une très grande avancée pour notre produit et pour nos clients.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
          { id: 'jsaas5d', role: 'poor', text: 'Le module est désormais en production et vendu à nos clients.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
        ],
      },
    ],
  },
  INDUS: {
    id: 'justif_indus',
    clientId: '*',
    blocks: [
      {
        id: 'etat_art',
        title: 'État de l’art',
        hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
        options: [
          { id: 'jindus1a', role: 'optimal', text: 'Aucune donnée publiée ne couvre la tenue en fatigue de ce couple d’alliages.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
          { id: 'jindus1b', role: 'acceptable', text: 'Une revue des normes et publications a été menée : le cas n’y figure pas.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
          { id: 'jindus1c', role: 'tempting', text: 'Aucun concurrent ne sait faire cette pièce, à notre connaissance à ce jour.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
          { id: 'jindus1d', role: 'poor', text: 'Notre procédé est une technologie totalement inédite dans la profession.', critique: 'Affirmation vague et invérifiable : sans valeur au contrôle.' },
        ],
      },
      {
        id: 'verrou',
        title: 'Verrou technique',
        hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
        options: [
          { id: 'jindus2a', role: 'optimal', text: 'Le verrou : souder deux alliages dissemblables sans amorce de fissure en fatigue.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
          { id: 'jindus2b', role: 'acceptable', text: 'Nous avons buté sur un obstacle de tenue mécanique que le calcul ne prédit pas.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
          { id: 'jindus2c', role: 'tempting', text: 'La pièce était particulièrement ambitieuse et complexe à mettre au point.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
          { id: 'jindus2d', role: 'poor', text: 'C’était très difficile à usiner et cela nous a pris énormément de temps.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
        ],
      },
      {
        id: 'incertitude',
        title: 'Incertitude scientifique',
        hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
        options: [
          { id: 'jindus3a', role: 'optimal', text: 'Au démarrage, rien ne disait qu’une soudure tiendrait : deux voies opposées testées.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
          { id: 'jindus3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu des contraintes de tenue.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
          { id: 'jindus3c', role: 'tempting', text: 'Nous n’étions pas certains de livrer le prototype à la date promise.', critique: 'Incertitude de planning : hors champ du CIR.' },
          { id: 'jindus3d', role: 'poor', text: 'On savait que ça marcherait, il n’y avait qu’à lancer les essais.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
        ],
      },
      {
        id: 'demarche',
        title: 'Démarche expérimentale',
        hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
        options: [
          { id: 'jindus4a', role: 'optimal', text: 'Campagnes d’essais destructifs datées, éprouvettes tracées, échecs conservés.', critique: 'Démarche tracée : la preuve par excellence.' },
          { id: 'jindus4b', role: 'acceptable', text: 'Nous avons procédé par essais successifs jusqu’à obtenir une soudure correcte.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
          { id: 'jindus4c', role: 'tempting', text: 'L’atelier a beaucoup travaillé et a fini par trouver le bon paramétrage.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
          { id: 'jindus4d', role: 'poor', text: 'Nous avons appliqué les paramètres de soudage habituels de l’atelier.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
        ],
      },
      {
        id: 'progres',
        title: 'Résultat et progrès',
        hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
        options: [
          { id: 'jindus5a', role: 'optimal', text: '+30 % de durée de vie en fatigue par rapport à la meilleure référence publiée.', critique: 'Progrès mesuré et référencé : impeccable.' },
          { id: 'jindus5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement notre pièce précédente.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
          { id: 'jindus5c', role: 'tempting', text: 'C’est une très grande avancée pour notre bureau d’études et l’atelier.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
          { id: 'jindus5d', role: 'poor', text: 'La pièce est désormais en série et livrée à notre donneur d’ordre.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
        ],
      },
    ],
  },
  BIOTECH: {
    id: 'justif_biotech',
    clientId: '*',
    blocks: [
      {
        id: 'etat_art',
        title: 'État de l’art',
        hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
        options: [
          { id: 'jbiotech1a', role: 'optimal', text: 'Aucune formulation publiée ne stabilise ce principe actif à température ambiante.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
          { id: 'jbiotech1b', role: 'acceptable', text: 'Une revue de la littérature a été menée ; les excipients connus ne suffisent pas.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
          { id: 'jbiotech1c', role: 'tempting', text: 'Aucun laboratoire ne sait le faire, à notre connaissance et à ce jour.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
          { id: 'jbiotech1d', role: 'poor', text: 'Notre candidat est une molécule totalement inédite et sans équivalent.', critique: 'Affirmation vague et invérifiable : sans valeur au contrôle.' },
        ],
      },
      {
        id: 'verrou',
        title: 'Verrou technique',
        hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
        options: [
          { id: 'jbiotech2a', role: 'optimal', text: 'Le verrou : stabiliser la molécule 24 mois hors chaîne du froid, jamais obtenu.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
          { id: 'jbiotech2b', role: 'acceptable', text: 'Nous avons buté sur un obstacle de stabilité que les excipients standard ne lèvent pas.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
          { id: 'jbiotech2c', role: 'tempting', text: 'Le programme était particulièrement ambitieux et complexe pour nos équipes.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
          { id: 'jbiotech2d', role: 'poor', text: 'C’était très difficile à formuler et cela nous a pris énormément de temps.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
        ],
      },
      {
        id: 'incertitude',
        title: 'Incertitude scientifique',
        hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
        options: [
          { id: 'jbiotech3a', role: 'optimal', text: 'Au démarrage, l’existence même d’une formulation stable était incertaine.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
          { id: 'jbiotech3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu des contraintes de conservation.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
          { id: 'jbiotech3c', role: 'tempting', text: 'Nous n’étions pas certains de tenir le calendrier de dépôt réglementaire.', critique: 'Incertitude de planning : hors champ du CIR.' },
          { id: 'jbiotech3d', role: 'poor', text: 'On savait que ça marcherait, il fallait juste cribler assez de composés.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
        ],
      },
      {
        id: 'demarche',
        title: 'Démarche expérimentale',
        hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
        options: [
          { id: 'jbiotech4a', role: 'optimal', text: 'Plans d’expériences datés, réplicats tracés, formulations écartées conservées.', critique: 'Démarche tracée : la preuve par excellence.' },
          { id: 'jbiotech4b', role: 'acceptable', text: 'Nous avons procédé par criblages successifs jusqu’à un résultat satisfaisant.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
          { id: 'jbiotech4c', role: 'tempting', text: 'L’équipe a beaucoup travaillé et a fini par trouver la bonne formulation.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
          { id: 'jbiotech4d', role: 'poor', text: 'Nous avons appliqué le protocole de formulation habituel du laboratoire.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
        ],
      },
      {
        id: 'progres',
        title: 'Résultat et progrès',
        hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
        options: [
          { id: 'jbiotech5a', role: 'optimal', text: 'Stabilité portée de 6 à 24 mois contre la meilleure formulation publiée.', critique: 'Progrès mesuré et référencé : impeccable.' },
          { id: 'jbiotech5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement notre formulation antérieure.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
          { id: 'jbiotech5c', role: 'tempting', text: 'C’est une très grande avancée pour notre laboratoire et nos partenaires.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
          { id: 'jbiotech5d', role: 'poor', text: 'Le lot clinique est désormais produit et livré au centre investigateur.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
        ],
      },
    ],
  },
  AGRI: {
    id: 'justif_agri',
    clientId: '*',
    blocks: [
      {
        id: 'etat_art',
        title: 'État de l’art',
        hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
        options: [
          { id: 'jagri1a', role: 'optimal', text: 'Aucune publication ne décrit une émulsion sans additif tenant au-delà de 40 °C.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
          { id: 'jagri1b', role: 'acceptable', text: 'Une revue des travaux du secteur a été menée : le cas n’y est pas traité.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
          { id: 'jagri1c', role: 'tempting', text: 'Aucun industriel ne propose l’équivalent, à notre connaissance à ce jour.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
          { id: 'jagri1d', role: 'poor', text: 'Notre recette est une innovation totalement inédite sur le marché.', critique: 'Affirmation vague et invérifiable : sans valeur au contrôle.' },
        ],
      },
      {
        id: 'verrou',
        title: 'Verrou technique',
        hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
        options: [
          { id: 'jagri2a', role: 'optimal', text: 'Le verrou : tenir l’émulsion à 40 °C sans additif de synthèse, jamais démontré.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
          { id: 'jagri2b', role: 'acceptable', text: 'Nous avons buté sur un obstacle de stabilité que les procédés connus ne lèvent pas.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
          { id: 'jagri2c', role: 'tempting', text: 'La formulation était particulièrement ambitieuse et complexe à maîtriser.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
          { id: 'jagri2d', role: 'poor', text: 'C’était très difficile à stabiliser et cela nous a pris énormément de temps.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
        ],
      },
      {
        id: 'incertitude',
        title: 'Incertitude scientifique',
        hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
        options: [
          { id: 'jagri3a', role: 'optimal', text: 'Au démarrage, rien ne garantissait qu’une combinaison protéique tienne.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
          { id: 'jagri3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu des contraintes de texture visées.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
          { id: 'jagri3c', role: 'tempting', text: 'Nous n’étions pas certains de sortir le produit pour la saison prévue.', critique: 'Incertitude de planning : hors champ du CIR.' },
          { id: 'jagri3d', role: 'poor', text: 'On savait que ça marcherait, il suffisait d’essayer assez de recettes.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
        ],
      },
      {
        id: 'demarche',
        title: 'Démarche expérimentale',
        hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
        options: [
          { id: 'jagri4a', role: 'optimal', text: 'Plans d’expériences datés, analyses rhéologiques tracées, échecs conservés.', critique: 'Démarche tracée : la preuve par excellence.' },
          { id: 'jagri4b', role: 'acceptable', text: 'Nous avons procédé par essais successifs jusqu’à une texture satisfaisante.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
          { id: 'jagri4c', role: 'tempting', text: 'L’équipe a beaucoup travaillé et a fini par trouver la bonne combinaison.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
          { id: 'jagri4d', role: 'poor', text: 'Nous avons appliqué la méthode de formulation habituelle du laboratoire.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
        ],
      },
      {
        id: 'progres',
        title: 'Résultat et progrès',
        hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
        options: [
          { id: 'jagri5a', role: 'optimal', text: 'Tenue portée de 25 à 45 °C par rapport à la meilleure référence publiée.', critique: 'Progrès mesuré et référencé : impeccable.' },
          { id: 'jagri5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement notre gamme précédente.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
          { id: 'jagri5c', role: 'tempting', text: 'C’est une très grande avancée pour notre marque et notre distribution.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
          { id: 'jagri5d', role: 'poor', text: 'Le produit est désormais référencé et vendu en grande distribution.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
        ],
      },
    ],
  },
  GREENTECH: {
    id: 'justif_green',
    clientId: '*',
    blocks: [
      {
        id: 'etat_art',
        title: 'État de l’art',
        hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
        options: [
          { id: 'jgreen1a', role: 'optimal', text: 'Aucun composite biosourcé publié n’atteint la tenue mécanique que nous visons.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
          { id: 'jgreen1b', role: 'acceptable', text: 'Une revue des travaux et brevets a été menée : l’écart de performance demeure.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
          { id: 'jgreen1c', role: 'tempting', text: 'Aucun acteur du secteur ne sait le faire, à notre connaissance à ce jour.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
          { id: 'jgreen1d', role: 'poor', text: 'Notre matériau est une innovation totalement inédite et sans équivalent.', critique: 'Affirmation vague et invérifiable : sans valeur au contrôle.' },
        ],
      },
      {
        id: 'verrou',
        title: 'Verrou technique',
        hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
        options: [
          { id: 'jgreen2a', role: 'optimal', text: 'Le verrou : atteindre 80 MPa avec une fibre végétale, jamais obtenu à ce jour.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
          { id: 'jgreen2b', role: 'acceptable', text: 'Nous avons buté sur un obstacle de tenue que les formulations connues ne lèvent pas.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
          { id: 'jgreen2c', role: 'tempting', text: 'Le matériau était particulièrement ambitieux et complexe à mettre au point.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
          { id: 'jgreen2d', role: 'poor', text: 'C’était très difficile à mettre au point et cela nous a demandé beaucoup de temps.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
        ],
      },
      {
        id: 'incertitude',
        title: 'Incertitude scientifique',
        hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
        options: [
          { id: 'jgreen3a', role: 'optimal', text: 'Au démarrage, rien ne disait que la matrice tiendrait : deux voies testées.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
          { id: 'jgreen3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu des contraintes de vieillissement.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
          { id: 'jgreen3c', role: 'tempting', text: 'Nous n’étions pas certains de tenir le calendrier du consortium européen.', critique: 'Incertitude de planning : hors champ du CIR.' },
          { id: 'jgreen3d', role: 'poor', text: 'On savait que ça marcherait, il fallait juste multiplier les essais.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
        ],
      },
      {
        id: 'demarche',
        title: 'Démarche expérimentale',
        hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
        options: [
          { id: 'jgreen4a', role: 'optimal', text: 'Vieillissements accélérés datés, éprouvettes tracées, hypothèses invalidées gardées.', critique: 'Démarche tracée : la preuve par excellence.' },
          { id: 'jgreen4b', role: 'acceptable', text: 'Nous avons procédé par essais successifs jusqu’à une tenue satisfaisante.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
          { id: 'jgreen4c', role: 'tempting', text: 'L’équipe s’est beaucoup investie et a fini par trouver la bonne composition.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
          { id: 'jgreen4d', role: 'poor', text: 'Nous avons appliqué la méthode de caractérisation habituelle du laboratoire.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
        ],
      },
      {
        id: 'progres',
        title: 'Résultat et progrès',
        hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
        options: [
          { id: 'jgreen5a', role: 'optimal', text: '+40 % de tenue mécanique par rapport au meilleur composite biosourcé publié.', critique: 'Progrès mesuré et référencé : impeccable.' },
          { id: 'jgreen5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement notre matériau précédent.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
          { id: 'jgreen5c', role: 'tempting', text: 'C’est une très grande avancée pour notre entreprise et pour la filière.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
          { id: 'jgreen5d', role: 'poor', text: 'Le matériau est désormais industrialisé et vendu à nos premiers clients.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
        ],
      },
    ],
  },
  SERVICES: {
    id: 'justif_services',
    clientId: '*',
    blocks: [
      {
        id: 'etat_art',
        title: 'État de l’art',
        hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
        options: [
          { id: 'jservices1a', role: 'optimal', text: 'Aucune méthode publiée ne résiste au recoupement sur des données aussi rares.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
          { id: 'jservices1b', role: 'acceptable', text: 'Une revue des travaux d’anonymisation a été menée : le cas n’y est pas couvert.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
          { id: 'jservices1c', role: 'tempting', text: 'Aucune ESN ne sait le faire, à notre connaissance et à ce jour.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
          { id: 'jservices1d', role: 'poor', text: 'Notre moteur interne est une technologie totalement inédite du marché.', critique: 'Affirmation vague et invérifiable : sans valeur au contrôle.' },
        ],
      },
      {
        id: 'verrou',
        title: 'Verrou technique',
        hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
        options: [
          { id: 'jservices2a', role: 'optimal', text: 'Le verrou : garantir la non-réidentification sur données rares, jamais démontré.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
          { id: 'jservices2b', role: 'acceptable', text: 'Nous avons buté sur un obstacle de robustesse que les bibliothèques ne lèvent pas.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
          { id: 'jservices2c', role: 'tempting', text: 'Le sujet était particulièrement ambitieux et complexe pour nos consultants.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
          { id: 'jservices2d', role: 'poor', text: 'C’était très difficile à coder et cela nous a pris énormément de temps.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
        ],
      },
      {
        id: 'incertitude',
        title: 'Incertitude scientifique',
        hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
        options: [
          { id: 'jservices3a', role: 'optimal', text: 'Au démarrage, l’existence d’une garantie de robustesse était incertaine.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
          { id: 'jservices3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu de la rareté des données.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
          { id: 'jservices3c', role: 'tempting', text: 'Nous n’étions pas certains de tenir les délais promis à nos clients.', critique: 'Incertitude de planning : hors champ du CIR.' },
          { id: 'jservices3d', role: 'poor', text: 'On savait que ça marcherait, il fallait juste y consacrer du temps.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
        ],
      },
      {
        id: 'demarche',
        title: 'Démarche expérimentale',
        hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
        options: [
          { id: 'jservices4a', role: 'optimal', text: 'Protocoles datés, jeux d’attaque versionnés, approches écartées conservées.', critique: 'Démarche tracée : la preuve par excellence.' },
          { id: 'jservices4b', role: 'acceptable', text: 'Nous avons procédé par essais successifs jusqu’à un niveau satisfaisant.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
          { id: 'jservices4c', role: 'tempting', text: 'L’équipe a beaucoup travaillé et a fini par trouver la bonne approche.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
          { id: 'jservices4d', role: 'poor', text: 'Nous avons appliqué la méthode d’ingénierie habituelle de l’agence.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
        ],
      },
      {
        id: 'progres',
        title: 'Résultat et progrès',
        hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
        options: [
          { id: 'jservices5a', role: 'optimal', text: 'Risque de réidentification divisé par 6 face à la meilleure méthode publiée.', critique: 'Progrès mesuré et référencé : impeccable.' },
          { id: 'jservices5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement notre outil interne précédent.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
          { id: 'jservices5c', role: 'tempting', text: 'C’est une très grande avancée pour notre agence et pour nos consultants.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
          { id: 'jservices5d', role: 'poor', text: 'L’outil est désormais déployé et utilisé sur toutes nos missions.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
        ],
      },
    ],
  },
};

/** Jeu de repli : un client sans secteur reconnu garde un justificatif jouable. */
export const GENERIC_JUSTIF: JustifSet = JUSTIF_SETS.SAAS;

export function justifForSector(sector: Sector): JustifSet {
  return JUSTIF_SETS[sector] ?? GENERIC_JUSTIF;
}
