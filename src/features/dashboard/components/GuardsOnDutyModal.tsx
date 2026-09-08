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
} from '../../../services/agencyApiService';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import ScalePressable from '../../../components/common/ScalePressable';

type Props = { visible: boolean; onClose: () => void };

const GuardsOnDutyModal: React.FC<Props> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const [guards, setGuards] = useState<AgencyGuard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    setError('');
    agencyApiService
      .getGuards()
      .then(items =>
        setGuards(items.filter(guard => guard.status === 'on_duty')),
      )
      .catch(requestError =>
        setError(
          requestError instanceof Error
            ? requestError.message
            : t('dashboard.unableToLoadGuards'),
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
            <Text style={s.title}>{t('dashboard.guardsOnDuty')}</Text>
            <ScalePressable
              style={s.close}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('dashboard.close')}
            >
              <Feather name="x" size={scaleFont(25)} color={colors.primary} />
            </ScalePressable>
          </View>
          <Text style={s.subtitle}>{t('dashboard.tapGuardDetails')}</Text>
          {loading ? (
            <View style={s.messageWrap}>
              <ActivityIndicator color={colors.primary} />
              <Text style={s.message}>{t('dashboard.loadingGuards')}</Text>
            </View>
          ) : error ? (
            <Text style={[s.message, s.error]}>{error}</Text>
          ) : guards.length ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.list}
            >
              {guards.map(guard => (
                <GuardCard key={guard.id} guard={guard} />
              ))}
            </ScrollView>
          ) : (
            <Text style={s.message}>{t('dashboard.noGuardsOnDuty')}</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const GuardCard: React.FC<{ guard: AgencyGuard }> = ({ guard }) => {
  const { t } = useTranslation();
  const time =
    guard.start_time && guard.end_time
      ? `${guard.start_time} – ${guard.end_time}`
      : t('dashboard.notScheduled');
  const location =
    guard.current_latitude != null && guard.current_longitude != null
      ? `${guard.current_latitude.toFixed(
          4,
        )}, ${guard.current_longitude.toFixed(4)}`
      : t('dashboard.noLocationYet');
  return (
    <ScalePressable
      style={s.card}
      onPress={() => undefined}
      accessibilityRole="button"
      accessibilityLabel={guard.full_name}
    >
      <View style={s.personRow}>
        <View style={s.avatar}>
          <Feather name="user" size={scaleFont(26)} color="#B9640A" />
        </View>
        <View style={s.personCopy}>
          <View style={s.nameRow}>
            <Text style={s.name}>{guard.full_name}</Text>
            <Feather
              name="chevron-right"
              size={scaleFont(24)}
              color="#6B7280"
            />
          </View>
          <Text style={s.detail}>
            {guard.guard_code} ·{' '}
            {guard.site_name || t('dashboard.unassignedSite')}
          </Text>
          <Text style={s.shift}>{time}</Text>
        </View>
      </View>
      <View style={s.liveRow}>
        <View style={s.liveLabel}>
          <Feather name="navigation" size={scaleFont(19)} color="#009A63" />
          <Text style={s.liveText}>{t('dashboard.live')}</Text>
        </View>
        <Text style={s.location}>{location}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { color: colors.primary, fontSize: scaleFont(24), fontWeight: '700' },
  close: {
    width: scaleWidth(38),
    height: scaleWidth(38),
    borderRadius: scaleWidth(19),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F8',
  },
  subtitle: {
    color: '#667085',
    fontSize: scaleFont(16),
    lineHeight: scaleFont(22),
    marginTop: scaleHeight(10),
    marginBottom: scaleHeight(16),
  },
  list: { gap: scaleHeight(16) },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4D8C5',
    paddingBottom: scaleHeight(16),
  },
  personRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: scaleWidth(72),
    height: scaleWidth(72),
    borderRadius: scaleWidth(36),
    backgroundColor: '#E2DBCA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleWidth(16),
  },
  personCopy: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: {
    flex: 1,
    color: '#1F2937',
    fontSize: scaleFont(23),
    fontWeight: '600',
  },
  detail: {
    color: '#667085',
    fontSize: scaleFont(16),
    marginTop: scaleHeight(2),
  },
  shift: {
    color: '#B9640A',
    fontSize: scaleFont(15),
    fontWeight: '600',
    marginTop: scaleHeight(6),
  },
  liveRow: {
    minHeight: scaleHeight(48),
    borderRadius: scaleWidth(9),
    borderWidth: 1,
    borderColor: '#009A63',
    backgroundColor: '#F0F9F5',
    marginTop: scaleHeight(14),
    paddingHorizontal: scaleWidth(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveLabel: { flexDirection: 'row', alignItems: 'center', gap: scaleWidth(9) },
  liveText: { color: '#009A63', fontSize: scaleFont(18), fontWeight: '600' },
  location: {
    color: '#667085',
    fontSize: scaleFont(15),
    textAlign: 'right',
    flexShrink: 1,
  },
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

export default GuardsOnDutyModal;
