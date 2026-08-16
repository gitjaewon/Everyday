export const formatProgress = (completed: number, total: number) => `${completed} / ${total}`;
export const formatClock = (value: string | null) => value ?? '';
export const formatCalendarMonth = (year: number, month: number) => `${year}년 ${month}월`;
export const formatWorkDayLabel = (month: number, day: number, weekday: string) =>
  `${month}/${day} (${weekday})`;
export const formatPendingDate = (month: number, day: number, weekday: string) =>
  `${month}월 ${day}일 (${weekday})`;
