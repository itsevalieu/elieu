export const spacing = {
  0: '0',
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
  '3xl': '6rem',
} as const;

export const maxWidth = {
  prose: '720px',
  content: '880px',
  wide: '1200px',
} as const;

export type SpacingToken = keyof typeof spacing;
