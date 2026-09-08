import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import SuperAdminTopNavigation from '../components/SuperAdminTopNavigation';
import SuperAdminBottomNavigation, { AdminTab } from '../components/SuperAdminBottomNavigation';
import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { scaleFont } from '../../../styles/dimensions';

export default function SuperAdminScreen() {
  const [tab, setTab] = useState<AdminTab>('agencies');
  const titles = { agencies: 'Agency management', approval: 'Agency approvals', live: 'Live status', profile: 'Administrator profile' };
  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
    <SuperAdminTopNavigation profileMenuOpen={tab === 'profile'} onProfilePress={() => setTab('profile')} />
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.role}><Feather name="shield" size={16} color={colors.primary} /><Text style={s.eyebrow}>SUPER ADMIN</Text></View>
      <Text style={s.title}>{titles[tab]}</Text>
      <Text style={s.subtitle}>Oversee your security network.</Text>
      {tab === 'agencies' && <>
        <View style={s.hero}><Text style={s.heroTitle}>A trusted network starts here</Text><Text style={s.heroCopy}>Review agency registrations and manage access from one place.</Text><ScalePressable style={s.action} onPress={() => setTab('approval')}><Text style={s.actionText}>Review approvals</Text><Feather name="arrow-right" size={20} color={colors.primary} /></ScalePressable></View>
        <View style={s.metrics}>{['Agencies', 'Guards', 'Clients'].map(label => <View key={label} style={s.metric}><Text style={s.value}>—</Text><Text style={s.body}>{label}</Text></View>)}</View>
        <Text style={s.section}>Agency directory</Text>
      </>}
      <View style={s.empty}><View style={s.emptyIcon}><Feather name={tab === 'approval' ? 'check-square' : tab === 'live' ? 'activity' : tab === 'profile' ? 'user' : 'grid'} size={28} color={colors.primary} /></View>
        <Text style={s.emptyTitle}>{tab === 'approval' ? 'Registration reviews' : tab === 'live' ? 'Your network at a glance' : tab === 'profile' ? 'Super Admin' : 'Your agency network'}</Text>
        <Text style={s.body}>{tab === 'approval' ? 'Agency approval requests will appear here when the approval service is available.' : tab === 'live' ? 'Live reporting is not available yet.' : tab === 'profile' ? 'Administrator account details are not available yet.' : 'Agency records are not available yet.'}</Text>
      </View>
    </ScrollView>
    <SuperAdminBottomNavigation activeTab={tab} onTabPress={setTab} />
  </SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.white }, content: { padding: spacing.md, gap: spacing.md }, role: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, eyebrow: { fontSize: scaleFont(typography.sizes.xs), fontWeight: typography.weights.bold, color: colors.primary }, title: { color: colors.primary, fontSize: scaleFont(typography.sizes.xxl), fontWeight: typography.weights.bold }, subtitle: { color: colors.textGray, fontSize: scaleFont(typography.sizes.md) }, hero: { backgroundColor: colors.primary, borderRadius: spacing.md, padding: spacing.lg, gap: spacing.md }, heroTitle: { color: colors.white, fontSize: scaleFont(typography.sizes.xl), fontWeight: typography.weights.bold }, heroCopy: { color: colors.white, fontSize: scaleFont(typography.sizes.sm), lineHeight: 22 }, action: { backgroundColor: colors.gold, minHeight: 48, borderRadius: spacing.sm, padding: spacing.sm, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, actionText: { color: colors.primary, fontSize: scaleFont(typography.sizes.sm), fontWeight: typography.weights.bold }, metrics: { flexDirection: 'row', gap: spacing.sm }, metric: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.sm, padding: spacing.md }, value: { color: colors.primary, fontSize: scaleFont(typography.sizes.xxl), fontWeight: typography.weights.bold }, body: { color: colors.textGray, fontSize: scaleFont(typography.sizes.sm), lineHeight: 22 }, section: { color: colors.primary, fontSize: scaleFont(typography.sizes.lg), fontWeight: typography.weights.semiBold }, empty: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.md, padding: spacing.lg, gap: spacing.md }, emptyIcon: { alignSelf: 'flex-start', padding: spacing.md, backgroundColor: colors.light.background, borderRadius: spacing.md }, emptyTitle: { color: colors.primary, fontSize: scaleFont(typography.sizes.lg), fontWeight: typography.weights.semiBold } });
