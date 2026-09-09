import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import ScalePressable from '../../../components/common/ScalePressable';
import {
  superAdminService,
  type SuperAdminProfile,
} from '../../../services/superAdminService';
import { colors } from '../../../styles/colors';
import { scaleFont } from '../../../styles/dimensions';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { isValidEmail, isValidIndianMobile } from '../../../utils/validation';

type Form = Pick<SuperAdminProfile, 'full_name' | 'email' | 'mobile_number'>;

const emptyForm: Form = { full_name: '', email: '', mobile_number: '' };

export default function SuperAdminProfilePanel({
  onSignOut,
}: {
  onSignOut: () => void;
}) {
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const account = await superAdminService.getProfile();
      setProfile(account);
      setForm({
        full_name: account.full_name ?? '',
        email: account.email ?? '',
        mobile_number: account.mobile_number ?? '',
      });
    } catch (error) {
      Alert.alert(
        'Profile',
        error instanceof Error ? error.message : 'Unable to load your profile.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const update = (key: keyof Form, value: string) =>
    setForm(current => ({ ...current, [key]: value }));

  const save = async () => {
    if (form.full_name.trim().length < 2) {
      Alert.alert('Full name required', 'Enter the Super Admin’s full name.');
      return;
    }
    if (!isValidEmail(form.email)) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    if (!isValidIndianMobile(form.mobile_number)) {
      Alert.alert(
        'Invalid phone number',
        'Enter a valid 10-digit Indian mobile number.',
      );
      return;
    }
    try {
      setSaving(true);
      const response = await superAdminService.updateProfile({
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile_number: form.mobile_number.trim(),
      });
      setProfile(current =>
        current ? { ...current, ...response.admin } : response.admin,
      );
      setForm(current => ({
        ...current,
        email: current.email.trim().toLowerCase(),
      }));
      Alert.alert('Profile updated', 'Your changes have been saved.');
    } catch (error) {
      Alert.alert(
        'Profile',
        error instanceof Error ? error.message : 'Unable to save your changes.',
      );
    } finally {
      setSaving(false);
    }
  };

  const initial = (form.full_name || 'S').trim().charAt(0).toUpperCase();

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={colors.primary} />
        <Text style={s.helper}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <View style={s.card}>
      <View style={s.identity}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{initial}</Text>
          <View style={s.camera}>
            <Feather name="camera" size={scaleFont(15)} color={colors.white} />
          </View>
        </View>
        <View style={s.identityCopy}>
          <Text style={s.name}>{form.full_name || 'Super Admin'}</Text>
          <Text style={s.accountId}>
            Account ID: {profile?.account_id || '—'}
          </Text>
        </View>
      </View>
      <View style={s.divider} />
      <Text style={s.section}>YOUR ACCOUNT</Text>
      <Field
        label="Full name"
        value={form.full_name}
        onChangeText={value => update('full_name', value)}
      />
      <Field
        label="Email"
        value={form.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={value => update('email', value)}
      />
      <Field
        label="Phone"
        value={form.mobile_number}
        keyboardType="phone-pad"
        onChangeText={value =>
          update('mobile_number', value.replace(/[^\d+]/g, ''))
        }
      />
      <ScalePressable
        style={s.save}
        onPress={() => void save()}
        disabled={saving}
        accessibilityRole="button"
      >
        <Text style={s.saveText}>{saving ? 'Saving…' : 'Save changes'}</Text>
      </ScalePressable>
      <ScalePressable
        style={s.signOut}
        onPress={onSignOut}
        accessibilityRole="button"
      >
        <Feather
          name="log-out"
          size={scaleFont(20)}
          color={colors.status.danger}
        />
        <Text style={s.signOutText}>Sign out</Text>
      </ScalePressable>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none';
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={s.input}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
      />
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  loading: {
    minHeight: 240,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  helper: { color: colors.textGray, fontSize: scaleFont(typography.sizes.sm) },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: scaleFont(76),
    height: scaleFont(76),
    borderRadius: scaleFont(38),
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.xxl),
    fontWeight: typography.weights.bold,
  },
  camera: {
    position: 'absolute',
    right: -spacing.xs,
    bottom: 0,
    width: scaleFont(30),
    height: scaleFont(30),
    borderRadius: scaleFont(15),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  identityCopy: { flex: 1, gap: spacing.xs },
  name: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.xl),
    fontWeight: typography.weights.bold,
  },
  accountId: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.md),
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  section: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.bold,
    letterSpacing: 1.2,
  },
  field: { gap: spacing.sm },
  label: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.medium,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
  },
  save: {
    minHeight: 50,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: colors.white,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  signOut: {
    minHeight: 50,
    borderRadius: spacing.sm,
    borderWidth: 1,
    borderColor: colors.status.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  signOutText: {
    color: colors.status.danger,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.semiBold,
  },
});
