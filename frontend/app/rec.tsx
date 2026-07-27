import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import AlternativeMenuSection from '../components/scan/AlternativeMenuCard';
import { recCategories, recAlternativesByCategory } from '../constants/mock-data';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/typography';

export default function Rec() {
  const [active, setActive] = useState<(typeof recCategories)[number]>('카페인');
  const items = recAlternativesByCategory[active] ?? [];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={typography.h3}>오늘의 추천</Text>
        <View style={{ width: 20 }} />
      </View>

      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        오늘 먹은 양과 임신 주차를 기준으로 추천해 드려요
      </Text>

      <View style={styles.filterRow}>
        {recCategories.map((c) => (
          <Pressable
            key={c}
            onPress={() => setActive(c)}
            style={[styles.chip, active === c && styles.chipActive]}
          >
            <Text style={[typography.bodyBold, active === c && { color: colors.textOnPrimary }]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      {items.length > 0 ? (
        <AlternativeMenuSection items={items} />
      ) : (
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            아직 준비 중인 카테고리예요
          </Text>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
