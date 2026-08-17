import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import AlertBadge from '@/assets/icons/alert-circle-badge.svg';
import Close from '@/assets/icons/close.svg';
import { ShiftCalendar } from '@/components/domain';
import { AppText, BottomSheetModal, Button, Card, DisclaimerCard, InlineAlert, Screen } from '@/components/ui';
import { augustCalendar } from '@/data/mock-data';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

export default function ScheduleScreen() {
  const pending = useAppStore((state) => state.pendingFixes);
  const resolve = useAppStore((state) => state.resolvePendingFix);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = pending.find((item) => item.id === selectedId);

  const openDay = (day: number) => setSelectedId(`2026-08-${day < 10 ? `0${day}` : day}`);
  const apply = () => { if (selectedId) resolve(selectedId); setSelectedId(null); };

  return (
    <Screen scroll contentStyle={styles.screen}>
      <View style={styles.titleRow}>
        <View><AppText variant="caption">2026년 8월</AppText><AppText variant="h1">근무표</AppText></View>
        <Button label="근무표 수정" variant="outline" compact onPress={() => setSelectedId(pending[0]?.id ?? null)} />
      </View>
      {pending.length ? <InlineAlert title={`확인이 필요한 날짜 ${pending.length}개`} body="AI가 인식하지 못한 시각이 있습니다." /> : <InlineAlert tone="success" title="모든 근무표를 확인했습니다." />}
      <ShiftCalendar cells={augustCalendar} onSelectReview={openDay} />
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
