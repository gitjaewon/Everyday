import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RoutineCard, WeekStrip } from '@/components/domain';
import { AppText, DisclaimerCard, Screen } from '@/components/ui';
import { homeSummary, weekDays } from '@/data/mock-data';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';
import { formatProgress } from '@/utils/formatters';

export default function HomeScreen() {
  const routines = useAppStore((state) => state.routines);
  const setStatus = useAppStore((state) => state.setRoutineStatus);
  const [expanded, setExpanded] = useState<string | null>(null);
  const completed = useMemo(() => routines.filter((item) => item.status === 'done').length, [routines]);

  const changeStatus = async (id: string, status: Parameters<typeof setStatus>[1]) => {
    const previous = routines.find((item) => item.id === id)?.status;
    setStatus(id, status);
    setExpanded(null);
    if (!/^\d+$/.test(id)) return;
    try {
      await api.updateRoutine(id, status);
    } catch {
      if (previous) setStatus(id, previous);
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
          <AppText variant="body2">{formatProgress(completed, homeSummary.total)}</AppText>
        </View>
        <View style={styles.track}><View style={[styles.progress, { width: `${(completed / homeSummary.total) * 100}%` }]} /></View>
      </View>
      <View style={styles.body}>
        <WeekStrip days={weekDays} />
        <View style={styles.timeline}>
          <View style={styles.line} />
          {routines.map((item) => (
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
