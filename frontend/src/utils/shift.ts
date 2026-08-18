import type { ShiftKind } from '@/types/domain';

/** 시작 시각만으로 주간/오후/야간을 추정한다. 사용자가 근무 종류를 직접 안 골라도 시간 기준으로 채워준다. */
export function inferShiftKind(startTime: string | null, endTime: string | null): ShiftKind {
  if (!startTime || !endTime) return 'unknown';
  const hour = Number(startTime.slice(0, 2));
  if (hour >= 5 && hour < 13) return 'day';
  if (hour >= 13 && hour < 18) return 'evening';
  return 'night';
}
