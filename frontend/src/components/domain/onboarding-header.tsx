import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import ChevronLeft from '@/assets/icons/chevron-left.svg';
import { colors, spacing } from '@/theme';

export function OnboardingHeader({ step }: { step: 1 | 2 | 3 }) {
  return (
    <View style={styles.wrapper}>
      <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" hitSlop={12} onPress={() => router.back()}>
        <ChevronLeft width={24} height={24} />
      </Pressable>
      <View accessibilityLabel={`온보딩 ${step}/3 단계`} style={styles.segments}>
        {[1, 2, 3].map((segment) => (
          <View key={segment} style={[styles.segment, segment <= step && styles.active]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xxl, paddingTop: spacing.sm, paddingBottom: spacing.xxl },
  segments: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.divider },
  active: { backgroundColor: colors.brand },
});
