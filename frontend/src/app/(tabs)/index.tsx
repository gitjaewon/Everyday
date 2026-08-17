import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RoutineCard, WeekStrip } from '@/components/domain';
import { AppText, DisclaimerCard, Screen } from '@/components/ui';
import { homeSummary } from '@/data/mock-data';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';
import type { RoutineItem, RoutineStatus } from '@/types/domain';
import { formatProgress } from '@/utils/formatters';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function HomeScreen() {
  const schedule = useAppStore((state) => state.schedule);
  const storeRoutines = useAppStore((state) => state.routines);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayRoutines, setDayRoutines] = useState<RoutineItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (schedule.length && !selectedDate) setSelectedDate(schedule[0].date);
  }, [schedule, selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    let cancelled = false;
    api
      .getRoutinesForDate(selectedDate)
      .then((routines) => { if (!cancelled) setDayRoutines(routines); })
      .catch(() => { if (!cancelled) setDayRoutines(storeRoutines.filter((item) => item.date === selectedDate)); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const weekDays = useMemo(
    () =>
      schedule.map((day) => {
        const parsed = new Date(`${day.date}T00:00:00`);
        return {
          date: day.date,
          weekday: WEEKDAY_LABELS[parsed.getDay()],
          day: parsed.getDate(),
          kind: day.kind,
          selected: day.date === selectedDate,
        };
      }),
    [schedule, selectedDate],
  );

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
        <AppText variant="caption">{homeSummary.dateLabel}　|　{homeSummary.shiftLabel}</AppText>
        <AppText variant="h1">{homeSummary.headline}</AppText>
        <AppText variant="body2">{homeSummary.tip}</AppText>
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
