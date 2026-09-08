import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList, RootStackParamList } from '../../../navigation/types';
import { session } from '../../../services/session';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';

type Props = { onLogout?: () => void };

const Row = ({
  icon,
  label,
  right,
  active,
  danger,
  expanded,
  disabled,
  onPress,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  right?: string;
  active?: boolean;
  danger?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) => {
  const tint = danger ? '#F22121' : active ? '#2563EB' : colors.primary;
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75} disabled={disabled} accessibilityState={{ disabled }}>
      <Feather name={icon} size={scaleFont(21)} color={tint} />
      <Text style={[styles.rowLabel, { color: tint }]}>{label}</Text>
      <View style={styles.right}>
        {right ? <Text style={styles.rightText}>{right}</Text> : null}
        {active ? (
          <Feather name="check" size={scaleFont(19)} color="#2563EB" />
        ) : !danger ? (
          <Feather
            name={
              expanded === undefined
                ? 'chevron-right'
                : expanded
                ? 'chevron-up'
                : 'chevron-down'
            }
            size={scaleFont(20)}
            color={colors.primary}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const AgencyProfileMenu: React.FC<Props> = ({ onLogout }) => {
  const { i18n, t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const logoutPending = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logout = async () => {
    if (logoutPending.current) return;
    logoutPending.current = true;
    setLoggingOut(true);
    try {
      await session.clearToken();
      navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.reset({
        index: 0,
        routes: [{ name: 'AuthFlow' }],
      });
      onLogout?.();
    } catch {
      Alert.alert(t('dashboard.logOut'), t('dashboard.tryAgain'));
    } finally {
      logoutPending.current = false;
      setLoggingOut(false);
    }
  };
  const [appearance, setAppearance] = useState('Light');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const language =
    i18n.language === 'hi'
      ? 'Hindi'
      : i18n.language === 'pa'
      ? 'Punjabi'
      : 'English';
  const changeLanguage = (code: 'en' | 'hi' | 'pa') => {
    void i18n.changeLanguage(code);
    setLanguageOpen(false);
  };
  const selectAppearance = (value: 'Light' | 'Dark' | 'System') => {
    setAppearance(value);
    setAppearanceOpen(false);
  };
  return (
    <View style={styles.menu}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>SR</Text>
          <View style={styles.online} />
        </View>
        <View>
          <Text style={styles.name}>Agency Admin</Text>
          <Text style={styles.company}>Sentry Security Services</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Row icon="user" label={t('dashboard.myProfile')} />
      <Row icon="settings" label={t('dashboard.settings')} />
      <Row
        icon="globe"
        label={t('dashboard.language')}
        right={t(`dashboard.${language.toLowerCase()}`)}
        expanded={languageOpen}
        onPress={() => {
          setLanguageOpen(open => !open);
          setAppearanceOpen(false);
        }}
      />
      {languageOpen ? (
        <View style={[styles.dropdown, styles.languageDropdown]}>
          <Row
            icon="globe"
            label={t('dashboard.english')}
            active={language === 'English'}
            onPress={() => changeLanguage('en')}
          />
          <Row
            icon="type"
            label={t('dashboard.hindi')}
            right="हिंदी"
            active={language === 'Hindi'}
            onPress={() => changeLanguage('hi')}
          />
          <Row
            icon="type"
            label={t('dashboard.punjabi')}
            right="ਪੰਜਾਬੀ"
            active={language === 'Punjabi'}
            onPress={() => changeLanguage('pa')}
          />
        </View>
      ) : null}
      <View style={styles.divider} />
      <Row
        icon="sun"
        label={t('dashboard.appearance')}
        right={t(`dashboard.${appearance.toLowerCase()}`)}
        expanded={appearanceOpen}
        onPress={() => {
          setAppearanceOpen(open => !open);
          setLanguageOpen(false);
        }}
      />
      {appearanceOpen ? (
        <View style={[styles.dropdown, styles.appearanceDropdown]}>
          <Row
            icon="sun"
            label={t('dashboard.light')}
            active={appearance === 'Light'}
            onPress={() => selectAppearance('Light')}
          />
          <Row
            icon="moon"
            label={t('dashboard.dark')}
            active={appearance === 'Dark'}
            onPress={() => selectAppearance('Dark')}
          />
          <Row
            icon="monitor"
            label={t('dashboard.system')}
            active={appearance === 'System'}
            onPress={() => selectAppearance('System')}
          />
        </View>
      ) : null}
      <View style={styles.divider} />
      <Row
        icon="log-out"
        label={t('dashboard.logOut')}
        danger
        onPress={() => { void logout(); }}
        disabled={loggingOut}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  menu: {
    position: 'absolute',
    zIndex: 20,
    top: scaleHeight(68),
    right: scaleWidth(12),
    width: scaleWidth(198),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scaleWidth(8),
    paddingVertical: scaleHeight(8),
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 7,
    overflow: 'visible',
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(11),
    paddingBottom: scaleHeight(8),
  },
  avatar: {
    width: scaleWidth(30),
    height: scaleWidth(30),
    borderRadius: scaleWidth(15),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleWidth(9),
  },
  avatarText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: scaleFont(12),
  },
  online: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
    backgroundColor: '#16A34A',
  },
  name: { color: '#121212', fontSize: scaleFont(14), fontWeight: '700' },
  company: { color: '#3F3F3F', fontSize: scaleFont(10) },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E4E4E4',
    marginHorizontal: scaleWidth(11),
  },
  row: {
    height: scaleHeight(30),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(12),
    gap: scaleWidth(9),
  },
  rowLabel: { fontSize: scaleFont(14), flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: scaleWidth(5) },
  rightText: { fontSize: scaleFont(10), color: '#666' },
  dropdown: {
    position: 'absolute',
    left: scaleWidth(8),
    right: scaleWidth(8),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scaleWidth(7),
    paddingVertical: scaleHeight(3),
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 9,
    zIndex: 30,
  },
  languageDropdown: { top: scaleHeight(137) },
  appearanceDropdown: { top: scaleHeight(167) },
});

export default AgencyProfileMenu;
