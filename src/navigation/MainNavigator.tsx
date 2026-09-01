import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AgencyOverviewScreen from '../features/dashboard/screens/AgencyOverviewScreen';

import { MainStackParamList } from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AgencyOverview" component={AgencyOverviewScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
