import type { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Splash: undefined;
  Onboarding01: undefined;
  Onboarding02: undefined;
  Onboarding03: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: { forceAccountType?: 'agency' } | undefined;
  AgencyDetails: undefined;
  ClientDetails: undefined;
  VerifyMobile: undefined;
  AccountCreated:
    | { returnToSuperAdmin?: boolean; approvalPending?: boolean }
    | undefined;
  ForgotPassword: undefined;
  VerifyOTP: undefined;
  CreateNewPassword: undefined;
  PasswordUpdated: undefined;
};

export type MainStackParamList = {
  AgencyOverview: undefined;
  AgencyIncidents: { openFileIncident?: boolean } | undefined;
  AgencySites: { openAddSite?: boolean } | undefined;
  AgencyProfile: undefined;
  AgencyGuards: { openAddGuard?: boolean } | undefined;
};

// NEW — root navigator that nests the three feature navigators
export type RootStackParamList = {
  SuperAdminFlow: undefined;
  OnboardingFlow: undefined;
  AuthFlow: NavigatorScreenParams<AuthStackParamList> | undefined;
  MainFlow: undefined;
  ClientFlow: undefined;
};
