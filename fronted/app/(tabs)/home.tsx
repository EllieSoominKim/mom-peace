import React from 'react';
import ScreenContainer from '../../components/ui/ScreenContainer';
import HomeHeader from '../../components/home/HomeHeader';
import HeroCard from '../../components/home/HeroCard';
import IntakeSummaryCard from '../../components/home/IntakeSummaryCard';
import QuickMenu from '../../components/home/QuickMenu';
import TodayCareCard from '../../components/home/TodayCareCard';
import { todayIntake, todayGuide } from '../../constants/mock-data';
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

  return (
    <ScreenContainer>
      <HomeHeader />
      <HeroCard
        name={user?.nickname ?? '회원'}
        week={user?.week ?? 0}
        day={user?.day ?? 0}
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
        exercise={{ icon: '🚶‍♀️', href: '/(tabs)/home', ...todayGuide.exercise }}
        nutrient={{ icon: '🥬', href: '/(tabs)/home', ...todayGuide.nutrient }}
      />
    </ScreenContainer>
  );
}