import { Pressable, StyleSheet, View } from 'react-native';

import ChevronDown from '@/assets/icons/chevron-down.svg';
import ChevronUp from '@/assets/icons/chevron-up.svg';
import { colors, radius, spacing } from '@/theme';
import type { RoutineItem, RoutineStatus } from '@/types/domain';
import { AppText, Button, ButtonRow, StatusBadge } from '@/components/ui';
import { routineIconMap } from './icon-map';

interface RoutineCardProps {
  item: RoutineItem;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: RoutineStatus) => void;
}

export function RoutineCard({ item, expanded, onToggle, onStatusChange }: RoutineCardProps) {
  const Icon = routineIconMap[item.icon];
  const muted = item.status === 'done' || item.status === 'postponed';
  return (
    <View style={[styles.card, item.current && styles.current]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.time}, ${expanded ? '접기' : '펼치기'}`}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.main}
      >
        <Icon width={40} height={40} />
        <View style={styles.copy}>
          <AppText variant="body1" color={muted ? colors.textMuted : colors.text} style={[styles.title, muted && styles.strike]}>{item.title}</AppText>
          <AppText variant="caption" color={muted ? colors.textMuted : colors.text}>{item.time}</AppText>
        </View>
        <StatusBadge value={item.status} />
        {expanded ? <ChevronUp width={20} height={20} /> : <ChevronDown width={20} height={20} />}
      </Pressable>
      {expanded ? (
        <View style={styles.actions}>
          <ButtonRow>
            <Button compact label="완료" onPress={() => onStatusChange('done')} />
            <Button compact variant="secondary" label="미루기" onPress={() => onStatusChange('postponed')} />
          </ButtonRow>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, overflow: 'hidden' },
  current: { borderColor: colors.brand },
  main: { minHeight: 64, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  copy: { flex: 1 },
  title: { fontWeight: '600' },
  strike: { textDecorationLine: 'line-through' },
  actions: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md },
});
