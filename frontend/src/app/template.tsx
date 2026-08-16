import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OnboardingHeader, WorkDayCard } from '@/components/domain';
import { AppText, Button, Screen } from '@/components/ui';
import { useAppStore } from '@/store/use-app-store';
import { spacing } from '@/theme';

export default function TemplateScreen() {
  const schedule = useAppStore((state) => state.schedule);
  const patchWorkDay = useAppStore((state) => state.patchWorkDay);
  const complete = useAppStore((state) => state.completeOnboarding);
  const finish = () => { complete(); router.replace('/(tabs)'); };

  return (
    <Screen scroll contentStyle={styles.screen}>
      <OnboardingHeader step={2} />
      <AppText variant="h1">템플릿 입력</AppText>
      <AppText variant="body1">본인의 근무표를 입력해주세요.</AppText>
      <View style={styles.list}>
        {schedule.map((day) => <WorkDayCard key={day.date} day={day} showDropdown onChange={(patch) => patchWorkDay(day.date, patch)} />)}
      </View>
      <Button label="확인" onPress={finish} />
      <Button label="나중에 수정하기" variant="secondary" disabled />
    </Screen>
  );
}

const styles = StyleSheet.create({ screen: { paddingBottom: spacing.xxl, gap: spacing.md }, list: { gap: spacing.sm, marginVertical: spacing.xxl } });
