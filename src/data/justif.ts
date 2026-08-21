// Mini-jeu de rédaction du justificatif technique (§7.5).
// Un set générique réutilisable : 5 blocs, 4 formulations chacun.

import type { JustifSet } from '../engine/types';

export const GENERIC_JUSTIF: JustifSet = {
  id: 'justif_generic',
  clientId: '*',
  blocks: [
    {
      id: 'etat_art',
      title: 'État de l’art',
      hint: 'Situez les travaux par rapport aux connaissances existantes, sources à l’appui.',
      options: [
        { id: 'j1a', role: 'optimal', text: 'Publications et brevets recensés (X, Y, Z) : la performance visée dépasse ce qu’ils permettent.', critique: 'État de l’art documenté et opposable : sources réelles, comparaison chiffrée.' },
        { id: 'j1b', role: 'acceptable', text: 'Une revue de la littérature a été menée ; les solutions existantes ne couvrent pas notre cas d’usage.', critique: 'Correct mais peu précis : citez les sources et l’écart de performance.' },
        { id: 'j1c', role: 'tempting', text: 'Le marché ne propose rien d’équivalent à notre connaissance, nous avons bien regardé.', critique: 'Argument commercial, pas scientifique : « à notre connaissance » n’est pas un état de l’art.' },
        { id: 'j1d', role: 'poor', text: 'C’est une technologie totalement innovante et unique sur son marché.', critique: 'Affirmation vague et invérifiable : sans faille au contrôle.' },
      ],
    },
    {
      id: 'verrou',
      title: 'Verrou technique',
      hint: 'Caractérisez l’obstacle que l’état de l’art ne permet pas de franchir.',
      options: [
        { id: 'j2a', role: 'optimal', text: 'Le verrou : une latence < 20 ms sous contrainte réseau, qu’aucune méthode connue ne garantit.', critique: 'Verrou caractérisé, mesurable et daté : idéal.' },
        { id: 'j2b', role: 'acceptable', text: 'Nous avons rencontré un obstacle technique sur la performance, non résolu par les outils standard.', critique: 'Verrou plausible mais à rendre mesurable pour être opposable.' },
        { id: 'j2c', role: 'tempting', text: 'Le projet était particulièrement ambitieux et complexe pour nos équipes.', critique: 'Complexité ≠ verrou : un vérificateur ne retiendra pas « c’était ambitieux ».' },
        { id: 'j2d', role: 'poor', text: 'C’était très difficile et cela nous a pris énormément de temps de travail.', critique: 'Difficulté et temps passé ne caractérisent pas un verrou scientifique.' },
      ],
    },
    {
      id: 'incertitude',
      title: 'Incertitude scientifique',
      hint: 'L’incertitude porte sur l’aboutissement, pas sur le planning.',
      options: [
        { id: 'j3a', role: 'optimal', text: 'Au démarrage, il était incertain qu’une solution existe : deux hypothèses concurrentes.', critique: 'Incertitude sur l’aboutissement, bien posée.' },
        { id: 'j3b', role: 'acceptable', text: 'Le résultat n’était pas acquis compte tenu des contraintes du projet.', critique: 'Correct mais générique : précisez les hypothèses en jeu.' },
        { id: 'j3c', role: 'tempting', text: 'Nous n’étions pas sûrs de tenir les délais annoncés pour le projet.', critique: 'Incertitude de planning : hors champ du CIR.' },
        { id: 'j3d', role: 'poor', text: 'On savait bien que ça marcherait, il fallait juste le faire.', critique: 'Absence d’incertitude : disqualifie l’éligibilité.' },
      ],
    },
    {
      id: 'demarche',
      title: 'Démarche expérimentale',
      hint: 'Itérations, hypothèses, protocoles, résultats — négatifs conservés.',
      options: [
        { id: 'j4a', role: 'optimal', text: 'Cinq itérations documentées, protocoles et résultats négatifs archivés et datés.', critique: 'Démarche tracée : la preuve par excellence.' },
        { id: 'j4b', role: 'acceptable', text: 'Nous avons procédé par essais successifs jusqu’à obtenir un résultat satisfaisant.', critique: 'Démarche réelle mais peu tracée : conservez les échecs.' },
        { id: 'j4c', role: 'tempting', text: 'L’équipe a beaucoup travaillé et a fini par trouver la bonne approche.', critique: 'Récit d’effort, pas de protocole : faible au contrôle.' },
        { id: 'j4d', role: 'poor', text: 'Nous avons appliqué la méthode de travail habituelle de l’équipe.', critique: 'Application de l’existant : ce n’est pas une démarche expérimentale.' },
      ],
    },
    {
      id: 'progres',
      title: 'Résultat et progrès',
      hint: 'Progrès par rapport à l’état de l’art, pas nouveauté interne.',
      options: [
        { id: 'j5a', role: 'optimal', text: '+35 % de performance par rapport à la meilleure solution publiée, mesures à l’appui.', critique: 'Progrès mesuré et référencé : impeccable.' },
        { id: 'j5b', role: 'acceptable', text: 'Les résultats obtenus améliorent nettement l’état antérieur des choses.', critique: 'Vrai mais à chiffrer contre l’état de l’art externe.' },
        { id: 'j5c', role: 'tempting', text: 'C’est une très grande avancée pour notre entreprise et pour nos clients.', critique: 'Nouveauté interne : ne caractérise pas un progrès sur l’état de l’art.' },
        { id: 'j5d', role: 'poor', text: 'Le produit est désormais opérationnel et vendu à nos clients.', critique: 'Résultat commercial : sans rapport avec le progrès scientifique.' },
      ],
    },
  ],
};
