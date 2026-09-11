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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import LanguageSelector from '../../../components/common/LanguageSelector';
import type {
  AuthStackParamList,
  RootStackParamList,
} from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { isValidEmail, passwordError } from '../../../utils/validation';
import { authService } from '../../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!isValidEmail(identifier.trim())) {
      Alert.alert(
        t('auth.invalidDetails'),
        t('auth.enterLinkedEmail'),
      );
      return;
    }

    const error = passwordError(password);
    if (error) {
      Alert.alert(t('auth.invalidPassword'), error);
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await authService.login(identifier.trim(), password);
      const accountType =
        response.admin?.account_type ?? response.user?.account_type;
      navigation
        .getParent<NativeStackNavigationProp<RootStackParamList>>()
        ?.reset({
          index: 0,
          routes: [
            {
              name: accountType === 'superAdmin'
                ? 'SuperAdminFlow'
                : accountType === 'client'
                ? 'ClientFlow'
                : 'MainFlow',
            },
          ],
        });
    } catch (loginError) {
      Alert.alert(
        t('auth.loginFailed'),
        loginError instanceof Error ? loginError.message : t('auth.tryAgain'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <LanguageSelector />

      <Image
        source={require('../../../assets/images/login-shield-logo.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      <Text style={styles.heading}>{t('auth.welcomeBack')}</Text>
      <Text style={styles.subtitle}>{t('auth.loginSubtitle')}</Text>

      <View style={styles.authTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeTabText}>{t('auth.login')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.inactiveTab}
          onPress={() => navigation.navigate('CreateAccount')}
        >
          <Text style={styles.inactiveTabText}>{t('auth.createAccount')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.identifierLabel}>{t('auth.emailAddress')}</Text>
      <View style={[styles.inputWrapper, styles.identifierInput]}>
        <Feather name="user" size={scaleFont(24)} color="#A3A3A3" />
        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          style={styles.input}
          placeholder="abc@example.com"
          placeholderTextColor="#A3A3A3"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
      </View>

      <Text style={styles.passwordLabel}>{t('auth.password')}</Text>
      <View style={[styles.inputWrapper, styles.passwordInput]}>
        <Feather name="lock" size={scaleFont(24)} color="#A3A3A3" />
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder={t('auth.enterPassword')}
          placeholderTextColor="#A3A3A3"
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setPasswordVisible(current => !current)}
          accessibilityLabel={
            passwordVisible ? t('auth.hidePassword') : t('auth.showPassword')
          }
        >
          <Feather
            name={passwordVisible ? 'eye-off' : 'eye'}
            size={scaleFont(24)}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.forgotButton}
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        <Text style={styles.forgotText}>{t('auth.forgotPassword')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.loginButton, isSubmitting && styles.disabledButton]}
        onPress={handleLogin}
        disabled={isSubmitting}
      >
        <Text style={styles.loginButtonText}>
          {isSubmitting ? t('auth.loggingIn') : t('auth.login')}
        </Text>
      </TouchableOpacity>

      <Text style={styles.continueText}>{t('auth.orContinueWith')}</Text>

      <View style={styles.socialRow}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require('../../../assets/images/google-logo.png')}
            style={styles.googleLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require('../../../assets/images/apple-logo.png')}
            style={styles.appleLogo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton}>
          <Feather name="phone" size={scaleFont(49)} color="#000000" />
        </TouchableOpacity>
      </View>

      <View style={styles.signupRow}>
        <Text style={styles.signupPrompt}>{t('auth.noAccount')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
          <Text style={styles.signupLink}> {t('auth.signUp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  logo: {
    position: 'absolute',
    left: scaleWidth(150),
    top: scaleHeight(78),
    width: scaleWidth(101),
    height: scaleHeight(101),
  },
  heading: {
    position: 'absolute',
    left: scaleWidth(34),
    top: scaleHeight(181),
    width: scaleWidth(333),
    textAlign: 'center',
    fontSize: scaleFont(42),
    lineHeight: scaleFont(51),
    fontWeight: '800',
    color: colors.primary,
  },
  subtitle: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(237),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: colors.primary,
  },
  authTabs: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(289),
    width: scaleWidth(363),
    height: scaleHeight(45),
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  activeTab: {
    width: scaleWidth(183),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  activeTabText: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: colors.white,
  },
  inactiveTabText: {
    fontSize: scaleFont(20),
    fontWeight: '600',
    color: colors.primary,
  },
  identifierLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(356),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  passwordLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(461),
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
  identifierInput: { top: scaleHeight(394) },
  passwordInput: { top: scaleHeight(497) },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: scaleWidth(8),
    paddingVertical: 0,
    fontSize: scaleFont(16),
    color: colors.primary,
  },
  eyeButton: {
    paddingHorizontal: scaleWidth(16),
    height: '100%',
    justifyContent: 'center',
  },
  forgotButton: {
    position: 'absolute',
    right: scaleWidth(20),
    top: scaleHeight(564),
  },
  forgotText: {
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    fontWeight: '700',
    color: '#2563EB',
  },
  loginButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(612),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.65 },
  loginButtonText: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: colors.white,
  },
  continueText: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(683),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    color: colors.primary,
  },
  socialRow: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(718),
    flexDirection: 'row',
    gap: scaleWidth(9),
  },
  socialButton: {
    width: scaleWidth(115),
    height: scaleHeight(75),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  googleLogo: { width: scaleWidth(100), height: scaleHeight(67) },
  appleLogo: { width: scaleWidth(115), height: scaleHeight(65) },
  signupRow: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(824),
    width: scaleWidth(355),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupPrompt: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: colors.primary,
  },
  signupLink: { fontSize: scaleFont(20), fontWeight: '700', color: '#2563EB' },
});

export default LoginScreen;
