import React, { useEffect, useRef, useState } from 'react';
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
import { isCompleteOtp } from '../../../utils/validation';
import { authService } from '../../../services/authService';
import { registrationDraft } from '../../../services/registrationDraft';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyMobile'>;

const OTP_LENGTH = 6;

const VerifyMobileScreen: React.FC<Props> = ({ navigation }) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [mobile, setMobile] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef<Array<React.ComponentRef<typeof TextInput> | null>>(
    [],
  );

  useEffect(() => {
    setMobile(registrationDraft.get()?.mobile_number || '');
  }, []);

  const updateOtp = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');
    const nextOtp = [...otp];

    if (digits.length > 1) {
      digits
        .slice(0, OTP_LENGTH - index)
        .split('')
        .forEach((digit, offset) => {
          nextOtp[index + offset] = digit;
        });
      setOtp(nextOtp);
      inputs.current[Math.min(index + digits.length, OTP_LENGTH - 1)]?.focus();
      return;
    }

    nextOtp[index] = digits;
    setOtp(nextOtp);

    if (digits && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key !== 'Backspace') {
      return;
    }

    if (otp[index]) {
      const nextOtp = [...otp];
      nextOtp[index] = '';
      setOtp(nextOtp);
      return;
    }

    if (index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMobile = async () => {
    if (!isCompleteOtp(otp)) {
      Alert.alert('Invalid OTP', 'Enter the complete 6-digit verification code.');
      return;
    }
    try {
      setIsSubmitting(true);
      if (!mobile) throw new Error('Your mobile number is missing. Please create the account again.');
      await authService.verifyMobileOtp(mobile, otp.join(''));
      navigation.navigate('AccountCreated');
    } catch (error) {
      Alert.alert('Verification failed', error instanceof Error ? error.message : 'Please try again.');
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

      <Text style={styles.heading}>Verify Mobile Number</Text>
      <Text style={styles.subtitle}>Enter the 6-digit code sent to</Text>
      <Text style={styles.phoneNumber}>{mobile ? `+91 ${mobile.slice(0, 5)} ${mobile.slice(5)}` : '+91'}</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={input => {
              inputs.current[index] = input;
            }}
            value={digit}
            onChangeText={value => updateOtp(value, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            style={styles.otpInput}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
            selectTextOnFocus
            accessibilityLabel={`Mobile verification digit ${index + 1}`}
          />
        ))}
      </View>

      <Text style={styles.didNotReceive}>Didn't receive OTP?</Text>
      <View style={styles.resendRow}>
        <TouchableOpacity onPress={() => mobile && authService.sendMobileOtp(mobile).catch(error => Alert.alert('Could not resend OTP', error.message))}>
          <Text style={styles.resendLink}>Resend OTP</Text>
        </TouchableOpacity>
        <Text style={styles.resendTimer}> in 00:30</Text>
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, isSubmitting && { opacity: 0.65 }]}
        onPress={handleVerifyMobile}
        disabled={isSubmitting}
      >
        <Text style={styles.verifyButtonText}>{isSubmitting ? 'Verifying...' : 'Verify & Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  backButton: {
    position: 'absolute', left: scaleWidth(19), top: scaleHeight(50),
    width: scaleWidth(26), height: scaleHeight(26), alignItems: 'center', justifyContent: 'center',
  },
  logo: {
    position: 'absolute', left: scaleWidth(150), top: scaleHeight(80),
    width: scaleWidth(101), height: scaleHeight(101),
  },
  heading: {
    position: 'absolute', left: scaleWidth(23), top: scaleHeight(308), width: scaleWidth(355),
    textAlign: 'center', fontSize: scaleFont(32), lineHeight: scaleFont(39), fontWeight: '800', color: colors.primary,
  },
  subtitle: {
    position: 'absolute', left: scaleWidth(23), top: scaleHeight(350), width: scaleWidth(355),
    textAlign: 'center', fontSize: scaleFont(20), lineHeight: scaleFont(24), color: colors.primary,
  },
  phoneNumber: {
    position: 'absolute', left: scaleWidth(23), top: scaleHeight(392), width: scaleWidth(355),
    textAlign: 'center', fontSize: scaleFont(20), lineHeight: scaleFont(24), fontWeight: '700', color: colors.primary,
  },
  otpRow: { position: 'absolute', left: scaleWidth(30), top: scaleHeight(440), flexDirection: 'row', gap: scaleWidth(10) },
  otpInput: {
    width: scaleWidth(48), height: scaleHeight(49), borderWidth: 1, borderColor: colors.primary,
    borderRadius: 8, padding: 0, fontSize: scaleFont(24), fontWeight: '700', color: '#000000',
  },
  didNotReceive: {
    position: 'absolute', left: scaleWidth(23), top: scaleHeight(521), width: scaleWidth(355),
    textAlign: 'center', fontSize: scaleFont(20), lineHeight: scaleFont(24), color: colors.primary,
  },
  resendRow: { position: 'absolute', left: scaleWidth(23), top: scaleHeight(554), width: scaleWidth(355), flexDirection: 'row', justifyContent: 'center' },
  resendLink: { fontSize: scaleFont(20), lineHeight: scaleFont(24), fontWeight: '700', color: '#2563EB' },
  resendTimer: { fontSize: scaleFont(20), lineHeight: scaleFont(24), color: colors.primary },
  verifyButton: {
    position: 'absolute', left: scaleWidth(19), top: scaleHeight(782), width: scaleWidth(363), height: scaleHeight(50),
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary,
  },
  verifyButtonText: { fontSize: scaleFont(24), fontWeight: '700', color: colors.white },
});

export default VerifyMobileScreen;
