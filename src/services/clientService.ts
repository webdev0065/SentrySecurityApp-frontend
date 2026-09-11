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
};
