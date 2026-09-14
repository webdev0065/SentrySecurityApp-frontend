import { apiRequest } from './apiClient';

export type AgencyProfile = {
  agency_name: string;
  business_type: string;
  gst_number?: string;
  office_address: string;
  city: string;
  state: string;
  district?: string;
  pincode: string;
  full_name: string;
  email: string;
  mobile_number: string;
};

type AgencyProfileResponse = { success: boolean; data: AgencyProfile };

export type UpdateAgencyProfileInput = {
  agencyName: string;
  businessType: string;
  gstNumber?: string;
  officeAddress: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
  fullName: string;
  email: string;
  mobileNumber: string;
};

export const accountService = {
  saveAgencyDetails: (body: object) =>
    apiRequest('/agency/details', {
      method: 'POST',
      body,
      authenticated: true,
    }),
  saveClientDetails: (body: object) =>
    apiRequest('/client/details', {
      method: 'POST',
      body,
      authenticated: true,
    }),
  getAgencyProfile: async () =>
    (
      await apiRequest<AgencyProfileResponse>('/agency/details', {
        authenticated: true,
      })
    ).data,
  updateAgencyProfile: (body: UpdateAgencyProfileInput) =>
    apiRequest<AgencyProfileResponse>('/agency/details', {
      method: 'PUT',
      body,
      authenticated: true,
    }),
};
