import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import ChevronLeft from '@/assets/icons/chevron-left.svg';
import ChevronRight from '@/assets/icons/chevron-right.svg';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './app-text';
import { BottomSheetModal } from './bottom-sheet-modal';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function parseIso(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month: month - 1, day };
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatLabel(value: string) {
  if (!value) return '날짜 선택';
  const { year, month, day } = parseIso(value);
  const weekday = WEEKDAYS[new Date(year, month, day).getDay()];
  return `${month + 1}월 ${day}일 (${weekday})`;
}

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [visible, setVisible] = useState(false);
  const [viewYear, setViewYear] = useState(() => (value ? parseIso(value).year : new Date().getFullYear()));
  const [viewMonth, setViewMonth] = useState(() => (value ? parseIso(value).month : new Date().getMonth()));

  const open = () => {
    const base = value ? parseIso(value) : { year: new Date().getFullYear(), month: new Date().getMonth() };
    setViewYear(base.year);
    setViewMonth(base.month);
    setVisible(true);
  };

  const changeMonth = (delta: number) => {
    const total = viewMonth + delta;
    setViewYear(viewYear + Math.floor(total / 12));
    setViewMonth(((total % 12) + 12) % 12);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const leading = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [...Array(leading).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const selectDay = (day: number) => {
    onChange(toIso(viewYear, viewMonth, day));
    setVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
      <Pressable accessibilityRole="button" accessibilityLabel={`${label} 선택`} style={styles.field} onPress={open}>
        <AppText variant="body1">{formatLabel(value)}</AppText>
      </Pressable>

      <BottomSheetModal visible={visible} onClose={() => setVisible(false)}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 달" onPress={() => changeMonth(-1)} style={styles.navButton}>
              <ChevronLeft width={20} height={20} />
            </Pressable>
            <AppText variant="h3">{viewYear}년 {viewMonth + 1}월</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="다음 달" onPress={() => changeMonth(1)} style={styles.navButton}>
              <ChevronRight width={20} height={20} />
            </Pressable>
          </View>
          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((day) => (
              <AppText key={day} variant="caption" align="center" color={colors.textSecondary} style={styles.cell}>{day}</AppText>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, index) => {
              const iso = day ? toIso(viewYear, viewMonth, day) : null;
              const selected = Boolean(iso) && iso === value;
              return (
                <Pressable
                  key={index}
                  disabled={!day}
                  accessibilityRole={day ? 'button' : undefined}
                  accessibilityLabel={day ? `${viewMonth + 1}월 ${day}일 선택` : undefined}
                  onPress={() => day && selectDay(day)}
                  style={[styles.cell, styles.dayCell, selected && styles.selectedDayCell]}
                >
                  {day ? <AppText variant="body2" align="center" color={selected ? colors.onBrand : colors.text}>{day}</AppText> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, gap: spacing.xs },
  field: {
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  sheet: { gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navButton: { padding: spacing.sm },
  weekdayRow: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  dayCell: { minHeight: 44, borderRadius: radius.sm, marginVertical: 2 },
  selectedDayCell: { backgroundColor: colors.brand },
});
