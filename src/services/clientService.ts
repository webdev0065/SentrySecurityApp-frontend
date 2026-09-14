import { apiRequest } from './apiClient';

export type ClientDetails = {
  id: number;
  user_id: number;
  company_name: string;
  site_name: string;
  site_address: string;
  city: string;
  state: string;
  pincode: string;
  avatar_url?: string | null;
};

export type UpdateClientDetailsInput = {
  companyName?: string;
  siteName: string;
  siteAddress: string;
  city: string;
  state: string;
  pincode: string;
};

export type CoverageRequest = {
  id: number;
  event_name: string;
  state: string;
  district: string;
  city: string;
  site_location: string;
  guards_needed: number;
  notes?: string | null;
  status: string;
  created_at: string;
  selected_agency_id?: number | null;
  assigned_agency_id?: number | null;
  agency_name?: string | null;
  agency_city?: string | null;
  agency_district?: string | null;
};

export type CoverageRequestInput = {
  eventName: string;
  state: string;
  district: string;
  city: string;
  siteLocation: string;
  guardsNeeded: number;
  notes: string;
  agencyId?: number;
};

export type AvailableAgency = {
  id: number;
  agency_name: string;
  business_type: string;
  city: string;
  state: string;
  district: string;
};

export type PublicAgencyDetails = AvailableAgency & {
  gst_number?: string | null;
  office_address: string;
  pincode: string;
  profile_photo_url?: string | null;
};

export type ClientAssignedGuard = {
  id: number;
  guard_code: string;
  full_name: string;
  status: 'on_duty' | 'off_duty';
  site_name: string;
  average_rating?: string | number | null;
  rating_count: number;
  client_rating?: number | null;
  client_comment?: string | null;
};

export type ClientAgencyGuardData = {
  guards: ClientAssignedGuard[];
  agencyRating: {
    average_rating?: string | number | null;
    rating_count: number;
    client_rating?: number | null;
    client_comment?: string | null;
  };
};

export const clientService = {
  getDetails: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: ClientDetails;
    }>('/client/details', { authenticated: true });
    return response.data;
  },
  updateDetails: async (body: UpdateClientDetailsInput) => {
    const response = await apiRequest<{
      success: boolean;
      data: ClientDetails;
    }>('/client/details', {
      method: 'PATCH',
      authenticated: true,
      body,
    });
    return response.data;
  },
  getCoverageRequests: async () => {
    const response = await apiRequest<{
      success: boolean;
      data: CoverageRequest[];
    }>('/client/coverage-request', { authenticated: true });
    return response.data;
  },
  createCoverageRequest: async (body: CoverageRequestInput) => {
    const response = await apiRequest<{
      success: boolean;
      data: CoverageRequest;
    }>('/client/coverage-request', {
      method: 'POST',
      authenticated: true,
      body,
    });
    return response.data;
  },
  getAvailableAgencies: async (district: string) => {
    const response = await apiRequest<{
      success: boolean;
      data: AvailableAgency[];
    }>(`/client/available-agencies?district=${encodeURIComponent(district)}`, {
      authenticated: true,
    });
    return response.data;
  },
  getAgencyDetails: async (id: number) => {
    const response = await apiRequest<{
      success: boolean;
      data: PublicAgencyDetails;
    }>(`/client/available-agencies/${id}`, { authenticated: true });
    return response.data;
  },
  getAssignedGuards: async (agencyId: number) =>
    (
      await apiRequest<{ success: boolean; data: ClientAgencyGuardData }>(
        `/client/agencies/${agencyId}/guards`,
        { authenticated: true },
      )
    ).data,
  rateAgency: (agencyId: number, rating: number, comment: string) =>
    apiRequest(`/client/agencies/${agencyId}/rating`, {
      method: 'PUT',
      authenticated: true,
      body: { rating, comment },
    }),
  rateGuard: (guardId: number, rating: number, comment: string) =>
    apiRequest(`/client/guards/${guardId}/rating`, {
      method: 'PUT',
      authenticated: true,
      body: { rating, comment },
    }),
};
