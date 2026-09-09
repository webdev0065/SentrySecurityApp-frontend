export type RegistrationDraft = {
  full_name: string;
  mobile_number: string;
  email: string;
  password: string;
  account_type: 'agency' | 'client';
  profile?: Record<string, string>;
  origin?: 'self' | 'superAdmin';
};

let draft: RegistrationDraft | null = null;

export const registrationDraft = {
  setAccount: (
    account: Omit<RegistrationDraft, 'profile' | 'origin'>,
    origin: RegistrationDraft['origin'] = 'self',
  ) => {
    draft = { ...account, origin };
  },
  setProfile: (profile: Record<string, string>) => {
    if (!draft)
      throw new Error(
        'Your registration session has expired. Please start again.',
      );
    draft = { ...draft, profile };
  },
  get: () => draft,
  clear: () => {
    draft = null;
  },
};
