import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';

import { colors } from '../../../styles/colors';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import type { MainStackParamList } from '../../../navigation/types';
import ScalePressable from '../../../components/common/ScalePressable';
import AgencyBottomNavigation, {
  type AgencyNavTab,
} from '../components/AgencyBottomNavigation';
import AgencyProfileMenu from '../components/AgencyProfileMenu';
import AgencyTopNavigation from '../components/AgencyTopNavigation';
import {
  agencyApiService,
  type AgencyCoverageRequest,
  type AgencyGuard,
  type AgencySite,
} from '../../../services/agencyApiService';
import {
  invoiceService,
  type AgencyInvoice,
} from '../../../services/invoiceService';

type Props = NativeStackScreenProps<MainStackParamList, 'AgencyInvoices'>;

/** Burnt-orange accent used for invoice amounts and pending badges. */
const AMBER = '#B9640A';

const formatINR = (value: number): string =>
  `₹${Math.round(value).toLocaleString('en-IN')}`;

const formatDueDate = (iso: string): string => {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
};

type DateParts = { year: number; month: number; day: number };

type AddOns = { p1000: boolean; p2000: boolean; custom: number };

const emptyAddOns: AddOns = { p1000: false, p2000: false, custom: 0 };

/** Invoice amount = client-site salary total + any active add-ons. */
const amountFrom = (base: number, addOns: AddOns): string =>
  String(
    Math.round(
      (base +
        (addOns.p1000 ? 1000 : 0) +
        (addOns.p2000 ? 2000 : 0) +
        addOns.custom) *
        100,
    ) / 100,
  );

const AgencyInvoicesScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [invoices, setInvoices] = useState<AgencyInvoice[]>([]);
  const [coverageRequests, setCoverageRequests] = useState<
    AgencyCoverageRequest[]
  >([]);
  const [sites, setSites] = useState<AgencySite[]>([]);
  const [guards, setGuards] = useState<AgencyGuard[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);

  const [clientOpen, setClientOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const [dateOpen, setDateOpen] = useState(false);
  const [dateParts, setDateParts] = useState<DateParts>(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    };
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addOns, setAddOns] = useState<AddOns>(emptyAddOns);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setClientsLoading(true);
      invoiceService
        .getInvoices()
        .then(items => {
          if (active) setInvoices(items);
        })
        .catch(() => undefined);
      // Existing integrations: client → coverage requests → sites → guards.
      agencyApiService
        .getCoverageRequests()
        .then(requests => {
          if (active) setCoverageRequests(requests);
        })
        .catch(() => undefined)
        .finally(() => {
          if (active) setClientsLoading(false);
        });
      agencyApiService
        .getSites()
        .then(items => {
          if (active) setSites(items);
        })
        .catch(() => undefined);
      agencyApiService
        .getGuards()
        .then(items => {
          if (active) setGuards(items);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  const clients = useMemo(
    () =>
      Array.from(
        new Set(
          coverageRequests
            .map(request => (request.company_name || '').trim())
            .filter(Boolean),
        ),
      ),
    [coverageRequests],
  );

  const clientOptions = useMemo(
    () =>
      Array.from(
        new Set([...clients, ...invoices.map(invoice => invoice.client)]),
      ),
    [clients, invoices],
  );

  /**
   * Guards assigned to the selected client's site(s) and their combined
   * salary, derived from existing APIs:
   * coverage request (company) → site (source_coverage_request_id) → guards.
   */
  const clientStats = useMemo(() => {
    const requestIds = new Set(
      coverageRequests
        .filter(
          request => (request.company_name || '').trim() === selectedClient,
        )
        .map(request => request.id),
    );
    const clientSites = sites.filter(
      site =>
        site.source_coverage_request_id != null &&
        requestIds.has(site.source_coverage_request_id),
    );
    const siteIds = new Set(clientSites.map(site => site.id));
    const clientGuards = guards.filter(
      guard => guard.site_id != null && siteIds.has(guard.site_id),
    );
    const totalSalary = clientGuards.reduce((sum, guard) => {
      const basic = Number(guard.basic_salary ?? 0);
      const allowance = Number(guard.allowances ?? 0);
      return (
        sum +
        (Number.isFinite(basic) ? basic : 0) +
        (Number.isFinite(allowance) ? allowance : 0)
      );
    }, 0);
    return {
      guardCount: clientGuards.length,
      totalSalary: Math.round(totalSalary * 100) / 100,
    };
  }, [coverageRequests, sites, guards, selectedClient]);

  // Selecting a client auto-fills the amount with its site salary total.
  useEffect(() => {
    if (!selectedClient) return;
    setAddOns(emptyAddOns);
    setAmount(amountFrom(clientStats.totalSalary, emptyAddOns));
  }, [selectedClient, clientStats.totalSalary]);

  const resetFeedback = () => {
    if (error) setError('');
    if (success) setSuccess('');
  };

  const openDate = () => {
    const values = dueDate.split('-').map(Number);
    const valid = values.length === 3 && values.every(Number.isFinite);
    const now = new Date();
    setDateParts(
      valid
        ? { year: values[0], month: values[1], day: values[2] }
        : {
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
          },
    );
    resetFeedback();
    setDateOpen(true);
  };

  const updateDatePart = (part: 'year' | 'month' | 'day', value: number) =>
    setDateParts(current => {
      const next = { ...current, [part]: value };
      const maxDay = new Date(next.year, next.month, 0).getDate();
      return { ...next, day: Math.min(next.day, maxDay) };
    });

  const confirmDate = () => {
    setDueDate(
      `${dateParts.year}-${String(dateParts.month).padStart(2, '0')}-${String(
        dateParts.day,
      ).padStart(2, '0')}`,
    );
    setDateOpen(false);
    resetFeedback();
  };

  const canSend =
    Boolean(selectedClient) && Boolean(amount.trim()) && Boolean(dueDate);

  const togglePreset = (key: 'p1000' | 'p2000') => {
    const next: AddOns = { ...addOns, [key]: !addOns[key] };
    setAddOns(next);
    setAmount(amountFrom(clientStats.totalSalary, next));
    resetFeedback();
  };

  const openCustom = () => {
    setCustomValue(addOns.custom > 0 ? String(addOns.custom) : '');
    setCustomError('');
    setCustomOpen(true);
  };

  const applyCustom = () => {
    const parsed = Number(customValue.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setCustomError(t('invoice.invalidAmount'));
      return;
    }
    const next: AddOns = { ...addOns, custom: Math.round(parsed * 100) / 100 };
    setAddOns(next);
    setAmount(amountFrom(clientStats.totalSalary, next));
    setCustomError('');
    setCustomOpen(false);
    resetFeedback();
  };

  const removeCustom = () => {
    const next: AddOns = { ...addOns, custom: 0 };
    setAddOns(next);
    setAmount(amountFrom(clientStats.totalSalary, next));
    setCustomError('');
    setCustomOpen(false);
    resetFeedback();
  };

  const send = async () => {
    if (sending) return;
    if (!selectedClient || !amount.trim() || !dueDate) {
      setSuccess('');
      setError(t('invoice.required'));
      return;
    }
    const parsedAmount = Number(amount.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setSuccess('');
      setError(t('invoice.invalidAmount'));
      return;
    }
    setError('');
    setSuccess('');
    setSending(true);
    try {
      await invoiceService.createInvoice({
        client: selectedClient,
        description: description.trim(),
        amount: parsedAmount,
        due_date: dueDate,
      });
      setInvoices(await invoiceService.getInvoices());
      setSelectedClient('');
      setAmount('');
      setDescription('');
      setDueDate('');
      setAddOns(emptyAddOns);
      setSuccess(t('invoice.sent', { client: selectedClient }));
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : t('invoice.sendFailed'),
      );
    } finally {
      setSending(false);
    }
  };

  const navigate = (tab: AgencyNavTab) => {
    if (tab === 'overview') navigation.navigate('AgencyOverview');
    if (tab === 'guards') navigation.navigate('AgencyGuards');
    if (tab === 'sites') navigation.navigate('AgencySites');
    if (tab === 'incidents') navigation.navigate('AgencyIncidents');
    if (tab === 'profile') navigation.navigate('AgencyProfile');
    if (tab === 'plan') navigation.navigate('AgencyPlan');
  };

  const yearOptions = Array.from(
    { length: 10 },
    (_, index) => new Date().getFullYear() + index,
  );
  const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
  const dayOptions = Array.from(
    { length: new Date(dateParts.year, dateParts.month, 0).getDate() },
    (_, index) => index + 1,
  );
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <AgencyTopNavigation
        profileMenuOpen={profileMenuOpen}
        onProfilePress={() => setProfileMenuOpen(open => !open)}
      />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.section}>{t('invoice.sendInvoice')}</Text>

          <FieldLabel text={t('invoice.selectClient')} required />
          <ScalePressable
            style={s.select}
            onPress={() => {
              resetFeedback();
              setClientOpen(open => !open);
            }}
            accessibilityRole="button"
            accessibilityState={{ expanded: clientOpen }}
            accessibilityLabel={t('invoice.selectClient')}
          >
            <Text style={[s.selectText, !selectedClient && s.placeholder]}>
              {selectedClient || '—'}
            </Text>
            <Feather
              name={clientOpen ? 'chevron-up' : 'chevron-down'}
              size={f(20)}
              color={colors.primary}
            />
          </ScalePressable>

          {selectedClient ? (
            <View style={s.statsCard}>
              <View style={s.stat}>
                <View style={s.statTop}>
                  <View style={[s.statIcon, s.statIconGuards]}>
                    <Feather name="users" size={f(16)} color="#2563EB" />
                  </View>
                  <Text style={[s.statValue, s.statValueGuards]}>
                    {clientStats.guardCount}
                  </Text>
                </View>
                <Text style={s.statLabel}>{t('invoice.guardsAssigned')}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.stat}>
                <View style={s.statTop}>
                  <View style={[s.statIcon, s.statIconSalary]}>
                    <Feather name="dollar-sign" size={f(16)} color="#0EAE5A" />
                  </View>
                  <Text style={[s.statValue, s.statValueSalary]}>
                    {formatINR(clientStats.totalSalary)}
                  </Text>
                </View>
                <Text style={s.statLabel}>{t('invoice.totalSalary')}</Text>
              </View>
            </View>
          ) : null}
          {selectedClient && clientStats.guardCount === 0 ? (
            <Text style={s.statsHint}>{t('invoice.noGuards')}</Text>
          ) : null}

          <FieldLabel text={t('invoice.amount')} required />
          <View style={s.amountWrap}>
            <Text style={s.currency}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={value => {
                resetFeedback();
                setAddOns(emptyAddOns);
                setAmount(value.replace(/[^0-9.]/g, ''));
              }}
              placeholder={t('invoice.amountPlaceholder')}
              placeholderTextColor={colors.textGray}
              keyboardType="numeric"
              style={s.amountInput}
              accessibilityLabel={t('invoice.amount')}
            />
          </View>

          {selectedClient ? (
            <>
              <FieldLabel text={t('invoice.addOn')} />
              <View style={s.addOnRow}>
                <AddOnChip
                  label={t('invoice.add1000')}
                  active={addOns.p1000}
                  onPress={() => togglePreset('p1000')}
                />
                <AddOnChip
                  label={t('invoice.add2000')}
                  active={addOns.p2000}
                  onPress={() => togglePreset('p2000')}
                />
                <AddOnChip
                  label={
                    addOns.custom > 0
                      ? `+${formatINR(addOns.custom)}`
                      : t('invoice.addCustom')
                  }
                  active={addOns.custom > 0}
                  onPress={openCustom}
                />
              </View>
            </>
          ) : null}

          <FieldLabel text={t('invoice.description')} />
          <TextInput
            value={description}
            onChangeText={value => {
              resetFeedback();
              setDescription(value);
            }}
            placeholder={t('invoice.descriptionPlaceholder')}
            placeholderTextColor={colors.textGray}
            multiline
            style={[s.input, s.multiline]}
            accessibilityLabel={t('invoice.description')}
          />

          <FieldLabel text={t('invoice.dueDate')} required />
          <ScalePressable
            style={s.select}
            onPress={openDate}
            accessibilityRole="button"
            accessibilityLabel={t('invoice.selectDueDate')}
          >
            <Text style={[s.selectText, !dueDate && s.placeholder]}>
              {dueDate ? formatDueDate(dueDate) : t('invoice.dueDatePlaceholder')}
            </Text>
            <Feather name="calendar" size={f(20)} color={colors.primary} />
          </ScalePressable>

          {error ? (
            <Text accessibilityRole="alert" style={s.error}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <View style={s.alertSuccess}>
              <Feather
                name="check-circle"
                size={f(16)}
                color={colors.status.success}
              />
              <Text style={s.alertSuccessText}>{success}</Text>
            </View>
          ) : null}

          <ScalePressable
            style={[s.send, !canSend && s.sendDisabled]}
            onPress={send}
            disabled={!canSend || sending}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend || sending, busy: sending }}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : null}
            <Text style={[s.sendText, !canSend && s.sendTextDisabled]}>
              {sending ? t('invoice.sending') : t('invoice.send')}
            </Text>
          </ScalePressable>
          <View style={s.band} />

          <Text style={s.section}>{t('invoice.invoicesSent')}</Text>
          <View style={s.list}>
            {invoices.length === 0 ? (
              <View style={s.empty}>
                <Feather name="file-text" size={f(24)} color={colors.textGray} />
                <Text style={s.emptyText}>{t('invoice.noInvoices')}</Text>
              </View>
            ) : (
              invoices.map((invoice, index) => (
                <View
                  key={invoice.id}
                  style={[s.row, index > 0 && s.rowDivider]}
                >
                  <View style={s.rowCopy}>
                    <Text style={s.rowClient}>{invoice.client}</Text>
                    {invoice.description ? (
                      <Text style={s.rowDescription}>{invoice.description}</Text>
                    ) : null}
                    <Text style={s.rowAmount}>{formatINR(invoice.amount)}</Text>
                  </View>
                  <View
                    style={[
                      s.badge,
                      invoice.status === 'paid' ? s.badgePaid : s.badgePending,
                    ]}
                  >
                    <Text
                      style={[
                        s.badgeText,
                        invoice.status === 'paid'
                          ? s.badgeTextPaid
                          : s.badgeTextPending,
                      ]}
                    >
                      {invoice.status === 'paid'
                        ? t('invoice.paid')
                        : t('invoice.pending')}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Client dropdown opens as an overlay so the form never shifts. */}
      <Modal
        visible={clientOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setClientOpen(false)}
      >
        <SafeAreaView style={s.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setClientOpen(false)}
            accessibilityLabel={t('dashboard.close')}
          />
          <View style={s.picker}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>{t('invoice.selectClient')}</Text>
              <ScalePressable
                style={s.pickerClose}
                onPress={() => setClientOpen(false)}
                accessibilityLabel={t('dashboard.close')}
              >
                <Feather name="x" size={f(20)} color={colors.primary} />
              </ScalePressable>
            </View>
            <ScrollView
              style={s.options}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {clientsLoading ? (
                <View style={s.optionState}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={s.hint}>{t('invoice.loadingClients')}</Text>
                </View>
              ) : clientOptions.length === 0 ? (
                <View style={s.optionState}>
                  <Text style={s.optionStateTitle}>
                    {t('invoice.noClients')}
                  </Text>
                  <Text style={s.hint}>{t('invoice.noClientsHint')}</Text>
                </View>
              ) : (
                clientOptions.map(option => {
                  const selected = option === selectedClient;
                  return (
                    <ScalePressable
                      key={option}
                      style={[s.option, selected && s.optionSelected]}
                      onPress={() => {
                        setSelectedClient(option);
                        setClientOpen(false);
                        resetFeedback();
                      }}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[s.optionText, selected && s.optionTextSelected]}
                      >
                        {option}
                      </Text>
                      {selected ? (
                        <Feather
                          name="check"
                          size={f(18)}
                          color={colors.primary}
                        />
                      ) : null}
                    </ScalePressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
      {/* Due-date picker overlay (year / month / day columns). */}
      <Modal
        visible={dateOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDateOpen(false)}
      >
        <SafeAreaView style={s.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setDateOpen(false)}
            accessibilityLabel={t('dashboard.close')}
          />
          <View style={s.calendar}>
            <Text style={s.calendarTitle}>{t('invoice.selectDueDate')}</Text>
            <Text style={s.datePreview}>
              {formatDueDate(
                `${dateParts.year}-${String(dateParts.month).padStart(
                  2,
                  '0',
                )}-${String(dateParts.day).padStart(2, '0')}`,
              )}
            </Text>
            <View style={s.dateColumns}>
              {[
                {
                  key: 'year' as const,
                  label: t('dashboard.year'),
                  values: yearOptions,
                  text: (value: number) => String(value),
                },
                {
                  key: 'month' as const,
                  label: t('dashboard.month'),
                  values: monthOptions,
                  text: (value: number) =>
                    new Date(2000, value - 1, 1).toLocaleDateString('en-IN', {
                      month: 'short',
                    }),
                },
                {
                  key: 'day' as const,
                  label: t('dashboard.date'),
                  values: dayOptions,
                  text: (value: number) => String(value),
                },
              ].map(column => (
                <View key={column.key} style={s.dateColumn}>
                  <Text style={s.dateColumnLabel}>{column.label}</Text>
                  <ScrollView
                    style={s.dateList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="handled"
                  >
                    {column.values.map(value => (
                      <ScalePressable
                        key={value}
                        style={[
                          s.dateOption,
                          dateParts[column.key] === value &&
                            s.dateOptionSelected,
                        ]}
                        onPress={() => updateDatePart(column.key, value)}
                        accessibilityRole="radio"
                        accessibilityState={{
                          checked: dateParts[column.key] === value,
                        }}
                      >
                        <Text
                          style={[
                            s.dateOptionText,
                            dateParts[column.key] === value &&
                              s.dateOptionTextSelected,
                          ]}
                        >
                          {column.text(value)}
                        </Text>
                      </ScalePressable>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
            <ScalePressable
              style={s.dateSubmit}
              onPress={confirmDate}
              accessibilityRole="button"
            >
              <Text style={s.dateSubmitText}>{t('dashboard.done')}</Text>
            </ScalePressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Custom add-on overlay. */}
      <Modal
        visible={customOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomOpen(false)}
      >
        <SafeAreaView style={s.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCustomOpen(false)}
            accessibilityLabel={t('dashboard.close')}
          />
          <View style={s.picker}>
            <View style={s.pickerHeader}>
              <Text style={s.pickerTitle}>{t('invoice.customAddOn')}</Text>
              <ScalePressable
                style={s.pickerClose}
                onPress={() => setCustomOpen(false)}
                accessibilityLabel={t('dashboard.close')}
              >
                <Feather name="x" size={f(20)} color={colors.primary} />
              </ScalePressable>
            </View>
            <View style={[s.amountWrap, s.customAmountWrap]}>
              <Text style={s.currency}>₹</Text>
              <TextInput
                value={customValue}
                onChangeText={value => {
                  setCustomValue(value.replace(/[^0-9.]/g, ''));
                  setCustomError('');
                }}
                placeholder={t('invoice.amountPlaceholder')}
                placeholderTextColor={colors.textGray}
                keyboardType="numeric"
                style={s.amountInput}
                accessibilityLabel={t('invoice.customAddOn')}
              />
            </View>
            {customError ? (
              <Text accessibilityRole="alert" style={s.error}>
                {customError}
              </Text>
            ) : null}
            <ScalePressable
              style={s.customApply}
              onPress={applyCustom}
              accessibilityRole="button"
            >
              <Text style={s.dateSubmitText}>{t('invoice.apply')}</Text>
            </ScalePressable>
            {addOns.custom > 0 ? (
              <ScalePressable
                style={s.removeAddOn}
                onPress={removeCustom}
                accessibilityRole="button"
              >
                <Text style={s.removeAddOnText}>
                  {t('invoice.removeAddOn')}
                </Text>
              </ScalePressable>
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>

      <AgencyBottomNavigation activeTab="overview" onTabPress={navigate} />
      {profileMenuOpen ? (
        <ScalePressable
          style={s.backdrop}
          onPress={() => setProfileMenuOpen(false)}
          accessibilityLabel={t('dashboard.close')}
        >
          <View />
        </ScalePressable>
      ) : null}
      {profileMenuOpen ? (
        <AgencyProfileMenu
          onMyProfile={() => {
            setProfileMenuOpen(false);
            navigation.navigate('AgencyProfile');
          }}
          onLogout={() => setProfileMenuOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
};

const FieldLabel: React.FC<{ text: string; required?: boolean }> = ({
  text,
  required,
}) => (
  <Text style={s.label}>
    {text}
    {required ? <Text style={s.required}> *</Text> : null}
  </Text>
);

const AddOnChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <ScalePressable
    style={[s.chip, active && s.chipActive]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
  >
    <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
  </ScalePressable>
);
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  flex: { flex: 1 },
  content: { padding: w(16), paddingBottom: h(24) },
  section: {
    color: colors.primary,
    fontSize: f(17),
    fontWeight: '700',
    borderLeftWidth: w(4),
    borderLeftColor: colors.gold,
    paddingLeft: w(9),
    marginTop: h(12),
    marginBottom: h(14),
  },
  label: {
    color: colors.primary,
    fontSize: f(17),
    fontWeight: '500',
    marginLeft: w(2),
    marginBottom: h(8),
  },
  required: { color: '#F22121' },
  select: {
    minHeight: h(50),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: w(8),
    paddingHorizontal: w(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: w(10),
    marginBottom: h(16),
    backgroundColor: colors.white,
  },
  selectText: { flex: 1, color: colors.primary, fontSize: f(16) },
  placeholder: { color: colors.textGray },
  amountWrap: {
    minHeight: h(50),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: w(8),
    paddingLeft: w(14),
    paddingRight: w(6),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h(16),
    backgroundColor: colors.white,
  },
  currency: {
    color: colors.primary,
    fontSize: f(16),
    fontWeight: '700',
    marginRight: w(4),
  },
  amountInput: {
    flex: 1,
    color: colors.primary,
    fontSize: f(16),
    paddingVertical: 0,
  },
  input: {
    minHeight: h(50),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: w(8),
    paddingHorizontal: w(14),
    color: colors.primary,
    fontSize: f(16),
    backgroundColor: colors.white,
    marginBottom: h(16),
  },
  multiline: {
    minHeight: h(96),
    paddingTop: h(12),
    textAlignVertical: 'top',
  },
  error: {
    color: colors.status.danger,
    fontSize: f(14),
    marginBottom: h(10),
  },
  alertSuccess: {
    borderWidth: 1,
    borderColor: colors.status.success,
    backgroundColor: '#EAF8EF',
    borderRadius: w(8),
    padding: w(12),
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(8),
    marginBottom: h(12),
  },
  alertSuccessText: { color: colors.status.success, fontSize: f(13), flex: 1 },
  send: {
    height: h(50),
    borderRadius: w(7),
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: w(8),
    marginTop: h(4),
  },
  sendDisabled: { backgroundColor: '#C9CFD8' },
  sendText: { color: colors.white, fontSize: f(17), fontWeight: '700' },
  sendTextDisabled: { color: '#6B7280' },
  band: {
    height: h(8),
    backgroundColor: '#F3F4F6',
    marginHorizontal: -w(16),
    marginVertical: h(22),
  },
  statsCard: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: w(12),
    marginBottom: h(16),
    gap: w(10),
  },
  stat: { flex: 1, gap: h(6) },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: '#E5E5E5',
  },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: w(8) },
  statIcon: {
    width: w(30),
    height: w(30),
    borderRadius: w(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconGuards: { backgroundColor: '#EEF3FF' },
  statIconSalary: { backgroundColor: '#E2F5E9' },
  statValue: { fontSize: f(19), fontWeight: '700' },
  statValueGuards: { color: '#2563EB' },
  statValueSalary: { color: '#0EAE5A' },
  statLabel: { color: colors.primary, fontSize: f(12), fontWeight: '500' },
  statsHint: {
    color: colors.textGray,
    fontSize: f(13),
    marginTop: -h(8),
    marginBottom: h(12),
  },
  addOnRow: { flexDirection: 'row', gap: w(10), marginBottom: h(16) },
  chip: {
    flex: 1,
    minHeight: h(44),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: w(7),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: w(6),
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: {
    color: colors.primary,
    fontSize: f(15),
    fontWeight: '600',
    textAlign: 'center',
  },
  chipTextActive: { color: colors.white },
  customAmountWrap: { marginBottom: 0 },
  customApply: {
    minHeight: h(48),
    borderRadius: w(6),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAddOn: {
    minHeight: h(46),
    borderRadius: w(6),
    borderWidth: 1,
    borderColor: colors.status.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeAddOnText: {
    color: colors.status.danger,
    fontSize: f(15),
    fontWeight: '600',
  },
  list: {
    borderWidth: 1,
    borderColor: '#DCDCDC',
    borderRadius: w(8),
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: w(14),
    paddingVertical: h(14),
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  rowCopy: { flex: 1, paddingRight: w(10) },
  rowClient: { color: colors.primary, fontSize: f(17), fontWeight: '700' },
  rowDescription: { color: '#707070', fontSize: f(14), marginTop: h(3) },
  rowAmount: {
    color: AMBER,
    fontSize: f(17),
    fontWeight: '700',
    marginTop: h(5),
  },
  badge: {
    borderWidth: 1,
    borderRadius: w(6),
    paddingHorizontal: w(12),
    paddingVertical: h(6),
    marginLeft: w(8),
  },
  badgePending: { borderColor: AMBER },
  badgePaid: { borderColor: colors.status.success },
  badgeText: { fontSize: f(12), fontWeight: '700' },
  badgeTextPending: { color: AMBER },
  badgeTextPaid: { color: colors.status.success },
  empty: { alignItems: 'center', gap: h(8), paddingVertical: h(26) },
  emptyText: { color: colors.textGray, fontSize: f(14) },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: w(16),
    backgroundColor: 'rgba(11,31,58,0.56)',
  },
  picker: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: w(8),
    padding: w(16),
    gap: w(10),
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: w(10),
  },
  pickerTitle: {
    color: colors.primary,
    fontSize: f(17),
    fontWeight: '700',
    flex: 1,
  },
  pickerClose: {
    minWidth: h(40),
    minHeight: h(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: { maxHeight: h(300) },
  option: {
    minHeight: h(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: w(10),
    paddingHorizontal: w(12),
    borderRadius: w(6),
  },
  optionSelected: { backgroundColor: colors.light.background },
  optionText: { flex: 1, color: colors.primary, fontSize: f(15) },
  optionTextSelected: { fontWeight: '700' },
  optionState: {
    alignItems: 'center',
    gap: h(8),
    paddingVertical: h(20),
    paddingHorizontal: w(8),
  },
  optionStateTitle: {
    color: colors.primary,
    fontSize: f(15),
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: { color: colors.textGray, fontSize: f(13), textAlign: 'center' },
  calendar: {
    backgroundColor: colors.white,
    borderRadius: w(8),
    padding: w(16),
    gap: w(10),
  },
  calendarTitle: { color: colors.primary, fontSize: f(18), fontWeight: '700' },
  datePreview: {
    color: colors.textGray,
    fontSize: f(14),
    textAlign: 'center',
  },
  dateColumns: { flexDirection: 'row', gap: w(8) },
  dateColumn: { flex: 1, gap: h(4) },
  dateColumnLabel: {
    color: colors.primary,
    fontSize: f(13),
    fontWeight: '600',
    textAlign: 'center',
  },
  dateList: {
    height: h(192),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: w(6),
  },
  dateOption: {
    minHeight: h(44),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: w(4),
  },
  dateOptionSelected: { backgroundColor: colors.primary },
  dateOptionText: {
    color: colors.primary,
    fontSize: f(14),
    fontWeight: '500',
    textAlign: 'center',
  },
  dateOptionTextSelected: { color: colors.white },
  dateSubmit: {
    minHeight: h(48),
    borderRadius: w(6),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateSubmitText: { color: colors.white, fontSize: f(16), fontWeight: '700' },
  backdrop: { ...StyleSheet.absoluteFill, zIndex: 10 },
});

export default AgencyInvoicesScreen;
