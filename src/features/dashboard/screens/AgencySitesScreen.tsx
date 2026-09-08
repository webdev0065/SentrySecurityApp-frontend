import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import type { MainStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import AgencyBottomNavigation, {
  AgencyNavTab,
} from '../components/AgencyBottomNavigation';
import AgencyProfileMenu from '../components/AgencyProfileMenu';
import AgencyTopNavigation from '../components/AgencyTopNavigation';
import AddSiteModal from '../components/AddSiteModal';
import {
  agencyApiService,
  type AgencySite,
} from '../../../services/agencyApiService';
import ScalePressable from '../../../components/common/ScalePressable';
import EditSiteModal from '../components/EditSiteModal';

type Props = NativeStackScreenProps<MainStackParamList, 'AgencySites'>;
const AgencySitesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [siteItems, setSiteItems] = useState<AgencySite[]>([]);
  const [addSiteOpen, setAddSiteOpen] = useState(
    route.params?.openAddSite ?? false,
  );
  const [selectedSite, setSelectedSite] = useState<AgencySite | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const loadSites = useCallback(async () => {
    try {
      setLoadError('');
      setSiteItems(await agencyApiService.getSites());
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : t('dashboard.unableToLoadSites'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    void loadSites();
  }, [loadSites]);
  useEffect(() => {
    if (route.params?.openAddSite) {
      setAddSiteOpen(true);
      navigation.setParams({ openAddSite: undefined });
    }
  }, [navigation, route.params?.openAddSite]);
  const visibleSites = useMemo(
    () =>
      siteItems.filter(site =>
        `${site.site_name} ${site.site_address ?? ''} ${site.city ?? ''} ${
          site.state ?? ''
        }`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query, siteItems],
  );
  const navigate = (tab: AgencyNavTab) => {
    if (tab === 'overview') navigation.navigate('AgencyOverview');
    if (tab === 'guards') navigation.navigate('AgencyGuards');
    if (tab === 'incidents') navigation.navigate('AgencyIncidents');
    if (tab === 'profile') navigation.navigate('AgencyProfile');
  };
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <AgencyTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
      />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <ScalePressable
          style={s.addButton}
          onPress={() => setAddSiteOpen(true)}
          accessibilityRole="button"
        >
          <Text style={s.addText}>{t('dashboard.addSite')}</Text>
        </ScalePressable>
        <View style={s.searchRow}>
          <View style={s.search}>
            <Feather name="search" size={f(23)} color="#A3A3A3" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('dashboard.searchSites')}
              placeholderTextColor="#A3A3A3"
              style={s.input}
            />
          </View>
          <TouchableOpacity
            style={s.filter}
            accessibilityLabel={t('dashboard.filter')}
          >
            <Feather name="filter" size={f(24)} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={s.list}>
          {loading ? (
            <Text style={s.message}>{t('dashboard.loadingSites')}</Text>
          ) : loadError ? (
            <Text style={s.error}>{loadError}</Text>
          ) : visibleSites.length ? (
            visibleSites.map(site => (
              <SiteCard
                key={site.id}
                site={site}
                onPress={() => setSelectedSite(site)}
              />
            ))
          ) : (
            <Text style={s.message}>{t('dashboard.noSites')}</Text>
          )}
        </View>
      </ScrollView>
      <AgencyBottomNavigation activeTab="sites" onTabPress={navigate} />
      {profileMenuOpen ? (
        <TouchableOpacity
          style={s.backdrop}
          activeOpacity={1}
          onPress={() => setProfileMenuOpen(false)}
        />
      ) : null}
      {profileMenuOpen ? (
        <AgencyProfileMenu onLogout={() => setProfileMenuOpen(false)} />
      ) : null}
      <AddSiteModal
        visible={addSiteOpen}
        onClose={() => setAddSiteOpen(false)}
        onCreated={loadSites}
      />
      <EditSiteModal
        visible={selectedSite !== null}
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
      />
    </SafeAreaView>
  );
};

const SiteCard: React.FC<{ site: AgencySite; onPress: () => void }> = ({
  site,
  onPress,
}) => {
  const { t } = useTranslation();
  const address =
    [site.site_address, site.city, site.state].filter(Boolean).join(', ') ||
    t('dashboard.addressNotProvided');
  const plan =
    site.coverage_plan === 'day_shift'
      ? t('dashboard.dayShift')
      : site.coverage_plan === 'night_watch'
      ? t('dashboard.nightWatch')
      : site.coverage_plan === '24x7'
      ? t('dashboard.coverage24x7')
      : t('dashboard.notSet');
  const time =
    site.start_time && site.end_time
      ? `${site.start_time} - ${site.end_time}`
      : t('dashboard.notScheduled');
  return (
    <ScalePressable
      style={s.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={site.site_name}
    >
      <View style={s.cardTop}>
        <Text style={s.name}>{site.site_name}</Text>
        <Feather name="chevron-right" size={f(25)} color="#999" />
      </View>
      <View style={s.addressRow}>
        <Feather name="map-pin" size={f(20)} color="#A0A0A0" />
        <Text style={s.address}>{address}</Text>
      </View>
      <View style={s.details}>
        <Text style={s.detail}>{t('dashboard.guardDataUnavailable')}</Text>
        <Text style={s.detail}>{plan}</Text>
      </View>
      <View style={s.timeRow}>
        <Feather name="clock" size={f(19)} color="#FFB800" />
        <Text style={s.time}>{time}</Text>
      </View>
    </ScalePressable>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  content: { padding: w(14), paddingBottom: h(22) },
  addButton: {
    height: h(36),
    backgroundColor: colors.primary,
    borderRadius: w(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: h(22),
    marginBottom: h(15),
  },
  addText: { color: colors.white, fontSize: f(16), fontWeight: '700' },
  searchRow: { flexDirection: 'row', gap: w(10), marginBottom: h(19) },
  search: {
    height: h(46),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: w(8),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(14),
  },
  input: {
    flex: 1,
    fontSize: f(18),
    color: colors.primary,
    marginLeft: w(9),
    height: '100%',
  },
  filter: {
    width: w(44),
    height: h(46),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: w(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: h(17) },
  message: {
    color: '#707070',
    fontSize: f(15),
    textAlign: 'center',
    marginTop: h(24),
  },
  error: {
    color: '#E53935',
    fontSize: f(14),
    textAlign: 'center',
    marginTop: h(24),
  },
  card: {
    minHeight: h(140),
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    padding: w(14),
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  name: { fontSize: f(18), fontWeight: '700', color: colors.primary, flex: 1 },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: h(10),
  },
  address: {
    flex: 1,
    color: '#707070',
    fontSize: f(15),
    lineHeight: f(18),
    marginLeft: w(5),
  },
  details: { flexDirection: 'row', marginTop: h(10) },
  detail: { width: '50%', color: '#707070', fontSize: f(12) },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginTop: h(8) },
  time: {
    color: '#FFB800',
    fontSize: f(15),
    fontWeight: '500',
    marginLeft: w(5),
  },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});
export default AgencySitesScreen;
