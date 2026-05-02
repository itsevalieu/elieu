export const fontFamily = {
  headline: '"Playfair Display", Georgia, serif',
  body: '"Lora", Georgia, serif',
  sans: '"Inter", "DM Sans", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

export const fontSize = {
  xs: '0.72rem',
  sm: '0.85rem',
  base: '1rem',
  md: '1.05rem',
  lg: '1.2rem',
  xl: '1.5rem',
  '2xl': '1.75rem',
  '3xl': '2rem',
  '4xl': '2.85rem',
  hero: 'clamp(2.25rem, 6vw, 3.5rem)',
} as const;

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: 1.08,
  snug: 1.22,
  normal: 1.6,
  relaxed: 1.75,
} as const;

export const letterSpacing = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.06em',
  wider: '0.1em',
  widest: '0.15em',
} as const;
