/** Shared domain types. These map 1:1 to the planned backend payloads. */

export type ShiftTypeId = 'fixed-day' | 'fixed-night' | 'two-shift' | 'three-shift' | 'custom';

export type ShiftKind = 'day' | 'evening' | 'night' | 'off' | 'unknown';

export interface ShiftTypeOption {
  id: ShiftTypeId;
  title: string;
  description: string;
}

/** One calendar day of the user's work schedule. */
export interface WorkDay {
  /** FastAPI Shift primary key when this item came from the backend. */
  backendId?: number;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** e.g. "8/9 (일)" */
  label: string;
  kind: ShiftKind;
  startTime: string | null;
  endTime: string | null;
  /** True when the AI could not read start/end time and the user must confirm. */
  needsReview?: boolean;
  reviewMessage?: string;
}

export type RoutineStatus = 'done' | 'planned' | 'postponed' | 'waiting';

export type RoutineIconName =
  | 'wake'
  | 'meal'
  | 'caffeine'
  | 'commute'
  | 'work'
  | 'sleep';

export interface RoutineItem {
  id: string;
  title: string;
  time: string;
  status: RoutineStatus;
  icon: RoutineIconName;
  /** Highlighted card (next up) */
  current?: boolean;
}

export type RoutineChange = 'new' | 'changed' | 'cancelled' | 'kept';

export interface RedesignedRoutineItem {
  id: string;
  title: string;
  time: string;
  icon: RoutineIconName;
  change: RoutineChange;
}

export type IncidentSeverity = 'danger' | 'warning';

export interface WearableAlert {
  id: string;
  title: string;
  detail: string;
  timeAgo: string;
  severity: IncidentSeverity;
  icon: 'heart' | 'activity';
  aiSummary: string;
}

export type IncidentTypeId = 'overtime' | 'emergency' | 'sleep-interrupted' | 'other';

export interface IncidentOption {
  id: IncidentTypeId;
  title: string;
  description: string;
}

export interface PendingFix {
  id: string;
  /** e.g. "8월 12일 (수)" */
  label: string;
  status: string;
  message: string;
}

export interface CalendarCell {
  day: number;
  kind: ShiftKind;
  /** Marks a day that needs review — rendered as "!" in the calendar. */
  needsReview?: boolean;
}

export interface HomeSummary {
  dateLabel: string;
  shiftLabel: string;
  headline: string;
  tip: string;
  completed: number;
  total: number;
}

export interface WeekDay {
  weekday: string;
  day: number;
  kind: ShiftKind;
  selected?: boolean;
}

export interface SettingsToggle {
  id: string;
  label: string;
  enabled: boolean;
}

export interface SettingsLink {
  id: string;
  label: string;
  href: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
}

export interface AuthCredentials {
  username: string;
  password: string;
}

export interface SignupPayload extends AuthCredentials {
  name: string;
  consented: boolean;
}

export interface UploadedSchedule {
  uri: string;
  note: string;
}

export interface IncidentReport {
  alertId?: string;
  type: IncidentTypeId;
  startTime: string;
  endTime: string;
}
