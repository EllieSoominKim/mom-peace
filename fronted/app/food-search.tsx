import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import Button from '../components/ui/Button';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/typography';

const TITLE_COLOR = '#6A3A25';

const POPULAR = ['떡볶이', '짜장면', '제육볶음', '마라탕', '김밥'];

export default function FoodSearch() {
  const [query, setQuery] = useState('');

  const goToResult = (name: string) => {
    if (!name.trim()) return;
    router.push({ pathname: '/scan-result', params: { productName: name.trim() } });
  };

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/(tabs)/scan')} hitSlop={12}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={styles.title}>외식·집밥 검색</Text>
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

      <View style={{ marginTop: spacing.sm }}>
        <Button label="검색" onPress={() => goToResult(query)} disabled={!query.trim()} />
      </View>

      <Text style={[typography.bodyBold, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>자주 찾는 음식</Text>
      <View style={styles.chipRow}>
        {POPULAR.map((food) => (
          <Pressable key={food} style={styles.chip} onPress={() => goToResult(food)}>
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