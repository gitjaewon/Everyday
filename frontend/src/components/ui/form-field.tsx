import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';
import { AppText } from './app-text';

interface FormFieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function FormField({ label, error, style, multiline, ...props }: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <AppText variant="caption" color={colors.textSecondary}>{label}</AppText> : null}
      <TextInput
        accessibilityLabel={label ?? props.placeholder}
        accessibilityState={{ disabled: !props.editable }}
        placeholderTextColor={colors.textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
        style={[
          styles.input,
          multiline && styles.multiline,
          error && styles.invalid,
          style,
        ]}
      />
      {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  input: {
    ...typography.body1,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: { minHeight: 140 },
  invalid: { borderColor: colors.danger },
});
