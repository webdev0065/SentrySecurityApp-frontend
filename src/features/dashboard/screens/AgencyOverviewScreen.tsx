import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../styles/colors';

const AgencyOverviewScreen: React.FC = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Welcome</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  title: { color: colors.primary, fontSize: 24, fontWeight: '700' },
});

export default AgencyOverviewScreen;
