import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { typography } from '../../../styles/typography';
import { spacing } from '../../../styles/spacing';
import { scaleFont, scaleHeight } from '../../../styles/dimensions';

export type AdminTab = 'agencies' | 'approval' | 'live' | 'profile';
const tabs = [
  { key: 'agencies', label: 'Dashboard', icon: 'layout' },
  { key: 'approval', label: 'Approval', icon: 'check-square' },
  { key: 'live', label: 'Live Status', icon: 'activity' },
  { key: 'profile', label: 'Profile', icon: 'user' },
] as const;
export default function SuperAdminBottomNavigation({
  activeTab,
  onTabPress,
}: {
  activeTab: AdminTab;
  onTabPress: (tab: AdminTab) => void;
}) {
  return (
    <View style={s.bar}>
      {tabs.map(tab => (
        <ScalePressable
          key={tab.key}
          style={s.tab}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab.key === activeTab }}
          onPress={() => onTabPress(tab.key)}
        >
          <Feather
            name={tab.icon}
            size={24}
            color={tab.key === activeTab ? colors.status.info : colors.primary}
          />
          <Text style={[s.label, tab.key === activeTab && s.active]}>
            {tab.label}
          </Text>
        </ScalePressable>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    minHeight: scaleHeight(69),
    padding: spacing.sm,
    gap: spacing.xs,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    fontSize: scaleFont(typography.sizes.xs),
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  active: { color: colors.status.info },
});
