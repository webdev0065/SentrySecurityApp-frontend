export type OnboardingStackParamList = {
  Splash: undefined;
  Onboarding01: undefined;
  Onboarding02: undefined;
  Onboarding03: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  AgencyDetails: undefined;
  ClientDetails: undefined;
  VerifyMobile: undefined;
  AccountCreated: undefined;
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
  AgencyGuards: undefined;
};

// NEW — root navigator that nests the three feature navigators
export type RootStackParamList = {
  SuperAdminFlow: undefined;
  OnboardingFlow: undefined;
  AuthFlow: undefined;
  MainFlow: undefined;
};
