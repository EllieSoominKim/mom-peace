import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Card from '../ui/Card';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

export type FoodLogItem = {
  id: string;
  time: string;
  name: string;
  kcal: number;
  caffeineMg?: number;
};

export default function TodayFoodCard({
  items,
  showViewAll = true,
  onAddPress,
  onDeletePress,
}: {
  items: FoodLogItem[];
  showViewAll?: boolean;
  onAddPress?: () => void;
  onDeletePress?: (id: string) => void;
}) {
  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.headerRow}>
        <Text style={typography.h3}>오늘 먹은 음식</Text>
        {onAddPress ? (
          <Pressable style={styles.addBtn} onPress={onAddPress}>
            <Text style={[typography.captionBold, { color: colors.primary }]}>+ 추가하기</Text>
          </Pressable>
        ) : (
          showViewAll && (
            <Pressable onPress={() => router.push('/(tabs)/diary')}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>전체 보기 ›</Text>
            </Pressable>
          )
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>오늘 섭취한 음식이 없어요.</Text>
          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 4 }]}>
            영양성분표를 촬영해서 기록해보세요!
          </Text>
        </View>
      ) : (
        <View>
          {items.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.row, idx !== items.length - 1 && styles.rowDivider]}
            >
              <Text style={[typography.caption, { color: colors.textTertiary, width: 48 }]}>{item.time}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { flex: 1 }]}>{item.name}</Text>
                {!!item.caffeineMg && item.caffeineMg > 0 && (
                  <Text style={[typography.small, { color: colors.textTertiary, marginTop: 2 }]}>카페인</Text>
                )}
              </View>
              <Text style={[typography.captionBold, { color: colors.primary }]}>{item.kcal}kcal</Text>
              {onDeletePress && (
                <Pressable onPress={() => onDeletePress(item.id)} hitSlop={10} style={styles.deleteBtn}>
                  <Text style={{ color: colors.textTertiary, fontSize: 16, fontWeight: '700' }}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      )}
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
  addBtn: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  emptyBox: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  deleteBtn: {
    width: 24,
    height: 24,
    marginLeft: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});