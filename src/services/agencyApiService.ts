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
  email: string;
  site_id?: number | null;
  status: 'on_duty' | 'off_duty';
  site_name?: string;
  coverage_plan?: 'day_shift' | 'night_watch' | '24x7';
  start_time?: string;
  end_time?: string;
  current_latitude?: number | null;
  current_longitude?: number | null;
  joining_date?: string;
  shift_hours?: number | null;
  basic_salary?: string | number | null;
  allowances?: string | number | null;
  address?: string | null;
  age?: number | null;
  gender?: 'male' | 'female' | 'other' | null;
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
  getGuard: async (id: number) =>
    (
      await apiRequest<{ success: boolean; data: AgencyGuard }>(
        `/agency/guards/${id}`,
        { authenticated: true },
      )
    ).data,
  updateGuard: (id: number, body: object) =>
    apiRequest(`/agency/guards/${id}`, {
      method: 'PUT',
      body,
      authenticated: true,
    }),
  removeGuard: (id: number) =>
    apiRequest(`/agency/guards/${id}`, {
      method: 'DELETE',
      authenticated: true,
    }),
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
