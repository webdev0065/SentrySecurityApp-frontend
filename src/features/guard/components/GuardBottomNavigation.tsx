import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';

export type GuardTab = 'duty' | 'schedule' | 'patrol' | 'report' | 'profile';
type Props = { activeTab: GuardTab; onTabPress: (tab: GuardTab) => void };

const tabs: Array<{
  key: GuardTab;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
}> = [
  { key: 'duty', label: 'Duty', icon: 'clock' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar' },
  { key: 'patrol', label: 'Patrol', icon: 'map-pin' },
  { key: 'report', label: 'Report', icon: 'file-text' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

const GuardBottomNavigation: React.FC<Props> = ({ activeTab, onTabPress }) => (
  <View style={styles.container} accessibilityRole="tablist">
    {tabs.map(tab => {
      const active = tab.key === activeTab;
      return (
        <ScalePressable
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: active }}
          accessibilityLabel={tab.label}
        >
          <View pointerEvents="none" style={styles.tabContent}>
            <Feather
              name={tab.icon}
              size={scaleFont(25)}
              color={active ? colors.status.info : colors.primary}
            />
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </View>
        </ScalePressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: scaleHeight(69),
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: scaleFont(typography.sizes.xs),
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  activeLabel: { color: colors.status.info },
});

export default GuardBottomNavigation;
