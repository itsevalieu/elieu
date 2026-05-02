/**
 * Unified color palette. Every value maps to a CSS custom property
 * defined in `styles/tokens.css` — use the `var()` references in
 * stylesheets, these JS values only when computed access is needed.
 */

export const colors = {
  newspaper: {
    light: {
      bg: '#faf8f4',
      ink: '#1a1a1a',
      rule: '#2a2a2a',
      ruleLight: '#ccc',
      accent: '#8b0000',
      muted: '#666666',
      card: '#ffffff',
      codeBg: '#f2efe8',
      inputBg: '#ffffff',
      border: '#d4d4d4',
    },
    dark: {
      bg: '#1a1a1a',
      ink: '#e8e4dd',
      rule: '#d4c9b8',
      ruleLight: '#3a3a3a',
      accent: '#e05555',
      muted: '#a0998e',
      card: '#242424',
      codeBg: '#2a2a2a',
      inputBg: '#2a2a2a',
      border: '#444444',
    },
  },
  magazine: {
    light: {
      bg: '#ffffff',
      ink: '#111111',
      rule: '#e5e5e5',
      ruleLight: '#f0f0f0',
      accent: '#2563eb',
      muted: '#737373',
      card: '#ffffff',
      codeBg: '#f4f4f5',
      inputBg: '#ffffff',
      border: '#e5e5e5',
    },
    dark: {
      bg: '#111111',
      ink: '#f0f0f0',
      rule: '#333333',
      ruleLight: '#2a2a2a',
      accent: '#60a5fa',
      muted: '#a3a3a3',
      card: '#1a1a1a',
      codeBg: '#1e1e1e',
      inputBg: '#1e1e1e',
      border: '#333333',
    },
  },
  portfolio: {
    light: {
      bg: '#f5f5f5',
      ink: '#333333',
      rule: '#dddddd',
      ruleLight: '#eeeeee',
      accent: '#0070f3',
      muted: '#666666',
      card: '#ffffff',
      codeBg: '#f0f0f0',
      inputBg: '#ffffff',
      border: '#d4d4d4',
    },
    dark: {
      bg: '#111111',
      ink: '#e5e5e5',
      rule: '#333333',
      ruleLight: '#2a2a2a',
      accent: '#3b82f6',
      muted: '#a3a3a3',
      card: '#1a1a1a',
      codeBg: '#1e1e1e',
      inputBg: '#1e1e1e',
      border: '#444444',
    },
  },
  admin: {
    bg: '#fafafa',
    surface: '#ffffff',
    ink: '#18181b',
    muted: '#71717a',
    border: '#e4e4e7',
    accent: '#18181b',
    danger: '#dc2626',
    success: '#16a34a',
    warning: '#d97706',
    info: '#2563eb',
  },
  semantic: {
    error: '#b91c1c',
    errorBg: '#fef2f2',
    success: '#15803d',
    successBg: '#f0fdf4',
    warning: '#92400e',
    warningBg: '#fffbeb',
    info: '#1d4ed8',
    infoBg: '#eff6ff',
  },
  category: {
    hobbies: 'hsl(210, 60%, 50%)',
    lifestyle: 'hsl(340, 60%, 50%)',
  },
} as const;

export type ColorTheme = keyof typeof colors;
