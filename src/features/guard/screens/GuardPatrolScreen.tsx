import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

import ScalePressable from '../../../components/common/ScalePressable';
import AgencyProfileMenu from '../../dashboard/components/AgencyProfileMenu';
import GuardTopNavigation from '../components/GuardTopNavigation';
import GuardBottomNavigation, {
  type GuardTab,
} from '../components/GuardBottomNavigation';
import {
  guardService,
  type GuardDutyDetails,
  type PatrolCheckpoint,
  type PatrolRoundState,
} from '../../../services/guardService';
import type { GuardStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';

const formatTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

export default function GuardPatrolScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardStackParamList>>();
  const [guard, setGuard] = useState<GuardDutyDetails | null>(null);
  const [round, setRound] = useState<PatrolRoundState | null>(null);
  const [checkpoints, setCheckpoints] = useState<PatrolCheckpoint[]>([]);
  const [siteName, setSiteName] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [completed, setCompleted] = useState(false);

  const load = useCallback(async () => {
    try {
      setError('');
      const [details, active, checkpointData] = await Promise.all([
        guardService.getDutyDetails(),
        guardService.getActivePatrolRound(),
        guardService.getPatrolCheckpoints(),
      ]);
      setGuard(details);
      setRound(active);
      setCheckpoints(
        active?.checkpoints ??
          checkpointData.checkpoints.map(point => ({
            ...point,
            scanned: false,
          })),
      );
      setSiteName(
        active
          ? details.site_name || checkpointData.site_name
          : checkpointData.site_name,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load patrol details.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const progress = round?.progress ?? {
    scanned: 0,
    total: checkpoints.length,
    percent: 0,
  };
  const nextCheckpoint =
    round?.next_checkpoint ?? checkpoints.find(point => !point.scanned) ?? null;
  const recentScans = useMemo(
    () =>
      checkpoints
        .filter(point => point.scanned)
        .slice(-4)
        .reverse(),
    [checkpoints],
  );

  const startOrScan = async () => {
    if (working) return;
    try {
      setWorking(true);
      if (!round) {
        const started = await guardService.startPatrolRound();
        const newCheckpoints = started.checkpoints.map(point => ({
          ...point,
          scanned: false,
        }));
        setCheckpoints(newCheckpoints);
        setRound({
          round: { id: started.id, status: 'in_progress' },
          progress: { scanned: 0, total: newCheckpoints.length, percent: 0 },
          next_checkpoint: newCheckpoints[0] ?? null,
          checkpoints: newCheckpoints,
        });
        return;
      }
      if (!nextCheckpoint) return;
      const result = await guardService.scanPatrolCheckpoint(nextCheckpoint.id);
      const updated = checkpoints.map(point =>
        point.id === nextCheckpoint.id
          ? { ...point, scanned: true, scanned_at: new Date().toISOString() }
          : point,
      );
      const next = updated.find(point => !point.scanned) ?? null;
      setCheckpoints(updated);
      setRound(current =>
        current
          ? {
              ...current,
              progress: result.progress,
              next_checkpoint: next,
              checkpoints: updated,
            }
          : current,
      );
      if (result.round_completed) {
        setCompleted(true);
        setRound(null);
        Alert.alert(
          'Patrol completed',
          'All checkpoints have been recorded successfully.',
        );
      }
    } catch (scanError) {
      Alert.alert(
        'Unable to update patrol',
        scanError instanceof Error ? scanError.message : 'Please try again.',
      );
    } finally {
      setWorking(false);
    }
  };
  const handleTab = (tab: GuardTab) => {
    setProfileMenuOpen(false);
    if (tab === 'duty') navigation.navigate('GuardDuty');
    else if (tab === 'report') navigation.navigate('GuardReport');
    else if (tab === 'profile') navigation.navigate('GuardProfile');
    else if (tab !== 'patrol')
      Alert.alert(tab, 'This guard feature will be available soon.');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <GuardTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
        avatarInitials={(guard?.full_name || 'G')
          .trim()
          .charAt(0)
          .toUpperCase()}
      />
      {loading ? (
        <View style={s.state}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.muted}>Loading patrol…</Text>
        </View>
      ) : error ? (
        <View style={s.state}>
          <Text style={s.error}>{error}</Text>
          <ScalePressable
            style={s.retry}
            onPress={() => {
              setLoading(true);
              load();
            }}
          >
            <Text style={s.retryText}>Try again</Text>
          </ScalePressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={s.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                setLoading(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
        >
          {completed ? (
            <View style={s.success}>
              <Feather
                name="check-circle"
                size={scaleFont(30)}
                color={colors.status.success}
              />
              <View>
                <Text style={s.successTitle}>Patrol completed</Text>
                <Text style={s.muted}>
                  All checkpoints were recorded successfully.
                </Text>
              </View>
            </View>
          ) : null}
          <ScalePressable
            style={s.scanButton}
            onPress={startOrScan}
            disabled={working || !checkpoints.length}
            accessibilityLabel={round ? 'Scan next checkpoint' : 'Start patrol'}
          >
            <Feather
              name="maximize"
              size={scaleFont(27)}
              color={colors.primary}
            />
            <View style={s.scanCopy}>
              <Text style={s.scanTitle}>
                {working
                  ? 'Updating patrol…'
                  : round
                  ? 'Scan Checkpoint'
                  : 'Start Patrol'}
              </Text>
              <Text style={s.scanHint}>
                {round
                  ? 'Record the next patrol checkpoint'
                  : checkpoints.length
                  ? 'Begin your assigned checkpoint route'
                  : 'No checkpoints assigned'}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={scaleFont(23)}
              color={colors.primary}
            />
          </ScalePressable>
          <Section title="PATROL PROGRESS">
            <View style={s.progressRow}>
              <Text style={s.progressText}>
                {progress.scanned}/{progress.total} completed
              </Text>
              <Text
                style={[
                  s.percent,
                  progress.percent === 100 && s.percentComplete,
                ]}
              >
                {progress.percent}%
              </Text>
            </View>
            <View style={s.track}>
              <View
                style={[
                  s.fill,
                  progress.percent === 100 && s.fillComplete,
                  { width: `${progress.percent}%` },
                ]}
              />
            </View>
          </Section>
          {nextCheckpoint ? (
            <Section title="NEXT CHECKPOINT">
              <View style={s.locationRow}>
                <View style={s.locationIcon}>
                  <Feather
                    name="map-pin"
                    size={scaleFont(24)}
                    color={colors.gold}
                  />
                </View>
                <View style={s.flex}>
                  <Text style={s.checkpointName}>{nextCheckpoint.name}</Text>
                  <Text style={s.muted}>Next checkpoint in your route</Text>
                </View>
              </View>
            </Section>
          ) : null}
          <Section title="RECENT SCANS">
            {recentScans.length ? (
              recentScans.map(point => (
                <View key={point.id} style={s.scanRow}>
                  <Feather
                    name="check-circle"
                    size={scaleFont(20)}
                    color={colors.status.success}
                  />
                  <Text style={s.scanName}>{point.name}</Text>
                  <Text style={s.scanTime}>{formatTime(point.scanned_at)}</Text>
                </View>
              ))
            ) : (
              <Text style={s.muted}>No checkpoints scanned yet today.</Text>
            )}
          </Section>
          <Section title={`CHECKPOINT LIST${siteName ? ` — ${siteName}` : ''}`}>
            <Text style={s.muted}>{checkpoints.length} checkpoints</Text>
            {checkpoints.map((point, index) => (
              <View key={point.id} style={s.checkpointRow}>
                <View style={s.sequence}>
                  <Text style={s.sequenceText}>{index + 1}</Text>
                </View>
                <Text style={s.checkpointName}>{point.name}</Text>
                <Feather
                  name={point.scanned ? 'check-circle' : 'circle'}
                  size={scaleFont(22)}
                  color={point.scanned ? colors.status.success : colors.border}
                />
              </View>
            ))}
          </Section>
        </ScrollView>
      )}
      <GuardBottomNavigation activeTab="patrol" onTabPress={handleTab} />
      {profileMenuOpen ? (
        <ScalePressable
          style={s.backdrop}
          onPress={() => setProfileMenuOpen(false)}
          accessibilityLabel="Close profile menu"
        >
          <View />
        </ScalePressable>
      ) : null}
      {profileMenuOpen ? (
        <AgencyProfileMenu
          identity={{
            name: guard?.full_name || 'Guard',
            company: guard?.guard_code ? `Badge ID ${guard.guard_code}` : '',
            initials: (guard?.full_name || 'G').trim().charAt(0).toUpperCase(),
          }}
          onMyProfile={() => {
            setProfileMenuOpen(false);
            navigation.navigate('GuardProfile');
          }}
          onLogout={() => setProfileMenuOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={s.section}>
    <View style={s.sectionHeader}>
      <View style={s.sectionMark} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  muted: {
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
  },
  error: {
    color: colors.status.danger,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    textAlign: 'center',
  },
  retry: {
    minHeight: scaleHeight(48),
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  retryText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semiBold,
  },
  scanButton: {
    minHeight: scaleHeight(76),
    borderRadius: spacing.md,
    padding: spacing.md,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gold,
  },
  scanCopy: { flex: 1, gap: spacing.xs },
  scanTitle: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  scanHint: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
  },
  section: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: scaleWidth(14),
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionMark: {
    width: spacing.xs,
    height: scaleHeight(22),
    borderRadius: 2,
    backgroundColor: colors.gold,
  },
  sectionTitle: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.bold,
    letterSpacing: scaleFont(1.4),
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  percent: {
    color: colors.gold,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.bold,
  },
  percentComplete: { color: colors.status.success },
  track: {
    height: scaleHeight(10),
    borderRadius: spacing.sm,
    backgroundColor: colors.light.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: spacing.sm,
    backgroundColor: colors.gold,
  },
  fillComplete: { backgroundColor: colors.status.success },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  locationIcon: {
    height: spacing.xxxl,
    width: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.light.background,
  },
  flex: { flex: 1 },
  checkpointName: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  scanRow: {
    minHeight: scaleHeight(38),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border,
  },
  scanName: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
  },
  scanTime: {
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
  },
  checkpointRow: {
    minHeight: scaleHeight(42),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border,
  },
  sequence: {
    width: scaleHeight(27),
    height: scaleHeight(27),
    borderRadius: scaleHeight(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.border,
  },
  sequenceText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.xs),
    fontWeight: typography.weights.semiBold,
  },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.md,
    backgroundColor: '#E2F5E9',
  },
  successTitle: {
    color: colors.status.success,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});
