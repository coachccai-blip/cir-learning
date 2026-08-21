// Avatars SVG paramétriques déterministes (§12.3). < 8 ko, aucun binaire.
// Style flat professionnel, monochrome bleu Leyton + accent orange.

import { useState } from 'react';
import { hashString } from '../engine/rng';
import { portraitUrl } from './portraits';
import type { Expression } from '../engine/types';

const SKIN = ['#f2c9a0', '#e0a878', '#c68642', '#8d5524', '#5c3a21', '#f7d7c4'];
const HAIR = ['#2b2b2b', '#5a3a22', '#8a6a45', '#b0b0b0', '#1a1a1a', '#6d4c3d', '#c9a24b'];
const OUTFIT = ['#002c49', '#0a3d61', '#123f5c', '#1c4e6e', '#274a63', '#0e5a6e'];

interface AvatarProps {
  seed: string;
  expression?: Expression;
  className?: string;
  /** 0-100 : affiche un anneau d'humeur autour du portrait (arc proportionnel + couleur). */
  mood?: number;
}

function pickIndex(h: number, shift: number, mod: number): number {
  return Math.abs((h >> shift) % mod);
}

/** Couleur de l'anneau d'humeur : rouge (fermé) → ambre → cyan → vert (ouvert). */
export function moodColor(mood: number): string {
  if (mood < 20) return '#c34024';
  if (mood < 40) return '#d9a441';
  if (mood < 65) return '#29b8c9';
  return '#7ebd4b';
}

export function Avatar({ seed, expression = 'neutre', className, mood }: AvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const photo = portraitUrl(seed);

  // Portrait 3D si le fichier existe dans public/portraits/ ; sinon avatar SVG.
  if (photo && !imgFailed) {
    return (
      <div className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
        <img
          src={photo}
          alt=""
          onError={() => setImgFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 30%, #0a3d61, #032840)',
            display: 'block',
          }}
        />
        {mood !== undefined && (
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }} aria-hidden>
            <g transform="rotate(-90 50 50)">
              <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.15" />
              <circle
                cx="50"
                cy="50"
                r="47"
                fill="none"
                stroke={moodColor(mood)}
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={`${(Math.max(2, Math.min(100, mood)) / 100) * 295.3} 295.3`}
                style={{ transition: 'stroke-dasharray 400ms ease, stroke 400ms ease' }}
              />
            </g>
          </svg>
        )}
      </div>
    );
  }

  const h = hashString(seed);
  const skin = SKIN[pickIndex(h, 0, SKIN.length)];
  const hair = HAIR[pickIndex(h, 3, HAIR.length)];
  const outfit = OUTFIT[pickIndex(h, 6, OUTFIT.length)];
  const hairStyle = pickIndex(h, 9, 5);
  const glasses = pickIndex(h, 12, 3) === 0;
  const beard = pickIndex(h, 14, 4) === 0;

  // Expressions : seuls sourcils + bouche changent.
  const brows: Record<Expression, string> = {
    neutre: 'M34 41 h10 M56 41 h10',
    satisfait: 'M34 40 q5 -3 10 0 M56 40 q5 -3 10 0',
    agace: 'M34 39 l10 3 M56 42 l10 -3',
    ferme: 'M34 42 l10 -1 M56 41 l10 1',
    enthousiaste: 'M33 39 q6 -4 12 0 M55 39 q6 -4 12 0',
  };
  const mouth: Record<Expression, string> = {
    neutre: 'M42 62 h16',
    satisfait: 'M41 60 q9 8 18 0',
    agace: 'M42 63 q8 -5 16 0',
    ferme: 'M43 62 h14',
    enthousiaste: 'M40 59 q10 11 20 0',
  };

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <clipPath id={`clip-${h}`}>
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#e8eef4" />
      <g clipPath={`url(#clip-${h})`}>
        {/* buste / tenue */}
        <path d="M15 100 C15 78 32 70 50 70 C68 70 85 78 85 100 Z" fill={outfit} />
        <path d="M50 70 L44 86 L50 92 L56 86 Z" fill="#ffffff" opacity="0.9" />
        <circle cx="50" cy="82" r="2.4" fill="var(--leyton-orange-main, #ff6633)" />
        {/* cou */}
        <rect x="43" y="58" width="14" height="16" rx="6" fill={skin} />
        {/* visage */}
        <circle cx="50" cy="44" r="22" fill={skin} />
        {/* cheveux selon style */}
        {hairStyle === 0 && <path d="M28 44 C28 24 72 24 72 44 C72 34 66 26 50 26 C34 26 28 34 28 44 Z" fill={hair} />}
        {hairStyle === 1 && <path d="M27 46 C25 26 75 26 73 46 L73 36 C73 22 27 22 27 36 Z" fill={hair} />}
        {hairStyle === 2 && <path d="M28 40 C30 22 70 22 72 40 C66 30 62 30 50 30 C38 30 34 30 28 40 Z" fill={hair} />}
        {hairStyle === 3 && <path d="M29 44 C29 25 71 25 71 44 C71 30 60 24 50 24 C40 24 29 30 29 44 Z M26 44 q-2 14 4 20 M74 44 q2 14 -4 20" fill={hair} />}
        {hairStyle === 4 && <path d="M30 38 C34 24 66 24 70 38 C64 32 36 32 30 38 Z" fill={hair} />}
        {/* barbe optionnelle */}
        {beard && <path d="M32 50 C34 68 66 68 68 50 C66 62 34 62 32 50 Z" fill={hair} opacity="0.85" />}
        {/* yeux */}
        <circle cx="41" cy="47" r="3" fill="#1c2b38" />
        <circle cx="59" cy="47" r="3" fill="#1c2b38" />
        {/* sourcils + bouche selon expression */}
        <path d={brows[expression]} stroke="#3a2b22" strokeWidth="2.4" fill="none" strokeLinecap="round" transform="translate(0 -2)" />
        <path d={mouth[expression]} stroke="#8a3b2f" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        {/* lunettes optionnelles */}
        {glasses && (
          <g stroke="#1c2b38" strokeWidth="2" fill="none">
            <circle cx="41" cy="47" r="7" />
            <circle cx="59" cy="47" r="7" />
            <path d="M48 47 h4" />
          </g>
        )}
      </g>
      <circle cx="50" cy="50" r="47" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.6" />
      {mood !== undefined && (
        <g transform="rotate(-90 50 50)">
          {/* piste de l'anneau */}
          <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" strokeWidth="4.5" opacity="0.15" />
          {/* arc proportionnel à l'humeur (circonférence ≈ 295.3) */}
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke={moodColor(mood)}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray={`${(Math.max(2, Math.min(100, mood)) / 100) * 295.3} 295.3`}
            style={{ transition: 'stroke-dasharray 400ms ease, stroke 400ms ease' }}
          />
        </g>
      )}
    </svg>
  );
}
