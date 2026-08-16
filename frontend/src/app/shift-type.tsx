import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingHeader, shiftIconMap } from '@/components/domain';
import { AppText, Button, Card, Screen } from '@/components/ui';
import { shiftTypeOptions } from '@/data/mock-data';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

export default function ShiftTypeScreen() {
  const selected = useAppStore((state) => state.selectedShiftType);
  const select = useAppStore((state) => state.selectShiftType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const next = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      await api.updateWorkPattern(selected);
      router.push('/schedule-upload');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '근무 유형 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.screen}>
      <OnboardingHeader step={1} />
      <AppText variant="h1">근무 유형 선택</AppText>
      <AppText variant="body1">귀하의 근무 형태를 선택해주세요.</AppText>
      <View style={styles.list} accessibilityRole="radiogroup">
        {shiftTypeOptions.map((option) => {
          const Icon = shiftIconMap[option.id];
          const isSelected = selected === option.id;
          return (
            <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: isSelected }} onPress={() => select(option.id)}>
              <Card tone={isSelected ? 'brand' : 'default'} style={styles.option}>
                <Icon width={40} height={40} />
                <View style={styles.copy}>
                  <AppText variant="body1" style={styles.title}>{option.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>{option.description}</AppText>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
      {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
      <View style={styles.spacer} />
      <Button label="다음" loading={loading} disabled={!selected} onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl },
  list: { gap: spacing.sm, marginTop: spacing.xxl },
  option: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  copy: { flex: 1 },
  title: { fontWeight: '700' },
  spacer: { flex: 1 },
});
