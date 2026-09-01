import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'sentry.authToken';
const PENDING_IDENTIFIER_KEY = 'sentry.pendingIdentifier';
const PENDING_MOBILE_KEY = 'sentry.pendingMobile';

export const session = {
  setToken: (token: string) => AsyncStorage.setItem(TOKEN_KEY, token),
  getToken: () => AsyncStorage.getItem(TOKEN_KEY),
  clearToken: () => AsyncStorage.removeItem(TOKEN_KEY),
  setPendingIdentifier: (identifier: string) =>
    AsyncStorage.setItem(PENDING_IDENTIFIER_KEY, identifier),
  getPendingIdentifier: () => AsyncStorage.getItem(PENDING_IDENTIFIER_KEY),
  setPendingMobile: (mobile: string) =>
    AsyncStorage.setItem(PENDING_MOBILE_KEY, mobile),
  getPendingMobile: () => AsyncStorage.getItem(PENDING_MOBILE_KEY),
};
