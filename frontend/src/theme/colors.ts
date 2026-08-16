/**
 * Design tokens - colors.
 * Mirrors the Figma design-system frame (Primary / Neutral ramps + semantic roles).
 */

export const palette = {
  primary: {
    50: '#DCF0E8',
    100: '#00D696',
    200: '#00BD84',
    300: '#00A372',
    400: '#008A60',
    500: '#00704F',
    600: '#00573D',
    700: '#003D2B',
    800: '#002419',
    900: '#000A07',
  },
  neutral: {
    50: '#FAFAF8',
    100: '#E7E7E7',
    200: '#D1D1D1',
    300: '#B0B0B0',
    400: '#7C7C7C',
    500: '#6D6D6D',
    600: '#5D5D5D',
    700: '#454545',
    800: '#3D3D3D',
    900: '#090909',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const colors = {
  /** App canvas */
  background: '#F4F5F7',
  /** Cards, headers, sheets */
  surface: palette.neutral[50],
  border: palette.neutral[100],
  divider: palette.neutral[200],

  /** Brand */
  brand: '#00A36F',
  brandSoft: 'rgba(0, 163, 111, 0.12)',
  brandSofter: 'rgba(0, 163, 111, 0.08)',
  /** Slightly deeper green used for the active tab + home progress bar */
  brandAccent: '#099101',
  onBrand: palette.neutral[50],

  /** Text */
  text: palette.neutral[900],
  textStrong: palette.black,
  textTertiary: palette.neutral[500],
  textSecondary: palette.neutral[400],
  textMuted: palette.neutral[300],
  textNote: palette.neutral[600],

  /** Shift semantics */
  night: '#2E7DD6',
  nightSoft: 'rgba(46, 125, 214, 0.10)',
  day: '#00A36F',
  daySoft: 'rgba(0, 163, 111, 0.10)',
  off: palette.neutral[400],
  offSoft: 'rgba(124, 124, 124, 0.08)',

  /** Status */
  warning: '#C77A16',
  warningText: '#A07434',
  warningSurface: '#ECE7DE',
  danger: '#A9463F',
  dangerSurface: '#EBE0E1',
  dangerSoft: 'rgba(169, 70, 63, 0.10)',

  /** Misc */
  track: '#D9D9D9',
  iconTile: '#E7E7E7',
  overlay: 'rgba(9, 9, 9, 0.40)',
  disabledSurface: palette.neutral[50],
  disabledText: palette.neutral[300],
} as const;

export type ColorToken = keyof typeof colors;
