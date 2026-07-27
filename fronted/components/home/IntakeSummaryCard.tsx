import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Card from '../ui/Card';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

type Nutrient = { current: number; max: number; unit: string };

function ProgressRow({
  label,
  current,
  max,
  unit,
  barColor,
  barBgColor,
}: {
  label: string;
  current: number;
  max: number;
  unit: string;
  barColor: string;
  barBgColor: string;
}) {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <View style={{ marginTop: spacing.sm }}>
      <View style={styles.progressLabelRow}>
        <Text style={typography.body}>{label}</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          {current} / {max}{unit}
        </Text>
      </View>
      <View style={[styles.barBg, { backgroundColor: barBgColor }]}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
      </View>
    </View>
  );
}

export default function IntakeSummaryCard({
  caffeine,
  sugar,
  carb,
  hasEntries = true,
}: {
  caffeine: Nutrient;
  sugar: Nutrient;
  carb: Nutrient;
  hasEntries?: boolean;
}) {
  const pct = Math.min(100, Math.round((caffeine.current / caffeine.max) * 100));
  const remaining = Math.max(0, caffeine.max - caffeine.current);

  return (
    <Card style={{ marginTop: spacing.md }}>
      <View style={styles.headerRow}>
        <Text style={typography.h3}>오늘의 현황</Text>
        <Text style={[typography.small, { color: colors.textTertiary }]}>기준: 주차별 1일 권장 허용량</Text>
      </View>

      {!hasEntries ? (
        <View style={styles.emptyBox}>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>
            오늘 기록된 섭취가 없어요!{'\n\n'}'오늘의 음식'이나 '오늘의 카페인'을 통해{'\n'}먹은 음식과 카페인을 기록해보세요 :)
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.boxRow}>
            <View style={[styles.box, { backgroundColor: colors.bgWhite, borderWidth: 1, borderColor: colors.border }]}>
              <View style={styles.boxTitleRow}>
                <Image source={require('../../assets/icons/caffeine.png')} style={styles.boxIcon} resizeMode="contain" />
                <Text style={typography.bodyBold}>카페인</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 8 }}>
                <Text style={styles.bigNumber}>{caffeine.current}</Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 4 }]}>
                  {' '}/ {caffeine.max}{caffeine.unit}
                </Text>
              </View>
              <View style={styles.barRow}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={[typography.small, { color: colors.textTertiary }]}>{pct}%</Text>
              </View>
            </View>

            <View style={[styles.box, styles.remainingBox]}>
              <Image
                source={require('../../assets/icons/devicon_coffeescript.png')}
                style={styles.remainingDecoIcon}
                resizeMode="contain"
              />
              <Text style={typography.bodyBold}>잔여 허용량</Text>
              <Text style={styles.remainingNumber}>
                {remaining}
                <Text style={typography.body}> {caffeine.unit}</Text>
              </Text>
            </View>
          </View>

          <Text style={[typography.bodyBold, { marginTop: spacing.md }]}>오늘 누적 당류·탄수화물</Text>
          <ProgressRow
  label="당류"
  current={sugar.current}
  max={sugar.max}
  unit={sugar.unit}
  barColor={colors.sugarBar}
  barBgColor={colors.sugarBarSoft}
/>
<ProgressRow
  label="탄수화물"
  current={carb.current}
  max={carb.max}
  unit={carb.unit}
  barColor={colors.carbBar}
  barBgColor={colors.carbBarSoft}
/>
        </>
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
  emptyBox: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  boxRow: { flexDirection: 'row', gap: spacing.sm },
  box: {
    flex: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  remainingBox: {
    backgroundColor: colors.remainingBoxBg,
    overflow: 'hidden',
    position: 'relative',
  },
  remainingDecoIcon: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 90,
    height: 90,
  },
  boxTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  boxIcon: { width: 18, height: 18 },
  bigNumber: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  remainingNumber: { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  barBg: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bgSoft,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: radius.pill, backgroundColor: colors.primary },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
});