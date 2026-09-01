import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight } from '../../../styles/dimensions';

export type AgencyNavTab = 'overview' | 'guards' | 'sites' | 'incidents' | 'plan' | 'profile';

type Props = { activeTab: AgencyNavTab; onTabPress?: (tab: AgencyNavTab) => void };

const tabs: Array<{ key: AgencyNavTab; label: string; icon: React.ComponentProps<typeof Feather>['name'] }> = [
  { key: 'overview', label: 'Overview', icon: 'home' }, { key: 'guards', label: 'Guard', icon: 'users' },
  { key: 'sites', label: 'Sites', icon: 'grid' }, { key: 'incidents', label: 'Incidents', icon: 'alert-triangle' },
  { key: 'plan', label: 'Plan', icon: 'calendar' }, { key: 'profile', label: 'Profile', icon: 'user' },
];

const AgencyBottomNavigation: React.FC<Props> = ({ activeTab, onTabPress }) => (
  <View style={styles.container}>
    {tabs.map(tab => {
      const active = tab.key === activeTab;
      return <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress?.(tab.key)} accessibilityRole="tab" accessibilityState={{ selected: active }}>
        <Feather name={tab.icon} size={scaleFont(28)} color={active ? '#2563EB' : colors.primary} />
        <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
      </TouchableOpacity>;
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: scaleHeight(69),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: scaleHeight(2) },
  label: { fontWeight: '600', color: colors.primary, fontSize: scaleFont(11) },
  activeLabel: { color: '#2563EB' },
});

export default AgencyBottomNavigation;
