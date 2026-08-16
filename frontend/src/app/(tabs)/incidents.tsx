import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import CheckCircle from '@/assets/icons/check-circle.svg';
import Close from '@/assets/icons/close.svg';
import { IncidentOptionCard, routineIconMap, WearableAlertCard } from '@/components/domain';
import { AppText, BottomSheetModal, Button, Card, FormField, Screen, StatusBadge } from '@/components/ui';
import { incidentOptions, wearableAlerts } from '@/data/mock-data';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, spacing } from '@/theme';

type Flow = 'closed' | 'analysis' | 'time' | 'result';

export default function IncidentsScreen() {
  const selectedType = useAppStore((state) => state.selectedIncidentType);
  const selectType = useAppStore((state) => state.selectIncidentType);
  const startTime = useAppStore((state) => state.incidentStartTime);
  const endTime = useAppStore((state) => state.incidentEndTime);
  const setTimes = useAppStore((state) => state.setIncidentTimes);
  const redesigned = useAppStore((state) => state.redesignedRoutine);
  const setRedesigned = useAppStore((state) => state.setRedesignedRoutine);
  const [flow, setFlow] = useState<Flow>('closed');
  const [alertId, setAlertId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const alert = wearableAlerts.find((item) => item.id === alertId) ?? wearableAlerts[0];

  const openAlert = (id: string) => { setAlertId(id); setFlow('analysis'); };
  const openManual = (id: typeof incidentOptions[number]['id']) => { selectType(id); setAlertId(undefined); setFlow('time'); };
  const redesign = async () => {
    if (!selectedType) return;
    setLoading(true);
    const items = await api.redesignRoutine({ alertId, type: selectedType, startTime, endTime });
    setRedesigned(items);
    setLoading(false);
    setFlow('result');
  };
  const close = () => { setFlow('closed'); selectType(null); };

  return (
    <Screen scroll padded={false} contentStyle={styles.screen}>
      <View style={styles.header}><AppText variant="h1">돌발 상황</AppText></View>
      <View style={styles.body}>
        <AppText variant="caption" color={colors.textSecondary}>웨어러블 기기 감지 알림</AppText>
        <View style={styles.list}>{wearableAlerts.map((item) => <WearableAlertCard key={item.id} alert={item} onPress={() => openAlert(item.id)} />)}</View>
        <View style={styles.or}><View style={styles.line} /><AppText variant="caption" color={colors.textSecondary}>또는 직접 입력</AppText><View style={styles.line} /></View>
        <View style={styles.list}>{incidentOptions.map((option) => <IncidentOptionCard key={option.id} option={option} onPress={() => openManual(option.id)} />)}</View>
      </View>

      <BottomSheetModal visible={flow !== 'closed'} onClose={close} fullHeight={flow === 'analysis' || flow === 'result'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheet}>
          <View style={styles.sheetTop}>
            <AppText variant="h2">{flow === 'result' ? '돌발 상황' : alert.title}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="닫기" onPress={close}><Close width={24} height={24} /></Pressable>
          </View>
          {flow === 'analysis' ? (
            <>
              <WearableAlertCard alert={alert} onPress={() => {}} />
              <Card style={styles.analysis}><View style={styles.analysisTitle}><CheckCircle width={24} height={24} /><AppText variant="body1" color={colors.brand} style={styles.bold}>AI 분석</AppText></View><AppText variant="body2">{alert.aiSummary}</AppText></Card>
              <AppText variant="caption" color={colors.textSecondary}>돌발 상황이 발생했나요? 상황을 선택해주세요.</AppText>
              <View style={styles.list}>{incidentOptions.map((option) => <IncidentOptionCard key={option.id} option={option} selected={selectedType === option.id} onPress={() => selectType(option.id)} />)}</View>
              <Button label="다음" disabled={!selectedType} onPress={() => setFlow('time')} />
              <Button label="돌발 상황이 아님" variant="secondary" onPress={close} />
            </>
          ) : null}
          {flow === 'time' ? (
            <>
              <AppText variant="h3">돌발 상황 기록</AppText>
              <View style={styles.timeRow}>
                <FormField label="시작 시간" value={startTime} onChangeText={(value) => setTimes(value, endTime)} keyboardType="numbers-and-punctuation" />
                <FormField label="종료 시간" value={endTime} onChangeText={(value) => setTimes(startTime, value)} keyboardType="numbers-and-punctuation" />
              </View>
              <Button label="루틴 재설계" loading={loading} onPress={redesign} />
              <Button label="취소" variant="secondary" onPress={close} />
            </>
          ) : null}
          {flow === 'result' ? (
            <>
              <Card style={styles.analysis}><View style={styles.analysisTitle}><CheckCircle width={24} height={24} /><AppText variant="body1" color={colors.brand} style={styles.bold}>AI 루틴 자동 설계 완료</AppText></View><AppText variant="body2">돌발 상황(3시간) 기준으로 신체 회복을 최우선으로 재배치했습니다. 호흡 안정 → 수면 → 식사 순서로 다음 근무 전 전체 루틴을 설계했습니다.</AppText></Card>
              <View style={styles.redesigned}>{redesigned.map((item) => { const Icon = routineIconMap[item.icon]; return <Card key={item.id} style={styles.routine}><Icon width={40} height={40} /><View style={styles.routineCopy}><AppText variant="body1" style={[styles.bold, item.change === 'cancelled' && styles.cancelled]}>{item.title}</AppText><AppText variant="caption">{item.time}</AppText></View><StatusBadge value={item.change} /></Card>; })}</View>
              <Button label="확인" onPress={close} />
            </>
          ) : null}
        </ScrollView>
      </BottomSheetModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl },
  header: { backgroundColor: colors.surface, paddingHorizontal: spacing.gutter, paddingVertical: spacing.xl },
  body: { padding: spacing.gutter, gap: spacing.sm },
  list: { gap: spacing.sm },
  or: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xxl },
  line: { flex: 1, height: 1, backgroundColor: colors.textSecondary },
  sheet: { gap: spacing.md, paddingBottom: spacing.xxl },
  sheetTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  analysis: { backgroundColor: colors.iconTile, gap: spacing.sm },
  analysisTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  bold: { fontWeight: '700' },
  timeRow: { flexDirection: 'row', gap: spacing.xxl },
  redesigned: { gap: spacing.sm },
  routine: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  routineCopy: { flex: 1 },
  cancelled: { color: colors.textMuted, textDecorationLine: 'line-through' },
});
