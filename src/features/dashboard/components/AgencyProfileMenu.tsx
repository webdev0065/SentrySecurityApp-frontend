import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';

type Props = { onLogout?: () => void };

const Row = ({ icon, label, right, active, danger, onPress }: { icon: React.ComponentProps<typeof Feather>['name']; label: string; right?: string; active?: boolean; danger?: boolean; onPress?: () => void }) => {
  const tint = danger ? '#F22121' : active ? '#2563EB' : colors.primary;
  return <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.75}><Feather name={icon} size={scaleFont(21)} color={tint} /><Text style={[styles.rowLabel, { color: tint }]}>{label}</Text><View style={styles.right}>{right ? <Text style={styles.rightText}>{right}</Text> : null}{active ? <Feather name="check" size={scaleFont(19)} color="#2563EB" /> : !danger ? <Feather name="chevron-right" size={scaleFont(20)} color={colors.primary} /> : null}</View></TouchableOpacity>;
};

const AgencyProfileMenu: React.FC<Props> = ({ onLogout }) => {
  const [language, setLanguage] = useState('English');
  const [appearance, setAppearance] = useState('Light');
  return <View style={styles.menu}>
    <View style={styles.identity}><View style={styles.avatar}><Text style={styles.avatarText}>SR</Text><View style={styles.online} /></View><View><Text style={styles.name}>Agency Admin</Text><Text style={styles.company}>Sentry Security Services</Text></View></View>
    <View style={styles.divider} />
    <Row icon="user" label="My Profile" /><Row icon="settings" label="Settings" />
    <Row icon="globe" label="Language" right={language} />
    <View style={styles.options}><Row icon="globe" label="English" active={language === 'English'} onPress={() => setLanguage('English')} /><Row icon="type" label="Hindi" right="हिंदी" active={language === 'Hindi'} onPress={() => setLanguage('Hindi')} /><Row icon="type" label="Punjabi" right="ਪੰਜਾਬੀ" active={language === 'Punjabi'} onPress={() => setLanguage('Punjabi')} /></View>
    <View style={styles.divider} />
    <Row icon="sun" label="Appearance" right={appearance} />
    <View style={styles.options}><Row icon="sun" label="Light" active={appearance === 'Light'} onPress={() => setAppearance('Light')} /><Row icon="moon" label="Dark" active={appearance === 'Dark'} onPress={() => setAppearance('Dark')} /><Row icon="monitor" label="System" active={appearance === 'System'} onPress={() => setAppearance('System')} /></View>
    <View style={styles.divider} /><Row icon="log-out" label="Log Out" danger onPress={onLogout} />
  </View>;
};

const styles = StyleSheet.create({
  menu: { position: 'absolute', zIndex: 20, top: scaleHeight(68), right: scaleWidth(12), width: scaleWidth(198), backgroundColor: colors.white, borderWidth: 1, borderColor: '#D9D9D9', borderRadius: scaleWidth(8), paddingVertical: scaleHeight(8), shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 7 },
  identity: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scaleWidth(11), paddingBottom: scaleHeight(8) }, avatar: { width: scaleWidth(30), height: scaleWidth(30), borderRadius: scaleWidth(15), backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: scaleWidth(9) }, avatarText: { color: colors.white, fontWeight: '700', fontSize: scaleFont(12) }, online: { position: 'absolute', right: -1, bottom: 0, width: scaleWidth(8), height: scaleWidth(8), borderRadius: scaleWidth(4), backgroundColor: '#16A34A' }, name: { color: '#121212', fontSize: scaleFont(14), fontWeight: '700' }, company: { color: '#3F3F3F', fontSize: scaleFont(10) }, divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E4E4E4', marginHorizontal: scaleWidth(11) }, row: { height: scaleHeight(30), flexDirection: 'row', alignItems: 'center', paddingHorizontal: scaleWidth(12), gap: scaleWidth(9) }, rowLabel: { fontSize: scaleFont(14), flex: 1 }, right: { flexDirection: 'row', alignItems: 'center', gap: scaleWidth(5) }, rightText: { fontSize: scaleFont(10), color: '#666' }, options: { paddingVertical: scaleHeight(2) },
});

export default AgencyProfileMenu;
