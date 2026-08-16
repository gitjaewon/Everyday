import { StyleSheet, TextInput, View } from 'react-native';

import ChevronDown from '@/assets/icons/chevron-down-small.svg';
import { colors, radius, spacing, typography } from '@/theme';
import type { WorkDay } from '@/types/domain';
import { AppText, Card } from '@/components/ui';

interface WorkDayCardProps {
  day: WorkDay;
  editable?: boolean;
  onChange?: (patch: Partial<WorkDay>) => void;
  showDropdown?: boolean;
}

function TimeField({ label, value, editable, onChange }: { label: string; value: string | null; editable: boolean; onChange?: (value: string) => void }) {
  return (
    <View style={styles.timeColumn}>
      <AppText variant="captionStrong">{label}</AppText>
      <TextInput
        accessibilityLabel={`${label} ${value ?? '미입력'}`}
        editable={editable}
        value={value ?? ''}
        placeholder=""
        keyboardType="numbers-and-punctuation"
        onChangeText={onChange}
        maxLength={5}
        style={styles.timeField}
      />
    </View>
  );
}

export function WorkDayCard({ day, editable = true, onChange, showDropdown = false }: WorkDayCardProps) {
  const off = day.kind === 'off';
  return (
    <Card tone={day.needsReview ? 'danger' : 'default'} style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={colors.textSecondary}>{day.label}</AppText>
        <View style={styles.kind}>
          <AppText variant="caption" color={colors.textSecondary}>{off ? '휴무' : '근무'}</AppText>
          {showDropdown ? <ChevronDown width={16} height={16} /> : null}
        </View>
      </View>
      {day.needsReview && day.reviewMessage ? (
        <AppText variant="body2" style={styles.review}>{day.reviewMessage}</AppText>
      ) : null}
      {off ? (
        <AppText variant="body2" style={styles.offCopy}>{showDropdown ? '휴무일 입니다.' : '휴무일로 인식되었습니다.'}</AppText>
      ) : (
        <View style={styles.times}>
          <TimeField label="시작 시각" value={day.startTime} editable={editable} onChange={(startTime) => onChange?.({ startTime })} />
          <TimeField label="종료 시각" value={day.endTime} editable={editable} onChange={(endTime) => onChange?.({ endTime })} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kind: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  review: { fontWeight: '700' },
  offCopy: { fontWeight: '600', paddingVertical: spacing.xs },
  times: { flexDirection: 'row', gap: spacing.xxl },
  timeColumn: { flex: 1, gap: spacing.xs },
  timeField: {
    ...typography.h3,
    height: 46,
    textAlign: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.sm,
  },
});
