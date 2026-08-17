import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import AlertBadge from '@/assets/icons/alert-circle-badge.svg';
import Close from '@/assets/icons/close.svg';
import { ShiftCalendar } from '@/components/domain';
import { AppText, BottomSheetModal, Button, Card, DisclaimerCard, InlineAlert, Screen } from '@/components/ui';
import { api } from '@/services/api';
import { colors, spacing } from '@/theme';
import type { CalendarCell, PendingFix, WorkDay } from '@/types/domain';
import { formatCalendarMonth, formatPendingDate } from '@/utils/formatters';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const today = new Date();
const YEAR = today.getFullYear();
const MONTH = today.getMonth() + 1;

function buildCells(daysInMonth: number, shiftsByDay: Map<number, WorkDay>): CalendarCell[] {
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const shift = shiftsByDay.get(day);
    return {
      day,
      kind: shift?.kind ?? 'off',
      needsReview: shift?.needsReview ?? false,
    };
  });
}

function buildPendingFixes(shiftsByDay: Map<number, WorkDay>): PendingFix[] {
  return Array.from(shiftsByDay.values())
    .filter((shift) => shift.needsReview)
    .map((shift) => {
      const date = new Date(`${shift.date}T00:00:00`);
      return {
        id: shift.date,
        label: formatPendingDate(MONTH, date.getDate(), WEEKDAY_LABELS[date.getDay()]),
        status: '확인필요',
        message: shift.reviewMessage || '시작·종료 시각을 확인해주세요.',
      };
    });
}

export default function ScheduleScreen() {
  const [shifts, setShifts] = useState<WorkDay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    api.getShiftsForMonth(YEAR, MONTH).then(setShifts).catch(() => setShifts([]));
  }, []);

  const shiftsByDay = useMemo(() => {
    const map = new Map<number, WorkDay>();
    for (const shift of shifts) {
      const date = new Date(`${shift.date}T00:00:00`);
      map.set(date.getDate(), shift);
    }
    return map;
  }, [shifts]);

  const daysInMonth = new Date(YEAR, MONTH, 0).getDate();
  const cells = useMemo(() => buildCells(daysInMonth, shiftsByDay), [daysInMonth, shiftsByDay]);
  const pending = useMemo(() => buildPendingFixes(shiftsByDay), [shiftsByDay]);
  const selected = pending.find((item) => item.id === selectedId);

  const openDay = (day: number) => {
    const iso = `${YEAR}-${String(MONTH).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedId(iso);
  };
  const apply = () => {
    if (selectedId) setShifts((current) => current.map((shift) => shift.date === selectedId ? { ...shift, needsReview: false } : shift));
    setSelectedId(null);
  };

  return (
    <Screen scroll contentStyle={styles.screen}>
      <View style={styles.titleRow}>
        <View><AppText variant="caption">{formatCalendarMonth(YEAR, MONTH)}</AppText><AppText variant="h1">근무표</AppText></View>
        <Button label="근무표 수정" variant="outline" onPress={() => setSelectedId(pending[0]?.id ?? null)} />
      </View>
      {pending.length ? <InlineAlert title={`확인이 필요한 날짜 ${pending.length}개`} body="AI가 인식하지 못한 시각이 있습니다." /> : <InlineAlert tone="success" title="모든 근무표를 확인했습니다." />}
      <ShiftCalendar year={YEAR} month={MONTH} cells={cells} onSelectReview={openDay} />
      <AppText variant="caption" color={colors.textSecondary}>수정 대기 목록</AppText>
      <View style={styles.list}>
        {pending.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.label} 수정 필요`} onPress={() => setSelectedId(item.id)}>
            <Card tone="danger" style={styles.pending}>
              <AlertBadge width={40} height={40} />
              <View style={styles.pendingCopy}>
                <AppText variant="body1" style={styles.bold}>{item.label}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{item.status}</AppText>
              </View>
              <AppText variant="body2" color={colors.danger}>수정 필요</AppText>
            </Card>
          </Pressable>
        ))}
      </View>
      <DisclaimerCard />

      <BottomSheetModal visible={Boolean(selected)} onClose={() => setSelectedId(null)}>
        {selected ? (
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <AlertBadge width={40} height={40} />
              <View style={styles.pendingCopy}><AppText variant="body1" style={styles.bold}>{selected.label}</AppText><AppText variant="caption" color={colors.danger}>{selected.status}</AppText></View>
              <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={() => setSelectedId(null)}><Close width={24} height={24} /></Pressable>
            </View>
            <Card tone="danger"><AppText variant="caption" color={colors.danger}>{selected.message}{`\n`}AI 보정안을 확인하거나 직접 입력해주세요.</AppText></Card>
            <Button label="AI 보정안 적용하기" onPress={apply} />
          </View>
        ) : null}
      </BottomSheetModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xxl },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  list: { gap: spacing.sm },
  pending: { minHeight: 70, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pendingCopy: { flex: 1 },
  bold: { fontWeight: '700' },
  sheet: { gap: spacing.lg },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
