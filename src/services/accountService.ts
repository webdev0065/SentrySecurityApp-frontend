import { apiRequest } from './apiClient';

export const accountService = {
  saveAgencyDetails: (body: object) =>
    apiRequest('/agency/details', { method: 'POST', body, authenticated: true }),
  saveClientDetails: (body: object) =>
    apiRequest('/client/details', { method: 'POST', body, authenticated: true }),
};
