import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useDiary } from '../context/DiaryContext';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/typography';

const TITLE_COLOR = '#6A3A25';

const BASE_NUTRIENT = { carbG: 45, sugarG: 8, kcal: 320 };

type Level = 'safe' | 'caution' | 'danger';

function levelFromSugar(sugarG: number): Level {
  if (sugarG >= 25) return 'danger';
  if (sugarG >= 12) return 'caution';
  return 'safe';
}

const STATUS_META: Record<Level, { bg: string; border: string; icon: string; iconBg: string; label: string; title: string; desc: string }> = {
  safe: {
    bg: colors.safeSoft, border: colors.safe, icon: '✓', iconBg: colors.safe,
    label: '안전', title: '오늘의 누적 섭취량 기준 안전해요', desc: '해당 제품은 섭취에 적합한 제품이에요.',
  },
  caution: {
    bg: colors.cautionSoft, border: colors.caution, icon: '!', iconBg: colors.caution,
    label: '주의', title: '오늘의 누적 섭취량 기준 주의해야 해요', desc: '당류·탄수화물 비율이 다소 높은 편이에요.',
  },
  danger: {
    bg: colors.dangerSoft, border: colors.danger, icon: '✕', iconBg: colors.danger,
    label: '위험', title: '오늘의 누적 섭취량 기준 위험해요', desc: '혈당 스파이크에 주의가 필요한 수치예요.',
  },
};

const NUTRIENT_EMOJI: Record<string, string> = {
  탄수화물: '🌾',
  당류: '🍬',
  열량: '🔥',
};

function nutrientTone(label: string, value: number): { text: string; label: string } {
  if (label === '탄수화물') {
    return value >= 70 ? { text: colors.danger, label: '확인 필요' } : value >= 45 ? { text: colors.caution, label: '주의' } : { text: colors.safe, label: '안전' };
  }
  if (label === '당류') {
    return value >= 25 ? { text: colors.danger, label: '확인 필요' } : value >= 12 ? { text: colors.caution, label: '주의' } : { text: colors.safe, label: '안전' };
  }
  return value >= 500 ? { text: colors.danger, label: '확인 필요' } : value >= 300 ? { text: colors.caution, label: '주의' } : { text: colors.safe, label: '안전' };
}

function todayTimeLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${d}. ${hh}:${mm}`;
}

const PORTION_UNITS = ['인분', '그릇', '접시', '봉지', '조각', 'g', 'ml', '개'];

export default function ScanResultScreen() {
  const { productName: paramName, kcal: paramKcal, carbG: paramCarbG, sugarG: paramSugarG } =
    useLocalSearchParams<{ productName?: string; kcal?: string; carbG?: string; sugarG?: string }>();
  const { addEntry } = useDiary();
  const [portion, setPortion] = useState('1');
  const [unit, setUnit] = useState(PORTION_UNITS[0]);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);
  const [productName, setProductName] = useState(paramName || '');

  const scannedAt = useMemo(() => todayTimeLabel(), []);

  const baseNutrient = {
    carbG: paramCarbG ? parseFloat(paramCarbG) : BASE_NUTRIENT.carbG,
    sugarG: paramSugarG ? parseFloat(paramSugarG) : BASE_NUTRIENT.sugarG,
    kcal: paramKcal ? parseFloat(paramKcal) : BASE_NUTRIENT.kcal,
  };

  const multiplier = parseFloat(portion) || 0;
  const carbG = Math.round(baseNutrient.carbG * multiplier);
  const sugarG = Math.round(baseNutrient.sugarG * multiplier);
  const kcal = Math.round(baseNutrient.kcal * multiplier);

  const level = levelFromSugar(sugarG);
  const meta = STATUS_META[level];

  const nutrients = [
    { label: '탄수화물', value: `${carbG}g`, raw: carbG },
    { label: '당류', value: `${sugarG}g`, raw: sugarG },
    { label: '열량', value: `${kcal}kcal`, raw: kcal },
  ];

  const handleAdd = async () => {
    await addEntry({
      name: productName,
      kcal,
      caffeineMg: 0,
      sugarG,
      sodiumMg: 0,
      carbG,
    });
    router.push('/(tabs)/diary');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScreenContainer>
        <View style={styles.backRow}>
          <Pressable onPress={() => router.push('/(tabs)/scan')} hitSlop={12}>
            <Image source={require('../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
          </Pressable>
          <Text style={styles.title}>스캔 결과</Text>
        </View>

        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: spacing.md }]}>
          영양 성분표 인식이 완료되었어요!
        </Text>

        <Card>
          <Text style={typography.h3}>주요 영양 정보</Text>
          <View style={styles.nutrientGrid}>
            {nutrients.map((n) => {
              const tone = nutrientTone(n.label, n.raw);
              return (
                <View key={n.label} style={styles.nutrientBox}>
                  <Text style={styles.nutrientIcon}>{NUTRIENT_EMOJI[n.label]}</Text>
                  <Text style={[typography.bodyBold, { marginTop: 6 }]}>{n.label}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{n.value}</Text>
                  <Text style={[typography.captionBold, { color: tone.text, marginTop: 2 }]}>{tone.label}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={typography.bodyBold}>섭취량</Text>
          <View style={styles.portionRow}>
            <TextInput
              style={styles.portionInput}
              value={portion}
              onChangeText={setPortion}
              keyboardType="decimal-pad"
            />
            <Pressable style={styles.unitPill} onPress={() => setUnitPickerOpen(true)}>
              <Text style={typography.body}>{unit}</Text>
              <Text style={{ color: colors.textTertiary, marginLeft: 6 }}>▾</Text>
            </Pressable>
          </View>
        </Card>

        <View style={[styles.statusCard, { backgroundColor: meta.bg, borderColor: meta.border }]}>
          <View style={{ alignItems: 'center', width: 64 }}>
            <View style={[styles.statusIconCircle, { backgroundColor: meta.iconBg }]}>
              <Text style={styles.statusIconText}>{meta.icon}</Text>
            </View>
            <Text style={[typography.bodyBold, { color: meta.border, marginTop: 6 }]}>{meta.label}</Text>
          </View>
          <View style={styles.statusDivider} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>누적 섭취량 기준</Text>
            <Text style={[typography.h3, { color: meta.border, marginTop: 2 }]}>{meta.title}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>{meta.desc}</Text>
          </View>
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>
            '오늘의 섭취'에 기록하기 위해 음식명을 입력해주세요 :)
          </Text>
          <TextInput
            style={styles.nameInput}
            value={productName}
            onChangeText={setProductName}
            placeholder="예: 유기농 그릭 요거트"
            placeholderTextColor={colors.textTertiary}
          />
          <View style={styles.metaRow}>
            <Text style={[typography.caption, { color: colors.textTertiary, width: 68 }]}>스캔 시간</Text>
            <Text style={typography.body}>{scannedAt}</Text>
          </View>
        </Card>

        {level === 'danger' && (
          <View style={{ marginTop: spacing.md }}>
            <Button
              label="대체 메뉴 보기"
              variant="outline"
              onPress={() => router.push({ pathname: '/food-alternatives', params: { productName } })}
            />
          </View>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <Button label="오늘의 섭취에 추가" onPress={handleAdd} disabled={!productName.trim()} />
        </View>

        <Pressable
          style={{ marginTop: spacing.md, marginBottom: spacing.lg, alignItems: 'center' }}
          onPress={() => router.push('/(tabs)/scan')}
        >
          <Text style={[typography.bodyBold, { color: colors.primary, textDecorationLine: 'underline' }]}>
            다시 스캔하기
          </Text>
        </Pressable>
      </ScreenContainer>

      <Modal visible={unitPickerOpen} transparent animationType="fade" onRequestClose={() => setUnitPickerOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setUnitPickerOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={[typography.bodyBold, { marginBottom: spacing.sm }]}>섭취 단위 선택</Text>
            {PORTION_UNITS.map((u) => (
              <Pressable
                key={u}
                style={[styles.modalRow, u === unit && styles.modalRowActive]}
                onPress={() => {
                  setUnit(u);
                  setUnitPickerOpen(false);
                }}
              >
                <Text style={[typography.body, u === unit && { color: colors.primary, fontWeight: '700' }]}>{u}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
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
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  nameInput: {
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  portionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  portionInput: {
    flex: 1,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
  unitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  statusCard: {
    flexDirection: 'row',
    marginTop: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  statusIconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconText: { color: colors.textOnPrimary, fontSize: 22, fontWeight: '700' },
  statusDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  nutrientGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  nutrientBox: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    padding: spacing.sm,
    alignItems: 'center',
  },
  nutrientIcon: { fontSize: 22 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSheet: {
    width: '78%',
    maxHeight: '70%',
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  modalRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  modalRowActive: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
  },
});