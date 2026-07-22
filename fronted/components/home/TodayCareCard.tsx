import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Card from '../ui/Card';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

type Item = { icon: string; title: string; desc: string; href: string };

export default function TodayCareCard({ exercise, nutrient }: { exercise: Item; nutrient: Item }) {
  const items = [exercise, nutrient];
  return (
    <Card style={{ marginTop: spacing.md }}>
      <Text style={typography.h3}>오늘 챙길 것</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
        {items.map((item) => (
          <View key={item.title} style={styles.subBox}>
            <Text style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</Text>
            <Text style={typography.bodyBold}>{item.title}</Text>
            <Text style={[typography.small, styles.desc]} numberOfLines={2}>
              {item.desc}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  subBox: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  desc: { color: colors.textSecondary, marginTop: 4 },
});