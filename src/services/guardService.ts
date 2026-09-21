import { apiRequest } from './apiClient';

export type GuardDutyDetails = {
  id: number;
  guard_code: string;
  full_name: string;
  status: 'on_duty' | 'off_duty';
  site_id?: number | null;
  site_name?: string | null;
  site_address?: string | null;
  coverage_plan?: 'day_shift' | 'night_watch' | '24x7';
  start_time?: string | null;
  end_time?: string | null;
};

export type GuardReport = {
  id: number;
  incident_code?: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  created_at: string;
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
  updateDutyStatus: async (status: GuardDutyDetails['status']) =>
    (
      await apiRequest<{ success: boolean; data: GuardDutyDetails }>(
        '/guard/duty',
        {
          method: 'PUT',
          body: { status },
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
