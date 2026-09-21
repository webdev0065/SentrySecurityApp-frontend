import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import GuardTopNavigation from '../components/GuardTopNavigation';
import GuardBottomNavigation, {
  type GuardTab,
} from '../components/GuardBottomNavigation';
import {
  guardService,
  type GuardDutyDetails,
} from '../../../services/guardService';
import AgencyProfileMenu from '../../dashboard/components/AgencyProfileMenu';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { GuardStackParamList } from '../../../navigation/types';

const formatTime = (time?: string | null) => {
  if (!time) return 'Schedule not set';
  const [hour = '0', minute = '00'] = time.split(':');
  const number = Number(hour);
  const suffix = number >= 12 ? 'PM' : 'AM';
  return `${String(number % 12 || 12).padStart(2, '0')}:${minute} ${suffix}`;
};

const GuardDutyScreen = () => {
  const [guard, setGuard] = useState<GuardDutyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<GuardTab>('duty');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardStackParamList>>();

  const load = useCallback(async () => {
    try {
      setError('');
      setGuard(await guardService.getDutyDetails());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load your duty details.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const isOnDuty = guard?.status === 'on_duty';
  const assignmentText = useMemo(() => {
    if (!guard?.site_name) return 'No active site assigned';
    return `${formatTime(guard.start_time)} – ${formatTime(guard.end_time)}`;
  }, [guard]);

  const toggleDuty = async () => {
    if (!guard || saving) return;
    try {
      setSaving(true);
      setGuard(
        await guardService.updateDutyStatus(isOnDuty ? 'off_duty' : 'on_duty'),
      );
    } catch (updateError) {
      Alert.alert(
        'Unable to update duty',
        updateError instanceof Error
          ? updateError.message
          : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };
  const showUnavailable = (label: string) =>
    Alert.alert(label, 'This guard feature will be available soon.');
  const handleTab = (tab: GuardTab) => {
    setActiveTab(tab);
    if (tab === 'report') {
      navigation.navigate('GuardReport');
      return;
    }
    if (tab === 'patrol') {
      navigation.navigate('GuardPatrol');
      return;
    }
    if (tab !== 'duty')
      showUnavailable(tab.charAt(0).toUpperCase() + tab.slice(1));
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <GuardTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
        avatarInitials={(guard?.full_name || 'G')
          .trim()
          .charAt(0)
          .toUpperCase()}
      />
      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.muted}>Loading duty dashboard…</Text>
        </View>
      ) : null}
      {!loading && error ? (
        <View style={styles.state}>
          <Text style={styles.error}>{error}</Text>
          <ScalePressable
            style={styles.retry}
            onPress={() => {
              setLoading(true);
              load();
            }}
          >
            <Text style={styles.retryText}>Try again</Text>
          </ScalePressable>
        </View>
      ) : null}
      {!loading && !error && guard ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
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
          <ScalePressable
            style={[styles.dutyCard, isOnDuty && styles.dutyCardActive]}
            onPress={toggleDuty}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={isOnDuty ? 'Clock out' : 'Clock in'}
          >
            <View
              style={[styles.dutyCircle, isOnDuty && styles.dutyCircleActive]}
            >
              <Feather
                name={isOnDuty ? 'sun' : 'moon'}
                size={scaleFont(34)}
                color={colors.primary}
              />
              <Text style={styles.dutyLabel}>
                {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
              </Text>
            </View>
            <Text style={styles.dutyAction}>
              {saving
                ? 'Updating…'
                : isOnDuty
                ? 'Tap to clock out'
                : 'Tap to clock in'}
            </Text>
            <Text style={styles.dutyHint}>
              {isOnDuty
                ? 'Your duty status is active'
                : 'Your agency will see you as available'}
            </Text>
          </ScalePressable>

          <Card
            title="CURRENT ASSIGNMENT"
            action={() => showUnavailable('Assignment details')}
          >
            <View style={styles.assignmentRow}>
              <IconBox icon="map-pin" />
              <View style={styles.flex}>
                <Text style={styles.assignmentName}>
                  {guard.site_name || 'No site assigned'}
                </Text>
                <Text style={styles.muted}>
                  {guard.site_address || assignmentText}
                </Text>
              </View>
              {guard.site_name ? (
                <Badge label={isOnDuty ? 'ACTIVE' : 'ASSIGNED'} />
              ) : null}
            </View>
            {guard.site_name && guard.site_address ? (
              <Text style={[styles.muted, styles.schedule]}>
                {assignmentText}
              </Text>
            ) : null}
          </Card>

          <Card title="RADIO CONTACT">
            <View style={styles.assignmentRow}>
              <IconBox icon="radio" />
              <View style={styles.flex}>
                <Text style={styles.assignmentName}>Control room support</Text>
                <Text style={styles.muted}>Channel 1 · 24×7 Support</Text>
              </View>
              <ScalePressable
                style={styles.call}
                onPress={() => showUnavailable('Call control room')}
                accessibilityLabel="Call control room"
              >
                <Feather
                  name="phone"
                  size={scaleFont(22)}
                  color={colors.primary}
                />
              </ScalePressable>
            </View>
          </Card>
          <Card
            title="TODAY’S PHOTO LOG"
            action={() => showUnavailable('Photo log')}
          >
            <View style={styles.assignmentRow}>
              <IconBox icon="image" />
              <Text style={[styles.muted, styles.flex]}>
                No clock-ins captured yet today.
              </Text>
            </View>
          </Card>
        </ScrollView>
      ) : null}
      <GuardBottomNavigation
        activeTab={activeTab}
        onTabPress={tab => {
          setProfileMenuOpen(false);
          handleTab(tab);
        }}
      />
      {profileMenuOpen ? (
        <ScalePressable
          style={styles.backdrop}
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
            handleTab('profile');
          }}
          onLogout={() => setProfileMenuOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
};

const IconBox = ({
  icon,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
}) => (
  <View style={styles.iconBox}>
    <Feather name={icon} size={scaleFont(24)} color={colors.gold} />
  </View>
);
const Badge = ({ label }: { label: string }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{label}</Text>
  </View>
);
const Card = ({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: () => void;
}) => (
  <View style={styles.card}>
    <View style={styles.cardTitleRow}>
      <View style={styles.sectionMark} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <ScalePressable
          onPress={action}
          style={styles.chevron}
          accessibilityLabel={`${title} details`}
        >
          <Feather
            name="chevron-right"
            size={scaleFont(23)}
            color={colors.primary}
          />
        </ScalePressable>
      ) : null}
    </View>
    {children}
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light.background },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  muted: {
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.regular,
    color: colors.textGray,
  },
  error: {
    color: colors.status.danger,
    fontFamily: typography.fontFamily,
    textAlign: 'center',
  },
  retry: {
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
  },
  retryText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semiBold,
  },
  dutyCard: {
    minHeight: scaleHeight(250),
    borderRadius: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dutyCardActive: { backgroundColor: colors.white, borderColor: colors.gold },
  dutyCircle: {
    width: scaleWidth(142),
    height: scaleWidth(142),
    borderRadius: scaleWidth(71),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: scaleWidth(3),
    borderColor: colors.border,
  },
  dutyCircleActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  dutyLabel: {
    marginTop: spacing.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: scaleFont(typography.sizes.sm),
    letterSpacing: scaleFont(1.5),
  },
  dutyAction: {
    marginTop: spacing.md,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: scaleFont(typography.sizes.lg),
  },
  dutyHint: {
    marginTop: spacing.xs,
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
  },
  card: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cardTitleRow: {
    minHeight: scaleHeight(28),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionMark: {
    height: scaleHeight(23),
    width: spacing.xs,
    backgroundColor: colors.gold,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: scaleFont(1.8),
  },
  chevron: { padding: spacing.xs },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: { flex: 1 },
  iconBox: {
    height: spacing.xxxl,
    width: spacing.xxxl,
    borderRadius: spacing.sm,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentName: {
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    backgroundColor: colors.light.background,
  },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.semiBold,
    fontSize: scaleFont(typography.sizes.xs),
    color: colors.status.success,
    letterSpacing: scaleFont(0.8),
  },
  schedule: { marginTop: spacing.sm, marginLeft: scaleWidth(58) },
  call: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.sm,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default GuardDutyScreen;
