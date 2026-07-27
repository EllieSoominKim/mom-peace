import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/typography';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
};

export default function Card({ children, style, padding = 16 }: Props) {
  return <View style={[styles.card, { padding }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
  },
});
