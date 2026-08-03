import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import Button from '../components/ui/Button';
import { lookupFoodNutrition, ApiError } from '../lib/api';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/typography';

const TITLE_COLOR = '#6A3A25';

const POPULAR = ['떡볶이', '짜장면', '제육볶음', '마라탕', '김밥','삼겹살','햄버거','샌드위치'];

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToResult = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await lookupFoodNutrition(trimmed);
      router.push({
        pathname: '/scan-result',
        params: {
          productName: trimmed,
          carbG: String(result.carbG),
          sugarG: String(result.sugarG),
          kcal: String(result.kcal),
          source: 'search',
        },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '영양정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/scan')} hitSlop={12}>
          <Image source={require('../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>외식·집밥 메뉴 검색</Text>
      </View>

      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.md }]}>
        음식 이름을 검색하면 예상 당류·탄수화물을 확인할 수 있어요
      </Text>

      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="예: 떡볶이, 짜장면"
        placeholderTextColor={colors.textTertiary}
        returnKeyType="search"
        onSubmitEditing={() => goToResult(query)}
      />

      {!!error && (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm, textAlign: 'center' }]}>
          {error}
        </Text>
      )}

      <View style={{ marginTop: spacing.sm }}>
        <Button
          label={loading ? '조회 중...' : '검색'}
          onPress={() => goToResult(query)}
          disabled={!query.trim() || loading}
          loading={loading}
        />
      </View>

      <Text style={[typography.bodyBold, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>자주 찾는 음식</Text>
      <View style={styles.chipRow}>
        {POPULAR.map((food) => (
          <Pressable key={food} style={styles.chip} onPress={() => goToResult(food)} disabled={loading}>
            <Text style={typography.body}>{food}</Text>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: TITLE_COLOR,
  },
  input: {
    height: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.primarySoft,
  },
});