import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import IntakeSummaryCard from '../../components/home/IntakeSummaryCard';
import TodayFoodCard from '../../components/home/TodayFoodCard';
import { todayIntake } from '../../constants/mock-data';
import { useUser } from '../../context/UserContext';
import { useDiary, DAILY_LIMITS } from '../../context/DiaryContext';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';

const TITLE_COLOR = '#6A3A25';
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function todayLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}.${m}.${d} (${WEEKDAYS[now.getDay()]})`;
}

export default function Diary() {
  const { user } = useUser();
  const { entries, caffeineTotal, sugarTotal, carbTotal, deleteEntry } = useDiary();
  const hasEntries = entries.length > 0;

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
          <Image source={require('../../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>오늘의 섭취</Text>
      </View>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
        {todayLabel()} · {user?.week ? `${user.week}주 ${user.day}일` : '기본 정보 미입력'}
      </Text>

      <IntakeSummaryCard
        caffeine={{ current: caffeineTotal, max: DAILY_LIMITS.caffeine, unit: 'mg' }}
        sugar={{ current: sugarTotal, max: todayIntake.sugarDailyMax, unit: 'g' }}
        carb={{ current: carbTotal, max: todayIntake.carbDailyMax, unit: 'g' }}
        hasEntries={hasEntries}
      />
      <TodayFoodCard
        items={entries}
        showViewAll={false}
        onAddPress={() => router.push('/scan')}
        onDeletePress={deleteEntry}
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
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: TITLE_COLOR,
  },
});