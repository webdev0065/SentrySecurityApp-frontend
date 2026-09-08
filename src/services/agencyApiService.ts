import { apiRequest } from './apiClient';

export type AgencySite = {
  id: number;
  site_name: string;
  site_address?: string;
  city?: string;
  state?: string;
  coverage_plan?: 'day_shift' | 'night_watch' | '24x7';
  start_time?: string;
  end_time?: string;
};
export type AgencyIncident = {
  id: number;
  incident_code: string;
  severity: 'low' | 'medium' | 'high';
  notes: string;
  site_name: string;
  created_at: string;
};
export type AgencyGuard = {
  id: number;
  guard_code: string;
  full_name: string;
  mobile_number: string;
  site_id?: number | null;
  status: 'on_duty' | 'off_duty';
  site_name?: string;
  coverage_plan?: 'day_shift' | 'night_watch' | '24x7';
  start_time?: string;
  end_time?: string;
  current_latitude?: number | null;
  current_longitude?: number | null;
};
type ApiList<T> = { success: boolean; data: T[] };

export const agencyApiService = {
  getSites: async () =>
    (
      await apiRequest<ApiList<AgencySite>>('/agency/sites', {
        authenticated: true,
      })
    ).data,
  createSite: (body: object) =>
    apiRequest('/agency/sites', { method: 'POST', body, authenticated: true }),
  getGuards: async () =>
    (
      await apiRequest<ApiList<AgencyGuard>>('/agency/guards', {
        authenticated: true,
      })
    ).data,
  createGuard: (body: object) =>
    apiRequest('/agency/guards', { method: 'POST', body, authenticated: true }),
  getIncidents: async () =>
    (
      await apiRequest<ApiList<AgencyIncident>>('/agency/incidents', {
        authenticated: true,
      })
    ).data,
  createIncident: (body: FormData) =>
    apiRequest('/agency/incidents', {
      method: 'POST',
      body,
      authenticated: true,
    }),
};
