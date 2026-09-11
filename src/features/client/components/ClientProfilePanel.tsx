import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import ScalePressable from '../../../components/common/ScalePressable';
import {
  clientService,
  type ClientDetails,
} from '../../../services/clientService';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { scaleFont } from '../../../styles/dimensions';

export default function ClientProfilePanel({
  details,
  onUpdated,
  onSignOut,
}: {
  details: ClientDetails;
  onUpdated: (details: ClientDetails) => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    siteName: details.site_name || '',
    siteAddress: details.site_address || '',
    city: details.city || '',
    state: details.state || '',
    pincode: details.pincode || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setForm({
      siteName: details.site_name || '',
      siteAddress: details.site_address || '',
      city: details.city || '',
      state: details.state || '',
      pincode: details.pincode || '',
    });
  }, [details]);

  const update = (field: keyof typeof form, value: string) => {
    setMessage('');
    setForm(current => ({ ...current, [field]: value }));
  };

  const save = async () => {
    const clean = {
      siteName: form.siteName.trim(),
      siteAddress: form.siteAddress.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };
    if (!clean.siteName || !clean.siteAddress || !clean.city || !clean.state) {
      setIsError(true);
      setMessage(t('dashboard.missingDetails'));
      return;
    }
    if (!/^\d{6}$/.test(clean.pincode)) {
      setIsError(true);
      setMessage(t('details.invalidPincode'));
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const updated = await clientService.updateDetails({
        companyName: details.company_name,
        ...clean,
      });
      onUpdated(updated);
      setIsError(false);
      setMessage(t('dashboard.changesSaved'));
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : t('dashboard.tryAgain'),
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <View style={s.container}>
      <View style={s.profileHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>C</Text>
          <View style={s.camera}>
            <Feather name="camera" size={scaleFont(15)} color={colors.white} />
          </View>
        </View>
        <View style={s.identity}>
          <Text style={s.name}>{t('client.profile')}</Text>
          <Text style={s.accountId}>
            {t('superAdmin.accountId', { id: details.user_id })}
          </Text>
        </View>
      </View>
      <View style={s.divider} />
      <Text style={s.section}>{t('superAdmin.yourAccount')}</Text>
      <EditableField
        label={t('details.siteName')}
        icon="map"
        value={form.siteName}
        onChangeText={value => update('siteName', value)}
      />
      <EditableField
        label={t('details.siteAddress')}
        icon="map-pin"
        value={form.siteAddress}
        onChangeText={value => update('siteAddress', value)}
      />
      <View style={s.row}>
        <EditableField
          style={s.flex}
          label={t('dashboard.city')}
          icon="navigation"
          value={form.city}
          onChangeText={value => update('city', value)}
        />
        <EditableField
          style={s.flex}
          label={t('dashboard.state')}
          icon="compass"
          value={form.state}
          onChangeText={value => update('state', value)}
        />
      </View>
      <EditableField
        label={t('dashboard.pincode')}
        icon="hash"
        value={form.pincode}
        onChangeText={value => update('pincode', value.replace(/\D/g, ''))}
        keyboardType="number-pad"
        maxLength={6}
      />
      {message ? (
        <Text style={[s.feedback, isError ? s.error : s.success]}>
          {message}
        </Text>
      ) : null}
      <ScalePressable
        style={[s.save, saving && s.disabled]}
        onPress={save}
        disabled={saving}
        accessibilityRole="button"
      >
        <Text style={s.saveText}>
          {saving ? t('dashboard.saving') : t('dashboard.saveChanges')}
        </Text>
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
        <Text style={s.signOutText}>{t('dashboard.signOut')}</Text>
      </ScalePressable>
    </View>
  );
}

function EditableField({
  label,
  icon,
  value,
  onChangeText,
  style,
  keyboardType,
  maxLength,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  value: string;
  onChangeText: (value: string) => void;
  style?: object;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  maxLength?: number;
}) {
  return (
    <View style={[s.field, style]}>
      <Text style={s.label}>{label}</Text>
      <View style={s.inputWrap}>
        <Feather name={icon} size={scaleFont(19)} color={colors.textGray} />
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          accessibilityLabel={label}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.md },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#E2DBCA',
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#B9640A',
    fontSize: scaleFont(typography.sizes.xxxl),
    fontWeight: typography.weights.bold,
  },
  camera: {
    position: 'absolute',
    right: -spacing.sm,
    bottom: -spacing.xs,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#B9640A',
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: { flex: 1, gap: spacing.xs },
  name: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.xxl),
    fontWeight: typography.weights.bold,
  },
  accountId: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.md),
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border },
  section: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
    borderLeftWidth: spacing.xs,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  field: { gap: spacing.sm },
  label: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.medium,
  },
  inputWrap: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.light.background,
  },
  input: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 0,
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
  feedback: {
    fontSize: scaleFont(typography.sizes.sm),
    textAlign: 'center',
  },
  error: { color: colors.status.danger },
  success: { color: colors.status.success },
  save: {
    minHeight: 50,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  disabled: { opacity: 0.55 },
  saveText: {
    color: colors.white,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  signOut: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.status.danger,
    borderRadius: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  signOutText: {
    color: colors.status.danger,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.semiBold,
  },
});
