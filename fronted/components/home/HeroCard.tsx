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
  dueDate: string; // "2026.10.26"
};

export default function HeroCard({ name, week, day, dateLabel, dueDate }: Props) {
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
        <Text style={[typography.h1, { marginTop: 6, color: colors.heroText }]}>♥ {week}주 {day}일</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {dateLabel}
        </Text>

        <Pressable style={styles.dueBadge} onPress={() => router.push('/(tabs)/mypage')}>
          <Text style={[typography.captionBold, { color: colors.primary }]}>
            {dueDate ? `예정일 D-${dDay(dueDate)}` : '예정일 미설정'}
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

function dDay(dueDate: string) {
  const [y, m, d] = dueDate.split('.').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return 0;
  const diff = Math.ceil((new Date(y, m - 1, d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 0;
}

const styles = StyleSheet.create({
  card: {
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: radius.lg,
  paddingHorizontal: spacing.lg,
  paddingVertical: 0,
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
  hero: { width: 170, height: 170 },
});