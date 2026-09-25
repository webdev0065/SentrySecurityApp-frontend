import { apiRequest } from './apiClient';

/**
 * Photo selected by the guard. Image Picker already returns a ready-to-upload
 * `file://` URI together with the original file name and MIME type.
 */
export type DutyPhoto = {
  uri: string;
  fileName?: string | null;
  type?: string | null;
};

/** Builds the multipart body the duty API expects (`photo` field). */
const buildDutyPhotoBody = (photo: DutyPhoto) => {
  const uri = /^(file|content|ph):\/\//i.test(photo.uri)
    ? photo.uri
    : `file://${photo.uri.startsWith('/') ? '' : '/'}${photo.uri}`;

  let name = photo.fileName?.trim() || `duty-photo-${Date.now()}.jpg`;
  if (!/\.(jpg|jpeg|png|webp)$/i.test(name)) {
    name = `${name}.jpg`;
  }

  const body = new FormData();
  body.append('photo', {
    uri,
    name,
    type:
      photo.type && photo.type.startsWith('image/') ? photo.type : 'image/jpeg',
  } as unknown as Blob);
  return body;
};

export type GuardDutyDetails = {
  id: number;
  guard_code?: string;
  full_name: string;
  status: 'on_duty' | 'off_duty';
  site_id?: number | null;
  site_name?: string | null;
  site_address?: string | null;
  coverage_plan?: 'day_shift' | 'night_watch' | '24x7';
  start_time?: string | null;
  end_time?: string | null;
};

export type GuardProfile = GuardDutyDetails & {
  mobile_number?: string | null;
  email?: string | null;
  address?: string | null;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
  joining_date?: string | null;
  shift_hours?: number | null;
  basic_salary?: number | null;
  allowances?: number | null;
};

export type GuardProfileUpdate = {
  fullName: string;
  mobileNumber: string;
  email: string;
  address?: string | null;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
};

export type GuardReport = {
  id: number;
  incident_code?: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  created_at: string;
};

export type GuardDutyLog = {
  id: number;
  site_id?: number | null;
  site_name?: string | null;
  status: 'on_duty' | 'off_duty';
  clock_in_at: string;
  clock_in_photo?: string | null;
  clock_out_at?: string | null;
  clock_out_photo?: string | null;
  duration_minutes?: number | string | null;
};

export type GuardDutyStatus = {
  status: GuardDutyLog['status'];
  active_log: GuardDutyLog | null;
  assignment: { site_id: number; site_name: string | null } | null;
};

export type DutyPhotoMode = 'clock_in' | 'clock_out';

/**
 * Payroll summary for a date range, calculated by the API from the guard's
 * logged duty hours (basic salary ÷ (26 × shift hours) = hourly rate).
 */
export type GuardSalarySummary = {
  from: string;
  to: string;
  total_shifts: number;
  total_minutes: number;
  total_hours: number;
  hourly_rate: number;
  calculated_pay: number;
};

export type PatrolCheckpoint = {
  id: number;
  name: string;
  sequence_order: number;
  scanned: boolean;
  scanned_at?: string | null;
};

export type PatrolRoundState = {
  round: { id: number; status: 'in_progress' | 'completed' };
  progress: { scanned: number; total: number; percent: number };
  next_checkpoint: PatrolCheckpoint | null;
  checkpoints: PatrolCheckpoint[];
};

export const guardService = {
  getDutyDetails: async () =>
    (
      await apiRequest<{ success: boolean; data: GuardDutyDetails }>(
        '/guard/me',
        {
          authenticated: true,
        },
      )
    ).data,
  getProfile: async () =>
    (
      await apiRequest<{ success: boolean; data: GuardProfile }>('/guard/me', {
        authenticated: true,
      })
    ).data,
  updateProfile: async (body: GuardProfileUpdate) =>
    (
      await apiRequest<{ success: boolean; data: GuardProfile }>(
        '/guard/profile',
        {
          method: 'PUT',
          body,
          authenticated: true,
        },
      )
    ).data,
  getDutyStatus: async () =>
    (
      await apiRequest<{ success: boolean; data: GuardDutyStatus }>(
        '/guard/duty/status',
        { authenticated: true },
      )
    ).data,
  getDutyHistory: async () =>
    (
      await apiRequest<{ success: boolean; data: GuardDutyLog[] }>(
        '/guard/duty/history',
        { authenticated: true },
      )
    ).data,
  getDutySalary: async (from: string, to: string) =>
    (
      await apiRequest<{ success: boolean; data: GuardSalarySummary }>(
        `/guard/duty/salary?from=${from}&to=${to}`,
        { authenticated: true },
      )
    ).data,
  clockIn: async (photo: DutyPhoto) =>
    (
      await apiRequest<{ success: boolean; data: GuardDutyLog }>(
        '/guard/duty/clock-in',
        {
          method: 'POST',
          body: buildDutyPhotoBody(photo),
          authenticated: true,
        },
      )
    ).data,
  clockOut: async (photo: DutyPhoto) =>
    (
      await apiRequest<{ success: boolean; data: GuardDutyLog }>(
        '/guard/duty/clock-out',
        {
          method: 'POST',
          body: buildDutyPhotoBody(photo),
          authenticated: true,
        },
      )
    ).data,
  submitReport: async (body: {
    severity: GuardReport['severity'];
    notes: string;
  }) =>
    (
      await apiRequest<{ success: boolean; data: GuardReport }>(
        '/guard/reports',
        {
          method: 'POST',
          body,
          authenticated: true,
        },
      )
    ).data,
  getReports: async () =>
    (
      await apiRequest<{ success: boolean; data: GuardReport[] }>(
        '/guard/reports',
        {
          authenticated: true,
        },
      )
    ).data,
  getActivePatrolRound: async () =>
    (
      await apiRequest<{ success: boolean; data: PatrolRoundState | null }>(
        '/guard/patrol/rounds/active',
        { authenticated: true },
      )
    ).data,
  getPatrolCheckpoints: async () =>
    (
      await apiRequest<{
        success: boolean;
        data: {
          site_id: number;
          site_name: string;
          checkpoints: PatrolCheckpoint[];
        };
      }>('/guard/patrol/checkpoints', { authenticated: true })
    ).data,
  startPatrolRound: async () =>
    (
      await apiRequest<{
        success: boolean;
        data: { id: number; checkpoints: PatrolCheckpoint[] };
      }>('/guard/patrol/rounds/start', { method: 'POST', authenticated: true })
    ).data,
  scanPatrolCheckpoint: async (id: number) =>
    (
      await apiRequest<{
        success: boolean;
        data: {
          progress: PatrolRoundState['progress'];
          round_completed: boolean;
        };
      }>(`/guard/patrol/checkpoints/${id}/scan`, {
        method: 'POST',
        authenticated: true,
      })
    ).data,
};
