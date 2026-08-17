import { create } from 'zustand';

import {
  initialPendingFixes,
  initialRoutines,
  initialSettings,
  recognizedSchedule,
  redesignedRoutines,
} from '@/data/mock-data';
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

interface AppState {
  hasStarted: boolean;
  user: AuthUser | null;
  onboardingComplete: boolean;
  selectedShiftType: ShiftTypeId | null;
  uploadedScheduleUri: string | null;
  uploadNote: string;
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
  setSchedule: (schedule) => set({ schedule }),
  patchWorkDay: (date, patch) =>
    set((state) => ({
      schedule: state.schedule.map((day) =>
        day.date === date ? { ...day, ...patch, needsReview: patch.endTime ? false : day.needsReview } : day,
      ),
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
