export interface ThemeColors {
  readonly primary: string
  readonly primaryDark: string
  readonly primaryLight: string
  readonly primarySoft: string
  readonly primaryUltraSoft: string
  readonly background: string
  readonly card: string
  readonly text: string
  readonly textMuted: string
  readonly border: string
  readonly borderFocus: string
  readonly focusSoft: string
  readonly error: string
  readonly errorSoft: string
  readonly white: string
  readonly water: string
  readonly waterSoft: string
}

export const paletteLight: ThemeColors = Object.freeze({
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
})

export const paletteDark: ThemeColors = Object.freeze({
  primary: '#4caf50',
  primaryDark: '#2e7d32',
  primaryLight: '#81c784',
  primarySoft: '#18331e',
  primaryUltraSoft: '#132417',
  background: '#0d130e',
  card: '#161f18',
  text: '#f1f5f2',
  textMuted: '#9ab09e',
  border: '#253527',
  borderFocus: '#66bb6a',
  focusSoft: '#1b291d',
  error: '#ef5350',
  errorSoft: '#331717',
  white: '#ffffff',
  water: '#29b6f6',
  waterSoft: '#102a38',
})

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
