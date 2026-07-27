import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useDiary, DAILY_LIMITS } from '../../context/DiaryContext';
import { searchCafeMenu, CafeMenuItem, ApiError } from '../../lib/api';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const TITLE_COLOR = '#6A3A25';

const STRENGTH_OPTIONS = [
  { label: '연하게', value: 0.5 },
  { label: '기본', value: 1 },
  { label: '진하게', value: 1.5 },
] as const;

function round(n: number) {
  return Math.round(n);
}

export default function CaffeineTodayScreen() {
  const { caffeineTotal, sugarTotal, carbTotal, addEntry } = useDiary();

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<CafeMenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<CafeMenuItem | null>(null);
  const [strength, setStrength] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearched(false);
    setError(null);
    setSelected(null);
    setStrength(null);
    try {
      const res = await searchCafeMenu(q);
      setResults(res.results);
      setSearched(true);
      // 프랜차이즈 결과 없이 '집/카페' 일반 매칭만 있는 경우 -> 바로 선택된 것으로 처리
      const onlyGeneric = res.results.length === 1 && res.results[0].isGeneric;
      if (onlyGeneric) {
        setSelected(res.results[0]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '검색 중 문제가 생겼어요. 다시 시도해주세요.');
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const resetSearch = () => {
    setSelected(null);
    setStrength(null);
  };

  const multiplier = strength ?? 1;
  const finalValues = selected
    ? {
        caffeineMg: round(selected.caffeineMg * multiplier),
        sugarG: round(selected.sugarG * multiplier),
        carbG: round(selected.carbG * multiplier),
        kcal: round(selected.kcal * multiplier),
      }
    : null;

  const remaining = (before: number, delta: number) => ({
    before: Math.max(0, round(before)),
    after: Math.max(0, round(before - delta)),
  });

  const caffeineRemaining = finalValues
    ? remaining(DAILY_LIMITS.caffeine - caffeineTotal, finalValues.caffeineMg)
    : null;
  const sugarRemaining = finalValues
    ? remaining(DAILY_LIMITS.sugar - sugarTotal, finalValues.sugarG)
    : null;
  const carbRemaining = finalValues
    ? remaining(DAILY_LIMITS.carb - carbTotal, finalValues.carbG)
    : null;

  const handleAdd = async () => {
    if (!selected || !finalValues) return;
    setAdding(true);
    try {
      const displayName = selected.brand ? `${selected.brand} ${selected.name}` : `${selected.name} (직접 입력)`;
      const label = strength && strength !== 1 ? `${displayName} · ${STRENGTH_OPTIONS.find((s) => s.value === strength)?.label}` : displayName;
      await addEntry({
        name: label,
        kcal: finalValues.kcal,
        caffeineMg: finalValues.caffeineMg,
        sugarG: finalValues.sugarG,
        sodiumMg: 0,
        carbG: finalValues.carbG,
      });
      router.push('/(tabs)/home');
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
          <Image source={require('../../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>카페인 함유량 검색</Text>
      </View>

      <Text style={styles.subtitle}>
        프랜차이즈 카페 메뉴를 검색하거나, 집/카페에서 만든 커피 이름을 입력해보세요.
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="프랜차이즈 카페 메뉴 검색 (예: 스타벅스 아메리카노)"
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          onSubmitEditing={runSearch}
        />
      </View>

      <View style={styles.cautionCard}>
        <Text style={[typography.captionBold, { color: colors.primary }]}>
          ⚠ 프랜차이즈 카페 메뉴가 아니라면? (집, 개인 카페 등)
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
          아메리카노, 라떼, 바닐라라떼처럼 메뉴 이름만 입력해도 1잔 기준에 맞추어 일반적인 카페인 함유량을 알려드려요.
        </Text>
      </View>

      <View style={{ marginTop: spacing.md }}>
        <Button
          label={searching ? '검색 중...' : '검색'}
          variant="outline"
          onPress={runSearch}
          disabled={!query.trim() || searching}
          loading={searching}
        />
      </View>

      {!!error && (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md, textAlign: 'center' }]}>
          {error}
        </Text>
      )}

      {searched && !error && results.length === 0 && (
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.lg, textAlign: 'center' }]}>
          검색 결과가 없어요. 다른 메뉴 이름으로 검색해보세요.
        </Text>
      )}

      {searched && !selected && results.length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.bodyBold, { marginBottom: spacing.sm }]}>검색 결과</Text>
          {results.map((item) => (
            <Pressable key={item.id} onPress={() => setSelected(item)}>
              <Card style={styles.resultCard}>
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyBold}>
                    {item.isGeneric ? `${item.name} (직접 입력 · 1잔 기준)` : `${item.brand} ${item.name}`}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    카페인 {item.caffeineMg}mg · 당류 {item.sugarG}g · 탄수화물 {item.carbG}g
                  </Text>
                </View>
                <Text style={{ color: colors.textTertiary, fontSize: 18 }}>›</Text>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      {selected && (
        <>
          <View style={styles.selectedRow}>
            <Text style={[typography.bodyBold, { color: colors.primary }]}>
              {selected.isGeneric ? `${selected.name} (직접 입력)` : `${selected.brand} ${selected.name}`}
            </Text>
            <Pressable onPress={resetSearch} hitSlop={8}>
              <Text style={[typography.caption, { color: colors.textTertiary, textDecorationLine: 'underline' }]}>
                다시 선택
              </Text>
            </Pressable>
          </View>

          <Text style={[typography.bodyBold, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>연하게 정도</Text>
          <View style={styles.strengthRow}>
            {STRENGTH_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.strengthBox, strength === opt.value && styles.strengthBoxActive]}
                onPress={() => setStrength(opt.value)}
              >
                <Text
                  style={[
                    typography.bodyBold,
                    { color: strength === opt.value ? colors.primary : colors.textPrimary },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {finalValues && caffeineRemaining && sugarRemaining && carbRemaining && (
            <>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.lg }]}>
                이 메뉴를 기록하면, 오늘 남은 허용량이 이렇게 바뀌어요
              </Text>
              <View style={styles.remainingRow}>
                <RemainingBox label="카페인" unit="mg" data={caffeineRemaining} />
                <RemainingBox label="당류" unit="g" data={sugarRemaining} />
                <RemainingBox label="탄수화물" unit="g" data={carbRemaining} />
              </View>
            </>
          )}
        </>
      )}

      <View style={{ marginTop: spacing.xl }}>
        <Button
          label={adding ? '추가 중...' : '오늘의 섭취에 추가'}
          onPress={handleAdd}
          disabled={!selected || !strength || adding}
          loading={adding}
        />
      </View>
    </ScreenContainer>
  );
}

function RemainingBox({
  label,
  unit,
  data,
}: {
  label: string;
  unit: string;
  data: { before: number; after: number };
}) {
  const alreadyMaxed = data.before === 0;
  return (
    <View style={styles.remainingBox}>
      <Image
        source={require('../../assets/images/coffee.png')}
        style={styles.remainingDecoIcon}
        resizeMode="contain"
      />
      <Text style={typography.captionBold}>{label}</Text>
      <View style={styles.remainingValueRow}>
        <Text style={styles.remainingBefore}>
          {data.before}
          {unit}
        </Text>
        <Text style={{ color: colors.textTertiary, marginHorizontal: 4 }}>→</Text>
        <Text style={styles.remainingAfter}>
          {data.after}
          {unit}
        </Text>
      </View>
      {alreadyMaxed && (
        <Text style={styles.remainingMaxedNote}>오늘 이미 권장량을 다 채웠어요</Text>
      )}
    </View>
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
  searchRow: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  cautionCard: {
    marginTop: spacing.md,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  selectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  strengthRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  strengthBox: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  remainingRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  remainingBox: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.remainingBoxBg,
    padding: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  remainingDecoIcon: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 56,
    height: 56,
    opacity: 0.5,
  },
  remainingValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  remainingBefore: {
    ...typography.caption,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  remainingAfter: {
    ...typography.bodyBold,
    fontSize: 16,
    color: colors.primary,
  },
  remainingMaxedNote: {
    ...typography.small,
    color: colors.danger,
    marginTop: 6,
  },
});