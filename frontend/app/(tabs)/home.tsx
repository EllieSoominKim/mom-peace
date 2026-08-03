import React from 'react';
import ScreenContainer from '../../components/ui/ScreenContainer';
import HomeHeader from '../../components/home/HomeHeader';
import HeroCard from '../../components/home/HeroCard';
import IntakeSummaryCard from '../../components/home/IntakeSummaryCard';
import QuickMenu from '../../components/home/QuickMenu';
import TodayCareCard from '../../components/home/TodayCareCard';
import { todayIntake, getTodayGuide } from '../../constants/mock-data';
import { useUser } from '../../context/UserContext';
import { useDiary, DAILY_LIMITS } from '../../context/DiaryContext';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function todayLabel() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}.${m}.${d} (${WEEKDAYS[now.getDay()]})`;
}

export default function Home() {
  const { user } = useUser();
  const { entries, caffeineTotal, sugarTotal, carbTotal } = useDiary();
  const hasEntries = entries.length > 0;

  // week/pregnancyWeeks 호환 처리
  const currentWeek = user?.week ?? user?.pregnancyWeeks ?? 0;
  const currentDay = user?.day ?? user?.pregnancyDays ?? 0;

  const todayGuide = getTodayGuide(currentWeek);

  return (
    <ScreenContainer>
      <HomeHeader />
      <HeroCard
        name={user?.nickname ?? '회원'}
        week={currentWeek}
        day={currentDay}
        dateLabel={todayLabel()}
        dueDate={user?.dueDate ?? ''}
      />
      <IntakeSummaryCard
        caffeine={{ current: caffeineTotal, max: DAILY_LIMITS.caffeine, unit: 'mg' }}
        sugar={{ current: sugarTotal, max: todayIntake.sugarDailyMax, unit: 'g' }}
        carb={{ current: carbTotal, max: todayIntake.carbDailyMax, unit: 'g' }}
        hasEntries={hasEntries}
      />
      <QuickMenu />
      <TodayCareCard
        exercise={{ icon: require('../../assets/icons/home_exercise.png'), href: '/(tabs)/home', ...todayGuide.exercise }}
        nutrient={{ icon: require('../../assets/icons/home_medicine.png'), href: '/(tabs)/home', ...todayGuide.nutrient }}
      />
    </ScreenContainer>
  );
}