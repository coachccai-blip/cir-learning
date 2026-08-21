// Silhouette anonyme homme/femme pour les prospects au téléphone :
// on ne voit pas son interlocuteur avant de l'avoir signé.

interface AnonymousAvatarProps {
  gender: 'F' | 'M';
  className?: string;
  /** Affiche le badge téléphone (appel en cours). */
  phone?: boolean;
}

export function AnonymousAvatar({ gender, className, phone }: AnonymousAvatarProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={gender === 'F' ? 'Interlocutrice au téléphone (visage inconnu)' : 'Interlocuteur au téléphone (visage inconnu)'}
      style={{ display: 'block', width: '100%', height: '100%' }}
    >
      <defs>
        <clipPath id={`anon-clip-${gender}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="var(--bg-sunken, #e7ecf1)" />
      <g clipPath={`url(#anon-clip-${gender})`} fill="var(--text-faint, #8aa0b0)" opacity="0.75">
        {/* buste */}
        <path d="M16 100 C16 79 33 71 50 71 C67 71 84 79 84 100 Z" />
        {/* cou */}
        <rect x="43" y="57" width="14" height="16" rx="6" />
        {/* tête */}
        <circle cx="50" cy="42" r="19" />
        {/* silhouette de coiffure : carré mi-long (F) / coupe courte (M) */}
        {gender === 'F' ? (
          <path d="M29 44 C29 22 71 22 71 44 L71 62 C71 66 66 66 66 62 L66 46 C60 38 40 38 34 46 L34 62 C34 66 29 66 29 62 Z" />
        ) : (
          <path d="M30 40 C32 24 68 24 70 40 C64 32 36 32 30 40 Z" />
        )}
      </g>
      {/* point d'interrogation discret */}
      <text
        x="50"
        y="50"
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        fill="var(--bg-elevated, #ffffff)"
        fontFamily="inherit"
      >
        ?
      </text>
      <circle cx="50" cy="50" r="47" fill="none" stroke="var(--border-strong, #b9c6d2)" strokeWidth="2.5" strokeDasharray="5 5" />
      {/* Pastille « au téléphone » : un combiné tracé, et non un émoji dont le
          rendu varie d'un système à l'autre au milieu d'un SVG. */}
      {phone && (
        <g>
          <circle cx="80" cy="80" r="13" fill="var(--brand-orange-main, #ff6633)" />
          <path
            d="M75.6 74.8l1.7 3.1-1.4 1.5a8.4 8.4 0 0 0 4.3 4.3l1.5-1.4 3.1 1.7-.4 2.1a1.4 1.4 0 0 1-1.6 1.1c-5.8-.9-10.6-5.7-11.4-11.5a1.4 1.4 0 0 1 1.1-1.5z"
            fill="#fff"
          />
        </g>
      )}
    </svg>
  );
}
