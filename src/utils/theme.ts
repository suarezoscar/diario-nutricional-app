export const paletteLight = {
  primary: '#2e7d32',
  primaryDark: '#1b5e20',
  primaryLight: '#43a047',
  primarySoft: '#e8f5e9',
  primaryUltraSoft: '#f2f8f3',
  background: '#f5f7f5',
  card: '#ffffff',
  text: '#1c281e',
  textMuted: '#5f7361',
  border: '#e1eae2',
  borderFocus: '#43a047',
  focusSoft: '#ffffff',
  error: '#d32f2f',
  errorSoft: '#ffebee',
  white: '#ffffff',
  water: '#0288d1',
  waterSoft: '#e1f5fe',
}

export const paletteDark = {
  primary: '#4caf50',
  primaryDark: '#2e7d32',
  primaryLight: '#81c784',
  primarySoft: '#1b3320',
  primaryUltraSoft: '#132417',
  background: '#101511',
  card: '#19211b',
  text: '#e6ede7',
  textMuted: '#8fa392',
  border: '#263328',
  borderFocus: '#66bb6a',
  focusSoft: '#1c261e',
  error: '#ef5350',
  errorSoft: '#381818',
  white: '#ffffff',
  water: '#29b6f6',
  waterSoft: '#0d2b3a',
}

export const themeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
}

export const themeRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  full: 9999,
}

export const theme = {
  colors: paletteLight,
  spacing: themeSpacing,
  radius: themeRadius,
}

export type ThemeColors = typeof paletteLight
