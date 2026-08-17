import { useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';
import { AppText } from './app-text';

const ITEM_HEIGHT = 40;
const VISIBLE_COUNT = 5;
const PAD_COUNT = Math.floor(VISIBLE_COUNT / 2);
const SCROLL_END_DEBOUNCE_MS = 120;

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

interface ScrollableWebNode {
  scrollTop: number;
  addEventListener(type: 'wheel', listener: (event: WheelEvent) => void, options?: AddEventListenerOptions): void;
  removeEventListener(type: 'wheel', listener: (event: WheelEvent) => void): void;
}

function Wheel({ values, selected, onChange }: { values: string[]; selected: string; onChange: (value: string) => void }) {
  const scrollRef = useRef<ScrollView>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const index = Math.max(0, values.indexOf(selected));

  const commitOffset = (offsetY: number) => {
    const rounded = Math.round(offsetY / ITEM_HEIGHT);
    const clamped = Math.min(values.length - 1, Math.max(0, rounded));
    onChange(values[clamped]);
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: false });
    // 최초 오픈 시 현재 값 위치로만 맞추면 되므로 selected 변경마다 재실행할 필요 없음
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 웹은 onMomentumScrollEnd가 안정적으로 안 붙어서(트랙패드/마우스휠엔 "momentum" 개념이 없음),
  // 마우스 휠은 한 칸씩만 이동하도록 직접 처리하고 스크롤이 멈추면 debounce로 선택값을 확정한다.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = (scrollRef.current as unknown as { getScrollableNode?: () => ScrollableWebNode })?.getScrollableNode?.();
    if (!node) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const currentIndex = Math.round(node.scrollTop / ITEM_HEIGHT);
      const nextIndex = Math.min(values.length - 1, Math.max(0, currentIndex + (event.deltaY > 0 ? 1 : -1)));
      node.scrollTop = nextIndex * ITEM_HEIGHT;
      onChange(values[nextIndex]);
    };
    node.addEventListener('wheel', handleWheel, { passive: false });
    return () => node.removeEventListener('wheel', handleWheel);
  }, [values, onChange]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitOffset(offsetY), SCROLL_END_DEBOUNCE_MS);
  };

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    commitOffset(event.nativeEvent.contentOffset.y);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.wheel}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * PAD_COUNT }}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleMomentumEnd}
    >
      {values.map((value) => (
        <View key={value} style={styles.item}>
          <AppText variant="h3" color={value === selected ? colors.text : colors.textSecondary}>{value}</AppText>
        </View>
      ))}
    </ScrollView>
  );
}

interface TimeWheelPickerProps {
  hour: string;
  minute: string;
  onChangeHour: (hour: string) => void;
  onChangeMinute: (minute: string) => void;
}

export function TimeWheelPicker({ hour, minute, onChangeHour, onChangeMinute }: TimeWheelPickerProps) {
  return (
    <View style={styles.container}>
      <Wheel values={HOURS} selected={hour} onChange={onChangeHour} />
      <AppText variant="h3" color={colors.textSecondary}>:</AppText>
      <Wheel values={MINUTES} selected={minute} onChange={onChangeMinute} />
      <View pointerEvents="none" style={styles.highlight} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  wheel: { height: ITEM_HEIGHT * VISIBLE_COUNT, width: 72 },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * PAD_COUNT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
  },
});
