import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import {
  agencyApiService,
  type AgencyGuard,
  type AgencySite,
} from '../../../services/agencyApiService';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import ScalePressable from '../../../components/common/ScalePressable';
import EditSiteModal from './EditSiteModal';

type Props = { visible: boolean; onClose: () => void };

const ActiveSitesModal: React.FC<Props> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [sites, setSites] = useState<AgencySite[]>([]);
  const [guards, setGuards] = useState<AgencyGuard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSite, setSelectedSite] = useState<AgencySite | null>(null);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    Promise.all([agencyApiService.getSites(), agencyApiService.getGuards()])
      .then(([siteItems, guardItems]) => {
        setSites(siteItems);
        setGuards(guardItems);
      })
      .catch(requestError =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : t('dashboard.unableToLoadSites'),
        ),
      )
      .finally(() => setLoading(false));
  }, [visible, t]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.sheet} accessibilityViewIsModal>
          <View style={s.header}>
            <View>
              <Text style={s.title}>{t('dashboard.activeSites')}</Text>
              <Text style={s.subtitle}>{t('dashboard.tapSiteManage')}</Text>
            </View>
            <ScalePressable
              style={s.close}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.close')}
            >
              <Feather name="x" size={scaleFont(25)} color={colors.primary} />
            </ScalePressable>
          </View>
          {loading ? (
            <View style={s.messageWrap}>
              <ActivityIndicator color={colors.primary} />
              <Text style={s.message}>{t('dashboard.loadingSites')}</Text>
            </View>
          ) : error ? (
            <Text style={[s.message, s.error]}>{error}</Text>
          ) : sites.length ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.list}
            >
              {sites.map(site => (
                <SiteCard
                  key={site.id}
                  site={site}
                  guardCount={
                    guards.filter(guard => guard.site_id === site.id).length
                  }
                  onPress={() => setSelectedSite(site)}
                />
              ))}
            </ScrollView>
          ) : (
            <Text style={s.message}>{t('dashboard.noSites')}</Text>
          )}
        </View>
        <EditSiteModal
          visible={selectedSite !== null}
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
        />
      </View>
    </Modal>
  );
};

const SiteCard: React.FC<{
  site: AgencySite;
  guardCount: number;
  onPress: () => void;
}> = ({ site, guardCount, onPress }) => {
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
      ? `${site.start_time} – ${site.end_time}`
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
        <Text style={s.status}>{t('dashboard.active')}</Text>
      </View>
      <View style={s.addressRow}>
        <Feather name="map-pin" size={scaleFont(20)} color="#667085" />
        <Text style={s.address}>{address}</Text>
      </View>
      <View style={s.details}>
        <Text style={s.detail}>
          {t('dashboard.guardCount', { count: guardCount })}
        </Text>
        <Text style={s.detail}>{plan}</Text>
      </View>
      <View style={s.timeRow}>
        <Feather name="clock" size={scaleFont(19)} color="#B9640A" />
        <Text style={s.time}>{time}</Text>
      </View>
    </ScalePressable>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.68)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(18),
  },
  sheet: {
    width: '100%',
    maxHeight: '78%',
    backgroundColor: colors.white,
    borderRadius: scaleWidth(14),
    padding: scaleWidth(20),
    borderWidth: 1,
    borderColor: '#D8D0C0',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: scaleHeight(16),
  },
  title: { color: colors.primary, fontSize: scaleFont(24), fontWeight: '700' },
  subtitle: {
    color: '#667085',
    fontSize: scaleFont(15),
    lineHeight: scaleFont(20),
    marginTop: scaleHeight(4),
  },
  close: {
    width: scaleWidth(38),
    height: scaleWidth(38),
    borderRadius: scaleWidth(19),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F8',
  },
  list: { gap: scaleHeight(16) },
  card: {
    borderWidth: 1,
    borderColor: '#D8D0C0',
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flex: 1,
    color: '#1F2937',
    fontSize: scaleFont(21),
    fontWeight: '700',
    paddingRight: scaleWidth(8),
  },
  status: {
    color: '#008B57',
    borderWidth: 1,
    borderColor: '#009A63',
    borderRadius: scaleWidth(6),
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    fontSize: scaleFont(13),
    fontWeight: '700',
    letterSpacing: scaleFont(1),
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaleHeight(16),
  },
  address: {
    flex: 1,
    color: '#667085',
    fontSize: scaleFont(16),
    lineHeight: scaleFont(21),
    marginLeft: scaleWidth(10),
  },
  details: {
    flexDirection: 'row',
    marginTop: scaleHeight(16),
    gap: scaleWidth(28),
  },
  detail: { color: '#667085', fontSize: scaleFont(16), flexShrink: 1 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleHeight(14),
    gap: scaleWidth(10),
  },
  time: { color: '#B9640A', fontSize: scaleFont(16), fontWeight: '600' },
  messageWrap: {
    alignItems: 'center',
    gap: scaleHeight(10),
    paddingVertical: scaleHeight(28),
  },
  message: {
    color: '#667085',
    fontSize: scaleFont(16),
    textAlign: 'center',
    paddingVertical: scaleHeight(24),
  },
  error: { color: '#D92D20' },
});

export default ActiveSitesModal;
