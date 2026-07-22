import React from 'react';
import { Text } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import IntakeSummaryCard from '../../components/home/IntakeSummaryCard';
import TodayFoodCard from '../../components/home/TodayFoodCard';
import { todayIntake } from '../../constants/mock-data';
import { useUser } from '../../context/UserContext';
import { useDiary, DAILY_LIMITS } from '../../context/DiaryContext';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';

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
  const { entries, caffeineTotal, sugarTotal, carbTotal } = useDiary();
  const hasEntries = entries.length > 0;

  return (
    <ScreenContainer>
      <Text style={[typography.h2, { marginTop: spacing.md }]}>오늘의 섭취</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
        {todayLabel()} · {user?.week ? `${user.week}주 ${user.day}일` : '기본 정보 미입력'}
      </Text>

      <IntakeSummaryCard
        caffeine={{ current: caffeineTotal, max: DAILY_LIMITS.caffeine, unit: 'mg' }}
        sugar={{ current: sugarTotal, max: todayIntake.sugarDailyMax, unit: 'g' }}
        carb={{ current: carbTotal, max: todayIntake.carbDailyMax, unit: 'g' }}
        hasEntries={hasEntries}
      />
      {hasEntries && <TodayFoodCard items={entries} showViewAll={false} />}
    </ScreenContainer>
  );
}