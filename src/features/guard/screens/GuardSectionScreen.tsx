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
import type {
  GuardSectionKey,
  GuardStackParamList,
} from '../../../navigation/types';

type Props = NativeStackScreenProps<GuardStackParamList, 'GuardSection'>;

const ACCENT = '#B9640A';

type SectionConfig = {
  titleKey: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  emptyKey: string;
  emptyHintKey: string;
};

const SECTION_CONFIG: Record<GuardSectionKey, SectionConfig> = {
  personalInfo: {
    titleKey: 'guardProfile.personalInformation',
    icon: 'user',
    emptyKey: 'guardProfile.notAvailable',
    emptyHintKey: 'guardProfile.comingSoon',
  },
  documents: {
    titleKey: 'guardProfile.documents',
    icon: 'file-text',
    emptyKey: 'guardProfile.documentsEmpty',
    emptyHintKey: 'guardProfile.documentsEmptyHint',
  },
  bankDetails: {
    titleKey: 'guardProfile.bankDetails',
    icon: 'briefcase',
    emptyKey: 'guardProfile.bankEmpty',
    emptyHintKey: 'guardProfile.bankEmptyHint',
  },
  emergencyContact: {
    titleKey: 'guardProfile.emergencyContact',
    icon: 'phone-call',
    emptyKey: 'guardProfile.emergencyEmpty',
    emptyHintKey: 'guardProfile.emergencyEmptyHint',
  },
  settings: {
    titleKey: 'guardProfile.settings',
    icon: 'settings',
    emptyKey: 'guardProfile.settingsEmpty',
    emptyHintKey: 'guardProfile.settingsEmptyHint',
  },
};

const GuardSectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const config = SECTION_CONFIG[route.params.section];

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
          {t(config.titleKey)}
        </Text>
        <View style={s.iconButton} />
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Feather name={config.icon} size={f(30)} color={ACCENT} />
          </View>
          <Text style={s.emptyTitle}>{t(config.emptyKey)}</Text>
          <Text style={s.emptyHint}>{t(config.emptyHintKey)}</Text>
        </View>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: w(64),
    height: w(64),
    borderRadius: w(32),
    backgroundColor: '#FDF3E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: h(6),
  },
  emptyTitle: {
    color: colors.primary,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.lg),
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
  emptyHint: {
    color: colors.textGray,
    fontFamily: typography.fontFamily,
    fontSize: f(typography.sizes.md),
    textAlign: 'center',
  },
});

export default GuardSectionScreen;