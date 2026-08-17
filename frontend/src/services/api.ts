import type {
  AuthCredentials,
  AuthUser,
  IncidentReport,
  RedesignedRoutineItem,
  RoutineItem,
  RoutineStatus,
  SignupPayload,
  UploadedSchedule,
  WorkDay,
} from '@/types/domain';
import { httpApi } from './http-api';

/** Stable frontend-to-FastAPI contract used by screens and the Zustand store. */
export interface HarugyeolApi {
  login(credentials: AuthCredentials): Promise<AuthUser>;
  signup(payload: SignupPayload): Promise<AuthUser>;
  updateWorkPattern(pattern: import('@/types/domain').ShiftTypeId): Promise<void>;
  getShiftsForMonth(year: number, month: number): Promise<WorkDay[]>;
  analyzeSchedule(upload: UploadedSchedule): Promise<WorkDay[]>;
  confirmSchedule(schedule: WorkDay[]): Promise<RoutineItem[]>;
  getRoutinesForDate(date: string): Promise<RoutineItem[]>;
  updateRoutine(id: string, status: RoutineStatus): Promise<RoutineItem>;
  redesignRoutine(report: IncidentReport): Promise<RedesignedRoutineItem[]>;
}

export const api: HarugyeolApi = httpApi;
