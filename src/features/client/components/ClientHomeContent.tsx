import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import ScalePressable from '../../../components/common/ScalePressable';
import type {
  ClientDetails,
  CoverageRequest,
} from '../../../services/clientService';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { scaleFont } from '../../../styles/dimensions';
import ClientAgencyGuardsModal from './ClientAgencyGuardsModal';

type Props = {
  details: ClientDetails | null;
  requests: CoverageRequest[];
  onHowItWorks: () => void;
  onWhyHireAgency: () => void;
  onNeedHelp: () => void;
};

const activeStatuses = new Set(['approved', 'assigned']);
const agencyStatuses = new Set(['approved', 'assigned', 'completed']);

export default function ClientHomeContent({
  details,
  requests,
  onHowItWorks,
  onWhyHireAgency,
  onNeedHelp,
}: Props) {
  const { t } = useTranslation();
  const [selectedAgency, setSelectedAgency] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const activeRequests = useMemo(
    () => requests.filter(request => activeStatuses.has(request.status)),
    [requests],
  );
  const agencies = useMemo(() => {
    const unique = new Map<string, CoverageRequest>();
    requests
      .filter(request => agencyStatuses.has(request.status))
      .forEach(request => {
        if (request.agency_name) unique.set(request.agency_name, request);
      });
    return [...unique.values()];
  }, [requests]);

  if (!agencies.length) {
    return (
      <View style={s.container}>
        <View style={[s.card, s.noAgencyCard]}>
          <View style={s.heroIcon}>
            <Feather
              name="user-plus"
              size={scaleFont(32)}
              color={colors.gold}
            />
          </View>
          <Text style={s.heroTitle}>{t('client.noAgencyYet')}</Text>
          <Text style={s.body}>{t('client.noAgencyYetHint')}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('client.helpfulInformation')}</Text>
          <InfoRow
            icon="users"
            title={t('client.howItWorks')}
            body={t('client.howItWorksHint')}
            onPress={onHowItWorks}
          />
          <InfoRow
            icon="shield"
            title={t('client.whyHireAgency')}
            body={t('client.whyHireAgencyHint')}
            onPress={onWhyHireAgency}
          />
          <InfoRow
            icon="headphones"
            title={t('client.needHelp')}
            body={t('client.needHelpHint')}
            onPress={onNeedHelp}
            last
          />
        </View>

        <View style={s.quoteCard}>
          <Text style={s.quote}>{t('client.securityQuote')}</Text>
          <View style={s.quoteAccent} />
        </View>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={[s.card, s.welcomeCard]}>
        <View style={s.welcomeCopy}>
          <Text style={s.heroTitle}>{t('client.welcomeBack')}</Text>
          <Text style={s.body}>{t('client.securityOverview')}</Text>
        </View>
        <View style={s.shieldIcon}>
          <Feather name="shield" size={scaleFont(28)} color={colors.primary} />
        </View>
      </View>

      <View style={s.sectionBlock}>
        <Text style={s.sectionTitle}>{t('client.yourAgencies')}</Text>
        {agencies.map(agency => (
          <ScalePressable
            key={`${agency.agency_name}-${
              agency.assigned_agency_id || agency.selected_agency_id
            }`}
            style={s.listCard}
            onPress={() => {
              const id = agency.assigned_agency_id || agency.selected_agency_id;
              if (id) setSelectedAgency({ id, name: agency.agency_name || '' });
            }}
            accessibilityRole="button"
          >
            <View style={s.agencyIcon}>
              <Feather
                name="briefcase"
                size={scaleFont(22)}
                color={colors.gold}
              />
            </View>
            <View style={s.listCopy}>
              <Text style={s.listTitle}>{agency.agency_name}</Text>
              <Text style={s.caption}>
                {[agency.agency_city, agency.agency_district]
                  .filter(Boolean)
                  .join(', ') || t('client.securityPartner')}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={scaleFont(20)}
              color={colors.textGray}
            />
          </ScalePressable>
        ))}
      </View>

      <View style={s.sectionBlock}>
        <Text style={s.sectionTitle}>{t('client.activeCoverage')}</Text>
        {activeRequests.map(request => (
          <View key={request.id} style={s.listCard}>
            <View style={s.coverageIcon}>
              <Feather
                name="shield"
                size={scaleFont(22)}
                color={colors.status.success}
              />
            </View>
            <View style={s.listCopy}>
              <Text style={s.listTitle}>{request.event_name}</Text>
              <Text style={s.caption}>{request.site_location}</Text>
              <Text style={s.caption}>
                {t('client.guardsAssigned', { count: request.guards_needed })}
              </Text>
            </View>
            <View style={s.activeBadge}>
              <Text style={s.activeText}>{t('client.active')}</Text>
            </View>
          </View>
        ))}
      </View>

      {details?.site_name ? (
        <Text style={s.siteCaption}>
          {[details.site_name, details.city, details.state]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      ) : null}
      <ClientAgencyGuardsModal
        visible={selectedAgency !== null}
        agencyId={selectedAgency?.id ?? null}
        agencyName={selectedAgency?.name ?? ''}
        onClose={() => setSelectedAgency(null)}
      />
    </View>
  );
}

function InfoRow({
  icon,
  title,
  body,
  onPress,
  last,
}: {
  icon: React.ComponentProps<typeof Feather>['name'];
  title: string;
  body: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <ScalePressable
      style={[s.infoRow, last && s.lastRow]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Feather name={icon} size={scaleFont(23)} color={colors.primary} />
      <View style={s.listCopy}>
        <Text style={s.infoTitle}>{title}</Text>
        <Text style={s.caption}>{body}</Text>
      </View>
      <Feather
        name="chevron-right"
        size={scaleFont(20)}
        color={colors.textGray}
      />
    </ScalePressable>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.lg },
  card: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  noAgencyCard: {},
  welcomeCard: { flexDirection: 'row', alignItems: 'center' },
  welcomeCopy: { flex: 1, gap: spacing.sm },
  heroIcon: {
    alignSelf: 'flex-end',
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  shieldIcon: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.lg,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.xxl),
    fontWeight: typography.weights.bold,
  },
  body: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    lineHeight: scaleFont(typography.sizes.xl),
  },
  sectionBlock: { gap: spacing.sm },
  sectionTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.bold,
    borderLeftWidth: spacing.xs,
    borderLeftColor: colors.gold,
    paddingLeft: spacing.sm,
  },
  listCard: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  agencyIcon: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverageIcon: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.lg,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCopy: { flex: 1, gap: spacing.xs },
  listTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  caption: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.lg),
  },
  activeBadge: {
    borderRadius: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.light.background,
  },
  activeText: {
    color: colors.status.success,
    fontSize: scaleFont(typography.sizes.xs),
    fontWeight: typography.weights.semiBold,
  },
  infoRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  lastRow: { borderBottomWidth: 0 },
  infoTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  quoteCard: {
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  quote: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.lg),
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  quoteAccent: {
    width: spacing.xxl,
    height: spacing.xs,
    borderRadius: spacing.xs,
    backgroundColor: colors.gold,
  },
  siteCaption: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.sm),
    textAlign: 'center',
  },
});
