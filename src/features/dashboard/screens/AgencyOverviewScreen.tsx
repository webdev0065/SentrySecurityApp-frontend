import React, { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../styles/colors';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import AgencyBottomNavigation from '../components/AgencyBottomNavigation';
import AgencyProfileMenu from '../components/AgencyProfileMenu';
import AgencyTopNavigation from '../components/AgencyTopNavigation';
import type { MainStackParamList } from '../../../navigation/types';
import ScalePressable from '../../../components/common/ScalePressable';
import GuardsOnDutyModal from '../components/GuardsOnDutyModal';
import ActiveSitesModal from '../components/ActiveSitesModal';
import {
  agencyApiService,
  type AgencyGuard,
  type AgencyIncident,
  type AgencySite,
} from '../../../services/agencyApiService';

const Icon = ({
  name,
  color,
  size = 23,
}: {
  name: React.ComponentProps<typeof Feather>['name'];
  color: string;
  size?: number;
}) => <Feather name={name} size={f(size)} color={color} />;
const Chevron = () => <Icon name="chevron-right" color="#696969" />;

type Props = NativeStackScreenProps<MainStackParamList, 'AgencyOverview'>;

const AgencyOverviewScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [guardsOnDutyOpen, setGuardsOnDutyOpen] = useState(false);
  const [activeSitesOpen, setActiveSitesOpen] = useState(false);
  const [sites, setSites] = useState<AgencySite[]>([]);
  const [guards, setGuards] = useState<AgencyGuard[]>([]);
  const [incidents, setIncidents] = useState<AgencyIncident[]>([]);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([
        agencyApiService.getSites(),
        agencyApiService.getGuards(),
        agencyApiService.getIncidents(),
      ])
        .then(([siteItems, guardItems, incidentItems]) => {
          if (!active) return;
          setSites(siteItems);
          setGuards(guardItems);
          setIncidents(incidentItems);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );
  const summary = [
    [
      'users',
      String(guards.filter(item => item.status === 'on_duty').length),
      'guardsOnDuty',
      '#0EAE5A',
      '#E2F5E9',
    ],
    ['grid', String(sites.length), 'activeSites', '#F5A400', '#FFF1D9'],
    [
      'alert-circle',
      String(incidents.filter(item => item.status !== 'closed').length),
      'openIncidents',
      '#EF4444',
      '#FDE4E4',
    ],
    [
      'user',
      String(guards.filter(item => !item.site_id).length),
      'unassignedGuards',
      '#2563EB',
      '#E8EEFF',
    ],
  ] as const;
  return (
    // edges: top keeps the header clear of the notch/status bar; bottom keeps
    // the tab bar clear of the home indicator on notched devices.
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />

      <AgencyTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
        onNotificationSelect={notification => {
          if (
            notification.reference_type === 'coverage_request' &&
            notification.reference_id
          ) {
            navigation.navigate('AgencySites', {
              openRequestId: notification.reference_id,
            });
          }
        }}
      />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.titleRow}>
          <Text style={s.section}>{t('dashboard.quickSummary')}</Text>
          <View style={s.date}>
            <Text style={s.dateText}>{t('dashboard.today')}, 3 Sep 2026</Text>
            <Icon name="calendar" color="#666" size={24} />
          </View>
        </View>

        <View style={s.grid}>
          {summary.map(([icon, value, label, color, tint]) => (
            <TouchableOpacity
              key={label}
              style={s.card}
              onPress={
                label === 'guardsOnDuty'
                  ? () => setGuardsOnDutyOpen(true)
                  : label === 'activeSites'
                  ? () => setActiveSitesOpen(true)
                  : label === 'openIncidents'
                  ? () => navigation.navigate('AgencyIncidents')
                  : undefined
              }
              activeOpacity={
                label === 'guardsOnDuty' ||
                label === 'activeSites' ||
                label === 'openIncidents'
                  ? 0.8
                  : 1
              }
            >
              <View style={[s.cardIcon, { backgroundColor: tint }]}>
                <Icon name={icon} color={color} size={27} />
              </View>
              <View style={s.cardCopy}>
                <Text style={[s.number, { color }]}>{value}</Text>
                <Text style={s.cardLabel}>{t(`dashboard.${label}`)}</Text>
                <Text style={s.details}>{t('dashboard.viewDetails')} ›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.insights}>
          <Insight
            icon="credit-card"
            title={t('dashboard.payrollSummary')}
            value="₹1,52,300"
            caption="April 2026 • 0 pending"
            color="#33C977"
            tint="#E2F5E9"
          />
          <Insight
            icon="file-text"
            title={t('dashboard.invoices')}
            value="₹45,000"
            caption="1 pending • 2 invoices"
            color="#5A8DFF"
            tint="#EEF3FF"
            onPress={() => navigation.navigate('AgencyInvoices')}
          />
          <Insight
            icon="star"
            title={t('dashboard.clientReviews')}
            value="★★★★★ 5.0 (1)"
            caption="Sunrise Mall"
            color="#A57AFF"
            tint="#F2EDFF"
            stars
          />
        </View>

        <Text style={s.section}>{t('dashboard.quickActions')}</Text>
        <View style={s.actions}>
          <Action
            icon="user-plus"
            text={t('dashboard.addGuard')}
            color="#0EAA55"
            onPress={() =>
              navigation.navigate('AgencyGuards', { openAddGuard: true })
            }
          />
          <Action
            icon="grid"
            text={t('dashboard.addSite')}
            color="#F39A00"
            onPress={() =>
              navigation.navigate('AgencySites', { openAddSite: true })
            }
          />
          <Action
            icon="alert-triangle"
            text={t('dashboard.incident')}
            color="#F22121"
            onPress={() =>
              navigation.navigate('AgencyIncidents', { openFileIncident: true })
            }
          />
        </View>

        <View style={s.liveHeader}>
          <Text style={s.section}>{t('dashboard.liveStatus')}</Text>
          <TouchableOpacity style={s.viewAll}>
            <Text style={s.viewAllText}>{t('dashboard.viewAll')}</Text>
            <Icon name="chevron-right" color="#2563EB" size={20} />
          </TouchableOpacity>
        </View>

        <View style={s.list}>
          {sites.map(site => (
            <Live
              key={site.id}
              title={site.site_name}
              assigned
              total={guards.filter(guard => guard.site_id === site.id).length}
              onDuty={
                guards.filter(
                  guard =>
                    guard.site_id === site.id && guard.status === 'on_duty',
                ).length
              }
            />
          ))}
          {guards.some(guard => !guard.site_id) ? (
            <Live
              title={t('dashboard.unassigned')}
              assigned={false}
              total={guards.filter(guard => !guard.site_id).length}
              onDuty={0}
            />
          ) : null}
        </View>
      </ScrollView>

      <AgencyBottomNavigation
        activeTab="overview"
        onTabPress={tab => {
          if (tab === 'guards') navigation.navigate('AgencyGuards');
          if (tab === 'incidents') navigation.navigate('AgencyIncidents');
          if (tab === 'sites') navigation.navigate('AgencySites');
          if (tab === 'profile') navigation.navigate('AgencyProfile');
          if (tab === 'plan') navigation.navigate('AgencyPlan');
        }}
      />
      {profileMenuOpen ? (
        <Pressable
          style={s.menuBackdrop}
          onPress={() => setProfileMenuOpen(false)}
        />
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
      <GuardsOnDutyModal
        visible={guardsOnDutyOpen}
        onClose={() => setGuardsOnDutyOpen(false)}
      />
      <ActiveSitesModal
        visible={activeSitesOpen}
        onClose={() => setActiveSitesOpen(false)}
      />
    </SafeAreaView>
  );
};

const Insight = ({
  icon,
  title,
  value,
  caption,
  color,
  tint,
  stars,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  value: string;
  caption: string;
  color: string;
  tint: string;
  stars?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={s.insight}
    onPress={onPress}
    activeOpacity={onPress ? 0.8 : 1}
    accessibilityRole={onPress ? 'button' : undefined}
  >
    <View style={[s.insightIcon, { backgroundColor: tint }]}>
      <Icon name={icon} color={color} />
    </View>
    <View style={s.insightCopy}>
      <Text style={s.insightTitle}>{title}</Text>
      <Text style={[s.insightValue, stars && s.stars]}>{value}</Text>
      <Text style={s.caption}>{caption}</Text>
    </View>
    <Chevron />
  </TouchableOpacity>
);
const Action = ({
  icon,
  text,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  text: string;
  color: string;
  onPress?: () => void;
}) => (
  <ScalePressable
    style={[s.action, { borderColor: color }]}
    onPress={onPress}
    accessibilityRole="button"
  >
    <Icon name={icon} color={color} size={20} />
    <Text style={[s.actionText, { color }]}>{text}</Text>
  </ScalePressable>
);
const Live = ({
  title,
  assigned,
  total,
  onDuty,
}: {
  title: string;
  assigned: boolean;
  total: number;
  onDuty: number;
}) => (
  <LiveContent
    title={title}
    assigned={assigned}
    total={total}
    onDuty={onDuty}
  />
);
const LiveContent = ({
  title,
  assigned,
  total,
  onDuty,
}: {
  title: string;
  assigned: boolean;
  total: number;
  onDuty: number;
}) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity style={s.live}>
      <View
        style={[
          s.liveIcon,
          assigned ? s.liveIconAssigned : s.liveIconUnassigned,
        ]}
      >
        <Icon
          name={assigned ? 'grid' : 'user'}
          color={assigned ? '#16A34A' : '#F26E6E'}
          size={22}
        />
      </View>
      <View style={s.liveCopy}>
        <Text style={s.liveTitle}>{title}</Text>
        <Text
          style={[s.liveCaption, assigned ? s.liveAssigned : s.liveUnassigned]}
        >
          {`${onDuty}/${total} ${t('dashboard.onDuty')}`}
        </Text>
      </View>
      <Chevron />
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  menuBackdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
  header: {
    height: h(64),
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: w(14),
    backgroundColor: colors.white,
    zIndex: 30,
    elevation: 0,
  },
  logo: { width: w(180), height: h(180) },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: w(10) },
  profileTrigger: { flexDirection: 'row', alignItems: 'center', gap: w(10) },
  bellWrapper: { position: 'relative' },
  badge: {
    position: 'absolute',
    right: -w(5),
    top: -h(5),
    width: w(13),
    height: w(13),
    borderRadius: w(7),
    backgroundColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: f(8), fontWeight: '700' },
  avatarWrapper: { position: 'relative', marginRight: w(11) },
  avatar: {
    width: w(33),
    height: w(33),
    borderRadius: w(17),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: f(13) },
  online: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: w(10),
    height: w(10),
    borderRadius: w(5),
    backgroundColor: '#19B563',
    borderWidth: 1,
    borderColor: colors.white,
  },
  scroll: { flex: 1 },
  content: { padding: w(11), paddingBottom: h(14) },
  titleRow: {
    height: h(54),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { color: colors.primary, fontWeight: '700', fontSize: f(17) },
  date: { flexDirection: 'row', alignItems: 'center', gap: w(6) },
  dateText: { color: '#747474', fontSize: f(16) },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: w(16),
  },
  card: {
    width: w(181),
    height: h(100),
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    padding: w(12),
    flexDirection: 'row',
  },
  cardIcon: {
    width: w(50),
    height: w(50),
    borderRadius: w(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { marginLeft: w(12), flex: 1 },
  number: { fontSize: f(31), lineHeight: f(32), fontWeight: '500' },
  cardLabel: { color: colors.primary, fontSize: f(13), fontWeight: '500' },
  details: { color: '#707070', fontSize: f(10), marginTop: h(4) },
  insights: { gap: h(15), marginTop: h(27), marginBottom: h(23) },
  insight: {
    height: h(71),
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    paddingHorizontal: w(11),
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightIcon: {
    width: w(42),
    height: w(42),
    borderRadius: w(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightCopy: { flex: 1, marginLeft: w(13) },
  insightTitle: {
    fontSize: f(12),
    lineHeight: f(15),
    color: '#6C6C6C',
    fontWeight: '500',
  },
  insightValue: {
    fontSize: f(17),
    lineHeight: f(21),
    color: colors.primary,
    fontWeight: '700',
  },
  stars: { color: colors.primary },
  caption: { fontSize: f(10), lineHeight: f(13), color: '#686868' },
  actions: {
    flexDirection: 'row',
    gap: w(10),
    marginTop: h(12),
    marginBottom: h(27),
  },
  action: {
    height: h(36),
    borderRadius: w(7),
    borderWidth: 1,
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: w(6),
  },
  actionText: { fontWeight: '700', fontSize: f(15) },
  liveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h(12),
  },
  viewAll: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { color: '#2563EB', fontWeight: '600', fontSize: f(14) },
  list: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    overflow: 'hidden',
  },
  live: {
    height: h(65),
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: w(11),
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIcon: {
    width: w(40),
    height: w(40),
    borderRadius: w(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveIconAssigned: { backgroundColor: '#E2F5E9' },
  liveIconUnassigned: { backgroundColor: '#FDE4E4' },
  liveCopy: { flex: 1, marginLeft: w(13) },
  liveTitle: { fontSize: f(16), fontWeight: '700', color: colors.primary },
  liveCaption: { fontSize: f(10), marginTop: 2 },
  liveAssigned: { color: '#16A34A' },
  liveUnassigned: { color: '#EF4444' },
});

export default AgencyOverviewScreen;
