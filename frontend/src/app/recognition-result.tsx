import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { OnboardingHeader, WorkDayCard } from '@/components/domain';
import { AppText, Button, InlineAlert, Screen } from '@/components/ui';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

export default function RecognitionResultScreen() {
  const schedule = useAppStore((state) => state.schedule);
  const patchWorkDay = useAppStore((state) => state.patchWorkDay);
  const complete = useAppStore((state) => state.completeOnboarding);
  const setRoutines = useAppStore((state) => state.setRoutines);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const reviewCount = schedule.filter((day) => day.needsReview).length;

  const confirm = async () => {
    setLoading(true);
    setError('');
    try {
      const routines = await api.confirmSchedule(schedule);
      if (routines.length) setRoutines(routines);
      complete();
      router.replace('/(tabs)');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '근무표 확정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.screen}>
      <OnboardingHeader step={3} />
      <AppText variant="h1">AI 인식 결과 확인</AppText>
      <AppText variant="body1">아래 항목을 검토 후, 틀리거나 누락된 값을 수정하세요.</AppText>
      <InlineAlert title={`확인이 필요한 날짜 ${reviewCount}개`} body="AI가 인식하지 못한 시각 및 일정이 있습니다." />
      <AppText variant="h3" style={styles.sectionTitle}>인식된 근무 일정</AppText>
      <View style={styles.list}>
        {schedule.map((day) => <WorkDayCard key={day.date} day={day} showDropdown onChange={(patch) => patchWorkDay(day.date, patch)} />)}
      </View>
      {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
      <Button label="확인" loading={loading} onPress={confirm} />
      <Button label="나중에 수정하기" variant="secondary" onPress={() => router.replace('/template')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl, gap: spacing.md },
  sectionTitle: { marginTop: spacing.xxl },
  list: { gap: spacing.sm, marginBottom: spacing.xxl },
});
