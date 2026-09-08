import React, { useMemo, useState } from 'react';
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
import Feather from 'react-native-vector-icons/Feather';

import LanguageSelector from '../../../components/common/LanguageSelector';
import { INDIAN_STATES_AND_UNION_TERRITORIES } from '../../../constants/indianStates';
import type { AuthStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { scaleFont, scaleHeight, scaleWidth } from '../../../styles/dimensions';
import { digitsOnly, isValidPincode } from '../../../utils/validation';
import { authService } from '../../../services/authService';
import { registrationDraft } from '../../../services/registrationDraft';

type Props = NativeStackScreenProps<AuthStackParamList, 'AgencyDetails'>;

const BUSINESS_TYPES = [
  { label: 'Private Limited Company', icon: 'briefcase' },
  { label: 'Partnership', icon: 'users' },
  { label: 'Proprietorship', icon: 'user' },
  { label: 'LLP (Limited Liability Partnership)', icon: 'briefcase' },
  { label: 'Public Limited Company', icon: 'home' },
  { label: 'Other', icon: 'help-circle' },
] as const;

const AgencyDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const [agencyName, setAgencyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [businessOpen, setBusinessOpen] = useState(false);
  const [stateOpen, setStateOpen] = useState(false);
  const [stateQuery, setStateQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredStates = useMemo(
    () =>
      INDIAN_STATES_AND_UNION_TERRITORIES.filter(item =>
        item.toLowerCase().includes(stateQuery.trim().toLowerCase()),
      ),
    [stateQuery],
  );

  const toggleBusinessMenu = () => {
    setBusinessOpen(current => !current);
    setStateOpen(false);
  };

  const toggleStateMenu = () => {
    setStateOpen(current => !current);
    setBusinessOpen(false);
  };

  const handleContinue = async () => {
    if (agencyName.trim().length < 2) {
      Alert.alert('Agency name required', 'Enter your agency or company name.');
      return;
    }
    if (!businessType) {
      Alert.alert('Business type required', 'Select your business type.');
      return;
    }
    if (gstNumber && !/^[A-Z0-9]{15}$/.test(gstNumber.trim().toUpperCase())) {
      Alert.alert(
        'Invalid GST number',
        'Enter a valid 15-character GST number or leave it blank.',
      );
      return;
    }
    if (officeAddress.trim().length < 5) {
      Alert.alert('Office address required', 'Enter your office address.');
      return;
    }
    if (city.trim().length < 2) {
      Alert.alert('City required', 'Enter your city.');
      return;
    }
    if (!state) {
      Alert.alert('State required', 'Select your state or Union Territory.');
      return;
    }
    if (!isValidPincode(pincode)) {
      Alert.alert('Invalid pincode', 'Enter a valid 6-digit pincode.');
      return;
    }
    try {
      setIsSubmitting(true);
      registrationDraft.setProfile({
        agencyName: agencyName.trim(),
        businessType,
        gstNumber: gstNumber.trim().toUpperCase(),
        officeAddress: officeAddress.trim(),
        city: city.trim(),
        state,
        pincode,
      });
      const mobile = registrationDraft.get()?.mobile_number;
      if (!mobile)
        throw new Error(
          'Your mobile number is missing. Please create the account again.',
        );
      await authService.sendMobileOtp(mobile);
      navigation.navigate('VerifyMobile');
    } catch (error) {
      Alert.alert(
        'Could not continue',
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

        <Text style={styles.heading}>Agency Details</Text>
        <Text style={styles.subtitle}>Tell us about your agency</Text>

        <Text style={styles.labelAgencyName}>Agency / Company Name</Text>
        <TextInput
          value={agencyName}
          onChangeText={setAgencyName}
          style={[styles.input, styles.agencyNameInput]}
          placeholder="Enter agency name"
          placeholderTextColor="#A3A3A3"
        />

        <Text style={styles.labelBusinessType}>Business Type</Text>
        <TouchableOpacity
          style={[styles.input, styles.businessInput]}
          onPress={toggleBusinessMenu}
        >
          <Text
            style={[styles.selectText, !businessType && styles.placeholder]}
          >
            {businessType || 'Select business type'}
          </Text>
          <Feather
            name={businessOpen ? 'chevron-up' : 'chevron-down'}
            size={scaleFont(24)}
            color={colors.primary}
          />
        </TouchableOpacity>

        {businessOpen && (
          <View style={styles.businessMenu}>
            {BUSINESS_TYPES.map(item => (
              <TouchableOpacity
                key={item.label}
                style={styles.businessOption}
                onPress={() => {
                  setBusinessType(item.label);
                  setBusinessOpen(false);
                }}
              >
                <Feather
                  name={item.icon}
                  size={scaleFont(21)}
                  color={colors.gold}
                />
                <Text style={styles.businessOptionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.labelGst}>GST Number (Optional)</Text>
        <TextInput
          value={gstNumber}
          onChangeText={setGstNumber}
          style={[styles.input, styles.gstInput]}
          placeholder="Enter GST number"
          placeholderTextColor="#A3A3A3"
          autoCapitalize="characters"
        />

        <Text style={styles.labelOfficeAddress}>Office Address</Text>
        <TextInput
          value={officeAddress}
          onChangeText={setOfficeAddress}
          style={[styles.input, styles.officeInput]}
          placeholder="Enter office address"
          placeholderTextColor="#A3A3A3"
        />

        <Text style={styles.labelCity}>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          style={[styles.input, styles.cityInput]}
          placeholder="Enter city"
          placeholderTextColor="#A3A3A3"
        />

        <Text style={styles.labelState}>State</Text>
        <TouchableOpacity
          style={[styles.input, styles.stateInput]}
          onPress={toggleStateMenu}
        >
          <Text style={[styles.selectText, !state && styles.placeholder]}>
            {state || 'Select state'}
          </Text>
          <Feather
            name={stateOpen ? 'chevron-up' : 'chevron-down'}
            size={scaleFont(24)}
            color={colors.primary}
          />
        </TouchableOpacity>

        {stateOpen && (
          <View style={styles.stateMenu}>
            <View style={styles.stateSearch}>
              <Feather name="search" size={scaleFont(21)} color="#A3A3A3" />
              <TextInput
                value={stateQuery}
                onChangeText={setStateQuery}
                style={styles.searchInput}
                placeholder="Select state"
                placeholderTextColor="#A3A3A3"
              />
            </View>
            <ScrollView
              style={styles.stateList}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {filteredStates.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.stateOption}
                  onPress={() => {
                    setState(item);
                    setStateOpen(false);
                    setStateQuery('');
                  }}
                >
                  <Text style={styles.stateOptionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.labelPincode}>Pincode</Text>
        <TextInput
          value={pincode}
          onChangeText={value => setPincode(digitsOnly(value).slice(0, 6))}
          style={[styles.input, styles.pincodeInput]}
          placeholder="Enter pincode"
          placeholderTextColor="#A3A3A3"
          keyboardType="number-pad"
          maxLength={6}
        />

        <TouchableOpacity
          style={[styles.continueButton, isSubmitting && { opacity: 0.65 }]}
          onPress={handleContinue}
          disabled={isSubmitting}
        >
          <Text style={styles.continueText}>
            {isSubmitting ? 'Saving...' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  scrollContent: {
    width: scaleWidth(402),
    height: scaleHeight(1032),
    backgroundColor: colors.white,
  },
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
    top: scaleHeight(190),
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
    top: scaleHeight(239),
    width: scaleWidth(355),
    textAlign: 'center',
    fontSize: scaleFont(20),
    lineHeight: scaleFont(24),
    color: colors.primary,
  },
  input: {
    position: 'absolute',
    left: scaleWidth(19),
    width: scaleWidth(363),
    height: scaleHeight(50),
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: scaleWidth(13),
    fontSize: scaleFont(16),
    color: colors.primary,
  },
  labelAgencyName: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(292),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  agencyNameInput: { top: scaleHeight(322) },
  labelBusinessType: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(396),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  businessInput: {
    top: scaleHeight(426),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: scaleFont(16), color: colors.primary },
  placeholder: { color: '#A3A3A3' },
  businessMenu: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(484),
    width: scaleWidth(363),
    height: scaleHeight(205),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    overflow: 'hidden',
    paddingVertical: scaleHeight(7),
    zIndex: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 3, height: 9 },
  },
  businessOption: {
    height: scaleHeight(32),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(9),
    gap: scaleWidth(9),
  },
  businessOptionText: { fontSize: scaleFont(20), color: '#000000' },
  labelGst: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(497),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  gstInput: { top: scaleHeight(524) },
  labelOfficeAddress: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(594),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  officeInput: { top: scaleHeight(624) },
  labelCity: {
    position: 'absolute',
    left: scaleWidth(27),
    top: scaleHeight(693),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  cityInput: {
    left: scaleWidth(19),
    top: scaleHeight(724),
    width: scaleWidth(173),
  },
  labelState: {
    position: 'absolute',
    left: scaleWidth(215),
    top: scaleHeight(693),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  stateInput: {
    left: scaleWidth(209),
    top: scaleHeight(724),
    width: scaleWidth(173),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stateMenu: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(783),
    width: scaleWidth(363),
    height: scaleHeight(238),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    zIndex: 30,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 3, height: 9 },
  },
  stateSearch: {
    height: scaleHeight(39),
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingHorizontal: scaleWidth(13),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(7),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontSize: scaleFont(20),
    color: colors.primary,
  },
  stateList: { flex: 1 },
  stateOption: {
    height: scaleHeight(31),
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(23),
  },
  stateOptionText: { fontSize: scaleFont(20), color: '#000000' },
  labelPincode: {
    position: 'absolute',
    left: scaleWidth(23),
    top: scaleHeight(796),
    fontSize: scaleFont(22),
    fontWeight: '500',
    color: colors.primary,
  },
  pincodeInput: { top: scaleHeight(826) },
  continueButton: {
    position: 'absolute',
    left: scaleWidth(19),
    top: scaleHeight(950),
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
});

export default AgencyDetailsScreen;
