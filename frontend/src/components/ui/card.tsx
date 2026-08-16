import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/theme';

interface CardProps extends ViewProps {
  tone?: 'default' | 'danger' | 'warning' | 'brand';
}

export function Card({ tone = 'default', style, ...props }: CardProps) {
  return (
    <View
      {...props}
      style={[
        styles.card,
        tone === 'danger' && styles.danger,
        tone === 'warning' && styles.warning,
        tone === 'brand' && styles.brand,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  danger: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  warning: { borderColor: colors.warning, backgroundColor: colors.warningSurface },
  brand: { borderColor: colors.brand },
});
