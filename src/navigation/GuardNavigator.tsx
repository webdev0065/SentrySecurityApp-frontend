import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GuardDutyScreen from '../features/guard/screens/GuardDutyScreen';
import GuardReportScreen from '../features/guard/screens/GuardReportScreen';
import GuardPatrolScreen from '../features/guard/screens/GuardPatrolScreen';
import GuardProfileScreen from '../features/guard/screens/GuardProfileScreen';
import GuardPersonalInfoScreen from '../features/guard/screens/GuardPersonalInfoScreen';
import GuardDocumentsScreen from '../features/guard/screens/GuardDocumentsScreen';
import GuardBankDetailsScreen from '../features/guard/screens/GuardBankDetailsScreen';
import GuardSalaryScreen from '../features/guard/screens/GuardSalaryScreen';
import GuardEmergencyContactScreen from '../features/guard/screens/GuardEmergencyContactScreen';
import GuardSectionScreen from '../features/guard/screens/GuardSectionScreen';
import type { GuardStackParamList } from './types';

const Stack = createNativeStackNavigator<GuardStackParamList>();

const GuardNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuardDuty" component={GuardDutyScreen} />
    <Stack.Screen name="GuardReport" component={GuardReportScreen} />
    <Stack.Screen name="GuardPatrol" component={GuardPatrolScreen} />
    <Stack.Screen name="GuardProfile" component={GuardProfileScreen} />
    <Stack.Screen
      name="GuardPersonalInfo"
      component={GuardPersonalInfoScreen}
    />
    <Stack.Screen name="GuardDocuments" component={GuardDocumentsScreen} />
    <Stack.Screen name="GuardBankDetails" component={GuardBankDetailsScreen} />
    <Stack.Screen name="GuardSalary" component={GuardSalaryScreen} />
    <Stack.Screen
      name="GuardEmergencyContact"
      component={GuardEmergencyContactScreen}
    />
    <Stack.Screen name="GuardSection" component={GuardSectionScreen} />
  </Stack.Navigator>
);

export default GuardNavigator;
