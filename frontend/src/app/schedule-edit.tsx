import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import ChevronLeft from '@/assets/icons/chevron-left.svg';
import ChevronRight from '@/assets/icons/chevron-right.svg';
import { WorkDayCard } from '@/components/domain';
import { AppText, Button, InlineAlert, Screen } from '@/components/ui';
import { api } from '@/services/api';
import { colors, spacing } from '@/theme';
import type { WorkDay } from '@/types/domain';
import { inferShiftKind } from '@/utils/shift';

const today = new Date();
const YEAR = today.getFullYear();
const MONTH = today.getMonth() + 1;
const TOTAL_WEEKS = Math.ceil(new Date(YEAR, MONTH, 0).getDate() / 7);

function weekOfMonth(isoDate: string) {
  return Math.ceil(new Date(`${isoDate}T00:00:00`).getDate() / 7) - 1;
}

export default function ScheduleEditScreen() {
  const [schedule, setSchedule] = useState<WorkDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [weekIndex, setWeekIndex] = useState(() => Math.min(Math.ceil(today.getDate() / 7) - 1, TOTAL_WEEKS - 1));

  useEffect(() => {
    api.getShiftsForMonth(YEAR, MONTH)
      .then(setSchedule)
      .catch(() => setError('근무표를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const patchDay = (date: string, patch: Partial<WorkDay>) => {
    setSchedule((current) =>
      current.map((day) => {
        if (day.date !== date) return day;
        const timeChanged = 'startTime' in patch || 'endTime' in patch;
        const merged = { ...day, ...patch };
        const kind = !patch.kind && timeChanged ? inferShiftKind(merged.startTime, merged.endTime) : merged.kind;
        const needsReview = patch.needsReview ?? (kind === 'off' ? false : !(merged.startTime && merged.endTime));
        return { ...merged, kind, needsReview };
      }),
    );
  };

  const weekSchedule = useMemo(() => schedule.filter((day) => weekOfMonth(day.date) === weekIndex), [schedule, weekIndex]);
  const reviewCount = schedule.filter((day) => day.needsReview).length;
  const weekLabel = `${MONTH}월 ${weekIndex + 1}주`;

  const confirm = async () => {
    setSaving(true);
    setError('');
    try {
      await api.confirmSchedule(schedule);
      router.back();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '근무표 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.screen}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" hitSlop={12} onPress={() => router.back()}>
        <ChevronLeft width={24} height={24} />
      </Pressable>
      <AppText variant="h1">근무표 수정</AppText>
      <AppText variant="body1">아래 항목을 검토 후, 틀리거나 누락된 값을 수정하세요.</AppText>
      {reviewCount ? <InlineAlert title={`확인이 필요한 날짜 ${reviewCount}개`} body="AI가 인식하지 못한 시각 및 일정이 있습니다." /> : null}
      <AppText variant="h3" style={styles.sectionTitle}>인식된 근무 일정</AppText>
      <View style={styles.weekNav}>
        <Pressable accessibilityRole="button" accessibilityLabel="이전 주" disabled={weekIndex === 0} onPress={() => setWeekIndex((index) => index - 1)}>
          <ChevronLeft width={20} height={20} />
        </Pressable>
        <AppText variant="body1">{weekLabel}</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="다음 주" disabled={weekIndex === TOTAL_WEEKS - 1} onPress={() => setWeekIndex((index) => index + 1)}>
          <ChevronRight width={20} height={20} />
        </Pressable>
      </View>
      <View style={styles.list}>
        {weekSchedule.map((day) => <WorkDayCard key={day.date} day={day} showDropdown onChange={(patch) => patchDay(day.date, patch)} />)}
      </View>
      {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
      <Button label="확인" loading={loading || saving} onPress={confirm} />
      <Button label="나중에 수정하기" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl, gap: spacing.md },
  sectionTitle: { marginTop: spacing.xxl },
  weekNav: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  list: { gap: spacing.sm, marginBottom: spacing.xxl },
});
