import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { WeekDay } from '@/types/domain';
import { AppText, StatusBadge } from '@/components/ui';

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <View style={styles.card} accessibilityLabel="이번 주 근무 일정">
      {days.map((day) => (
        <View key={day.day} style={[styles.day, day.selected && styles.selected]}>
          <AppText variant="caption" align="center">{day.weekday}</AppText>
          <View style={[styles.number, day.selected && styles.numberSelected]}>
            <AppText variant="body2" color={day.selected ? colors.onBrand : colors.text}>{day.day}</AppText>
          </View>
          <StatusBadge value={day.kind} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, gap: 2 },
  day: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.xs, borderRadius: radius.sm },
  selected: { backgroundColor: colors.brandSoft },
  number: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numberSelected: { backgroundColor: colors.brand },
});
