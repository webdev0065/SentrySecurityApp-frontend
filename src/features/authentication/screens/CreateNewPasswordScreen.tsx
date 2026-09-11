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
import { useTranslation } from 'react-i18next';

import LanguageSelector from '../../../components/common/LanguageSelector';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { passwordError } from '../../../utils/validation';
import { authService } from '../../../services/authService';
import { session } from '../../../services/session';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateNewPassword'>;

const CreateNewPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResetPassword = async () => {
    const error = passwordError(newPassword);
    if (error) {
      Alert.alert(t('auth.invalidPassword'), error);
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        t('auth.passwordsMismatch'),
        'Confirm password must match the new password.',
      );
      return;
    }
    try {
      setIsSubmitting(true);
      const identifier = await session.getPendingIdentifier();
      if (!identifier)
        throw new Error('Your reset session has expired. Request a new OTP.');
      await authService.resetPassword(identifier, newPassword, confirmPassword);
      navigation.navigate('PasswordUpdated');
    } catch (error) {
      Alert.alert(
        'Could not reset password',
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
        accessibilityLabel={t('auth.goBack')}
      >
        <Feather name="arrow-left" size={scaleFont(26)} color="#000000" />
      </TouchableOpacity>

      <LanguageSelector />

      <Image
        source={require('../../../assets/images/login-shield-logo.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      <Text style={styles.heading}>Create New{`\n`}Password</Text>
      <Text style={styles.subtitle}>{t('auth.newPasswordSubtitle')}</Text>

      <Text style={styles.newPasswordLabel}>{t('auth.newPassword')}</Text>
      <View style={[styles.inputWrapper, styles.newPasswordInput]}>
        <Feather name="lock" size={scaleFont(24)} color="#A3A3A3" />
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          placeholder={t('auth.enterNewPassword')}
          placeholderTextColor="#A3A3A3"
          secureTextEntry={!newPasswordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setNewPasswordVisible(current => !current)}
          accessibilityLabel={
            newPasswordVisible ? 'Hide password' : 'Show password'
          }
        >
          <Feather
            name={newPasswordVisible ? 'eye-off' : 'eye'}
            size={scaleFont(24)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.confirmPasswordLabel}>{t('auth.confirmPassword')}</Text>
      <View style={[styles.inputWrapper, styles.confirmPasswordInput]}>
        <Feather name="lock" size={scaleFont(24)} color="#A3A3A3" />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholder={t('auth.confirmNewPassword')}
          placeholderTextColor="#A3A3A3"
          secureTextEntry={!confirmPasswordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setConfirmPasswordVisible(current => !current)}
          accessibilityLabel={
            confirmPasswordVisible ? 'Hide password' : 'Show password'
          }
        >
          <Feather
            name={confirmPasswordVisible ? 'eye-off' : 'eye'}
            size={scaleFont(24)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.resetButton, isSubmitting && { opacity: 0.65 }]}
        onPress={handleResetPassword}
        disabled={isSubmitting}
      >
        <Text style={styles.resetButtonText}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Text>
      </TouchableOpacity>

      <View style={styles.rememberRow}>
        <Text style={styles.rememberText}>{t('auth.rememberPassword')}</Text>
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Text style={styles.loginLink}> {t('auth.login')}</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
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
    top: scaleHeight(187),
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
    top: scaleHeight(295),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: colors.primary,
  },
  newPasswordLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(389),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  confirmPasswordLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(488),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  inputWrapper: {
    position: 'absolute',
    left: scaleWidth(19),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: scaleWidth(13),
  },
  newPasswordInput: { top: scaleHeight(419) },
  confirmPasswordInput: { top: scaleHeight(519) },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: scaleWidth(8),
    paddingVertical: 0,
    fontSize: scaleFont(16),
    color: colors.primary,
  },
  eyeButton: {
    height: '100%',
    paddingHorizontal: scaleWidth(16),
    justifyContent: 'center',
  },
  resetButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(647),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  resetButtonText: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: colors.white,
  },
  rememberRow: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(792),
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

export default CreateNewPasswordScreen;
