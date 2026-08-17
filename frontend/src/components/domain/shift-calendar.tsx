import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import type { CalendarCell, ShiftKind } from '@/types/domain';
import { AppText } from '@/components/ui';

const weekday = ['일', '월', '화', '수', '목', '금', '토'];
const kindLabel: Record<ShiftKind, string> = { day: '주', evening: '오', night: '야', off: '휴', unknown: '!' };

interface ShiftCalendarProps {
  year: number;
  month: number;
  cells: CalendarCell[];
  onSelectReview?: (day: number) => void;
}

export function ShiftCalendar({ year, month, cells, onSelectReview }: ShiftCalendarProps) {
  const leading = new Date(year, month - 1, 1).getDay();
  return (
    <View style={styles.calendar} accessibilityLabel={`${year}년 ${month}월 근무 달력`}>
      {weekday.map((label) => <View key={label} style={styles.cell}><AppText variant="caption" align="center">{label}</AppText></View>)}
      {Array.from({ length: leading }).map((_, index) => <View key={`blank-${index}`} style={styles.cell} />)}
      {cells.map((cell) => {
        const kind = cell.needsReview ? 'unknown' : cell.kind;
        return (
          <Pressable
            key={cell.day}
            accessibilityRole={cell.needsReview ? 'button' : undefined}
            accessibilityLabel={`${month}월 ${cell.day}일 ${kindLabel[kind]}`}
            onPress={() => cell.needsReview && onSelectReview?.(cell.day)}
            style={[styles.cell, styles.dayCell, styles[kind]]}
          >
            <AppText variant="body2" align="center">{cell.day}</AppText>
            <AppText variant="caption" align="center" color={kind === 'day' ? colors.day : kind === 'night' ? colors.night : kind === 'unknown' ? colors.danger : colors.textSecondary}>{kindLabel[kind]}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  calendar: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm },
  cell: { width: `${100 / 7}%`, minHeight: 34, alignItems: 'center', justifyContent: 'center' },
  dayCell: { minHeight: 44, borderRadius: radius.sm, marginVertical: 2 },
  day: { backgroundColor: colors.daySoft },
  evening: { backgroundColor: colors.warningSurface },
  night: { backgroundColor: colors.nightSoft },
  off: { backgroundColor: colors.offSoft },
  unknown: { backgroundColor: colors.dangerSurface },
});
