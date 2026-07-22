import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusLevel, statusColor } from '../../theme/colors';
import { radius, typography } from '../../theme/typography';

type Props = {
  level: StatusLevel;
  size?: 'sm' | 'lg';
};

export default function StatusBadge({ level, size = 'sm' }: Props) {
  const { main, soft, label } = statusColor(level);
  const isLg = size === 'lg';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: soft },
        isLg && { paddingVertical: 8, paddingHorizontal: 16 },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: main }]} />
      <Text
        style={[
          isLg ? typography.h3 : typography.captionBold,
          { color: main },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
