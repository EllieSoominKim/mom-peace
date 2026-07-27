import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import AlternativeMenuSection from '../components/scan/AlternativeMenuCard';
import { AlternativeItem } from '../lib/api';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

export default function ScanAlternatives() {
  const { productName, alternatives } = useLocalSearchParams<{
    productName: string;
    alternatives: string;
  }>();

  let items: AlternativeItem[] = [];
  try {
    items = alternatives ? JSON.parse(alternatives) : [];
  } catch {
    items = [];
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={typography.h3}>대체 메뉴</Text>
        <View style={{ width: 20 }} />
      </View>

      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md }]}>
        {productName ? `'${productName}' 대신 이런 건 어때요?` : '이런 메뉴는 어때요?'}
      </Text>

      {items.length > 0 ? (
        <AlternativeMenuSection items={items} />
      ) : (
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            아직 추천할 대체 메뉴가 없어요
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
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});