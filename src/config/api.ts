import { Platform } from 'react-native';

// Android emulators reach the computer hosting the API at 10.0.2.2. For a
// physical device, replace this with your computer's LAN IP address.
const localHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = `http://${localHost}:3000/api`;
