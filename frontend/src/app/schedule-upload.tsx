import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import Camera from '@/assets/icons/camera-circle.svg';
import Close from '@/assets/icons/close-gray.svg';
import Loader from '@/assets/icons/loader.svg';
import { OnboardingHeader } from '@/components/domain';
import { AppText, Button, FormField, Screen } from '@/components/ui';
import { recognizedSchedule } from '@/data/mock-data';
import { api } from '@/services/api';
import { useAppStore } from '@/store/use-app-store';
import { colors, radius, spacing } from '@/theme';

export default function ScheduleUploadScreen() {
  const uri = useAppStore((state) => state.uploadedScheduleUri);
  const note = useAppStore((state) => state.uploadNote);
  const startDate = useAppStore((state) => state.uploadStartDate);
  const endDate = useAppStore((state) => state.uploadEndDate);
  const setUri = useAppStore((state) => state.setUploadedSchedule);
  const setNote = useAppStore((state) => state.setUploadNote);
  const setDateRange = useAppStore((state) => state.setUploadDateRange);
  const setSchedule = useAppStore((state) => state.setSchedule);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!analyzing) return;
    const animation = Animated.loop(Animated.timing(spin, { toValue: 1, duration: 900, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [analyzing, spin]);

  const pickSchedule = async () => {
    if (analyzing) return;
    if (uri) {
      setUri(null);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled) setUri(result.assets[0].uri);
  };

  const analyze = async () => {
    if (!uri) {
      setSchedule(recognizedSchedule.map((day) => ({ ...day })));
      router.replace('/recognition-result');
      return;
    }
    setAnalyzing(true);
    setError('');
    try {
      const schedule = await api.analyzeSchedule({ uri, note, startDate, endDate });
      setSchedule(schedule);
      router.replace('/recognition-result');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '근무표 분석에 실패했습니다.');
      setAnalyzing(false);
    }
  };

  return (
    <Screen scroll={!analyzing} contentStyle={styles.screen}>
      <OnboardingHeader step={2} />
      <AppText variant="h1">근무표를 올려주세요.</AppText>
      <AppText variant="body1">사진 한 장이면 충분해요.{`\n`}AI가 근무표를 읽고 최적의 루틴을 제공합니다.</AppText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={uri ? '업로드한 근무표 사진 삭제' : '근무표 촬영 또는 업로드'}
        onPress={pickSchedule}
        style={[styles.upload, uri && styles.preview]}
      >
        {analyzing ? (
          <View style={styles.center}>
            <Animated.View style={{ transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
              <Loader width={24} height={24} />
            </Animated.View>
            <AppText variant="body1" align="center">AI가 분석 중이에요.{`\n`}잠시만 기다려주세요.</AppText>
          </View>
        ) : uri ? (
          <View style={styles.checker}>
            <Image source={{ uri }} contentFit="cover" style={StyleSheet.absoluteFill} />
            <View style={styles.close}><Close width={24} height={24} /></View>
          </View>
        ) : (
          <View style={styles.center}>
            <Camera width={56} height={56} />
            <AppText variant="body1" style={styles.uploadCopy}>근무표 촬영 또는 업로드</AppText>
          </View>
        )}
      </Pressable>
      {!analyzing ? (
        <>
          <AppText variant="caption" color={colors.textSecondary}>근무 날짜 입력 (1주 단위)</AppText>
          <View style={styles.dateRow}>
            <FormField label="시작 날짜" placeholder="YYYY-MM-DD" value={startDate} onChangeText={(value) => setDateRange(value, endDate)} />
            <FormField label="종료 날짜" placeholder="YYYY-MM-DD" value={endDate} onChangeText={(value) => setDateRange(startDate, value)} />
          </View>
          <FormField
            label="특이사항 (선택)"
            placeholder={'루틴 설계에 참고하실 점을 특이사항을 적어주세요.\n(ex. 제 이름은 홍길동이고, 저는 평소 하루에 2끼 먹습니다.)'}
            multiline
            value={note}
            onChangeText={setNote}
          />
          {error ? <AppText variant="caption" color={colors.danger}>{error}</AppText> : null}
          <View style={styles.spacer} />
          <Button label="다음" onPress={analyze} />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: spacing.xxl, gap: spacing.md },
  upload: { height: 201, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.brand, borderRadius: radius.xl, backgroundColor: colors.surface, marginVertical: spacing.xxl, overflow: 'hidden' },
  preview: { borderStyle: 'dashed' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xxl },
  uploadCopy: { fontWeight: '700' },
  checker: { flex: 1, backgroundColor: colors.border },
  dateRow: { flexDirection: 'row', gap: spacing.xxl },
  close: { position: 'absolute', right: spacing.md, top: spacing.md, borderRadius: radius.pill, backgroundColor: colors.surface },
  spacer: { flex: 1, minHeight: spacing.xxl },
});
