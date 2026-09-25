import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { launchCamera } from 'react-native-image-picker';

import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { scaleFont } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import type { DutyPhoto, DutyPhotoMode } from '../../../services/guardService';

type Props = {
  mode: DutyPhotoMode;
  /** True while the captured photo is being uploaded. */
  busy: boolean;
  onConfirm: (photo: DutyPhoto) => void;
};

/** `permission` = denied/blocked, `unavailable` = no camera or stale build. */
type BlockedState = 'permission' | 'unavailable' | null;

const formatClock = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

const GuardSelfieCapture = ({ mode, busy, onConfirm }: Props) => {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<DutyPhoto | null>(null);
  const [launching, setLaunching] = useState(false);
  const [blocked, setBlocked] = useState<BlockedState>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Returning from Settings / the system camera: clear a stale permission block.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active' || blocked !== 'permission') return;
      if (Platform.OS !== 'android') return;
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA)
        .then(granted => {
          if (granted) setBlocked(null);
        })
        .catch(() => undefined);
    });
    return () => subscription.remove();
  }, [blocked]);

  const openCamera = useCallback(async () => {
    if (busy || launching) return;

    try {
      setError('');

      // Android never prompts for CAMERA itself, so request it first.
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('guard.duty.cameraPermissionTitle'),
            message: t('guard.duty.cameraPermissionBody'),
            buttonPositive: t('guard.duty.grantCamera'),
            buttonNegative: t('guard.common.close'),
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          setBlocked('permission');
          return;
        }
      }

      setLaunching(true);
      const response = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 1600,
        saveToPhotos: false,
      });

      if (response.didCancel) return;

      if (response.errorCode) {
        const message = (response.errorMessage || '').toLowerCase();
        if (response.errorCode === 'camera_unavailable') {
          setBlocked('unavailable');
        } else if (
          response.errorCode === 'permission' ||
          message.includes('permission')
        ) {
          setBlocked('permission');
        } else {
          setError(response.errorMessage || t('guard.duty.captureFailed'));
        }
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) {
        setError(t('guard.duty.captureFailed'));
        return;
      }

      setPhoto({ uri: asset.uri, fileName: asset.fileName, type: asset.type });
    } catch (caught) {
      // A missing native module (stale build) throws a TypeError here.
      const message = caught instanceof Error ? caught.message : '';
      if (caught instanceof TypeError || /undefined|null/.test(message)) {
        setBlocked('unavailable');
      } else {
        setError(message || t('guard.duty.captureFailed'));
      }
    } finally {
      setLaunching(false);
    }
  }, [busy, launching, t]);

  const resetBlocked = () => {
    setBlocked(null);
    setError('');
  };

  if (blocked) {
    return (
      <View style={styles.state}>
        <View style={styles.stateIcon}>
          <Feather name="camera-off" size={scaleFont(30)} color={colors.gold} />
        </View>
        <Text style={styles.stateTitle}>
          {blocked === 'permission'
            ? t('guard.duty.cameraPermissionTitle')
            : t('guard.duty.cameraUnavailable')}
        </Text>
        <Text style={styles.stateBody}>
          {blocked === 'permission'
            ? t('guard.duty.cameraPermissionBody')
            : t('guard.duty.cameraUnavailableHint')}
        </Text>
        <View style={styles.stateActions}>
          {blocked === 'permission' ? (
            <ScalePressable
              style={styles.primaryButton}
              onPress={() => Linking.openSettings()}
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                {t('guard.duty.openSettings')}
              </Text>
            </ScalePressable>
          ) : null}
          <ScalePressable
            style={
              blocked === 'permission'
                ? styles.secondaryButton
                : styles.primaryButton
            }
            onPress={resetBlocked}
            accessibilityRole="button"
          >
            <Text
              style={
                blocked === 'permission'
                  ? styles.secondaryButtonText
                  : styles.primaryButtonText
              }
            >
              {t('guard.duty.tryAgain')}
            </Text>
          </ScalePressable>
        </View>
      </View>
    );
  }

  if (photo) {
    return (
      <View style={styles.preview}>
        <Image
          source={{ uri: photo.uri }}
          style={styles.previewImage}
          resizeMode="cover"
        />
        <View style={styles.previewBar}>
          <Text style={styles.previewTime}>{formatClock(new Date(now))}</Text>
          <Text style={styles.previewHint}>
            {t('guard.duty.confirmPhotoHint')}
          </Text>
          <View style={styles.previewActions}>
            <ScalePressable
              style={styles.secondaryButton}
              onPress={() => setPhoto(null)}
              disabled={busy}
              accessibilityRole="button"
            >
              <Feather
                name="rotate-ccw"
                size={scaleFont(18)}
                color={colors.white}
              />
              <Text style={styles.secondaryButtonText}>
                {t('guard.duty.retake')}
              </Text>
            </ScalePressable>
            <ScalePressable
              style={styles.primaryButton}
              onPress={() => onConfirm(photo)}
              disabled={busy}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {t('guard.duty.usePhoto')}
                </Text>
              )}
            </ScalePressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.camera}>
      <View style={styles.heroIcon}>
        <Feather name="camera" size={scaleFont(40)} color={colors.gold} />
      </View>
      <Text style={styles.heroTime}>{formatClock(new Date(now))}</Text>
      <Text style={styles.heroHint}>
        {mode === 'clock_in'
          ? t('guard.duty.captureClockInHint')
          : t('guard.duty.captureClockOutHint')}
      </Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.shutterArea}>
        <ScalePressable
          style={styles.shutter}
          onPress={openCamera}
          disabled={launching || busy}
          pressedScale={0.94}
          accessibilityRole="button"
          accessibilityLabel={t('guard.duty.takePhoto')}
        >
          {launching ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </ScalePressable>
        <Text style={styles.shutterLabel}>
          {launching
            ? t('guard.duty.openingCamera')
            : t('guard.duty.takePhoto')}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  heroIcon: {
    height: 92,
    width: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    marginBottom: spacing.lg,
  },
  heroTime: {
    color: colors.gold,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: scaleFont(typography.sizes.xl),
    letterSpacing: scaleFont(0.6),
  },
  heroHint: {
    marginTop: spacing.sm,
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.sm) * 1.5,
    textAlign: 'center',
    maxWidth: 320,
  },
  errorText: {
    marginTop: spacing.md,
    color: '#FCA5A5',
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.xs),
    textAlign: 'center',
  },
  shutterArea: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(11, 31, 58, 0.72)',
  },
  shutter: {
    height: 76,
    width: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.gold,
  },
  shutterInner: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
  },
  shutterLabel: {
    marginTop: spacing.sm,
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semiBold,
    fontSize: scaleFont(typography.sizes.sm),
    letterSpacing: scaleFont(1),
  },
  preview: { flex: 1, backgroundColor: colors.primary },
  previewImage: { flex: 1 },
  previewBar: { padding: spacing.lg, backgroundColor: colors.primary },
  previewTime: {
    color: colors.gold,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: scaleFont(typography.sizes.lg),
  },
  previewHint: {
    marginTop: spacing.xs,
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
  },
  previewActions: {
    marginTop: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  primaryButtonText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: scaleFont(typography.sizes.sm),
    letterSpacing: scaleFont(0.8),
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semiBold,
    fontSize: scaleFont(typography.sizes.sm),
  },
  state: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  stateIcon: {
    height: 68,
    width: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
    marginBottom: spacing.md,
  },
  stateTitle: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: scaleFont(typography.sizes.md),
    textAlign: 'center',
  },
  stateBody: {
    marginTop: spacing.sm,
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.sm) * 1.5,
    textAlign: 'center',
  },
  stateActions: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.md,
    alignSelf: 'stretch',
  },
});

export default GuardSelfieCapture;
