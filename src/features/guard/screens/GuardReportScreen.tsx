import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  type GuardReport,
} from '../../../services/guardService';
import type { GuardStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';

const severities: Array<{ key: GuardReport['severity']; label: string }> = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

const GuardReportScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<GuardStackParamList>>();
  const [guard, setGuard] = useState<GuardDutyDetails | null>(null);
  const [severity, setSeverity] = useState<GuardReport['severity']>('low');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    guardService
      .getDutyDetails()
      .then(setGuard)
      .catch(() => undefined);
  }, []);
  const submit = async () => {
    if (!notes.trim()) {
      Alert.alert(
        'Describe the incident',
        'Add the incident, location, and action taken before submitting.',
      );
      return;
    }
    try {
      setSubmitting(true);
      await guardService.submitReport({ severity, notes: notes.trim() });
      setNotes('');
      setSeverity('low');
      Alert.alert(
        'Report submitted',
        'Your agency has been notified about this incident.',
      );
    } catch (error) {
      Alert.alert(
        'Unable to submit report',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleTab = (tab: GuardTab) => {
    setProfileMenuOpen(false);
    if (tab === 'duty') navigation.navigate('GuardDuty');
    else if (tab !== 'report')
      Alert.alert(tab, 'This guard feature will be available soon.');
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <View style={styles.heading}>
            <View style={styles.sectionMark} />
            <Text style={styles.headingText}>FILE INCIDENT REPORT</Text>
          </View>
          <Text style={styles.label}>Severity</Text>
          <View style={styles.severityRow}>
            {severities.map(option => (
              <ScalePressable
                key={option.key}
                style={[
                  styles.severityOption,
                  severity === option.key && styles.severityActive,
                ]}
                onPress={() => setSeverity(option.key)}
                accessibilityRole="radio"
                accessibilityState={{ selected: severity === option.key }}
              >
                <Text
                  style={[
                    styles.severityText,
                    severity === option.key && styles.severityTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </ScalePressable>
            ))}
          </View>
          <Text style={styles.label}>What happened</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            style={styles.notes}
            placeholder="Describe the incident, location, and action taken…"
            placeholderTextColor={colors.textGray}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Incident details"
          />
          <ScalePressable
            style={styles.attach}
            onPress={() =>
              Alert.alert(
                'Photo attachment',
                'Photo attachment will be enabled when the app camera or gallery picker is connected.',
              )
            }
            accessibilityLabel="Attach photo"
          >
            <Feather
              name="camera"
              size={scaleFont(22)}
              color={colors.textGray}
            />
            <Text style={styles.attachText}>Attach photo</Text>
          </ScalePressable>
          <ScalePressable
            style={styles.submit}
            onPress={submit}
            disabled={submitting || !notes.trim()}
            accessibilityLabel="Submit report"
          >
            <Text style={styles.submitText}>
              {submitting ? 'Submitting…' : 'Submit Report'}
            </Text>
          </ScalePressable>
        </View>
      </ScrollView>
      <GuardBottomNavigation activeTab="report" onTabPress={handleTab} />
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
            Alert.alert(
              'Profile',
              'Your guard profile will be available soon.',
            );
          }}
          onLogout={() => setProfileMenuOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.light.background,
    position: 'relative',
  },
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.xs,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionMark: {
    width: 3,
    height: scaleHeight(18),
    backgroundColor: colors.gold,
    marginRight: spacing.sm,
    borderRadius: 2,
  },
  headingText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.bold,
    letterSpacing: scaleFont(1),
  },
  label: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.medium,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  severityOption: {
    flex: 1,
    paddingVertical: scaleHeight(10),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.xs,
    backgroundColor: colors.white,
  },
  severityActive: {
    borderColor: colors.gold,
    backgroundColor: '#FFF8E7',
  },
  severityText: {
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.medium,
  },
  severityTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  notes: {
    minHeight: scaleHeight(130),
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.xs,
    backgroundColor: colors.white,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.md + 4),
  },
  attach: {
    paddingVertical: scaleHeight(11),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.xs,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  attachText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.semiBold,
  },
  submit: {
    paddingVertical: scaleHeight(13),
    borderRadius: spacing.xs,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});

export default GuardReportScreen;
