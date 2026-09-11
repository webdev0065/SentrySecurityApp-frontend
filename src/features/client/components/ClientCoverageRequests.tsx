import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import ScalePressable from '../../../components/common/ScalePressable';
import {
  clientService,
  type AvailableAgency,
  type CoverageRequest,
} from '../../../services/clientService';
import {
  indiaLocationService,
  type IndiaLocationOption,
} from '../../../services/indiaLocationService';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { scaleFont } from '../../../styles/dimensions';

type Picker = 'state' | 'district' | 'city' | null;
const emptyForm = {
  eventName: '',
  state: '',
  district: '',
  city: '',
  siteLocation: '',
  notes: '',
};

export default function ClientCoverageRequests() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [guardsNeeded, setGuardsNeeded] = useState(1);
  const [requests, setRequests] = useState<CoverageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [picker, setPicker] = useState<Picker>(null);
  const [query, setQuery] = useState('');
  const [states, setStates] = useState<IndiaLocationOption[]>([]);
  const [districts, setDistricts] = useState<IndiaLocationOption[]>([]);
  const [cities, setCities] = useState<IndiaLocationOption[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [agencies, setAgencies] = useState<AvailableAgency[]>([]);
  const [agenciesLoading, setAgenciesLoading] = useState(false);
  const [agenciesError, setAgenciesError] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState<number | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await clientService.getCoverageRequests());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t('coverageRequest.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    loadRequests();
    indiaLocationService
      .getStates()
      .then(setStates)
      .catch(() => setError(t('coverageRequest.locationFailed')));
  }, [loadRequests, t]);

  useEffect(() => {
    let active = true;
    if (!form.district) {
      setAgencies([]);
      setSelectedAgencyId(null);
      setAgenciesError('');
      return () => {
        active = false;
      };
    }
    setAgenciesLoading(true);
    setAgenciesError('');
    clientService
      .getAvailableAgencies(form.district)
      .then(data => {
        if (active) setAgencies(data);
      })
      .catch(() => {
        if (active) {
          setAgencies([]);
          setAgenciesError(t('coverageRequest.agenciesFailed'));
        }
      })
      .finally(() => {
        if (active) setAgenciesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [form.district, t]);

  const update = (key: keyof typeof emptyForm, value: string) =>
    setForm(current => ({ ...current, [key]: value }));
  const find = (options: IndiaLocationOption[], name: string) =>
    options.find(option => option.name.toLowerCase() === name.toLowerCase());
  const openPicker = async (type: Exclude<Picker, null>) => {
    setPicker(type);
    setQuery('');
    setLocationsLoading(true);
    try {
      if (type === 'district') {
        const state = find(states, form.state);
        if (!state) throw new Error(t('coverageRequest.selectStateFirst'));
        setDistricts(await indiaLocationService.getDistricts(state.slug));
      }
      if (type === 'city') {
        const state = find(states, form.state);
        const district = find(districts, form.district);
        if (!state || !district)
          throw new Error(t('coverageRequest.selectDistrictFirst'));
        setCities(
          await indiaLocationService.getCities(state.slug, district.slug),
        );
      }
    } catch (locationError) {
      setPicker(null);
      Alert.alert(
        t('coverageRequest.location'),
        locationError instanceof Error
          ? locationError.message
          : t('coverageRequest.locationFailed'),
      );
    } finally {
      setLocationsLoading(false);
    }
  };
  const options =
    picker === 'state' ? states : picker === 'district' ? districts : cities;
  const filteredOptions = useMemo(
    () =>
      options.filter(option =>
        option.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [options, query],
  );
  const select = (option: IndiaLocationOption) => {
    if (picker === 'state') {
      setSelectedAgencyId(null);
      setForm(current => ({
        ...current,
        state: option.name,
        district: '',
        city: '',
      }));
      setDistricts([]);
      setCities([]);
    }
    if (picker === 'district') {
      setSelectedAgencyId(null);
      setForm(current => ({ ...current, district: option.name, city: '' }));
      setCities([]);
    }
    if (picker === 'city') update('city', option.name);
    setPicker(null);
  };
  const submit = async () => {
    if (
      !form.eventName.trim() ||
      !form.state ||
      !form.district ||
      !form.city ||
      !form.siteLocation.trim() ||
      (agencies.length > 0 && !selectedAgencyId)
    ) {
      setError(t('coverageRequest.required'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await clientService.createCoverageRequest({
        ...form,
        eventName: form.eventName.trim(),
        siteLocation: form.siteLocation.trim(),
        notes: form.notes.trim(),
        guardsNeeded,
        ...(selectedAgencyId ? { agencyId: selectedAgencyId } : {}),
      });
      setForm(emptyForm);
      setGuardsNeeded(1);
      setSelectedAgencyId(null);
      await loadRequests();
      Alert.alert(
        t('coverageRequest.sentTitle'),
        t('coverageRequest.sentMessage'),
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t('coverageRequest.sendFailed'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.sectionTitle}>{t('coverageRequest.location')}</Text>
        <Field
          label={t('coverageRequest.eventName')}
          value={form.eventName}
          onChangeText={value => update('eventName', value)}
          placeholder={t('coverageRequest.eventPlaceholder')}
        />
        <Dropdown
          label={t('dashboard.state')}
          value={form.state}
          open={picker === 'state'}
          onPress={() => openPicker('state')}
        />
        <Dropdown
          label={t('dashboard.district')}
          value={form.district}
          open={picker === 'district'}
          disabled={!form.state}
          onPress={() => openPicker('district')}
        />
        <Dropdown
          label={t('dashboard.city')}
          value={form.city}
          open={picker === 'city'}
          disabled={!form.district}
          onPress={() => openPicker('city')}
        />
        {form.district ? (
          <View style={s.agenciesSection}>
            <Text style={s.sectionTitle}>
              {t('coverageRequest.agenciesInArea')}
            </Text>
            {agenciesLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : agenciesError ? (
              <Text style={s.error}>{agenciesError}</Text>
            ) : agencies.length ? (
              agencies
                .filter(
                  agency =>
                    selectedAgencyId === null || agency.id === selectedAgencyId,
                )
                .map(agency => (
                  <ScalePressable
                    key={agency.id}
                    style={[
                      s.agencyCard,
                      agency.id === selectedAgencyId && s.selectedAgencyCard,
                    ]}
                    onPress={() =>
                      setSelectedAgencyId(current =>
                        current === agency.id ? null : agency.id,
                      )
                    }
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: agency.id === selectedAgencyId,
                    }}
                  >
                    <View style={s.agencyIcon}>
                      <Feather
                        name="briefcase"
                        size={scaleFont(20)}
                        color={colors.gold}
                      />
                    </View>
                    <View style={s.agencyDetails}>
                      <Text style={s.agencyName}>{agency.agency_name}</Text>
                      <Text style={s.muted}>
                        {[agency.city, agency.district, agency.state]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </View>
                    <View style={s.availableBadge}>
                      <Text style={s.availableText}>
                        {agency.id === selectedAgencyId
                          ? t('coverageRequest.changeAgency')
                          : t('coverageRequest.selectAgency')}
                      </Text>
                    </View>
                  </ScalePressable>
                ))
            ) : (
              <Text style={s.muted}>
                {t('coverageRequest.noAgenciesInArea')}
              </Text>
            )}
          </View>
        ) : null}
        <Field
          label={t('coverageRequest.siteLocation')}
          value={form.siteLocation}
          onChangeText={value => update('siteLocation', value)}
          placeholder={t('coverageRequest.sitePlaceholder')}
        />
        <View style={s.field}>
          <Text style={s.label}>{t('coverageRequest.guardsNeeded')}</Text>
          <View style={s.counter}>
            <ScalePressable
              style={s.counterButton}
              disabled={guardsNeeded === 1 || saving}
              onPress={() => setGuardsNeeded(value => Math.max(1, value - 1))}
            >
              <Feather
                name="minus"
                size={scaleFont(20)}
                color={colors.primary}
              />
            </ScalePressable>
            <Text style={s.count}>{guardsNeeded}</Text>
            <ScalePressable
              style={s.counterButton}
              disabled={saving}
              onPress={() => setGuardsNeeded(value => Math.min(99, value + 1))}
            >
              <Feather
                name="plus"
                size={scaleFont(20)}
                color={colors.primary}
              />
            </ScalePressable>
          </View>
        </View>
        <Field
          label={t('coverageRequest.notes')}
          value={form.notes}
          onChangeText={value => update('notes', value)}
          placeholder={t('coverageRequest.notesPlaceholder')}
          multiline
        />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <ScalePressable
          style={s.submit}
          disabled={saving}
          onPress={submit}
          accessibilityState={{ disabled: saving, busy: saving }}
        >
          <Text style={s.submitText}>
            {saving ? t('coverageRequest.sending') : t('coverageRequest.send')}
          </Text>
        </ScalePressable>
      </View>
      <View style={s.card}>
        <Text style={s.sectionTitle}>{t('coverageRequest.myRequests')}</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : !requests.length ? (
          <Text style={s.muted}>{t('coverageRequest.none')}</Text>
        ) : (
          requests.map(request => (
            <View key={request.id} style={s.request}>
              <View style={s.requestRow}>
                <Text style={s.requestTitle}>{request.event_name}</Text>
                <Text style={s.badge}>
                  {t(`coverageRequest.status.${request.status}`, {
                    defaultValue: request.status,
                  })}
                </Text>
              </View>
              <Text style={s.muted}>{request.site_location}</Text>
              <Text style={s.muted}>
                {new Date(request.created_at).toLocaleDateString(i18n.language)}
              </Text>
            </View>
          ))
        )}
      </View>
      <Modal
        visible={picker !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPicker(null)}
      >
        <View style={s.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setPicker(null)}
          />
          <View style={s.picker}>
            <Text style={s.pickerTitle}>
              {picker ? t(`dashboard.${picker}`) : ''}
            </Text>
            <View style={s.search}>
              <Feather
                name="search"
                size={scaleFont(19)}
                color={colors.textGray}
              />
              <TextInput
                style={s.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={t('addGuardForm.search')}
                placeholderTextColor={colors.textGray}
              />
            </View>
            <ScrollView
              style={s.options}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {locationsLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                filteredOptions.map(option => (
                  <ScalePressable
                    key={option.slug}
                    style={s.option}
                    onPress={() => select(option)}
                  >
                    <Text style={s.optionText}>{option.name}</Text>
                  </ScalePressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, multiline && s.notes]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textGray}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={multiline ? 500 : 160}
      />
    </View>
  );
}
function Dropdown({
  label,
  value,
  open,
  disabled,
  onPress,
}: {
  label: string;
  value: string;
  open: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <ScalePressable
        style={[s.input, s.dropdown, disabled && s.disabled]}
        disabled={disabled}
        onPress={onPress}
        accessibilityState={{ disabled, expanded: open }}
      >
        <Text style={[s.inputText, !value && s.placeholder]}>
          {value || '—'}
        </Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={scaleFont(20)}
          color={colors.primary}
        />
      </ScalePressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.md },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    padding: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.white,
  },
  sectionTitle: {
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
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
  },
  placeholder: { color: colors.textGray },
  disabled: {
    backgroundColor: colors.light.background,
    borderColor: colors.border,
  },
  notes: { minHeight: 130, paddingTop: spacing.md },
  agenciesSection: { gap: spacing.sm },
  agencyCard: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedAgencyCard: {
    borderColor: colors.status.success,
  },
  agencyIcon: {
    width: 42,
    height: 42,
    borderRadius: spacing.sm,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agencyDetails: { flex: 1, gap: spacing.xs },
  agencyName: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  availableBadge: {
    borderWidth: 1,
    borderColor: colors.status.success,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  availableText: {
    color: colors.status.success,
    fontSize: scaleFont(typography.sizes.xs),
    fontWeight: typography.weights.semiBold,
  },
  counter: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  counterButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    minWidth: 32,
    textAlign: 'center',
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.semiBold,
  },
  error: {
    color: colors.status.danger,
    fontSize: scaleFont(typography.sizes.sm),
  },
  submit: {
    minHeight: 50,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    color: colors.white,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  muted: { color: colors.textGray, fontSize: scaleFont(typography.sizes.sm) },
  request: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  requestTitle: {
    flex: 1,
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  badge: {
    color: colors.status.review,
    borderWidth: 1,
    borderColor: colors.status.review,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: scaleFont(typography.sizes.xs),
    fontWeight: typography.weights.semiBold,
    textTransform: 'uppercase',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(11,31,58,0.56)',
  },
  picker: {
    backgroundColor: colors.white,
    borderRadius: spacing.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pickerTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  search: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
  },
  options: { height: 48 * 4 },
  option: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  optionText: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
  },
});
