import { Platform, type TextStyle } from 'react-native';

/**
 * Design tokens - typography.
 * The Figma file uses Pretendard. It is not bundled as a native font here, so we fall
 * back to the platform UI font (SF Pro / Roboto) which keeps Korean metrics close.
 * Swap `fontFamily` below once Pretendard .otf files are added to `assets/fonts`.
 */
export const fontFamily = {
  sans: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
  serif: 'GowunBatang_400Regular',
};

const base: TextStyle = { fontFamily: fontFamily.sans };

export const typography = {
  title: { ...base, fontSize: 28, fontWeight: '700', letterSpacing: -1.12, lineHeight: 34 },
  h1: { ...base, fontSize: 24, fontWeight: '700', letterSpacing: -0.96, lineHeight: 29 },
  h2: { ...base, fontSize: 22, fontWeight: '600', letterSpacing: -0.88, lineHeight: 26 },
  h3: { ...base, fontSize: 18, fontWeight: '600', letterSpacing: -0.72, lineHeight: 27 },
  body1: { ...base, fontSize: 16, fontWeight: '500', letterSpacing: -0.64, lineHeight: 24 },
  body2: { ...base, fontSize: 14, fontWeight: '500', letterSpacing: -0.56, lineHeight: 21 },
  body3: { ...base, fontSize: 14, fontWeight: '400', letterSpacing: -0.56, lineHeight: 21 },
  caption: { ...base, fontSize: 12, fontWeight: '400', letterSpacing: -0.48, lineHeight: 18 },
  captionStrong: { ...base, fontSize: 12, fontWeight: '600', letterSpacing: -0.48, lineHeight: 18 },
  serifLead: { fontFamily: fontFamily.serif, fontSize: 20, fontWeight: '400', lineHeight: 24 },
} satisfies Record<string, TextStyle>;

export type TypographyToken = keyof typeof typography;
