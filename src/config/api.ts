import { Platform } from 'react-native';

// Android emulators reach the computer hosting the API at 10.0.2.2. For a
// physical device, replace this with your computer's LAN IP address.
const localHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_ORIGIN = `http://${localHost}:3000`;

export const API_BASE_URL = `${API_ORIGIN}/api`;

/**
 * Uploaded files (duty photos, incident images, avatars) are served by the API
 * host outside of `/api`. Stored records can hold a relative path
 * (`/uploads/duty/duty_1_123.jpg`) or a full filesystem path, so normalise both
 * into a URL the app can render.
 */
export const resolveMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const uploadsIndex = path.indexOf('/uploads/');
  const relativePath = uploadsIndex >= 0 ? path.slice(uploadsIndex) : path;

  return `${API_ORIGIN}${relativePath.startsWith('/') ? '' : '/'}${relativePath}`;
};
