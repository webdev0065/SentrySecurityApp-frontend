import React from 'react';
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

import LanguageSelector from '../../../components/common/LanguageSelector';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';

type Props = NativeStackScreenProps<AuthStackParamList, 'AccountCreated'>;

const DOTS = [
  { left: 99, top: 207, color: '#35C759' },
  { left: 83, top: 240, color: '#FFB800' },
  { left: 96, top: 280, color: '#0B1F3A' },
  { left: 84, top: 316, color: '#FFB800' },
  { left: 96, top: 349, color: '#35C759' },
  { left: 87, top: 385, color: '#0B1F3A' },
  { left: 107, top: 415, color: '#FFB800' },
  { left: 288, top: 207, color: '#FFB800' },
  { left: 308, top: 237, color: '#0B1F3A' },
  { left: 300, top: 273, color: '#35C759' },
  { left: 308, top: 306, color: '#FFB800' },
  { left: 300, top: 341, color: '#0B1F3A' },
  { left: 311, top: 382, color: '#FFB800' },
  { left: 296, top: 415, color: '#35C759' },
];

const AccountCreatedScreen: React.FC<Props> = ({ navigation }) => (
  <View style={styles.container}>
    <StatusBar barStyle="dark-content" />

    <LanguageSelector />

    {DOTS.map((dot, index) => (
      <View
        key={index}
        style={[
          styles.confettiDot,
          {
            left: scaleWidth(dot.left),
            top: scaleHeight(dot.top),
            backgroundColor: dot.color,
          },
        ]}
      />
    ))}

    <Image
      source={require('../../../assets/images/login-shield-logo.png')}
      style={styles.successShield}
      resizeMode="contain"
    />
    <View style={styles.successBadge}>
      <Feather name="check" size={scaleFont(34)} color={colors.white} />
    </View>

    <Text style={styles.heading}>Account Created{`\n`}Successfully!</Text>
    <Text style={styles.subtitle}>
      Your account has been created.{`\n`}You can now login and explore{`\n`}the
      app.
    </Text>

    <TouchableOpacity
      style={styles.loginButton}
      onPress={() => navigation.popToTop()}
    >
      <Text style={styles.loginButtonText}>Go to Login</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  confettiDot: {
    position: 'absolute',
    width: scaleWidth(8),
    height: scaleHeight(8),
    borderRadius: 100,
  },
  successShield: {
    position: 'absolute',
    left: scaleWidth(100),
    top: scaleHeight(218),
    width: scaleWidth(202),
    height: scaleHeight(202),
  },
  successBadge: {
    position: 'absolute',
    left: scaleWidth(239),
    top: scaleHeight(222),
    width: scaleWidth(59),
    height: scaleHeight(59),
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#35C759',
  },
  heading: {
    position: 'absolute',
    left: scaleWidth(27),
    top: scaleHeight(465),
    width: scaleWidth(348),
    textAlign: 'center',
    fontSize: scaleFont(32),
    lineHeight: scaleFont(39),
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(551),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(29),
    color: colors.primary,
  },
  loginButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(782),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  loginButtonText: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: colors.white,
  },
});

export default AccountCreatedScreen;
