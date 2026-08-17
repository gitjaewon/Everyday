import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RoutineCard, WeekStrip } from '@/components/domain';
import { AppText, DisclaimerCard, Screen } from '@/components/ui';
import { api } from '@/services/api';
import { colors, spacing } from '@/theme';
import type { RoutineItem, RoutineStatus, WorkDay } from '@/types/domain';
import { formatProgress } from '@/utils/formatters';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const SHIFT_LABEL: Record<WorkDay['kind'], string> = {
  day: '주간 근무', evening: '오후 근무', night: '야간 근무', off: '휴무', unknown: '확인 필요',
};

const today = new Date();

function getWeekDates(base: Date): Date[] {
  const start = new Date(base);
  start.setDate(base.getDate() - base.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function toIsoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const [monthShifts, setMonthShifts] = useState<WorkDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(today));
  const [dayRoutines, setDayRoutines] = useState<RoutineItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.getShiftsForMonth(today.getFullYear(), today.getMonth() + 1).then(setMonthShifts).catch(() => setMonthShifts([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .getRoutinesForDate(selectedDate)
      .then((routines) => { if (!cancelled) setDayRoutines(routines); })
      .catch(() => { if (!cancelled) setDayRoutines([]); });
    return () => { cancelled = true; };
  }, [selectedDate]);

  const shiftsByDate = useMemo(() => new Map(monthShifts.map((shift) => [shift.date, shift])), [monthShifts]);

  const weekDays = useMemo(
    () =>
      getWeekDates(today).map((d) => {
        const iso = toIsoDate(d);
        const shift = shiftsByDate.get(iso);
        return {
          date: iso,
          weekday: WEEKDAY_LABELS[d.getDay()],
          day: d.getDate(),
          kind: shift?.kind ?? 'off',
          selected: iso === selectedDate,
        };
      }),
    [shiftsByDate, selectedDate],
  );

  const todayShift = shiftsByDate.get(toIsoDate(today));
  const dateLabel = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}.`;
  const shiftLabel = todayShift ? SHIFT_LABEL[todayShift.kind] : '근무표 없음';

  const completed = useMemo(() => dayRoutines.filter((item) => item.status === 'done').length, [dayRoutines]);

  const changeStatus = async (id: string, status: RoutineStatus) => {
    const previous = dayRoutines.find((item) => item.id === id)?.status;
    setDayRoutines((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    setExpanded(null);
    if (!/^\d+$/.test(id)) return;
    try {
      await api.updateRoutine(id, status);
    } catch {
      if (previous) setDayRoutines((current) => current.map((item) => (item.id === id ? { ...item, status: previous } : item)));
    }
  };

  return (
    <Screen scroll padded={false} contentStyle={styles.screen}>
      <View style={styles.header}>
        <AppText variant="caption">{dateLabel}　|　{shiftLabel}</AppText>
        <AppText variant="h1">오늘의 루틴</AppText>
        <View style={styles.progressCopy}>
          <AppText variant="caption" color={colors.textSecondary}>진행도</AppText>
          <AppText variant="body2">{formatProgress(completed, dayRoutines.length)}</AppText>
        </View>
        <View style={styles.track}><View style={[styles.progress, { width: dayRoutines.length ? `${(completed / dayRoutines.length) * 100}%` : '0%' }]} /></View>
      </View>
      <View style={styles.body}>
        <WeekStrip days={weekDays} onSelect={setSelectedDate} />
        <View style={styles.timeline}>
          <View style={styles.line} />
          {dayRoutines.map((item) => (
            <View key={item.id} style={styles.timelineRow}>
              <View style={[styles.dot, item.status === 'done' && styles.dotDone, item.status === 'postponed' && styles.dotPostponed]} />
              <View style={styles.routine}>
                <RoutineCard
                  item={item}
                  expanded={expanded === item.id}
                  onToggle={() => setExpanded((current) => current === item.id ? null : item.id)}
                  onStatusChange={(status) => changeStatus(item.id, status)}
                />
              </View>
            </View>
          ))}
          {!dayRoutines.length ? <AppText variant="body2" color={colors.textSecondary}>이 날짜에는 루틴이 없습니다.</AppText> : null}
        </View>
        <DisclaimerCard />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl },
  header: { backgroundColor: colors.surface, paddingHorizontal: spacing.gutter, paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.sm },
  progressCopy: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xl },
  track: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  progress: { height: 4, backgroundColor: colors.brandAccent, borderRadius: 2 },
  body: { padding: spacing.gutter, gap: spacing.xxl },
  timeline: { position: 'relative', gap: spacing.sm },
  line: { position: 'absolute', left: 5, top: 30, bottom: 30, width: 1, backgroundColor: colors.divider },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  dot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1, borderColor: colors.textSecondary, backgroundColor: colors.background, zIndex: 1 },
  dotDone: { borderColor: colors.brand, backgroundColor: colors.brand },
  dotPostponed: { borderColor: colors.warning, backgroundColor: colors.warning },
  routine: { flex: 1 },
});
