import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SuperAdminScreen from '../features/superAdmin/screens/SuperAdminScreen';
import ClientPortalScreen from '../features/client/screens/ClientPortalScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="OnboardingFlow"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="OnboardingFlow" component={OnboardingNavigator} />
        <Stack.Screen name="AuthFlow" component={AuthNavigator} />
        <Stack.Screen name="MainFlow" component={MainNavigator} />
        <Stack.Screen name="SuperAdminFlow" component={SuperAdminScreen} />
        <Stack.Screen name="ClientFlow" component={ClientPortalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
