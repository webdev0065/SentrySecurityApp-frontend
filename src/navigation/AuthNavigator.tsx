import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../features/authentication/screens/LoginScreen';
import CreateAccountScreen from '../features/authentication/screens/CreateAccountScreen';
import AgencyDetailsScreen from '../features/authentication/screens/AgencyDetailsScreen';
import ClientDetailsScreen from '../features/authentication/screens/ClientDetailsScreen';
import VerifyMobileScreen from '../features/authentication/screens/VerifyMobileScreen';
import AccountCreatedScreen from '../features/authentication/screens/AccountCreatedScreen';
import ForgotPasswordScreen from '../features/authentication/screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../features/authentication/screens/VerifyOTPScreen';
import CreateNewPasswordScreen from '../features/authentication/screens/CreateNewPasswordScreen';
import PasswordUpdatedScreen from '../features/authentication/screens/PasswordUpdatedScreen';

import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <Stack.Screen name="AgencyDetails" component={AgencyDetailsScreen} />
      <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} />
      <Stack.Screen name="VerifyMobile" component={VerifyMobileScreen} />
      <Stack.Screen name="AccountCreated" component={AccountCreatedScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPasswordScreen}
      />
      <Stack.Screen name="PasswordUpdated" component={PasswordUpdatedScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
