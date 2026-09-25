import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import ScalePressable from '../../../components/common/ScalePressable';
import { colors } from '../../../styles/colors';
import {
  scaleFont as f,
  scaleHeight as h,
  scaleWidth as w,
} from '../../../styles/dimensions';

type Props = {
  title: string;
  message: string;
  actionLabel: string;
  onUpgrade: () => void;
};

/**
 * Inline notice shown when the agency has used up the guards or sites included
 * in its current plan. Keeps the parent layout fixed and offers a direct route
 * to the Plan / Billing screen.
 */
const PlanLimitNotice: React.FC<Props> = ({
  title,
  message,
  actionLabel,
  onUpgrade,
}) => (
  <View style={s.card} accessibilityRole="alert">
    <View style={s.header}>
      <View style={s.iconWrap}>
        <Feather name="lock" size={f(14)} color="#B9640A" />
      </View>
      <Text style={s.title}>{title}</Text>
    </View>
    <Text style={s.message}>{message}</Text>
    <ScalePressable
      style={s.button}
      onPress={onUpgrade}
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
    >
      <Feather name="arrow-up-circle" size={f(16)} color={colors.white} />
      <Text style={s.buttonText}>{actionLabel}</Text>
    </ScalePressable>
  </View>
);

const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#F0C070',
    backgroundColor: '#FFF8E6',
    borderRadius: w(8),
    padding: w(12),
    marginBottom: h(15),
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: w(8) },
  iconWrap: {
    width: w(24),
    height: w(24),
    borderRadius: w(12),
    backgroundColor: '#FFE9BC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, color: '#8A5A00', fontSize: f(15), fontWeight: '700' },
  message: {
    color: '#4B5563',
    fontSize: f(13),
    lineHeight: f(18),
    marginTop: h(6),
  },
  button: {
    minHeight: h(42),
    borderRadius: w(7),
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: w(8),
    marginTop: h(10),
  },
  buttonText: { color: colors.white, fontSize: f(14), fontWeight: '700' },
});

export default PlanLimitNotice;
