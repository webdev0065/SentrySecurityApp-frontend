import { apiRequest } from './apiClient';

export type SuperAdminProfile = {
  id: number;
  account_id: string;
  full_name: string;
  email: string;
  mobile_number: string;
  profile_photo?: string | null;
};

export const superAdminService = {
  getAgencies: () =>
    apiRequest<AgencyRecord[]>('/superadmin/agencies', { authenticated: true }),
  updateAgency: (id: string, body: object) =>
    apiRequest(`/superadmin/agencies/${id}`, {
      method: 'PUT',
      authenticated: true,
      body,
    }),
  getPendingAgencies: () =>
    apiRequest<PendingAgency[]>('/superadmin/agencies?status=pending', {
      authenticated: true,
    }),
  approveAgency: (id: number) =>
    apiRequest(`/superadmin/agencies/${id}/approve`, {
      method: 'PUT',
      authenticated: true,
    }),
  rejectAgency: (id: number) =>
    apiRequest(`/superadmin/agencies/${id}/reject`, {
      method: 'PUT',
      authenticated: true,
    }),
  getProfile: () =>
    apiRequest<SuperAdminProfile>('/superadmin/account', {
      authenticated: true,
    }),
  updateProfile: (
    profile: Pick<SuperAdminProfile, 'full_name' | 'email' | 'mobile_number'>,
  ) =>
    apiRequest<{ success: true; admin: SuperAdminProfile }>(
      '/superadmin/account',
      {
        method: 'PUT',
        authenticated: true,
        body: profile,
      },
    ),
};

export type PendingAgency = {
  id: number;
  agency_name: string;
  full_name: string;
  email: string;
  mobile_number: string;
  office_address: string;
  city: string;
  state: string;
  district: string;
  status: string;
};

export type AgencyRecord = PendingAgency & {
  gst_number?: string;
  pincode: string;
  user_id: number;
};
