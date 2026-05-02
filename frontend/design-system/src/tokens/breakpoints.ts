export const breakpoints = {
  sm: '540px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',
} as const;

export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
} as const;
