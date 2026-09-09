import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import ScalePressable from '../../../components/common/ScalePressable';
import {
  superAdminService,
  type PendingAgency,
} from '../../../services/superAdminService';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { scaleFont } from '../../../styles/dimensions';

export default function AgencyApprovalsPanel({
  onChanged,
}: {
  onChanged: () => void;
}) {
  const [agencies, setAgencies] = useState<PendingAgency[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAgencies(await superAdminService.getPendingAgencies());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load approval requests.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const review = (agency: PendingAgency, approve: boolean) => {
    Alert.alert(
      approve ? 'Approve agency?' : 'Reject agency?',
      approve
        ? `${agency.agency_name} will be able to log in.`
        : `${agency.agency_name} will be removed from pending agencies and will not be able to log in.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: approve ? 'Approve' : 'Reject',
          style: approve ? 'default' : 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              if (approve) await superAdminService.approveAgency(agency.id);
              else await superAdminService.rejectAgency(agency.id);
              setAgencies(current =>
                current.filter(item => item.id !== agency.id),
              );
              onChanged();
            } catch (err) {
              Alert.alert(
                'Could not update agency',
                err instanceof Error ? err.message : 'Please try again.',
              );
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };
  return (
    <View style={s.container}>
      <Text style={s.title}>Agency approvals</Text>
      <ScalePressable
        style={s.secondary}
        disabled={loading || busy}
        onPress={() => void load()}
      >
        <Text style={s.body}>Refresh requests</Text>
      </ScalePressable>
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : error ? (
        <Text style={s.error}>{error}</Text>
      ) : !agencies.length ? (
        <Text style={s.body}>No agencies awaiting approval.</Text>
      ) : (
        agencies.map(agency => (
          <View key={agency.id} style={s.card}>
            <Text style={s.title}>{agency.agency_name}</Text>
            <Text style={s.body}>{agency.full_name}</Text>
            <Text style={s.body}>{agency.email}</Text>
            <Text style={s.body}>{agency.mobile_number}</Text>
            <Text style={s.body}>
              {[
                agency.office_address,
                agency.city,
                agency.district,
                agency.state,
              ]
                .filter(Boolean)
                .join(', ')}
            </Text>
            <View style={s.actions}>
              <ScalePressable
                accessibilityRole="button"
                disabled={busy}
                style={[s.button, s.approve]}
                onPress={() => review(agency, true)}
              >
                <Text style={s.white}>Approve</Text>
              </ScalePressable>
              <ScalePressable
                accessibilityRole="button"
                disabled={busy}
                style={[s.button, s.reject]}
                onPress={() => review(agency, false)}
              >
                <Text style={s.error}>Reject</Text>
              </ScalePressable>
            </View>
          </View>
        ))
      )}
    </View>
  );
}
const s = StyleSheet.create({
  container: { gap: spacing.md },
  card: {
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  body: { fontSize: scaleFont(typography.sizes.sm), color: colors.textGray },
  error: {
    fontSize: scaleFont(typography.sizes.sm),
    color: colors.status.danger,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  button: {
    flex: 1,
    minHeight: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
  },
  approve: { backgroundColor: colors.primary },
  reject: { borderWidth: 1, borderColor: colors.status.danger },
  white: {
    color: colors.white,
    fontSize: scaleFont(typography.sizes.sm),
    fontWeight: typography.weights.semiBold,
  },
  secondary: { minHeight: spacing.xxxl, justifyContent: 'center' },
});
