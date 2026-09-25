import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useFocusEffect } from '@react-navigation/native';
import type { MainStackParamList } from '../../../navigation/types';
import {
  planService,
  type AgencyPlan,
  type AgencySubscription,
} from '../../../services/planService';
import { colors } from '../../../styles/colors';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import AgencyBottomNavigation, {
  type AgencyNavTab,
} from '../components/AgencyBottomNavigation';
import AgencyProfileMenu from '../components/AgencyProfileMenu';
import AgencyTopNavigation from '../components/AgencyTopNavigation';
import ScalePressable from '../../../components/common/ScalePressable';
type Props = NativeStackScreenProps<MainStackParamList, 'AgencyPlan'>;
const parsePrice = (value: AgencyPlan['price']): number => {
  if (typeof value === 'number') return value;
  const parsed = Number(String(value ?? '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};
const formatINR = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;
const formatPriceLine = (
  price: AgencyPlan['price'],
  freeLabel: string,
  interval?: string | null,
): string => {
  const value = parsePrice(price);
  if (value <= 0) return freeLabel;
  const suffix = String(interval ?? 'month')
    .toLowerCase()
    .includes('year')
    ? '/yr'
    : '/mo';
  return `${formatINR(value)}${suffix}`;
};
const parseFeatures = (features: AgencyPlan['features']): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features.filter(Boolean).map(String);
  return String(features)
    .split(/\r?\n|;/)
    .map(x => x.trim())
    .filter(Boolean);
};
const formatDate = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
const isUnlimitedLimit = (limit: number | null | undefined): boolean =>
  limit === null || limit === undefined;
const UsageBar: React.FC<{
  label: string;
  used: number;
  limit: number | null;
  tone: string;
}> = ({ label, used, limit, tone }) => {
  const { t } = useTranslation();
  const unlimited = limit === null || limit === undefined;
  const finiteLimit = typeof limit === 'number' ? limit : 0;
  const percent = unlimited
    ? 100
    : finiteLimit > 0
    ? Math.min(100, Math.max(0, (used / finiteLimit) * 100))
    : 0;
  const reached = !unlimited && used >= finiteLimit;
  return (
    <View style={planStyles.usageBlock}>
      <View style={planStyles.usageRow}>
        <Text style={planStyles.usageLabel}>{label}</Text>
        <Text
          style={[
            planStyles.usageValue,
            reached && planStyles.usageValueReached,
          ]}
        >
          {used} / {unlimited ? t('plan.unlimited') : limit}
        </Text>
      </View>
      <View style={planStyles.track}>
        <View
          style={[
            planStyles.fill,
            unlimited
              ? planStyles.unlimitedFill
              : tone === 'guard'
              ? planStyles.guardFill
              : planStyles.siteFill,
            { width: `${percent}%` },
          ]}
        />
      </View>
      {reached ? (
        <View style={planStyles.limitRow}>
          <Feather
            name="alert-circle"
            size={f(13)}
            color={colors.status.danger}
          />
          <Text style={planStyles.limitText}>
            {t('plan.limitReached')} · {t('plan.upgradeHint')}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const AgencyPlanScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState<AgencySubscription | null>(
    null,
  );
  const [plans, setPlans] = useState<AgencyPlan[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [plansError, setPlansError] = useState('');
  const [switchingName, setSwitchingName] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const loadSubscription = useCallback(async () => {
    try {
      setLoadingSubscription(true);
      setSubscriptionError('');
      setSubscription(await planService.getSubscription());
    } catch (error) {
      setSubscription(null);
      setSubscriptionError(
        error instanceof Error ? error.message : t('plan.loadFailed'),
      );
    } finally {
      setLoadingSubscription(false);
    }
  }, [t]);
  const loadPlans = useCallback(async () => {
    try {
      setLoadingPlans(true);
      setPlansError('');
      const items = await planService.getPlans();
      setPlans(Array.isArray(items) ? items : []);
    } catch (error) {
      setPlans([]);
      setPlansError(
        error instanceof Error ? error.message : t('plan.loadFailed'),
      );
    } finally {
      setLoadingPlans(false);
    }
  }, [t]);
  const load = useCallback(async () => {
    await Promise.all([loadSubscription(), loadPlans()]);
  }, [loadPlans, loadSubscription]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const currentPlanName = (subscription?.plan_name ?? '').toLowerCase();
  const orderedPlans = useMemo(
    () => [...plans].sort((a, b) => parsePrice(a.price) - parsePrice(b.price)),
    [plans],
  );
  const guardUsed = subscription?.usage?.guards?.used ?? 0;
  const siteUsed = subscription?.usage?.sites?.used ?? 0;
  const guardLimit =
    subscription?.usage?.guards?.limit ?? subscription?.max_guards ?? null;
  const siteLimit =
    subscription?.usage?.sites?.limit ?? subscription?.max_sites ?? null;
  const statusLabel = (subscription?.status ?? '').toUpperCase();
  const freePlan = parsePrice(subscription?.price ?? 0) <= 0;
  const renewal = formatDate(
    subscription?.renews_at ?? subscription?.renewsAt ?? null,
  );
  const navigate = (tab: AgencyNavTab) => {
    if (tab === 'overview') navigation.navigate('AgencyOverview');
    if (tab === 'guards') navigation.navigate('AgencyGuards');
    if (tab === 'sites') navigation.navigate('AgencySites');
    if (tab === 'incidents') navigation.navigate('AgencyIncidents');
    if (tab === 'profile') navigation.navigate('AgencyProfile');
  };
  const switchPlan = async (plan: AgencyPlan) => {
    if (!plan.name || switchingName) return;
    if (plan.name.toLowerCase() === currentPlanName) return;
    try {
      setSwitchingName(plan.name);
      setActionError('');
      setActionSuccess('');
      await planService.switchPlan(plan.name);
      setActionSuccess(t('plan.switched', { name: plan.name }));
      await loadSubscription();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : t('plan.switchFailed'),
      );
    } finally {
      setSwitchingName(null);
    }
  };
  const renderCurrentPlan = () => {
    if (loadingSubscription) {
      return (
        <View style={[planStyles.card, planStyles.centerBox]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={planStyles.message}>{t('plan.loading')}</Text>
        </View>
      );
    }
    if (subscriptionError || !subscription) {
      return (
        <View style={[planStyles.card, planStyles.centerBox]}>
          <Feather
            name="alert-circle"
            size={f(22)}
            color={colors.status.danger}
          />
          <Text style={planStyles.error}>
            {subscriptionError || t('plan.loadFailed')}
          </Text>
          <ScalePressable
            style={planStyles.retryButton}
            onPress={() => loadSubscription()}
            accessibilityRole="button"
          >
            <Text style={planStyles.retryText}>{t('plan.retry')}</Text>
          </ScalePressable>
        </View>
      );
    }
    return (
      <View style={planStyles.card}>
        <View style={planStyles.cardHeaderRow}>
          <Text style={planStyles.sectionTitle}>{t('plan.currentPlan')}</Text>
          <View
            style={[
              planStyles.statusBadge,
              statusLabel === 'ACTIVE'
                ? planStyles.statusActive
                : planStyles.statusOther,
            ]}
          >
            <Text
              style={[
                planStyles.statusText,
                statusLabel === 'ACTIVE'
                  ? planStyles.statusTextActive
                  : planStyles.statusTextOther,
              ]}
            >
              {statusLabel || '-'}
            </Text>
          </View>
        </View>
        <View style={planStyles.planTitleRow}>
          <Feather name="award" size={f(22)} color={colors.primary} />
          <Text style={planStyles.planName}>{subscription.plan_name}</Text>
          <Text style={planStyles.planPrice}>
            {formatPriceLine(
              subscription.price,
              t('plan.free'),
              subscription.billing_interval ?? subscription.interval,
            )}
          </Text>
        </View>
        <Text style={planStyles.renewal}>
          {freePlan
            ? t('plan.freePlanHint')
            : renewal
            ? t('plan.renewsOn', { date: renewal })
            : t('plan.monthlyBilling')}
        </Text>
        <UsageBar
          label={t('plan.guards')}
          used={guardUsed}
          limit={guardLimit}
          tone="guard"
        />
        <UsageBar
          label={t('plan.sites')}
          used={siteUsed}
          limit={siteLimit}
          tone="site"
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={planStyles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <AgencyTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
      />
      <ScrollView
        contentContainerStyle={planStyles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={planStyles.screenTitle}>{t('plan.title')}</Text>
        {renderCurrentPlan()}
        {actionError ? (
          <View style={planStyles.alertError}>
            <Text style={planStyles.alertErrorText}>{actionError}</Text>
          </View>
        ) : null}
        {actionSuccess ? (
          <View style={planStyles.alertSuccess}>
            <Feather
              name="check-circle"
              size={f(16)}
              color={colors.status.success}
            />
            <Text style={planStyles.alertSuccessText}>{actionSuccess}</Text>
          </View>
        ) : null}
        <View style={planStyles.card}>
          <Text style={planStyles.sectionTitle}>{t('plan.paymentMethod')}</Text>
          <Text style={planStyles.muted}>{t('plan.noPaymentMethod')}</Text>
          <ScalePressable
            style={planStyles.outlineButton}
            accessibilityRole="button"
            onPress={() => setActionError(t('plan.paymentComingSoon'))}
          >
            <Feather name="credit-card" size={f(18)} color={colors.primary} />
            <Text style={planStyles.outlineText}>
              {t('plan.addPaymentMethod')}
            </Text>
          </ScalePressable>
        </View>
        <View style={planStyles.card}>
          <Text style={planStyles.sectionTitle}>{t('plan.comparePlans')}</Text>
          {loadingPlans ? (
            <Text style={planStyles.message}>{t('plan.loadingPlans')}</Text>
          ) : plansError ? (
            <View style={planStyles.centerBox}>
              <Text style={planStyles.error}>{plansError}</Text>
              <ScalePressable
                style={planStyles.retryButton}
                onPress={() => loadPlans()}
                accessibilityRole="button"
              >
                <Text style={planStyles.retryText}>{t('plan.retry')}</Text>
              </ScalePressable>
            </View>
          ) : orderedPlans.length ? (
            <View style={planStyles.planList}>
              {orderedPlans.map(plan => {
                const active = plan.name?.toLowerCase() === currentPlanName;
                const features = parseFeatures(plan.features);
                const switching = switchingName === plan.name;
                return (
                  <View
                    key={`${plan.id}-${plan.name}`}
                    style={[
                      planStyles.planCard,
                      active && planStyles.planCardActive,
                    ]}
                  >
                    <View style={planStyles.planCardTop}>
                      <Text style={planStyles.planCardName}>{plan.name}</Text>
                      <Text style={planStyles.planCardPrice}>
                        {formatPriceLine(
                          plan.price,
                          t('plan.free'),
                          plan.billing_interval ?? plan.interval,
                        )}
                      </Text>
                    </View>
                    <Text style={planStyles.planLimits}>
                      {t('plan.planLimits', {
                        guards: isUnlimitedLimit(plan.max_guards)
                          ? t('plan.unlimited')
                          : plan.max_guards,
                        sites: isUnlimitedLimit(plan.max_sites)
                          ? t('plan.unlimited')
                          : plan.max_sites,
                      })}
                    </Text>
                    {features.map(feature => (
                      <View key={feature} style={planStyles.featureRow}>
                        <Feather
                          name="check-circle"
                          size={f(16)}
                          color={colors.status.success}
                        />
                        <Text style={planStyles.featureText}>{feature}</Text>
                      </View>
                    ))}
                    {active ? (
                      <Text style={planStyles.currentPlanText}>
                        {t('plan.currentPlanLabel')}
                      </Text>
                    ) : (
                      <ScalePressable
                        style={planStyles.outlineButton}
                        disabled={Boolean(switchingName)}
                        onPress={() => switchPlan(plan)}
                        accessibilityRole="button"
                      >
                        {switching ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : null}
                        <Text style={planStyles.outlineText}>
                          {t('plan.switchTo', { name: plan.name })}
                        </Text>
                      </ScalePressable>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text style={planStyles.message}>{t('plan.noPlans')}</Text>
          )}
        </View>
        <View style={planStyles.card}>
          <Text style={planStyles.sectionTitle}>
            {t('plan.billingHistory')}
          </Text>
          <Text style={planStyles.muted}>{t('plan.billingUnavailable')}</Text>
        </View>
      </ScrollView>
      <AgencyBottomNavigation activeTab="plan" onTabPress={navigate} />
      {profileMenuOpen ? (
        <ScalePressable
          style={planStyles.backdrop}
          onPress={() => setProfileMenuOpen(false)}
          accessibilityLabel={t('dashboard.close')}
        >
          <View />
        </ScalePressable>
      ) : null}
      {profileMenuOpen ? (
        <AgencyProfileMenu
          onMyProfile={() => {
            setProfileMenuOpen(false);
            navigation.navigate('AgencyProfile');
          }}
          onLogout={() => setProfileMenuOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
};
const planStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  content: { padding: w(14), paddingBottom: h(22), gap: h(14) },
  screenTitle: {
    color: colors.primary,
    fontSize: f(19),
    fontWeight: '700',
    marginTop: h(12),
    borderLeftWidth: w(4),
    borderLeftColor: colors.gold,
    paddingLeft: w(9),
  },
  card: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    padding: w(14),
    backgroundColor: colors.white,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: w(10),
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: f(16),
    fontWeight: '700',
    borderLeftWidth: w(4),
    borderLeftColor: colors.gold,
    paddingLeft: w(9),
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: w(6),
    paddingHorizontal: w(10),
    paddingVertical: h(4),
  },
  statusActive: {
    borderColor: colors.status.success,
    backgroundColor: '#EAF8EF',
  },
  statusOther: { borderColor: '#DCDCDC', backgroundColor: '#F4F6F8' },
  statusText: { fontSize: f(12), fontWeight: '700' },
  statusTextActive: { color: colors.status.success },
  statusTextOther: { color: colors.primary },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(8),
    marginTop: h(12),
  },
  planName: { color: colors.primary, fontSize: f(22), fontWeight: '800' },
  planPrice: { color: '#6A6A6A', fontSize: f(16), fontWeight: '600' },
  renewal: { color: '#6A6A6A', fontSize: f(13), marginTop: h(4) },
  usageBlock: { marginTop: h(14) },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: h(6),
  },
  usageLabel: { color: '#4B5563', fontSize: f(14), fontWeight: '600' },
  usageValue: { color: colors.primary, fontSize: f(14), fontWeight: '700' },
  usageValueReached: { color: colors.status.danger },
  track: {
    height: h(8),
    borderRadius: w(6),
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: w(6) },
  guardFill: { backgroundColor: colors.primary },
  siteFill: { backgroundColor: colors.status.success },
  unlimitedFill: { backgroundColor: colors.status.success },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(6),
    marginTop: h(6),
  },
  limitText: {
    color: colors.status.danger,
    fontSize: f(12),
    fontWeight: '600',
  },
  centerBox: { alignItems: 'center', gap: h(8) },
  message: { color: '#6A6A6A', fontSize: f(14), textAlign: 'center' },
  error: { color: '#E53935', fontSize: f(14), textAlign: 'center' },
  retryButton: {
    minHeight: h(44),
    borderRadius: w(7),
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: w(18),
    marginTop: h(6),
  },
  retryText: { color: colors.primary, fontWeight: '700', fontSize: f(15) },
  alertError: {
    borderWidth: 1,
    borderColor: colors.status.danger,
    backgroundColor: '#FDECEC',
    borderRadius: w(8),
    padding: w(12),
  },
  alertErrorText: { color: colors.status.danger, fontSize: f(13) },
  alertSuccess: {
    borderWidth: 1,
    borderColor: colors.status.success,
    backgroundColor: '#EAF8EF',
    borderRadius: w(8),
    padding: w(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(8),
  },
  alertSuccessText: { color: colors.status.success, fontSize: f(13), flex: 1 },
  muted: { color: '#6A6A6A', fontSize: f(14), marginTop: h(8) },
  outlineButton: {
    minHeight: h(48),
    borderRadius: w(7),
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: w(8),
    marginTop: h(12),
    paddingHorizontal: w(12),
  },
  outlineText: { color: colors.primary, fontWeight: '700', fontSize: f(15) },
  planList: { gap: h(12), marginTop: h(12) },
  planCard: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    padding: w(12),
    gap: h(8),
  },
  planCardActive: { borderColor: colors.primary, borderWidth: 1.5 },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: w(10),
  },
  planCardName: { color: colors.primary, fontSize: f(20), fontWeight: '800' },
  planCardPrice: { color: colors.primary, fontSize: f(16), fontWeight: '700' },
  planLimits: { color: '#6A6A6A', fontSize: f(12), fontWeight: '600' },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: w(8) },
  featureText: { color: '#4B5563', fontSize: f(14), flex: 1, flexWrap: 'wrap' },
  currentPlanText: {
    color: colors.primary,
    fontSize: f(15),
    fontWeight: '700',
    textAlign: 'center',
    marginTop: h(4),
  },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});
export default AgencyPlanScreen;
