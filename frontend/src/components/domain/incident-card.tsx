import { Pressable, StyleSheet, View } from 'react-native';

import Activity from '@/assets/icons/activity.svg';
import HeartRate from '@/assets/icons/heart-rate.svg';
import { colors, radius, spacing } from '@/theme';
import type { IncidentOption, WearableAlert } from '@/types/domain';
import { AppText } from '@/components/ui';
import { incidentIconMap } from './icon-map';

export function WearableAlertCard({ alert, onPress }: { alert: WearableAlert; onPress: () => void }) {
  const Icon = alert.icon === 'heart' ? HeartRate : Activity;
  const danger = alert.severity === 'danger';
  const color = danger ? colors.danger : colors.warningText;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${alert.title}, ${alert.detail}`} onPress={onPress} style={[styles.alert, danger ? styles.danger : styles.warning]}>
      <Icon width={28} height={28} />
      <View style={styles.copy}>
        <AppText variant="body1" color={color} style={styles.bold}>{alert.title}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>{alert.detail}</AppText>
      </View>
      <AppText variant="caption" color={colors.textSecondary}>{alert.timeAgo}</AppText>
    </Pressable>
  );
}

export function IncidentOptionCard({ option, onPress, selected = false }: { option: IncidentOption; onPress: () => void; selected?: boolean }) {
  const Icon = incidentIconMap[option.id];
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={[styles.option, selected && styles.selected]}>
      <Icon width={40} height={40} />
      <View style={styles.copy}>
        <AppText variant="body1" style={styles.bold}>{option.title}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>{option.description}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  alert: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  danger: { borderColor: colors.danger, backgroundColor: colors.dangerSurface },
  warning: { borderColor: colors.warning, backgroundColor: colors.warningSurface },
  copy: { flex: 1 },
  bold: { fontWeight: '700' },
  option: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  selected: { borderColor: colors.brand, backgroundColor: colors.brandSofter },
});
