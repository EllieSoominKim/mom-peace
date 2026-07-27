import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

type Props = {
  name: string;
  week: number;
  day: number;
  dateLabel: string; // 예: "2026.05.15 (금)"
  dueDate: string; // "2026.10.26" 또는 "2026-10-26"
};

export default function HeroCard({ name, week, day, dateLabel, dueDate }: Props) {
  const dDayValue = dDay(dueDate);

  return (
    <LinearGradient
      colors={[colors.primarySoft, '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={{ flex: 1 }}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {name}님, 오늘도 맘편하게
        </Text>
        <Text style={[typography.h1, { marginTop: 6, color: colors.heroText }]}>
          ♥ {week}주 {day}일
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {dateLabel}
        </Text>

        <Pressable style={styles.dueBadge} onPress={() => router.push('/(tabs)/mypage')}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            {dueDate ? `예정일 D-${dDayValue}` : '예정일 미설정'}
          </Text>
        </Pressable>
      </View>

      <Image
        source={require('../../assets/images/home-hero.png')}
        style={styles.hero}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

// 점(.)과 하이픈(-) 형태의 날짜 포맷을 모두 지원하는 D-Day 계산 함수
function dDay(dueDate: string) {
  if (!dueDate) return 0;

  // '.' 이나 '-' 모두 잘라낼 수 있도록 정규식 사용
  const parts = dueDate.split(/[.-]/).map((v) => parseInt(v, 10));
  if (parts.length < 3) return 0;

  const [y, m, d] = parts;
  if (!y || !m || !d) return 0;

  // 자정(00:00:00) 기준으로 계산하기 위해 시/분/초 초기화
  const targetDate = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, // 기존 0에서 정돈된 패딩으로 변경
    marginTop: spacing.sm,
  },
  dueBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgWhite,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: spacing.md,
  },
  hero: {
    width: 150,
    height: 150,
  },
});