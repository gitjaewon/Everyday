import { Switch } from 'react-native';

import { colors } from '@/theme';

export function SwitchControl({ value, onValueChange, label }: { value: boolean; onValueChange: () => void; label: string }) {
  return (
    <Switch
      accessibilityLabel={label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.divider, true: colors.brand }}
      thumbColor={colors.surface}
      ios_backgroundColor={colors.divider}
    />
  );
}
