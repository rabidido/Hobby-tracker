import type { CSSProperties } from 'react';

/* Minimal inline icon set (stroke-based, currentColor). */
type P = { className?: string; style?: CSSProperties };
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const IconSkull = ({ className, style }: P) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 2C7 2 3.5 5.4 3.5 10.2c0 2.6 1.1 4.3 2.4 5.4.5.4.8 1 .8 1.7v1.4c0 .8.6 1.4 1.4 1.4h.5v-2.2a.9.9 0 0 1 1.8 0V22h1.5v-2.2a.9.9 0 0 1 1.8 0V22h1.5v-2.2a.9.9 0 0 1 1.8 0V22h.5c.8 0 1.4-.6 1.4-1.4v-1.4c0-.7.3-1.3.8-1.7 1.3-1.1 2.4-2.8 2.4-5.4C20.5 5.4 17 2 12 2Zm-3.4 11a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm6.8 0a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Z" />
  </svg>
);

export const IconSearch = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const IconPlus = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconClose = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const IconArrowRight = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconLayers = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5M3 18l9 5 9-5" opacity="0.5" />
  </svg>
);

export const IconGroup = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <rect x="3" y="14" width="18" height="4" rx="1" />
  </svg>
);

export const IconNote = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="M4 5h16M4 10h16M4 15h9" />
  </svg>
);

export const IconDisc = ({ className, style }: P) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="none" aria-hidden>
    <ellipse cx="12" cy="12" rx="9" ry="4.5" stroke="currentColor" strokeWidth="2" />
    <ellipse cx="12" cy="12" rx="3.5" ry="1.6" fill="currentColor" />
  </svg>
);

export const IconBack = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
);

export const IconSettings = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
);

export const IconTrash = ({ className, style }: P) => (
  <svg className={className} style={style} {...base} aria-hidden>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
);
