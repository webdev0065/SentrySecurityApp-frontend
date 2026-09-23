import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
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
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';

const severities: Array<{ key: GuardReport['severity']; labelKey: string }> = [
  { key: 'low', labelKey: 'guard.report.severityLow' },
  { key: 'medium', labelKey: 'guard.report.severityMedium' },
  { key: 'high', labelKey: 'guard.report.severityHigh' },
];

const GuardReportScreen = () => {
  const { t } = useTranslation();
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
        t('guard.report.describeTitle'),
        t('guard.report.describeBody'),
      );
      return;
    }
    try {
      setSubmitting(true);
      await guardService.submitReport({ severity, notes: notes.trim() });
      setNotes('');
      setSeverity('low');
      Alert.alert(
        t('guard.report.submittedTitle'),
        t('guard.report.submittedBody'),
      );
    } catch (error) {
      Alert.alert(
        t('guard.report.submitFailed'),
        error instanceof Error ? error.message : t('guard.common.tryAgain'),
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleTab = (tab: GuardTab) => {
    setProfileMenuOpen(false);
    if (tab === 'duty') navigation.navigate('GuardDuty');
    else if (tab === 'patrol') navigation.navigate('GuardPatrol');
    else if (tab === 'profile') navigation.navigate('GuardProfile');
    else if (tab !== 'report') {
      Alert.alert(t('guard.tabs.schedule'), t('guard.common.featureSoon'));
    }
  };
  const submitDisabled = submitting || !notes.trim();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <GuardTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
        avatarInitials={(guard?.full_name || 'G')
          .trim()
          .charAt(0)
          .toUpperCase()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.sectionMark} />
              <Text style={styles.sectionTitle}>
                {t('guard.report.reportDetails')}
              </Text>
            </View>

            <Text style={styles.label}>{t('guard.report.severity')}</Text>
            <View style={styles.severityRow}>
              {severities.map(option => {
                const active = severity === option.key;
                return (
                  <ScalePressable
                    key={option.key}
                    style={[
                      styles.severityOption,
                      active && styles.severityActive,
                    ]}
                    onPress={() => setSeverity(option.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        active && styles.severityTextActive,
                      ]}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </ScalePressable>
                );
              })}
            </View>

            <Text style={styles.label}>{t('guard.report.whatHappened')}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={styles.notes}
              placeholder={t('guard.report.notesPlaceholder')}
              placeholderTextColor={colors.textGray}
              multiline
              textAlignVertical="top"
              accessibilityLabel={t('guard.report.incidentDetails')}
            />

            <Text style={styles.label}>{t('guard.report.attachments')}</Text>
            <ScalePressable
              style={styles.attach}
              onPress={() =>
                Alert.alert(
                  t('guard.report.photoTitle'),
                  t('guard.report.photoBody'),
                )
              }
              accessibilityLabel={t('guard.report.attachPhoto')}
            >
              <Feather
                name="camera"
                size={scaleFont(22)}
                color={colors.textGray}
              />
              <Text style={styles.attachText}>
                {t('guard.report.attachPhoto')}
              </Text>
            </ScalePressable>
          </View>

          <ScalePressable
            style={[styles.submit, submitDisabled && styles.submitDisabled]}
            onPress={submit}
            disabled={submitDisabled}
            accessibilityLabel={t('guard.report.submitReport')}
          >
            <Text style={styles.submitText}>
              {submitting
                ? t('guard.report.submitting')
                : t('guard.report.submitReport')}
            </Text>
          </ScalePressable>
        </ScrollView>
      </KeyboardAvoidingView>
      <GuardBottomNavigation activeTab="report" onTabPress={handleTab} />
      {profileMenuOpen ? (
        <ScalePressable
          style={styles.backdrop}
          onPress={() => setProfileMenuOpen(false)}
          accessibilityLabel={t('guard.common.closeProfileMenu')}
        >
          <View />
        </ScalePressable>
      ) : null}
      {profileMenuOpen ? (
        <AgencyProfileMenu
          identity={{
            name: guard?.full_name || t('guard.common.guardFallback'),
            company: guard?.guard_code
              ? t('guard.common.badgeId', { id: guard.guard_code })
              : '',
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
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.light.background,
    position: 'relative',
  },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: scaleWidth(14),
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionMark: {
    width: spacing.xs,
    height: scaleHeight(20),
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.bold,
    letterSpacing: scaleFont(1.6),
  },
  label: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.semiBold,
  },
  severityRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  severityOption: {
    flex: 1,
    minHeight: scaleHeight(46),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scaleWidth(10),
    backgroundColor: colors.white,
  },
  severityActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  severityText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.medium,
  },
  severityTextActive: {
    color: colors.white,
    fontWeight: typography.weights.semiBold,
  },
  notes: {
    minHeight: scaleHeight(140),
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scaleWidth(10),
    backgroundColor: colors.white,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.md + 4),
  },
  attach: {
    minHeight: scaleHeight(48),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: scaleWidth(10),
    backgroundColor: colors.light.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  attachText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.semiBold,
  },
  submit: {
    minHeight: scaleHeight(48),
    borderRadius: scaleWidth(10),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
    letterSpacing: scaleFont(0.4),
  },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});

export default GuardReportScreen;
