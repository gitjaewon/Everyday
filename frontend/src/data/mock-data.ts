import type {
  CalendarCell,
  HomeSummary,
  IncidentOption,
  PendingFix,
  RedesignedRoutineItem,
  RoutineItem,
  SettingsLink,
  SettingsToggle,
  ShiftTypeOption,
  WearableAlert,
  WeekDay,
  WorkDay,
} from '@/types/domain';

export const shiftTypeOptions: ShiftTypeOption[] = [
  { id: 'fixed-day', title: '고정 주간', description: '09:00–18:00 고정 근무' },
  { id: 'fixed-night', title: '고정 야간', description: '22:00–06:00 고정 근무' },
  { id: 'two-shift', title: '2교대', description: '주·야 2개조 로테이션' },
  { id: 'three-shift', title: '3교대', description: '주·중·야 3개조 로테이션' },
  { id: 'custom', title: '직접 입력', description: '예정보다 근무가 길어진 경우' },
];

export const recognizedSchedule: WorkDay[] = [
  { date: '2026-08-09', label: '8/9 (일)', kind: 'night', startTime: '20:00', endTime: '05:00' },
  { date: '2026-08-10', label: '8/10 (월)', kind: 'night', startTime: '20:00', endTime: '05:00' },
  {
    date: '2026-08-11',
    label: '8/11 (화)',
    kind: 'night',
    startTime: '20:00',
    endTime: null,
    needsReview: true,
    reviewMessage: '종료 시각이 인식되지 않았습니다.\n직접 입력해주세요.',
  },
  { date: '2026-08-12', label: '8/12 (수)', kind: 'night', startTime: '20:00', endTime: '05:00' },
  { date: '2026-08-13', label: '8/13 (목)', kind: 'off', startTime: null, endTime: null },
  { date: '2026-08-14', label: '8/14 (금)', kind: 'off', startTime: null, endTime: null },
  { date: '2026-08-15', label: '8/15 (토)', kind: 'day', startTime: '08:00', endTime: '17:00' },
];

export const homeSummary: HomeSummary = {
  dateLabel: '2026. 08. 09.',
  shiftLabel: '야간 근무',
  headline: '오늘의 루틴',
  tip: '물을 마셔보는 것이 어떨까요?',
  completed: 3,
  total: 8,
};

export const weekDays: WeekDay[] = [
  { weekday: '일', day: 9, kind: 'night', selected: true },
  { weekday: '월', day: 10, kind: 'night' },
  { weekday: '화', day: 11, kind: 'night' },
  { weekday: '수', day: 12, kind: 'night' },
  { weekday: '목', day: 13, kind: 'off' },
  { weekday: '금', day: 14, kind: 'off' },
  { weekday: '토', day: 15, kind: 'day' },
];

export const initialRoutines: RoutineItem[] = [
  { id: 'wake', title: '기상', time: '14:30', status: 'done', icon: 'wake' },
  { id: 'lunch', title: '점심 식사', time: '15:00', status: 'done', icon: 'meal' },
  { id: 'caffeine', title: '카페인 금지', time: '18:30', status: 'postponed', icon: 'caffeine' },
  { id: 'dinner', title: '저녁 식사', time: '19:30', status: 'planned', icon: 'meal' },
  { id: 'prepare', title: '출근 준비', time: '20:30', status: 'planned', icon: 'commute' },
  { id: 'work', title: '야간 근무 시작', time: '22:00', status: 'waiting', icon: 'work', current: true },
  { id: 'sleep', title: '퇴근 후 파워냅', time: '06:30', status: 'waiting', icon: 'sleep' },
];

const calendarKinds: CalendarCell['kind'][] = [
  'day', 'day', 'day', 'day', 'off', 'off', 'night', 'night', 'night', 'night', 'off', 'day', 'day', 'day',
  'day', 'day', 'off', 'off', 'night', 'night', 'night', 'night', 'unknown', 'off', 'off', 'day', 'day', 'day',
  'day', 'off', 'off', 'night',
];

export const augustCalendar: CalendarCell[] = calendarKinds.map((kind, index) => ({
  day: index + 1,
  kind,
  needsReview: index + 1 === 12 || index + 1 === 22,
}));

export const initialPendingFixes: PendingFix[] = [
  { id: '2026-08-12', label: '8월 12일 (수)', status: '확인필요', message: '시작 · 종료 시간이 누락되었습니다.' },
  { id: '2026-08-22', label: '8월 22일 (금)', status: '확인필요', message: '시작 · 종료 시간이 누락되었습니다.' },
];

export const wearableAlerts: WearableAlert[] = [
  {
    id: 'heart-spike', title: '심박수 급상승 감지', detail: '68 → 152 bpm', timeAgo: '5분 전', severity: 'danger', icon: 'heart',
    aiSummary: '안정 시 대비 심박수가 급격히 상승했습니다.\n긴급 출동 또는 극심한 신체 스트레스 상황으로 판단됩니다.',
  },
  {
    id: 'movement-spike', title: '움직임 급증 감지', detail: '14% → 60%', timeAgo: '15분 전', severity: 'warning', icon: 'activity',
    aiSummary: '평소보다 움직임이 급격히 증가했습니다. 현재 상황을 확인해주세요.',
  },
];

export const incidentOptions: IncidentOption[] = [
  { id: 'overtime', title: '연장근무', description: '예정보다 근무가 길어진 경우' },
  { id: 'emergency', title: '긴급 출동', description: '코드블루·비상 출동 등' },
  { id: 'sleep-interrupted', title: '수면 중 중단', description: '비번 중 수면이 깨진 경우' },
  { id: 'other', title: '기타', description: '그 외 루틴이 깨진 경우' },
];

export const redesignedRoutines: RedesignedRoutineItem[] = [
  { id: 'water', title: '수분 보충', time: '즉시', icon: 'meal', change: 'new' },
  { id: 'sleep-55', title: '취침 (5.5h 수면)', time: '08:30', icon: 'sleep', change: 'new' },
  { id: 'wake-new', title: '기상', time: '14:00', icon: 'wake', change: 'changed' },
  { id: 'lunch-new', title: '점심 식사', time: '14:30', icon: 'meal', change: 'changed' },
  { id: 'nap-cancel', title: '파워냅 (30m)', time: '15:00', icon: 'sleep', change: 'cancelled' },
  { id: 'caffeine-kept', title: '카페인 금지 시작', time: '16:30', icon: 'caffeine', change: 'kept' },
  { id: 'prepare-kept', title: '출근 준비', time: '21:30', icon: 'commute', change: 'kept' },
];

export const initialSettings: SettingsToggle[] = [
  { id: 'alarms', label: '알람 사용', enabled: false },
  { id: 'push', label: '푸시 알림 허용', enabled: false },
  { id: 'wake', label: '기상 알림', enabled: false },
  { id: 'sleep', label: '취침 알림', enabled: false },
  { id: 'meal', label: '식사 알림', enabled: false },
  { id: 'caffeine', label: '카페인 금지 알림', enabled: false },
  { id: 'commute', label: '출근 준비 알림', enabled: false },
  { id: 'nap', label: '파워냅 알림', enabled: false },
];

export const settingsLinks: SettingsLink[] = [
  { id: 'edit', label: '근무표 수정', href: '/schedule' },
  { id: 'upload', label: '근무표 재등록', href: '/schedule-upload' },
  { id: 'shift', label: '근무 유형 변경', href: '/shift-type' },
];
