import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import ScalePressable from '../../../components/common/ScalePressable';

type Props = {
  profileMenuOpen: boolean;
  onProfilePress: () => void;
  onNotificationPress?: () => void;
  unreadNotificationCount?: number;
  avatarInitials?: string;
};

const AgencyTopNavigation: React.FC<Props> = ({
  profileMenuOpen,
  onProfilePress,
  onNotificationPress,
  unreadNotificationCount = 0,
  avatarInitials = 'SR',
}) => {
  const { t } = useTranslation();
  return (
    <View style={styles.header}>
      <Image
        source={require('../../../assets/images/sentry-logo-horizontal.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.actions}>
        <ScalePressable
          style={styles.bell}
          onPress={onNotificationPress}
          disabled={!onNotificationPress}
          accessibilityLabel={t('superAdmin.notifications')}
        >
          <Feather name="bell" size={scaleFont(25)} color={colors.primary} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </ScalePressable>
        <ScalePressable
          style={styles.profileTrigger}
          onPress={onProfilePress}
          accessibilityLabel={t('dashboard.myProfile')}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitials}</Text>
            <View style={styles.online} />
          </View>
          <Feather
            name={profileMenuOpen ? 'chevron-up' : 'chevron-down'}
            size={scaleFont(22)}
            color={colors.primary}
          />
        </ScalePressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: scaleHeight(64),
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(14),
    backgroundColor: colors.white,
    zIndex: 30,
    elevation: 0,
  },
  logo: { width: scaleWidth(180), height: scaleHeight(180) },
  actions: { flexDirection: 'row', alignItems: 'center', gap: scaleWidth(10) },
  bell: { position: 'relative' },
  badge: {
    position: 'absolute',
    right: -scaleWidth(5),
    top: -scaleHeight(5),
    width: scaleWidth(13),
    height: scaleWidth(13),
    borderRadius: scaleWidth(7),
    backgroundColor: '#E50914',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.white, fontSize: scaleFont(8), fontWeight: '700' },
  profileTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(10),
  },
  avatar: {
    width: scaleWidth(39),
    height: scaleWidth(39),
    borderRadius: scaleWidth(20),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: scaleFont(15),
  },
  online: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: scaleWidth(11),
    height: scaleWidth(11),
    borderRadius: scaleWidth(6),
    backgroundColor: '#19B563',
    borderWidth: 1,
    borderColor: colors.white,
  },
});

export default AgencyTopNavigation;
