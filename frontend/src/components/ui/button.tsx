import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { colors, layout, radius, spacing } from '@/theme';
import { AppText } from './app-text';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  compact?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  disabled,
  compact = false,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      {...props}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onBrand : colors.brand} />
      ) : (
        <AppText
          variant="body1"
          color={
            isDisabled
              ? colors.disabledText
              : variant === 'primary'
                ? colors.onBrand
                : variant === 'outline'
                  ? colors.text
                  : colors.brand
          }
          style={styles.label}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

export function ButtonRow({ children }: React.PropsWithChildren) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.ctaHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  compact: { flex: 1, minHeight: 42 },
  primary: { backgroundColor: colors.brand },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.text },
  disabled: { backgroundColor: colors.disabledSurface, borderWidth: 1, borderColor: colors.border },
  pressed: { opacity: 0.78 },
  label: { fontWeight: '700' },
  row: { flexDirection: 'row', gap: spacing.xxl / 2 },
});
