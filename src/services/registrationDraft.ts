export type RegistrationDraft = {
  full_name: string;
  mobile_number: string;
  email: string;
  password: string;
  account_type: 'agency' | 'client';
  profile?: Record<string, string>;
};

let draft: RegistrationDraft | null = null;

export const registrationDraft = {
  setAccount: (account: Omit<RegistrationDraft, 'profile'>) => {
    draft = { ...account };
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
