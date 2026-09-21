import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuardDutyScreen from '../features/guard/screens/GuardDutyScreen';
import GuardReportScreen from '../features/guard/screens/GuardReportScreen';
import GuardPatrolScreen from '../features/guard/screens/GuardPatrolScreen';
import type { GuardStackParamList } from './types';

const Stack = createNativeStackNavigator<GuardStackParamList>();

const GuardNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuardDuty" component={GuardDutyScreen} />
    <Stack.Screen name="GuardReport" component={GuardReportScreen} />
    <Stack.Screen name="GuardPatrol" component={GuardPatrolScreen} />
  </Stack.Navigator>
);

export default GuardNavigator;
