import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import ClientTopNavigation from '../components/ClientTopNavigation';
import ClientBottomNavigation, {
  type ClientTab,
} from '../components/ClientBottomNavigation';
import ClientProfilePanel from '../components/ClientProfilePanel';
import ClientCoverageRequests from '../components/ClientCoverageRequests';
import AgencyProfileMenu from '../../dashboard/components/AgencyProfileMenu';
import ScalePressable from '../../../components/common/ScalePressable';
import {
  clientService,
  type ClientDetails,
} from '../../../services/clientService';
import { session } from '../../../services/session';
import type { RootStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { scaleFont } from '../../../styles/dimensions';

export default function ClientPortalScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<ClientTab>('home');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [details, setDetails] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setDetails(await clientService.getDetails());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : t('client.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    load();
  }, [load]);
  const signOut = async () => {
    await session.clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'AuthFlow' }] });
  };
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ClientTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
        onNotificationPress={() => {
          setProfileMenuOpen(false);
          setTab('alerts');
        }}
      />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={s.state}>
            <ActivityIndicator color={colors.primary} />
            <Text style={s.muted}>{t('client.loading')}</Text>
          </View>
        ) : null}
        {!loading && error ? (
          <View style={s.state}>
            <Text style={s.error}>{error}</Text>
            <ScalePressable style={s.outline} onPress={load}>
              <Text style={s.outlineText}>{t('superAdmin.tryAgain')}</Text>
            </ScalePressable>
          </View>
        ) : null}
        {!loading && !error && tab === 'home' ? (
          <>
            <Section title={t('client.yourAgencies')}>
              <Empty
                icon="briefcase"
                title={t('client.noAgency')}
                body={t('client.noAgencyHint')}
              />
            </Section>
            <Section title={t('client.coveragePlan')}>
              <Text style={s.cardTitle}>
                {details?.site_name || t('client.noCoverage')}
              </Text>
              <Text style={s.muted}>
                {details
                  ? [
                      details.site_address,
                      details.city,
                      details.state,
                      details.pincode,
                    ]
                      .filter(Boolean)
                      .join(', ')
                  : t('client.noCoverageHint')}
              </Text>
            </Section>
          </>
        ) : null}
        {!loading && !error && tab === 'request' ? (
          <ClientCoverageRequests />
        ) : null}
        {!loading && !error && tab === 'invoices' ? (
          <Section title={t('client.invoices')}>
            <Empty
              icon="file-text"
              title={t('client.noInvoices')}
              body={t('client.noInvoicesHint')}
            />
          </Section>
        ) : null}
        {!loading && !error && tab === 'alerts' ? (
          <Section title={t('client.alerts')}>
            <Empty
              icon="bell"
              title={t('client.noAlerts')}
              body={t('client.noAlertsHint')}
            />
          </Section>
        ) : null}
        {!loading && !error && tab === 'profile' && details ? (
          <ClientProfilePanel
            details={details}
            onUpdated={setDetails}
            onSignOut={signOut}
          />
        ) : null}
      </ScrollView>
      <ClientBottomNavigation
        activeTab={tab}
        onTabPress={nextTab => {
          setProfileMenuOpen(false);
          setTab(nextTab);
        }}
      />
      {profileMenuOpen ? (
        <ScalePressable
          style={s.backdrop}
          onPress={() => setProfileMenuOpen(false)}
          accessibilityLabel={t('dashboard.close')}
        >
          <View />
        </ScalePressable>
      ) : null}
      {profileMenuOpen ? (
        <AgencyProfileMenu
          identity={{
            name: t('client.profile'),
            company: details?.site_name || '',
            initials: 'C',
          }}
          onMyProfile={() => {
            setTab('profile');
            setProfileMenuOpen(false);
          }}
          onLogout={() => setProfileMenuOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}
function Empty({
  icon,
  title,
  body,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  body: string;
}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Feather name={icon} size={scaleFont(24)} color={colors.primary} />
      </View>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.muted}>{body}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  section: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
    borderLeftWidth: spacing.xs,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  state: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  empty: { alignItems: 'flex-start', gap: spacing.sm },
  emptyIcon: {
    padding: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.light.background,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  muted: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: 21,
  },
  error: {
    color: colors.status.danger,
    fontSize: scaleFont(typography.sizes.sm),
    textAlign: 'center',
  },
  outline: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.semiBold,
  },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});
