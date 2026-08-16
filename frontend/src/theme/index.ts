export { colors, palette, type ColorToken } from './colors';
export { typography, fontFamily, type TypographyToken } from './typography';

/** 4px scale, matching the Figma spacing rhythm. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  /** Horizontal screen gutter used on every screen (24px in Figma). */
  gutter: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 100,
} as const;

export const layout = {
  /** Reference frame width of the Figma designs. */
  designWidth: 375,
  headerHeight: 50,
  tabBarHeight: 64,
  cardMinHeight: 60,
  ctaHeight: 54,
  iconTile: 40,
  icon: 24,
  iconSm: 20,
} as const;

export const shadows = {
  toggleKnob: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;
