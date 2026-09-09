import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
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

import LanguageSelector from '../../../components/common/LanguageSelector';
import type {
  AuthStackParamList,
  RootStackParamList,
} from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import {
  isValidEmail,
  isValidIndianMobile,
  passwordError,
  digitsOnly,
} from '../../../utils/validation';
import { authService } from '../../../services/authService';

type Props = NativeStackScreenProps<AuthStackParamList, 'CreateAccount'>;
type AccountType = 'agency' | 'client';

const CreateAccountScreen: React.FC<Props> = ({ navigation, route }) => {
  const forceAccountType = route.params?.forceAccountType;
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>(
    forceAccountType ?? 'agency',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cancel = () => {
    if (forceAccountType === 'agency') {
      navigation
        .getParent<NativeStackNavigationProp<RootStackParamList>>()
        ?.reset({
          index: 0,
          routes: [{ name: 'SuperAdminFlow' }],
        });
      return;
    }
    navigation.goBack();
  };

  const handleContinue = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid name', 'Enter your full name.');
      return;
    }
    if (!isValidIndianMobile(mobile)) {
      Alert.alert(
        'Invalid mobile number',
        'Enter a valid 10-digit Indian mobile number.',
      );
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Invalid email address', 'Enter a valid email address.');
      return;
    }
    const error = passwordError(password);
    if (error) {
      Alert.alert('Invalid password', error);
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        'Passwords do not match',
        'Confirm password must match the password.',
      );
      return;
    }
    try {
      setIsSubmitting(true);
      await authService.startRegistration(
        {
          full_name: name.trim(),
          mobile_number: mobile,
          email: email.trim().toLowerCase(),
          password,
          account_type: accountType,
        },
        forceAccountType === 'agency' ? 'superAdmin' : 'self',
      );
      navigation.navigate(
        accountType === 'agency' ? 'AgencyDetails' : 'ClientDetails',
      );
    } catch (error) {
      Alert.alert(
        'Could not create account',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <LanguageSelector />

        {forceAccountType ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={cancel}
            accessibilityLabel="Back to Super Admin"
          >
            <Feather
              name="arrow-left"
              size={scaleFont(26)}
              color={colors.primary}
            />
          </TouchableOpacity>
        ) : null}

        <Image
          source={require('../../../assets/images/login-shield-logo.png')}
          style={styles.logo}
          resizeMode="cover"
        />

        <Text style={styles.heading}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in your details to get started</Text>

        {!forceAccountType ? (
          <View style={styles.authTabs}>
            <TouchableOpacity style={styles.inactiveTab} onPress={cancel}>
              <Text style={styles.inactiveTabText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.fullNameLabel}>Full Name</Text>
        <FormInput
          style={styles.fullNameInput}
          icon="user"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Akash Singh"
        />

        <Text style={styles.mobileLabel}>Mobile Number</Text>
        <FormInput
          style={styles.mobileInput}
          icon="phone"
          value={mobile}
          onChangeText={value => setMobile(digitsOnly(value).slice(0, 10))}
          placeholder="+91 9800 000 000"
          keyboardType="phone-pad"
        />

        <Text style={styles.emailLabel}>Email Address</Text>
        <FormInput
          style={styles.emailInput}
          icon="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="abc@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.passwordLabel}>Password</Text>
        <PasswordInput
          style={styles.passwordInput}
          value={password}
          onChangeText={setPassword}
          visible={passwordVisible}
          onToggleVisibility={() => setPasswordVisible(current => !current)}
          placeholder="Enter your password"
        />

        <Text style={styles.confirmPasswordLabel}>Confirm Password</Text>
        <PasswordInput
          style={styles.confirmPasswordInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          visible={confirmPasswordVisible}
          onToggleVisibility={() =>
            setConfirmPasswordVisible(current => !current)
          }
          placeholder="Enter your password"
        />

        <Text style={styles.accountTypeLabel}>
          {forceAccountType ? 'Account type' : 'Choose your account type...'}
        </Text>
        <View style={styles.accountTypeRow}>
          <AccountTypeCard
            active={accountType === 'agency'}
            icon="grid"
            title="Agency"
            description={'Manage guards &\nsecurity services'}
            onPress={() => setAccountType('agency')}
            fullWidth={forceAccountType === 'agency'}
          />
          {!forceAccountType ? (
            <AccountTypeCard
              active={accountType === 'client'}
              icon="user"
              title="Client"
              description={'Hire & manage\nsecurity services'}
              onPress={() => setAccountType('client')}
            />
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, isSubmitting && { opacity: 0.65 }]}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          <Text style={styles.continueText}>
            {isSubmitting ? 'Creating account...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        {!forceAccountType ? (
          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}> Log in</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

type FormInputProps = {
  style: object;
  icon: React.ComponentProps<typeof Feather>['name'];
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none';
};

const FormInput: React.FC<FormInputProps> = ({
  style,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}) => (
  <View style={[styles.inputWrapper, style]}>
    <Feather name={icon} size={scaleFont(24)} color="#A3A3A3" />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#A3A3A3"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
    />
  </View>
);

type PasswordInputProps = {
  style: object;
  value: string;
  onChangeText: (value: string) => void;
  visible: boolean;
  onToggleVisibility: () => void;
  placeholder: string;
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  style,
  value,
  onChangeText,
  visible,
  onToggleVisibility,
  placeholder,
}) => (
  <View style={[styles.inputWrapper, style]}>
    <Feather name="lock" size={scaleFont(24)} color="#A3A3A3" />
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#A3A3A3"
      secureTextEntry={!visible}
      autoCapitalize="none"
    />
    <TouchableOpacity
      style={styles.eyeButton}
      onPress={onToggleVisibility}
      accessibilityLabel={visible ? 'Hide password' : 'Show password'}
    >
      <Feather
        name={visible ? 'eye-off' : 'eye'}
        size={scaleFont(24)}
        color={colors.primary}
      />
    </TouchableOpacity>
  </View>
);

type AccountTypeCardProps = {
  active: boolean;
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  description: string;
  onPress: () => void;
  fullWidth?: boolean;
};

const AccountTypeCard: React.FC<AccountTypeCardProps> = ({
  active,
  icon,
  title,
  description,
  onPress,
  fullWidth,
}) => (
  <TouchableOpacity
    style={[
      styles.accountTypeCard,
      fullWidth && styles.accountTypeCardFull,
      active && styles.accountTypeCardActive,
    ]}
    onPress={onPress}
  >
    <Feather
      name={icon}
      size={scaleFont(50)}
      color={active ? colors.white : colors.primary}
    />
    <Text
      style={[styles.accountTypeTitle, active && styles.accountTypeTextActive]}
    >
      {title}
    </Text>
    <Text
      style={[
        styles.accountTypeDescription,
        active && styles.accountTypeTextActive,
      ]}
    >
      {description}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: {
    width: scaleWidth(402),
    height: scaleHeight(1168),
    backgroundColor: colors.white,
  },
  logo: {
    position: 'absolute',
    left: scaleWidth(150),
    top: scaleHeight(78),
    width: scaleWidth(101),
    height: scaleHeight(101),
  },
  backButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(42),
    width: scaleWidth(44),
    height: scaleHeight(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  heading: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(183),
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
    top: scaleHeight(233),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: colors.primary,
  },
  authTabs: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(266),
    width: scaleWidth(363),
    height: scaleHeight(45),
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  activeTab: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTab: {
    width: scaleWidth(179),
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  fullNameLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(342),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  mobileLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(449),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  emailLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(551),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  passwordLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(648),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  confirmPasswordLabel: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(747),
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
  fullNameInput: { top: scaleHeight(375) },
  mobileInput: { top: scaleHeight(478) },
  emailInput: { top: scaleHeight(577) },
  passwordInput: { top: scaleHeight(678) },
  confirmPasswordInput: { top: scaleHeight(778) },
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
  accountTypeLabel: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(850),
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: colors.primary,
  },
  accountTypeRow: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(889),
    flexDirection: 'row',
    gap: scaleWidth(13),
  },
  accountTypeCard: {
    width: scaleWidth(170),
    height: scaleHeight(148),
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTypeCardFull: { width: scaleWidth(363) },
  accountTypeCardActive: { backgroundColor: colors.primary },
  accountTypeTitle: {
    marginTop: scaleHeight(5),
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: colors.primary,
  },
  accountTypeDescription: {
    marginTop: scaleHeight(3),
    textAlign: 'center',
    fontSize: scaleFont(16),
    lineHeight: scaleFont(18),
    color: colors.primary,
  },
  accountTypeTextActive: { color: colors.white },
  continueButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(1056),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: scaleFont(24),
    fontWeight: '700',
    color: colors.white,
  },
  loginRow: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(1127),
    width: scaleWidth(355),
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginPrompt: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    color: colors.primary,
  },
  loginLink: { fontSize: scaleFont(20), fontWeight: '700', color: '#2563EB' },
});

export default CreateAccountScreen;
