import { Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography, type TypographyToken } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyToken;
  color?: string;
  align?: TextStyle['textAlign'];
}

export function AppText({
  variant = 'body2',
  color = colors.text,
  align,
  style,
  ...props
}: AppTextProps) {
  return <Text {...props} style={[typography[variant], { color, textAlign: align }, style]} />;
}
