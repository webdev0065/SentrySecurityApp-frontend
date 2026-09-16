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
};
