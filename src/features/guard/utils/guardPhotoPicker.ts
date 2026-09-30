import { PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';

import type { DutyPhoto } from '../../../services/guardService';

/**
 * Outcome of a camera capture or gallery pick. The UI renders one explicit
 * state per outcome, so failures never rely on an `Alert` loop.
 */
export type GuardPhotoPickResult =
  | { status: 'success'; photos: DutyPhoto[] }
  | { status: 'cancelled' }
  | { status: 'permission' }
  | { status: 'unavailable' }
  | { status: 'error'; message: string };

type CameraPermissionTexts = {
  title: string;
  message: string;
  buttonPositive: string;
  buttonNegative: string;
};

/** Evidence photos are downscaled before upload to keep reports light. */
const EVIDENCE_QUALITY = {
  quality: 0.8,
  maxWidth: 1600,
  maxHeight: 1600,
} as const;

const toPhotos = (assets: ImagePickerResponse['assets']): DutyPhoto[] =>
  (assets ?? []).reduce<DutyPhoto[]>((photos, asset) => {
    if (!asset?.uri) return photos;
    photos.push({
      uri: asset.uri,
      fileName: asset.fileName,
      type: asset.type,
    });
    return photos;
  }, []);

const toResult = (
  response: ImagePickerResponse,
  fallbackMessage: string,
): GuardPhotoPickResult => {
  if (response.didCancel) return { status: 'cancelled' };

  if (response.errorCode) {
    const message = (response.errorMessage ?? '').toLowerCase();
    if (response.errorCode === 'camera_unavailable') {
      return { status: 'unavailable' };
    }
    if (response.errorCode === 'permission' || message.includes('permission')) {
      return { status: 'permission' };
    }
    return {
      status: 'error',
      message: response.errorMessage || fallbackMessage,
    };
  }

  const photos = toPhotos(response.assets);
  if (!photos.length) return { status: 'error', message: fallbackMessage };
  return { status: 'success', photos };
};

/** A stale build without the native module throws a `TypeError` on launch. */
const toThrownResult = (
  caught: unknown,
  fallbackMessage: string,
): GuardPhotoPickResult => {
  const message = caught instanceof Error ? caught.message : '';
  if (caught instanceof TypeError || /undefined|null/.test(message)) {
    return { status: 'unavailable' };
  }
  return { status: 'error', message: message || fallbackMessage };
};

/**
 * Opens the device camera for an incident evidence photo. Android never prompts
 * for CAMERA itself, so the runtime permission is requested first.
 */
export const captureGuardEvidencePhoto = async (
  permission: CameraPermissionTexts,
  fallbackMessage: string,
): Promise<GuardPhotoPickResult> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        permission,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return { status: 'permission' };
      }
    }

    const response = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      saveToPhotos: false,
      ...EVIDENCE_QUALITY,
    });
    return toResult(response, fallbackMessage);
  } catch (caught) {
    return toThrownResult(caught, fallbackMessage);
  }
};

/**
 * Opens the system photo picker (`selectionLimit` photos in one pass). Android
 * uses the Photo Picker and iOS uses PHPicker, so no storage permission is
 * required on either platform.
 */
export const pickGuardEvidencePhotos = async (
  selectionLimit: number,
  fallbackMessage: string,
): Promise<GuardPhotoPickResult> => {
  try {
    const response = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: Math.max(1, selectionLimit),
      ...EVIDENCE_QUALITY,
    });
    return toResult(response, fallbackMessage);
  } catch (caught) {
    return toThrownResult(caught, fallbackMessage);
  }
};
