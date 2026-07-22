import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Card from '../ui/Card';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';

type FoodLogItem = { time: string; name: string; kcal: number };

export default function TodayFoodCard({
  items,
  showViewAll = true,
}: {
  items: FoodLogItem[];
  showViewAll?: boolean;
}) {
  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.headerRow}>
        <Text style={typography.h3}>오늘 먹은 음식</Text>
        {showViewAll && (
          <Pressable onPress={() => router.push('/(tabs)/diary')}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>전체 보기 ›</Text>
          </Pressable>
        )}
      </View>

      <View>
        {items.map((item, idx) => (
          <View
            key={`${item.time}-${item.name}`}
            style={[styles.row, idx !== items.length - 1 && styles.rowDivider]}
          >
            <Text style={[typography.caption, { color: colors.textTertiary, width: 48 }]}>{item.time}</Text>
            <Text style={[typography.bodyBold, { flex: 1 }]}>{item.name}</Text>
            <Text style={[typography.captionBold, { color: colors.primary }]}>{item.kcal}kcal</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});