import React, { useState } from 'react';
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

import LanguageSelector from '../../../components/common/LanguageSelector';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { isValidIdentifier } from '../../../utils/validation';
import { authService } from '../../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async () => {
    if (!isValidIdentifier(identifier)) {
      Alert.alert(
        'Invalid details',
        'Enter a valid email address or mobile number.',
      );
      return;
    }
    try {
      setIsSubmitting(true);
      await authService.requestPasswordReset(identifier.trim());
      navigation.navigate('VerifyOTP');
    } catch (error) {
      Alert.alert(
        'Could not send OTP',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <Feather name="arrow-left" size={scaleFont(26)} color="#000000" />
      </TouchableOpacity>

      <LanguageSelector />

      <Image
        source={require('../../../assets/images/login-shield-logo.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      <Text style={styles.heading}>Forgot Password</Text>
      <Text style={styles.subtitle}>
        Enter your registered mobile number{`\n`}or email address
      </Text>

      <Text style={styles.identifierLabel}>Email or Mobile Number</Text>
      <View style={styles.inputWrapper}>
        <Feather name="user" size={scaleFont(24)} color="#A3A3A3" />
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          style={styles.input}
          placeholder="you@example.com or +91 98765 43210"
          placeholderTextColor="#A3A3A3"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        style={[styles.sendOtpButton, isSubmitting && { opacity: 0.65 }]}
        onPress={handleSendOtp}
        disabled={isSubmitting}
      >
        <Text style={styles.sendOtpText}>
          {isSubmitting ? 'Sending...' : 'Send OTP'}
        </Text>
      </TouchableOpacity>

      <View style={styles.rememberRow}>
        <Text style={styles.rememberText}>Remember your password?</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.loginLink}> Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  backButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(50),
    width: scaleWidth(26),
    height: scaleHeight(26),
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    left: scaleWidth(150),
    top: scaleHeight(80),
    width: scaleWidth(101),
    height: scaleHeight(101),
  },
  heading: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(198),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(42),
    lineHeight: scaleFont(51),
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(254),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: colors.primary,
  },
  identifierLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(395),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  inputWrapper: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(433),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: scaleWidth(13),
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: scaleWidth(8),
    paddingVertical: 0,
    fontSize: scaleFont(16),
    color: colors.primary,
  },
  sendOtpButton: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(527),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOtpText: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: colors.white,
  },
  rememberRow: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(788),
    width: scaleWidth(355),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rememberText: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: colors.primary,
  },
  loginLink: { fontSize: scaleFont(20), fontWeight: '700', color: '#2563EB' },
});

export default ForgotPasswordScreen;
