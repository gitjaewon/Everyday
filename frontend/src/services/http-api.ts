import { Platform } from 'react-native';

import { redesignedRoutines } from '@/data/mock-data';
import type {
  AuthUser,
  RoutineItem,
  RoutineStatus,
  ShiftKind,
  ShiftTypeId,
  SignupPayload,
  UploadedSchedule,
  WorkDay,
} from '@/types/domain';
import type { HarugyeolApi } from './api';
import { clearAccessToken, getAccessToken, setAccessToken } from './token-storage';

const defaultApiUrl = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || defaultApiUrl).replace(/\/$/, '');

interface TokenResponse { access_token: string }
interface UserResponse { id: number; username: string; name: string }
interface ImageUploadResponse { image_url: string }
interface ShiftUploadResponse {
  id: number;
  status: 'pending' | 'processing' | 'done' | 'failed';
}
interface ShiftResponse {
  id: number;
  work_date: string;
  shift_type: ShiftKind;
  start_time: string | null;
  end_time: string | null;
  needs_review: boolean;
  review_message: string | null;
}
interface RoutineResponse {
  id: number;
  title: string;
  category: string;
  start_time: string | null;
  status: 'scheduled' | 'done' | 'pending';
}

type RequestOptions = RequestInit & { authenticated?: boolean };

function backendMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== 'object' || !('detail' in body)) return fallback;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((item) => item && typeof item === 'object' && 'msg' in item ? String(item.msg) : '').filter(Boolean).join('\n') || fallback;
  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, headers, ...init } = options;
  const token = authenticated ? await getAccessToken() : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401) await clearAccessToken();
    const body = await response.json().catch(() => null);
    throw new Error(backendMessage(body, `서버 요청에 실패했습니다. (${response.status})`));
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function toUser(user: UserResponse): AuthUser {
  return { id: String(user.id), name: user.name, username: user.username };
}

function timeValue(value: string | null) {
  return value ? value.slice(0, 5) : null;
}

function dateLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`);
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getMonth() + 1}/${date.getDate()} (${weekdays[date.getDay()]})`;
}

function toWorkDay(shift: ShiftResponse): WorkDay {
  return {
    backendId: shift.id,
    date: shift.work_date,
    label: dateLabel(shift.work_date),
    kind: shift.shift_type,
    startTime: timeValue(shift.start_time),
    endTime: timeValue(shift.end_time),
    needsReview: shift.needs_review,
    reviewMessage: shift.review_message ?? undefined,
  };
}

const workPatternMap: Record<ShiftTypeId, string> = {
  'fixed-day': 'fixed_day',
  'fixed-night': 'fixed_night',
  'two-shift': 'rotation_2',
  'three-shift': 'rotation_3',
  custom: 'custom',
};

const routineStatusMap: Record<RoutineStatus, 'scheduled' | 'done' | 'pending'> = {
  done: 'done', planned: 'scheduled', postponed: 'pending', waiting: 'pending',
};

let latestUploadId: number | null = null;

async function authenticate(path: '/auth/login' | '/auth/signup', payload: object) {
  const token = await request<TokenResponse>(path, { method: 'POST', authenticated: false, body: JSON.stringify(payload) });
  await setAccessToken(token.access_token);
  return toUser(await request<UserResponse>('/users/me'));
}

async function uploadImage(upload: UploadedSchedule) {
  if (upload.uri.startsWith('mock://')) throw new Error('근무표 사진을 먼저 선택해주세요.');
  const form = new FormData();
  const extension = upload.uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mimeType = extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : extension === 'heic' ? 'image/heic' : 'image/jpeg';
  if (Platform.OS === 'web') {
    const blob = await fetch(upload.uri).then((response) => response.blob());
    form.append('file', blob, `schedule.${extension}`);
  } else {
    form.append('file', { uri: upload.uri, name: `schedule.${extension}`, type: mimeType } as unknown as Blob);
  }
  return request<ImageUploadResponse>('/images/upload', { method: 'POST', body: form });
}

export const httpApi: HarugyeolApi = {
  async login(credentials) {
    return authenticate('/auth/login', credentials);
  },
  async signup(payload: SignupPayload) {
    return authenticate('/auth/signup', {
      name: payload.name.trim(), username: payload.username.trim(), password: payload.password,
      password_confirm: payload.password, terms_agreed: payload.consented,
    });
  },
  async updateWorkPattern(pattern) {
    await request('/users/me/work-pattern', { method: 'PATCH', body: JSON.stringify({ work_pattern: workPatternMap[pattern] }) });
  },
  async analyzeSchedule(upload) {
    const image = await uploadImage(upload);
    const created = await request<ShiftUploadResponse>('/shifts/uploads', {
      method: 'POST', body: JSON.stringify({ image_url: image.image_url, note: upload.note || null }),
    });
    latestUploadId = created.id;
    if (created.status !== 'done') {
      throw new Error('근무표 인식이 완료되지 않았습니다. 사진을 다시 촬영해 주세요.');
    }
    const shifts = await request<ShiftResponse[]>(`/shifts/uploads/${created.id}/shifts`);
    if (!shifts.length) {
      throw new Error('사진에서 근무 일정을 찾지 못했습니다. 날짜와 근무 코드가 잘 보이도록 다시 촬영해 주세요.');
    }
    return shifts.map(toWorkDay);
  },
  async confirmSchedule(schedule) {
    if (latestUploadId === null) return [];
    const shifts = schedule.filter((day) => day.backendId).map((day) => ({
      id: day.backendId, shift_type: day.kind, start_time: day.startTime, end_time: day.endTime,
    }));
    if (shifts.length) {
      await request(`/shifts/uploads/${latestUploadId}/shifts`, { method: 'PATCH', body: JSON.stringify({ shifts }) });
    }
    await request(`/shifts/uploads/${latestUploadId}/confirm`, { method: 'POST' });
    if (!shifts.length) return [];
    const routines = await request<RoutineResponse[]>(`/shifts/uploads/${latestUploadId}/routines`, { method: 'POST' });
    return routines.map((routine) => ({
      id: String(routine.id),
      title: routine.title,
      time: timeValue(routine.start_time) || '',
      status: routine.status === 'done' ? 'done' : routine.status === 'scheduled' ? 'planned' : 'waiting',
      icon: ['sleep', 'meal', 'caffeine'].indexOf(routine.category) >= 0 ? routine.category as RoutineItem['icon'] : 'work',
    }));
  },
  async updateRoutine(id, status) {
    if (!/^\d+$/.test(id)) throw new Error('서버에서 생성된 루틴만 동기화할 수 있습니다.');
    const routine = await request<RoutineResponse>(`/shifts/routines/${id}`, {
      method: 'PATCH', body: JSON.stringify({ status: routineStatusMap[status] }),
    });
    return {
      id: String(routine.id), title: routine.title, time: timeValue(routine.start_time) || '', status,
      icon: ['sleep', 'meal', 'caffeine'].indexOf(routine.category) >= 0 ? routine.category as RoutineItem['icon'] : 'work',
    };
  },
  async redesignRoutine() {
    // FastAPI currently has no incident/redesign router. Keep this isolated fallback until that contract is added.
    return redesignedRoutines.map((item) => ({ ...item }));
  },
};
