import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import AlternativeMenuSection from '../components/scan/AlternativeMenuCard';
import { getFoodAlternatives, AlternativeFoodItem, ApiError } from '../lib/api';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

const TITLE_COLOR = '#6A3A25';

export default function FoodAlternatives() {
  const { productName } = useLocalSearchParams<{ productName?: string }>();
  const [items, setItems] = useState<AlternativeFoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getFoodAlternatives(productName ?? '')
      .then((res) => {
        if (!cancelled) setItems(res.items);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : '대체 메뉴를 불러오지 못했어요.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productName]);

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Image source={require('../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>대체 메뉴 보기</Text>
      </View>

      <Text style={styles.subtitle}>
        오늘 잔여 허용량 안에서 즐길 수 있는 대체 메뉴예요
      </Text>

      {loading && (
        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {!loading && !!error && (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md, textAlign: 'center' }]}>
          {error}
        </Text>
      )}

      {!loading && !error && (
        <AlternativeMenuSection
          items={items}
          onSelect={(item) =>
            router.push({ pathname: '/scan-result', params: { productName: item.name } })
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: TITLE_COLOR,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});