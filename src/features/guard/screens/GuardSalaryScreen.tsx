import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
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
import { ApiError } from '../../../services/apiClient';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import type { GuardStackParamList } from '../../../navigation/types';
import {
  guardService,
  type GuardProfile,
  type GuardSalarySummary,
} from '../../../services/guardService';

type Props = NativeStackScreenProps<GuardStackParamList, 'GuardSalary'>;
type MonthOffset = number;

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatINR = (value: number | string | null | undefined): string => {
  const amount = toNumber(value);
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const isoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

/** The API includes the current day for the running month. */
const monthPeriod = (offset: MonthOffset): { from: string; to: string } => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end =
    offset === 0
      ? now
      : new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: isoDate(start), to: isoDate(end) };
};

const monthLabel = (offset: MonthOffset, locale: string): string =>
  new Date(
    new Date().getFullYear(),
    new Date().getMonth() + offset,
    1,
  ).toLocaleDateString(locale, { month: 'long', year: 'numeric' });

const periodLabel = (period: { from: string; to: string }, locale: string) => {
  const from = new Date(`${period.from}T00:00:00`);
  const to = new Date(`${period.to}T00:00:00`);
  return `${from.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  })} – ${to.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
};

const GuardSalaryScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [monthOffset, setMonthOffset] = useState<MonthOffset>(0);
  const [profile, setProfile] = useState<GuardProfile | null>(null);
  const [summary, setSummary] = useState<GuardSalarySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(
    async (offset: MonthOffset, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        setError('');
        const period = monthPeriod(offset);
        const [nextProfile, nextSummary] = await Promise.all([
          guardService.getProfile(),
          guardService.getDutySalary(period.from, period.to),
        ]);
        setProfile(nextProfile);
        setSummary(nextSummary);
      } catch (loadError) {
        setError(
          loadError instanceof ApiError && loadError.status === 400
            ? t('guard.salary.notConfigured')
            : loadError instanceof Error
            ? loadError.message
            : t('guard.salary.loadFailed'),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [t],
  );

  useEffect(() => {
    load(monthOffset);
  }, [load, monthOffset]);

  const changeMonth = (offset: MonthOffset) => {
    if (offset > 0 || loading) return;
    setMonthOffset(offset);
  };

  const totalHours = toNumber(summary?.total_hours);
  const shiftCount = toNumber(summary?.total_shifts);
  const hasHours = shiftCount > 0 && totalHours > 0;
  const period = summary
    ? { from: summary.from, to: summary.to }
    : monthPeriod(monthOffset);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <ScalePressable
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('guardProfile.back')}
        >
          <Feather name="arrow-left" size={f(22)} color={colors.primary} />
        </ScalePressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('guard.salary.headerTitle')}
        </Text>
        <View style={styles.iconButton} />
      </View>

      {loading ? (
        <View style={styles.state}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.stateText}>{t('guard.salary.loading')}</Text>
        </View>
      ) : null}

      {!loading && error ? (
        <View style={styles.state}>
          <View style={styles.errorIcon}>
            <Feather
              name="alert-circle"
              size={f(28)}
              color={colors.status.danger}
            />
          </View>
          <Text style={styles.error}>{error}</Text>
          <ScalePressable
            style={styles.retryButton}
            onPress={() => load(monthOffset)}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>{t('guard.salary.retry')}</Text>
          </ScalePressable>
        </View>
      ) : null}

      {!loading && !error && summary ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(monthOffset, true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.periodPicker}>
            <ScalePressable
              style={styles.periodButton}
              onPress={() => changeMonth(monthOffset - 1)}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel={t('guard.salary.previousMonth')}
            >
              <Feather
                name="chevron-left"
                size={f(22)}
                color={colors.primary}
              />
            </ScalePressable>
            <View style={styles.periodTextWrap}>
              <Text style={styles.periodLabel}>
                {t('guard.salary.salaryPeriod')}
              </Text>
              <Text style={styles.periodValue}>
                {monthLabel(monthOffset, i18n.language)}
              </Text>
            </View>
            <ScalePressable
              style={[
                styles.periodButton,
                monthOffset === 0 && styles.periodButtonDisabled,
              ]}
              onPress={() => changeMonth(monthOffset + 1)}
              disabled={monthOffset === 0 || loading}
              accessibilityRole="button"
              accessibilityLabel={t('guard.salary.nextMonth')}
              accessibilityState={{ disabled: monthOffset === 0 }}
            >
              <Feather
                name="chevron-right"
                size={f(22)}
                color={monthOffset === 0 ? colors.textGray : colors.primary}
              />
            </ScalePressable>
          </View>

          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Feather name="credit-card" size={f(24)} color={colors.white} />
            </View>
            <Text style={styles.heroLabel}>
              {t('guard.salary.calculatedSalary')}
            </Text>
            <Text
              style={styles.heroAmount}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatINR(summary.calculated_pay)}
            </Text>
            <Text style={styles.heroPeriod}>
              {periodLabel(period, i18n.language)}
            </Text>
            <View style={styles.calculatedBadge}>
              <Feather
                name="check-circle"
                size={f(14)}
                color={colors.status.success}
              />
              <Text style={styles.calculatedText}>
                {t('guard.salary.hoursBased')}
              </Text>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <MetricCard
              icon="clock"
              label={t('guard.salary.hoursWorked')}
              value={totalHours.toLocaleString(i18n.language, {
                maximumFractionDigits: 2,
              })}
            />
            <MetricCard
              icon="briefcase"
              label={t('guard.salary.shiftsCompleted')}
              value={String(shiftCount)}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('guard.salary.earningsDetails')}
            </Text>
            <DetailRow
              label={t('guard.salary.hourlyRate')}
              value={`${formatINR(summary.hourly_rate)} / ${t(
                'guard.salary.hour',
              )}`}
            />
            <View style={styles.divider} />
            <DetailRow
              label={t('guard.salary.loggedTime')}
              value={t('guard.salary.minutesFromShifts', {
                minutes: Math.round(toNumber(summary.total_minutes)),
              })}
            />
            <View style={styles.divider} />
            <DetailRow
              label={t('guard.salary.calculatedPay')}
              value={formatINR(summary.calculated_pay)}
              emphasized
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('guard.salary.compensation')}
            </Text>
            <DetailRow
              label={t('guard.salary.basicSalary')}
              value={formatINR(profile?.basic_salary)}
            />
            <View style={styles.divider} />
            <DetailRow
              label={t('guard.salary.allowances')}
              value={formatINR(profile?.allowances)}
            />
            <View style={styles.infoBox}>
              <Feather name="info" size={f(17)} color={colors.status.info} />
              <Text style={styles.infoText}>
                {t('guard.salary.calculationNote')}
              </Text>
            </View>
          </View>

          {!hasHours ? (
            <View style={styles.emptyCard}>
              <Feather name="calendar" size={f(28)} color={colors.primary} />
              <Text style={styles.emptyTitle}>
                {t('guard.salary.noHoursTitle')}
              </Text>
              <Text style={styles.emptyText}>
                {t('guard.salary.noHoursBody')}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

type MetricCardProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  value: string;
};

const MetricCard = ({ icon, label, value }: MetricCardProps) => (
  <View style={styles.metricCard}>
    <View style={styles.metricIcon}>
      <Feather name={icon} size={f(20)} color={colors.primary} />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

type DetailRowProps = {
  label: string;
  value: string;
  emphasized?: boolean;
};

const DetailRow = ({ label, value, emphasized = false }: DetailRowProps) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, emphasized && styles.detailLabelStrong]}>
      {label}
    </Text>
    <Text
      style={[styles.detailValue, emphasized && styles.detailValueStrong]}
      numberOfLines={1}
    >
      {value}
    </Text>
  </View>
);

const textBase = {
  fontFamily: typography.fontFamily,
  fontSize: f(typography.sizes.md),
  fontWeight: typography.weights.regular,
};
const body = { ...textBase, lineHeight: f(22) };
const caption = {
  ...textBase,
  fontSize: f(typography.sizes.xs),
  lineHeight: f(17),
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light.background },
  header: {
    minHeight: h(58),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.xl),
    fontWeight: typography.weights.bold,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  stateText: { ...textBase, color: colors.light.secondaryText },
  errorIcon: {
    width: w(56),
    height: w(56),
    borderRadius: w(28),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.background,
  },
  error: { ...textBase, color: colors.status.danger, textAlign: 'center' },
  retryButton: {
    minHeight: 48,
    minWidth: w(132),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryText: {
    ...textBase,
    color: colors.white,
    fontWeight: typography.weights.semiBold,
  },
  periodPicker: {
    minHeight: h(64),
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  periodButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.light.background,
  },
  periodButtonDisabled: { backgroundColor: colors.progressTrack },
  periodTextWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  periodLabel: { ...caption, color: colors.light.secondaryText },
  periodValue: {
    ...body,
    marginTop: spacing.xs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  hero: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  heroIcon: {
    width: w(48),
    height: w(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: w(24),
    backgroundColor: colors.navy,
  },
  heroLabel: { ...body, marginTop: spacing.md, color: colors.white },
  heroAmount: {
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.xxxl),
    fontWeight: typography.weights.extraBold,
    color: colors.white,
    marginTop: spacing.xs,
    maxWidth: '100%',
  },
  heroPeriod: { ...caption, marginTop: spacing.sm, color: colors.white },
  calculatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  calculatedText: {
    ...caption,
    color: colors.status.success,
    fontWeight: typography.weights.semiBold,
  },

  metricsRow: { flexDirection: 'row', gap: spacing.md },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  metricIcon: {
    width: w(40),
    height: w(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: w(20),
    backgroundColor: colors.light.background,
  },
  metricValue: {
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.xl),
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  metricLabel: {
    ...caption,
    color: colors.light.secondaryText,
    marginTop: spacing.xs,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  cardTitle: {
    ...body,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
    marginBottom: spacing.md,
  },
  detailRow: {
    minHeight: h(38),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: { ...body, color: colors.light.secondaryText, flex: 1 },
  detailLabelStrong: {
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  detailValue: {
    ...body,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    flexShrink: 1,
  },
  detailValueStrong: {
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.light.background,
  },
  infoText: { ...caption, color: colors.light.secondaryText, flex: 1 },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  emptyTitle: {
    ...body,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
    marginTop: spacing.md,
  },
  emptyText: {
    ...body,
    color: colors.light.secondaryText,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default GuardSalaryScreen;
