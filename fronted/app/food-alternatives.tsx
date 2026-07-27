import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import AlternativeMenuSection from '../components/scan/AlternativeMenuCard';
import { sugarCarbAlternativesByCategory, guessFoodCategory } from '../constants/mock-data';
import { colors } from '../theme/colors';
import { spacing, typography } from '../theme/typography';

const TITLE_COLOR = '#6A3A25';

export default function FoodAlternatives() {
  const { productName } = useLocalSearchParams<{ productName?: string }>();
  const category = guessFoodCategory(productName ?? '');
  const items = sugarCarbAlternativesByCategory[category] ?? sugarCarbAlternativesByCategory['기본'];

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={{ fontSize: 20 }}>←</Text>
        </Pressable>
        <Text style={styles.title}>대체 메뉴 보기</Text>
      </View>

      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        {productName ? `'${productName}'과 비슷한 카테고리에서, ` : ''}당류·탄수화물 부담이 적은 메뉴로 대신 추천해드려요
      </Text>

      <AlternativeMenuSection
        items={items}
        onSelect={(item) =>
          router.push({ pathname: '/(tabs)/scan-result', params: { productName: item.name } })
        }
      />
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
});