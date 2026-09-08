import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import SuperAdminTopNavigation from '../components/SuperAdminTopNavigation';
import SuperAdminBottomNavigation, { AdminTab } from '../components/SuperAdminBottomNavigation';
import AgencyProfileMenu from '../../dashboard/components/AgencyProfileMenu';
import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { scaleFont } from '../../../styles/dimensions';

export default function SuperAdminScreen() {
  const [tab, setTab] = useState<AdminTab>('agencies');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  return <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
    <SuperAdminTopNavigation
      profileMenuOpen={profileMenuOpen}
      onProfilePress={() => setProfileMenuOpen(open => !open)}
    />
    <ScrollView contentContainerStyle={s.content}>
      {tab === 'agencies' && <>
        <View style={s.metrics}>{['Agencies', 'Guards', 'Clients'].map(label => <View key={label} style={s.metric}><Text style={s.value}>—</Text><Text style={s.body}>{label}</Text></View>)}</View>
        <ScalePressable
          style={s.addAgencyButton}
          accessibilityRole="button"
          accessibilityLabel="Add new agency"
        >
          <Feather name="plus" size={scaleFont(20)} color={colors.white} />
          <Text style={s.addAgencyText}>Add New Agency</Text>
        </ScalePressable>
        <ScalePressable
          style={s.reviewButton}
          onPress={() => setTab('approval')}
          accessibilityRole="button"
        >
          <Text style={s.reviewButtonText}>Review approvals</Text>
          <Feather name="arrow-right" size={scaleFont(20)} color={colors.primary} />
        </ScalePressable>
        <Text style={s.section}>Agency directory</Text>
      </>}
      <View style={s.empty}><View style={s.emptyIcon}><Feather name={tab === 'approval' ? 'check-square' : tab === 'live' ? 'activity' : tab === 'profile' ? 'user' : 'grid'} size={28} color={colors.primary} /></View>
        <Text style={s.emptyTitle}>{tab === 'approval' ? 'Registration reviews' : tab === 'live' ? 'Your network at a glance' : tab === 'profile' ? 'Super Admin' : 'Your agency network'}</Text>
        <Text style={s.body}>{tab === 'approval' ? 'Agency approval requests will appear here when the approval service is available.' : tab === 'live' ? 'Live reporting is not available yet.' : tab === 'profile' ? 'Administrator account details are not available yet.' : 'Agency records are not available yet.'}</Text>
      </View>
    </ScrollView>
    <SuperAdminBottomNavigation activeTab={tab} onTabPress={setTab} />
    {profileMenuOpen ? <Pressable style={s.menuBackdrop} onPress={() => setProfileMenuOpen(false)} /> : null}
    {profileMenuOpen ? <AgencyProfileMenu
      identity={{ name: 'Super Admin', company: 'Sentry Security Services', initials: 'SA' }}
      onMyProfile={() => { setTab('profile'); setProfileMenuOpen(false); }}
      onLogout={() => setProfileMenuOpen(false)}
    /> : null}
  </SafeAreaView>;
}
const s = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.white }, content: { padding: spacing.md, gap: spacing.md }, metrics: { flexDirection: 'row', gap: spacing.sm }, metric: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.sm, padding: spacing.md }, value: { color: colors.primary, fontSize: scaleFont(typography.sizes.xxl), fontWeight: typography.weights.bold }, body: { color: colors.textGray, fontSize: scaleFont(typography.sizes.sm), lineHeight: 22 }, addAgencyButton: { minHeight: 52, borderRadius: spacing.sm, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm }, addAgencyText: { color: colors.white, fontSize: scaleFont(typography.sizes.lg), fontWeight: typography.weights.bold }, reviewButton: { minHeight: 48, borderWidth: 1, borderColor: colors.primary, borderRadius: spacing.sm, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, reviewButtonText: { color: colors.primary, fontSize: scaleFont(typography.sizes.md), fontWeight: typography.weights.semiBold }, section: { color: colors.primary, fontSize: scaleFont(typography.sizes.lg), fontWeight: typography.weights.semiBold }, empty: { borderWidth: 1, borderColor: colors.border, borderRadius: spacing.md, padding: spacing.lg, gap: spacing.md }, emptyIcon: { alignSelf: 'flex-start', padding: spacing.md, backgroundColor: colors.light.background, borderRadius: spacing.md }, emptyTitle: { color: colors.primary, fontSize: scaleFont(typography.sizes.lg), fontWeight: typography.weights.semiBold }, menuBackdrop: { ...StyleSheet.absoluteFill, zIndex: 10 } });
