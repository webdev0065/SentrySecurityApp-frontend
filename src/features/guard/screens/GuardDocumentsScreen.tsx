import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useTranslation } from 'react-i18next';

import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import { spacing } from '../../../styles/spacing';
import { typography } from '../../../styles/typography';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';
import type { GuardStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<GuardStackParamList, 'GuardDocuments'>;

const ACCENT = '#B9640A';

type DocStatus = 'verified' | 'pending';

type DocItem = {
  key: string;
  labelKey: string;
  status: DocStatus;
};

const DOCUMENTS: DocItem[] = [
  { key: 'idProof', labelKey: 'guardProfile.idProof', status: 'verified' },
  {
    key: 'securityLicense',
    labelKey: 'guardProfile.securityLicense',
    status: 'verified',
  },
  {
    key: 'certifications',
    labelKey: 'guardProfile.certifications',
    status: 'pending',
  },
];

const GuardDocumentsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <ScalePressable
          style={s.iconButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('guardProfile.back')}
        >
          <Feather name="arrow-left" size={f(22)} color={colors.primary} />
        </ScalePressable>
        <Text style={s.headerTitle} numberOfLines={1}>
          {t('guardProfile.documents')}
        </Text>
        <View style={s.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {DOCUMENTS.map(doc => {
          const verified = doc.status === 'verified';
          return (
            <View key={doc.key} style={s.card}>
              <Feather name="file-text" size={f(22)} color={ACCENT} />
              <Text style={s.cardLabel} numberOfLines={2}>
                {t(doc.labelKey)}
              </Text>
              <View
                style={[
                  s.badge,
                  verified ? s.badgeVerified : s.badgePending,
                ]}
              >
                <Text
                  style={[
                    s.badgeText,
                    verified ? s.badgeTextVerified : s.badgeTextPending,
                  ]}
                >
                  {verified
                    ? t('guardProfile.verified')
                    : t('guardProfile.pending')}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: w(12),
    paddingVertical: h(10),
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light.border,
  },
  iconButton: {
    width: w(40),
    height: w(40),
    borderRadius: w(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.bold,
  },
  content: { padding: spacing.md, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: w(12),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: h(16),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLabel: {
    flex: 1,
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.medium,
  },
  badge: {
    borderWidth: 1,
    borderRadius: spacing.sm,
    paddingHorizontal: w(12),
    paddingVertical: h(6),
  },
  badgeVerified: { borderColor: colors.status.success },
  badgePending: { borderColor: ACCENT },
  badgeText: {
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.sm),
    fontWeight: typography.weights.semiBold,
    letterSpacing: 1,
  },
  badgeTextVerified: { color: colors.status.success },
  badgeTextPending: { color: ACCENT },
});

export default GuardDocumentsScreen;