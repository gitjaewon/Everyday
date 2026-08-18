import { create } from 'zustand';

import {
  initialPendingFixes,
  initialRoutines,
  initialSettings,
  recognizedSchedule,
  redesignedRoutines,
} from '@/data/mock-data';
import { inferShiftKind } from '@/utils/shift';
import type {
  AuthUser,
  IncidentTypeId,
  PendingFix,
  RedesignedRoutineItem,
  RoutineItem,
  RoutineStatus,
  SettingsToggle,
  ShiftTypeId,
  WorkDay,
} from '@/types/domain';

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function currentWeekRange() {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: toIsoDate(monday), end: toIsoDate(sunday) };
}

interface AppState {
  hasStarted: boolean;
  user: AuthUser | null;
  onboardingComplete: boolean;
  selectedShiftType: ShiftTypeId | null;
  uploadedScheduleUri: string | null;
  uploadNote: string;
  uploadStartDate: string;
  uploadEndDate: string;
  schedule: WorkDay[];
  routines: RoutineItem[];
  pendingFixes: PendingFix[];
  settings: SettingsToggle[];
  selectedIncidentType: IncidentTypeId | null;
  incidentStartTime: string;
  incidentEndTime: string;
  redesignedRoutine: RedesignedRoutineItem[];

  start: () => void;
  setUser: (user: AuthUser | null) => void;
  selectShiftType: (id: ShiftTypeId) => void;
  setUploadedSchedule: (uri: string | null) => void;
  setUploadNote: (note: string) => void;
  setUploadDateRange: (startDate: string, endDate: string) => void;
  setSchedule: (schedule: WorkDay[]) => void;
  patchWorkDay: (date: string, patch: Partial<WorkDay>) => void;
  completeOnboarding: () => void;
  setRoutines: (routines: RoutineItem[]) => void;
  setRoutineStatus: (id: string, status: RoutineStatus) => void;
  resolvePendingFix: (id: string) => void;
  toggleSetting: (id: string) => void;
  selectIncidentType: (id: IncidentTypeId | null) => void;
  setIncidentTimes: (startTime: string, endTime: string) => void;
  setRedesignedRoutine: (items: RedesignedRoutineItem[]) => void;
}

const clone = <T extends object>(items: T[]) => items.map((item) => ({ ...item }));

export const useAppStore = create<AppState>((set) => ({
  hasStarted: false,
  user: null,
  onboardingComplete: false,
  selectedShiftType: null,
  uploadedScheduleUri: null,
  uploadNote: '',
  uploadStartDate: currentWeekRange().start,
  uploadEndDate: currentWeekRange().end,
  schedule: clone(recognizedSchedule),
  routines: clone(initialRoutines),
  pendingFixes: clone(initialPendingFixes),
  settings: clone(initialSettings),
  selectedIncidentType: null,
  incidentStartTime: '17:00',
  incidentEndTime: '21:00',
  redesignedRoutine: clone(redesignedRoutines),

  start: () => set({ hasStarted: true }),
  setUser: (user) => set({ user }),
  selectShiftType: (selectedShiftType) => set({ selectedShiftType }),
  setUploadedSchedule: (uploadedScheduleUri) => set({ uploadedScheduleUri }),
  setUploadNote: (uploadNote) => set({ uploadNote }),
  setUploadDateRange: (uploadStartDate, uploadEndDate) => set({ uploadStartDate, uploadEndDate }),
  setSchedule: (schedule) => set({ schedule }),
  patchWorkDay: (date, patch) =>
    set((state) => ({
      schedule: state.schedule.map((day) => {
        if (day.date !== date) return day;
        const timeChanged = 'startTime' in patch || 'endTime' in patch;
        const merged = { ...day, ...patch };
        // 시각만 입력하고 근무 종류를 직접 안 골랐으면 시작 시각 기준으로 주간/오후/야간을 채워준다.
        const kind = !patch.kind && timeChanged ? inferShiftKind(merged.startTime, merged.endTime) : merged.kind;
        const needsReview = patch.needsReview ?? (kind === 'off' ? false : !(merged.startTime && merged.endTime));
        return { ...merged, kind, needsReview };
      }),
    })),
  completeOnboarding: () => set({ onboardingComplete: true }),
  setRoutines: (routines) => set({ routines }),
  setRoutineStatus: (id, status) =>
    set((state) => ({
      routines: state.routines.map((routine) => (routine.id === id ? { ...routine, status } : routine)),
    })),
  resolvePendingFix: (id) =>
    set((state) => ({ pendingFixes: state.pendingFixes.filter((item) => item.id !== id) })),
  toggleSetting: (id) =>
    set((state) => ({
      settings: state.settings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting,
      ),
    })),
  selectIncidentType: (selectedIncidentType) => set({ selectedIncidentType }),
  setIncidentTimes: (incidentStartTime, incidentEndTime) => set({ incidentStartTime, incidentEndTime }),
  setRedesignedRoutine: (redesignedRoutine) => set({ redesignedRoutine }),
}));
