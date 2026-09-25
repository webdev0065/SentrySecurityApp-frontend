import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import type { GuardStackParamList } from '../../../navigation/types';
import { guardService, type GuardProfile } from '../../../services/guardService';

type Props = NativeStackScreenProps<GuardStackParamList, 'GuardSalary'>;

/** Burnt-orange accent shared across the guard feature. */
const ACCENT = '#B9640A';

// Frontend sample values until the backend exposes payroll endpoints.
const SAMPLE_OVERTIME = 1000;
const SAMPLE_DEDUCTIONS = 1400;
const SAMPLE_HISTORY: Array<{ monthOffset: number; amount: number }> = [
  { monthOffset: -1, amount: 26300 },
  { monthOffset: -2, amount: 26500 },
];

const formatINR = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const monthLabel = (date: Date, locale: string): string =>
  date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

const GuardSalaryScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<GuardProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      setProfile(await guardService.getProfile());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t('guard.salary.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const basic = toNumber(profile?.basic_salary);
  const allowances = toNumber(profile?.allowances);
  const overtime = SAMPLE_OVERTIME;
  const deductions = SAMPLE_DEDUCTIONS;
  const net = basic + overtime + allowances - deductions;

  const now = new Date();
  const currentMonth = monthLabel(now, i18n.language);
  const history = SAMPLE_HISTORY.map(entry => ({
    label: monthLabel(
      new Date(now.getFullYear(), now.getMonth() + entry.monthOffset, 1),
      i18n.language,
    ),
    amount: entry.amount,
  }));

  const downloadPayslip = () =>
    Alert.alert(
      t('guard.salary.downloadPayslip'),
      t('guard.salary.payslipSoon'),
    );
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <ScalePressable
          style={s.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('guardProfile.back')}
        >
          <Feather name="arrow-left" size={f(22)} color={colors.primary} />
        </ScalePressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {t('guard.salary.headerTitle')}
        </Text>
        <View style={s.iconButton} />
      </View>

      {loading ? (
        <View style={s.state}>
          <ActivityIndicator color={colors.primary} />
          <Text style={s.muted}>{t('guard.salary.loading')}</Text>
        </View>
      ) : null}
      {!loading && error ? (
        <View style={s.state}>
          <Text style={s.error}>{error}</Text>
          <ScalePressable
            style={s.retry}
            onPress={() => {
              setLoading(true);
              load();
            }}
            accessibilityRole="button"
          >
            <Text style={s.retryText}>{t('guard.salary.retry')}</Text>
          </ScalePressable>
        </View>
      ) : null}
      {!loading && !error ? (
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.hero}>
            <View style={s.heroTop}>
              <Text style={s.heroCaption}>
                {`${currentMonth} · ${t('guard.salary.totalSalary')}`}
              </Text>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeText}>{t('guard.salary.pending')}</Text>
              </View>
            </View>
            <Text style={s.heroAmount}>{formatINR(net)}</Text>
          </View>

          <View style={s.card}>
            <Row
              label={t('guard.salary.basicSalary')}
              value={formatINR(basic)}
            />
            <Row label={t('guard.salary.overtime')} value={formatINR(overtime)} />
            <Row
              label={t('guard.salary.allowances')}
              value={formatINR(allowances)}
            />
            <Row
              label={t('guard.salary.deductions')}
              value={`-${formatINR(deductions)}`}
              danger
            />
            <View style={s.divider} />
            <View style={s.row}>
              <Text style={s.netLabel}>{t('guard.salary.netSalary')}</Text>
              <Text style={s.netValue}>{formatINR(net)}</Text>
            </View>
            <ScalePressable
              style={s.downloadButton}
              onPress={downloadPayslip}
              accessibilityRole="button"
              accessibilityLabel={t('guard.salary.downloadPayslip')}
            >
              <Feather name="download" size={f(18)} color={colors.white} />
              <Text style={s.downloadText}>
                {t('guard.salary.downloadPayslip')}
              </Text>
            </ScalePressable>
          </View>
          <View style={s.card}>
            <View style={s.titleRow}>
              <View style={s.sectionMark} />
              <Text style={s.sectionTitle}>{t('guard.salary.history')}</Text>
            </View>
            {history.map((entry, index) => (
              <View
                key={entry.label}
                style={[s.historyRow, index > 0 && s.historyDivider]}
              >
                <Text style={s.historyMonth}>{entry.label}</Text>
                <Text style={s.historyAmount}>{formatINR(entry.amount)}</Text>
                <View style={s.verifiedBadge}>
                  <Text style={s.verifiedText}>
                    {t('guard.salary.verified')}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={s.card}>
            <View style={s.titleRow}>
              <View style={s.sectionMark} />
              <Text style={s.sectionTitle}>
                {t('guard.salary.advanceHistory')}
              </Text>
            </View>
            <Text style={s.muted}>{t('guard.salary.noAdvances')}</Text>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  danger?: boolean;
}> = ({ label, value, danger }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, danger && s.rowValueDanger]}>{value}</Text>
  </View>
);
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(12),
    paddingVertical: h(10),
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border,
  },
  iconButton: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  muted: {
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.sm),
    textAlign: 'center',
  },
  error: {
    color: colors.status.danger,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.sm),
    textAlign: 'center',
  },
  retry: {
    minHeight: h(44),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  retryText: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontWeight: typography.weights.bold,
    fontSize: f(typography.sizes.sm),
  },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.lg },
  hero: {
    backgroundColor: ACCENT,
    borderRadius: w(14),
    padding: spacing.lg,
    gap: spacing.sm,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  heroCaption: {
    flex: 1,
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  heroBadge: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.xs),
    fontWeight: typography.weights.bold,
    letterSpacing: f(0.8),
  },
  heroAmount: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.display),
    fontWeight: typography.weights.extraBold,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: w(14),
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: h(7),
  },
  rowLabel: {
    flex: 1,
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    fontWeight: typography.weights.medium,
  },
  rowValue: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  rowValueDanger: { color: colors.status.danger },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.light.border,
    marginTop: h(4),
    marginBottom: h(2),
  },
  netLabel: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  netValue: {
    color: colors.status.success,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  downloadButton: {
    minHeight: h(52),
    marginTop: spacing.md,
    backgroundColor: ACCENT,
    borderRadius: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  downloadText: {
    color: colors.white,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    fontWeight: typography.weights.bold,
  },
  titleRow: {
    minHeight: h(28),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionMark: {
    height: h(23),
    width: spacing.xs,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.sm),
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: f(1.4),
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: h(10),
  },
  historyDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.light.border,
  },
  historyMonth: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  historyAmount: {
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  verifiedBadge: {
    borderWidth: 1,
    borderColor: colors.status.success,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  verifiedText: {
    color: colors.status.success,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.xs),
    fontWeight: typography.weights.bold,
    letterSpacing: f(0.8),
  },
});

export default GuardSalaryScreen;