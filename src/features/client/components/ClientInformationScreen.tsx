import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import { scaleFont } from '../../../styles/dimensions';

export type ClientInformationPage = 'howItWorks' | 'whyHireAgency';

type Props = {
  page: ClientInformationPage;
};

const content = {
  howItWorks: [
    ['search', 'clientInfo.chooseLocation', 'clientInfo.chooseLocationBody'],
    ['briefcase', 'clientInfo.selectAgency', 'clientInfo.selectAgencyBody'],
    ['send', 'clientInfo.sendRequest', 'clientInfo.sendRequestBody'],
    [
      'check-circle',
      'clientInfo.trackCoverage',
      'clientInfo.trackCoverageBody',
    ],
  ],
  whyHireAgency: [
    [
      'shield',
      'clientInfo.verifiedSecurity',
      'clientInfo.verifiedSecurityBody',
    ],
    ['users', 'clientInfo.trainedGuards', 'clientInfo.trainedGuardsBody'],
    ['clock', 'clientInfo.reliableCoverage', 'clientInfo.reliableCoverageBody'],
    ['file-text', 'clientInfo.clearRecords', 'clientInfo.clearRecordsBody'],
  ],
} as const;

export default function ClientInformationScreen({ page }: Props) {
  const { t } = useTranslation();
  const isHowItWorks = page === 'howItWorks';
  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.headerCopy}>
          <Text style={s.title}>
            {t(isHowItWorks ? 'client.howItWorks' : 'client.whyHireAgency')}
          </Text>
          <Text style={s.subtitle}>
            {t(
              isHowItWorks
                ? 'clientInfo.howItWorksIntro'
                : 'clientInfo.whyHireIntro',
            )}
          </Text>
        </View>
      </View>

      <View style={s.card}>
        {content[page].map(([icon, title, body], index) => (
          <View
            key={title}
            style={[s.item, index === content[page].length - 1 && s.lastItem]}
          >
            <View style={s.icon}>
              <Feather
                name={icon}
                size={scaleFont(22)}
                color={colors.primary}
              />
            </View>
            <View style={s.copy}>
              <Text style={s.itemTitle}>{t(title)}</Text>
              <Text style={s.body}>{t(body)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.note}>
        <Feather name="info" size={scaleFont(20)} color={colors.gold} />
        <Text style={s.noteText}>
          {t(
            isHowItWorks ? 'clientInfo.requestNote' : 'clientInfo.partnerNote',
          )}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xs },
  title: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.xxl),
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.lg),
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  item: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastItem: { borderBottomWidth: 0 },
  icon: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.lg,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: spacing.xs },
  itemTitle: {
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.md),
    fontWeight: typography.weights.semiBold,
  },
  body: {
    color: colors.textGray,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.lg),
  },
  note: {
    borderRadius: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.light.background,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
    color: colors.primary,
    fontSize: scaleFont(typography.sizes.sm),
    lineHeight: scaleFont(typography.sizes.lg),
  },
});
