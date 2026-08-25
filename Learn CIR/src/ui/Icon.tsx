/**
 * Jeu d'icônes vectorielles.
 *
 * Les pictogrammes du jeu étaient des émojis : rendu différent sur chaque
 * système, taille incontrôlable, alignement approximatif et couleur imposée
 * par la police. Ces tracés-là suivent la couleur du texte (`currentColor`),
 * s'alignent sur la ligne de base et gardent la même graisse partout.
 *
 * Les émojis restent employés là où ils sont expressifs — une célébration, un
 * badge — jamais comme mobilier d'interface.
 *
 * Grille de 24, trait de 1,8, extrémités arrondies : un seul dessin pour toute
 * la famille.
 */

export type IconName =
  | 'relation'
  | 'technique'
  | 'shield'
  | 'trend'
  | 'trendDown'
  | 'bolt'
  | 'star'
  | 'euro'
  | 'clock'
  | 'history'
  | 'calendar'
  | 'alert'
  | 'info'
  | 'check'
  | 'cross'
  | 'dash'
  | 'lock'
  | 'unlock'
  | 'flag'
  | 'sparkle'
  | 'doc'
  | 'bulb'
  | 'phone'
  | 'mail'
  | 'inbox'
  | 'users'
  | 'book'
  | 'trophy'
  | 'medal'
  | 'sliders'
  | 'arrowRight'
  | 'arrowLeft'
  | 'play'
  | 'target'
  | 'scale'
  | 'search'
  | 'flame'
  | 'speaker'
  | 'speakerOff'
  | 'stop'
  | 'building'
  | 'cards'
  | 'ladder'
  | 'briefcase'
  | 'link';

/** Tracés au trait — aucun `fill`, tout suit `currentColor`. */
const PATHS: Record<IconName, string[]> = {
  relation: [
    'M16.5 19.5v-1.4a3.6 3.6 0 0 0-3.6-3.6H7.1a3.6 3.6 0 0 0-3.6 3.6v1.4',
    'M10 11.4a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M16.4 4.8a3.5 3.5 0 0 1 0 6.8',
    'M20.5 19.5v-1.4a3.6 3.6 0 0 0-2.7-3.5',
  ],
  technique: ['M9.2 3h5.6', 'M10.2 3v6.4L5 18.1A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-2.9l-5.2-8.7V3', 'M7.6 14.5h8.8'],
  shield: ['M12 3.2 5 6.1v5.4c0 4.2 2.9 7.6 7 9.3 4.1-1.7 7-5.1 7-9.3V6.1z', 'M9.3 12.1l1.9 1.9 3.6-3.9'],
  trend: ['M3.5 16.8 9 11.3l3.4 3.4L20.5 6.6', 'M20.5 6.6h-4.8', 'M20.5 6.6v4.8'],
  trendDown: ['M3.5 7.2 9 12.7l3.4-3.4 8.1 8.1', 'M20.5 17.4h-4.8', 'M20.5 17.4v-4.8'],
  bolt: ['M13.3 2.5 4.8 13.6h5.6L10.7 21.5l8.5-11.1h-5.6z'],
  star: ['M12 3.6l2.6 5.3 5.8.9-4.2 4.1 1 5.8L12 17l-5.2 2.7 1-5.8-4.2-4.1 5.8-.9z'],
  euro: ['M17.4 6.6A6.6 6.6 0 0 0 7.6 9.2', 'M7.6 14.8a6.6 6.6 0 0 0 9.8 2.6', 'M4.2 10.4h8.6', 'M4.2 13.6h8.6'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.2V12l3.2 2'],
  history: ['M3.6 12a8.4 8.4 0 1 0 2.6-6', 'M3.4 4.4v4.2h4.2', 'M12 7.6V12l3 1.9'],
  calendar: ['M4.5 6.6h15v13.4h-15z', 'M4.5 10.6h15', 'M8.6 3.8v3.4', 'M15.4 3.8v3.4'],
  alert: ['M12 3.7 2.6 20.3h18.8z', 'M12 9.6v4.3', 'M12 17.1h.01'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5.4', 'M12 7.6h.01'],
  check: ['M4.6 12.6 9.5 17.4 19.6 6.9'],
  cross: ['M6.2 6.2l11.6 11.6', 'M17.8 6.2 6.2 17.8'],
  dash: ['M5.5 12h13'],
  lock: ['M5.8 10.4h12.4v9.8H5.8z', 'M8.6 10.4V7.6a3.4 3.4 0 1 1 6.8 0v2.8', 'M12 14.2v2.2'],
  unlock: ['M5.8 10.4h12.4v9.8H5.8z', 'M8.6 10.4V7.6a3.4 3.4 0 0 1 6.6-1.1', 'M12 14.2v2.2'],
  flag: ['M5.4 21.2V3.4', 'M5.4 4h11.2l-2 3.6 2 3.6H5.4'],
  sparkle: ['M12 3.2l1.8 4.6 4.6 1.8-4.6 1.8L12 16l-1.8-4.6L5.6 9.6l4.6-1.8z', 'M18.4 15.4l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z'],
  doc: ['M6.4 3.2h6.8l4.4 4.4v13.2H6.4z', 'M13.2 3.2v4.4h4.4', 'M9.2 12.6h5.6', 'M9.2 16.2h5.6'],
  bulb: ['M12 3.2a5.9 5.9 0 0 0-3.3 10.8c.6.4.9 1 .9 1.7h4.8c0-.7.3-1.3.9-1.7A5.9 5.9 0 0 0 12 3.2Z', 'M9.6 18.2h4.8', 'M10.4 21h3.2'],
  phone: ['M7.4 3.6 9.8 8l-2 2.1a12 12 0 0 0 6.1 6.1l2.1-2 4.4 2.4-.6 3a2 2 0 0 1-2.2 1.6C10.4 20.4 3.6 13.6 2.4 5.4A2 2 0 0 1 4 3.2z'],
  mail: ['M3.6 5.8h16.8v12.4H3.6z', 'M3.6 6.6 12 13l8.4-6.4'],
  inbox: ['M3.6 5.8h16.8v12.4H3.6z', 'M3.6 13.4h4.2l1.4 2.4h5.6l1.4-2.4h4.2'],
  users: ['M15.6 19.6v-1.5a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.1v1.5', 'M9.3 11a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z', 'M21 19.6v-1.5a3.6 3.6 0 0 0-2.7-3.5', 'M15.6 4a3.6 3.6 0 0 1 0 7'],
  book: ['M4.2 5.2A2.4 2.4 0 0 1 6.6 2.8H19.8v15.4H6.6a2.4 2.4 0 0 0-2.4 2.4z', 'M4.2 18.2A2.4 2.4 0 0 1 6.6 15.8H19.8'],
  trophy: ['M8 3.4h8v5.2a4 4 0 0 1-8 0z', 'M8 4.8H5.2v1.6a3 3 0 0 0 3 3', 'M16 4.8h2.8v1.6a3 3 0 0 1-3 3', 'M12 12.6v4', 'M8.6 20.6h6.8'],
  medal: ['M12 20.4a5.6 5.6 0 1 0 0-11.2 5.6 5.6 0 0 0 0 11.2Z', 'M9 9.6 6.6 3.4h10.8L15 9.6', 'M12 12.4l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9 14.6l2-.3z'],
  sliders: ['M4 7.4h9.4', 'M17.6 7.4h2.4', 'M4 16.6h3', 'M11.2 16.6h8.8', 'M15.5 9.6a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z', 'M9.1 18.8a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z'],
  arrowRight: ['M4.4 12h14.6', 'M13.4 6.4 19 12l-5.6 5.6'],
  arrowLeft: ['M19.6 12H5', 'M10.6 6.4 5 12l5.6 5.6'],
  play: ['M7.6 4.6 19 12 7.6 19.4z'],
  target: ['M12 20.6a8.6 8.6 0 1 0 0-17.2 8.6 8.6 0 0 0 0 17.2Z', 'M12 16.6a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2Z', 'M12 13.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z'],
  scale: ['M12 3.6v16.8', 'M7.4 20.4h9.2', 'M4.4 8h15.2', 'M4.4 8 2 14.4h4.8z', 'M19.6 8l-2.4 6.4H22z'],
  search: ['M11 18.4a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8Z', 'M16.4 16.4 20.8 20.8'],
  flame: ['M12 2.6C9.6 6 6.6 8.4 6.6 13.2a5.4 5.4 0 0 0 10.8 0c0-4.8-3-7.2-5.4-10.6Z', 'M12 12.4c-1 1.4-2 2.2-2 3.6a2 2 0 0 0 4 0c0-1.4-1-2.2-2-3.6Z'],
  speaker: ['M4 9.4h3.4L12 5.2v13.6L7.4 14.6H4z', 'M15.4 9.2a4 4 0 0 1 0 5.6', 'M18 6.6a7.6 7.6 0 0 1 0 10.8'],
  speakerOff: ['M4 9.4h3.4L12 5.2v13.6L7.4 14.6H4z', 'M16 9.8l4.4 4.4', 'M20.4 9.8L16 14.2'],
  stop: ['M6.4 6.4h11.2v11.2H6.4z'],
  building: ['M4.4 21V5.6L11 3v18', 'M11 10.2h6.4a2 2 0 0 1 2 2V21', 'M2.8 21h18.4', 'M7 8.4v.01', 'M7 12.4v.01', 'M7 16.4v.01', 'M15 14.4v.01', 'M15 17.8v.01'],
  cards: ['M8.2 7.6h9.4v12.8H8.2z', 'M5.6 16.8 3.4 5.6l8.4-1.7'],
  ladder: ['M7.4 3v18', 'M16.6 3v18', 'M7.4 7.6h9.2', 'M7.4 12h9.2', 'M7.4 16.4h9.2'],
  briefcase: ['M3.6 8.4h16.8v11H3.6z', 'M8.8 8.4V6.2a1.6 1.6 0 0 1 1.6-1.6h3.2a1.6 1.6 0 0 1 1.6 1.6v2.2', 'M3.6 13.2h16.8', 'M11 13.2v2.2h2v-2.2'],
  link: ['M10.3 13.7a3.6 3.6 0 0 0 5.2 0l2.3-2.3a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3', 'M13.7 10.3a3.6 3.6 0 0 0-5.2 0l-2.3 2.3a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3'],
};

export interface IconProps {
  name: IconName;
  /** Taille en pixels — le tracé suit, l'épaisseur est compensée. */
  size?: number;
  className?: string;
  /** Tracé plein — pour les jauges de niveau (étoiles de difficulté). */
  filled?: boolean;
  /** Titre accessible ; sans lui l'icône est décorative et masquée. */
  title?: string;
}

export function Icon({ name, size = 18, className, filled, title }: IconProps) {
  const paths = PATHS[name];
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
