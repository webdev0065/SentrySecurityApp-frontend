import { apiRequest } from './apiClient';
import { session } from './session';
import { registrationDraft, type RegistrationDraft } from './registrationDraft';

type AuthResponse = {
  message?: string;
  token?: string;
  approval_status?: 'pending' | 'approved';
  admin?: {
    id: number;
    full_name: string;
    email: string;
    account_type: string;
  };
  user?: { id: number; full_name: string; email: string; account_type: string };
};

const formatPhoneNumber = (mobile: string) =>
  `+91${mobile.replace(/\D/g, '').slice(-10)}`;

export const authService = {
  async login(identifier: string, password: string) {
    const email = identifier.trim().toLowerCase();
    const response = await apiRequest<AuthResponse>('/login', {
      method: 'POST',
      // The current unified API authenticates both roles with an email address.
      body: { email, password },
    });
    if (!response.token)
      throw new Error(response.message || 'Login could not be completed.');
    await session.setToken(response.token);
    return response;
  },
  startRegistration: async (
    payload: Omit<RegistrationDraft, 'profile' | 'origin'>,
    origin: RegistrationDraft['origin'] = 'self',
  ) => {
    registrationDraft.setAccount(payload, origin);
  },
  // Temporary development bypass: no SMS is sent until Firebase OTP is enabled.
  async sendMobileOtp(_mobile: string) {
    return undefined;
  },
  async verifyMobileOtp(mobile: string, code: string) {
    const draft = registrationDraft.get();
    if (!draft?.profile) {
      throw new Error(
        'Your registration details are missing. Please start again.',
      );
    }
    const { origin, ...registration } = draft;
    const response = await apiRequest<AuthResponse>('/complete-registration', {
      method: 'POST',
      body: {
        ...registration,
        otp: code,
        mobile_number: formatPhoneNumber(mobile),
      },
    });
    if (origin !== 'superAdmin') {
      if (response.token && response.approval_status !== 'pending')
        await session.setToken(response.token);
      else await session.clearToken();
    }
    registrationDraft.clear();
    return { ...response, returnToSuperAdmin: origin === 'superAdmin' };
  },
  async requestPasswordReset(identifier: string) {
    await session.setPendingIdentifier(identifier);
    return apiRequest('/forgot-password', {
      method: 'POST',
      body: { identifier },
    });
  },
  verifyForgotPasswordOtp: (identifier: string, otp: string) =>
    apiRequest('/verify-forgot-password-otp', {
      method: 'POST',
      body: { identifier, otp },
    }),
  resetPassword: (
    identifier: string,
    new_password: string,
    confirm_password: string,
  ) =>
    apiRequest('/reset-password', {
      method: 'POST',
      body: { identifier, new_password, confirm_password },
    }),
};
