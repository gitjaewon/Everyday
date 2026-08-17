import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import ChevronDown from '@/assets/icons/chevron-down-small.svg';
import { colors, radius, spacing } from '@/theme';
import type { ShiftKind, WorkDay } from '@/types/domain';
import { AppText, BottomSheetModal, Button, Card, TimeWheelPicker } from '@/components/ui';

interface WorkDayCardProps {
  day: WorkDay;
  editable?: boolean;
  onChange?: (patch: Partial<WorkDay>) => void;
  showDropdown?: boolean;
}

const KIND_OPTIONS: { value: ShiftKind; label: string }[] = [
  { value: 'day', label: '주간' },
  { value: 'evening', label: '오후' },
  { value: 'night', label: '야간' },
  { value: 'off', label: '휴무' },
];

const KIND_LABEL: Record<ShiftKind, string> = { day: '주간', evening: '오후', night: '야간', off: '휴무', unknown: '미정' };

function parseTime(value: string | null): [string, string] {
  if (!value) return ['00', '00'];
  const [h, m] = value.split(':');
  return [h?.padStart(2, '0') ?? '00', m?.padStart(2, '0') ?? '00'];
}

function TimeField({ label, value, editable, onChange }: { label: string; value: string | null; editable: boolean; onChange?: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');

  const openPicker = () => {
    const [h, m] = parseTime(value);
    setHour(h);
    setMinute(m);
    setOpen(true);
  };

  const confirm = () => {
    onChange?.(`${hour}:${minute}`);
    setOpen(false);
  };

  return (
    <View style={styles.timeColumn}>
      <AppText variant="captionStrong">{label}</AppText>
      <Pressable
        accessibilityRole={editable ? 'button' : undefined}
        accessibilityLabel={`${label} ${value ?? '미입력'}, 드래그로 시간 선택`}
        disabled={!editable}
        onPress={openPicker}
        style={styles.timeField}
      >
        <AppText variant="h3" color={value ? colors.text : colors.textSecondary}>{value ?? '--:--'}</AppText>
      </Pressable>
      <BottomSheetModal visible={open} onClose={() => setOpen(false)}>
        <AppText variant="h3" style={styles.pickerTitle}>{label}</AppText>
        <TimeWheelPicker hour={hour} minute={minute} onChangeHour={setHour} onChangeMinute={setMinute} />
        <Button label="확인" onPress={confirm} />
      </BottomSheetModal>
    </View>
  );
}

export function WorkDayCard({ day, editable = true, onChange, showDropdown = false }: WorkDayCardProps) {
  const off = day.kind === 'off';
  const [pickerOpen, setPickerOpen] = useState(false);
  const canPickKind = showDropdown && editable && !!onChange;

  return (
    <Card tone={day.needsReview ? 'danger' : 'default'} style={styles.card}>
      <View style={styles.header}>
        <AppText variant="caption" color={colors.textSecondary}>{day.label}</AppText>
        <Pressable
          accessibilityRole={canPickKind ? 'button' : undefined}
          accessibilityLabel={canPickKind ? `근무 종류 선택, 현재 ${KIND_LABEL[day.kind]}` : undefined}
          disabled={!canPickKind}
          onPress={() => setPickerOpen(true)}
          style={styles.kind}
        >
          <AppText variant="caption" color={colors.textSecondary}>{showDropdown ? KIND_LABEL[day.kind] : off ? '휴무' : '근무'}</AppText>
          {showDropdown ? <ChevronDown width={16} height={16} /> : null}
        </Pressable>
      </View>
      {canPickKind ? (
        <BottomSheetModal visible={pickerOpen} onClose={() => setPickerOpen(false)}>
          <AppText variant="h3" style={styles.pickerTitle}>근무 종류 선택</AppText>
          {KIND_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              style={styles.pickerOption}
              onPress={() => {
                onChange?.({ kind: option.value, needsReview: false });
                setPickerOpen(false);
              }}
            >
              <AppText variant="body1" color={day.kind === option.value ? colors.brand : colors.text}>{option.label}</AppText>
            </Pressable>
          ))}
        </BottomSheetModal>
      ) : null}
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
  pickerTitle: { marginBottom: spacing.md },
  pickerOption: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  review: { fontWeight: '700' },
  offCopy: { fontWeight: '600', paddingVertical: spacing.xs },
  times: { flexDirection: 'row', gap: spacing.xxl },
  timeColumn: { flex: 1, gap: spacing.xs },
  timeField: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
  },
});
