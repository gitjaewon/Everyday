import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { RoutineChange, RoutineStatus, ShiftKind } from '@/types/domain';
import { AppText } from './app-text';

type BadgeValue = RoutineStatus | RoutineChange | ShiftKind;

const labels: Record<BadgeValue, string> = {
  done: '완료', planned: '예정', postponed: '미룸', waiting: '대기',
  new: '신규', changed: '변경', cancelled: '취소', kept: '유지',
  day: '주간', evening: '오후', night: '야간', off: '휴무', unknown: '!',
};

export function StatusBadge({ value }: { value: BadgeValue }) {
  const isGreen = ['done', 'planned', 'new', 'kept', 'day'].indexOf(value) >= 0;
  const isOrange = ['postponed', 'changed'].indexOf(value) >= 0;
  const isBlue = ['night', 'evening'].indexOf(value) >= 0;
  return (
    <View style={[styles.badge, isGreen && styles.green, isOrange && styles.orange, isBlue && styles.blue]}>
      <AppText
        variant="captionStrong"
        color={isGreen ? colors.brand : isOrange ? colors.warning : isBlue ? colors.night : colors.textSecondary}
      >
        {labels[value]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.textSecondary, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  green: { borderColor: colors.brand, backgroundColor: colors.brandSofter },
  orange: { borderColor: colors.warning, backgroundColor: 'rgba(199,122,22,0.08)' },
  blue: { borderColor: colors.night, backgroundColor: colors.nightSoft },
});
