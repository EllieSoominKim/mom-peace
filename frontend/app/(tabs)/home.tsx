import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import ScreenContainer from '../../components/ui/ScreenContainer';
import HomeHeader from '../../components/home/HomeHeader';
import HeroCard from '../../components/home/HeroCard';
import IntakeSummaryCard from '../../components/home/IntakeSummaryCard';
import TodayFoodCard, { FoodItem } from '../../components/home/TodayFoodCard';
import TodayCareCard from '../../components/home/TodayCareCard';
import QuickMenu from '../../components/home/QuickMenu';
import ChatFAB from '../../components/chat/ChatFAB';
import { useRouter } from 'expo-router';

// 초기 MOCK 데이터
const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: '아메리카노 (ICED)',
    amount: '1잔 (355ml)',
    time: '09:30',
    category: '카페인',
  },
  {
    id: '2',
    name: '호밀빵 샌드위치',
    amount: '1개 (200g)',
    time: '12:15',
    category: '식사',
  },
  {
    id: '3',
    name: '초콜릿 쿠키',
    amount: '1개 (50g)',
    time: '15:00',
    category: '간식',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  // 1. 오늘의 섭취 음식 리스트 상태 관리
  const [todayFoods, setTodayFoods] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);

  // 2. 섭취 요약 데이터 상태 관리 (삭제 시 영양성분 차감을 위해 state로 변환)
  const [intakeSummary, setIntakeSummary] = useState({
    calories: { current: 1250, target: 2000, unit: 'kcal' },
    carbo: { current: 150, target: 250, unit: 'g' },
    sugar: { current: 25, target: 50, unit: 'g' },
    sodium: { current: 1100, target: 2000, unit: 'mg' },
    caffeine: { current: 150, target: 300, unit: 'mg' },
  });

  // 메뉴 삭제 처리 함수
  const handleDeleteFood = (id: string) => {
    // 삭제할 아이템 찾기
    const targetFood = todayFoods.find((food) => food.id === id);

    // 리스트에서 해당 아이템 제거
    setTodayFoods((prevFoods) => prevFoods.filter((food) => food.id !== id));

    // 선택적으로 영양성분 요약 수치 감소 (기본 차감 로직)
    if (targetFood) {
      setIntakeSummary((prev) => ({
        ...prev,
        calories: { ...prev.calories, current: Math.max(0, prev.calories.current - 150) },
        carbo: { ...prev.carbo, current: Math.max(0, prev.carbo.current - 20) },
        sugar: { ...prev.sugar, current: Math.max(0, prev.sugar.current - 5) },
        caffeine: {
          ...prev.caffeine,
          current: targetFood.category === '카페인' ? Math.max(0, prev.caffeine.current - 75) : prev.caffeine.current,
        },
      }));
    }
  };

  return (
    <ScreenContainer style={styles.container}>
      <HomeHeader
        userName="김엄마"
        onNotificationPress={() => {}}
        onProfilePress={() => router.push('/(tabs)/mypage')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <HeroCard
          title="오늘도 아이와 함께 건강한 하루!"
          subtitle="맞춤형 영양 관리로 마음 편한 일상을 시작해보세요."
        />

        {/* 섭취 요약 카드 */}
        <IntakeSummaryCard data={intakeSummary} />

        {/* 오늘의 섭취 목록 카드 */}
        <TodayFoodCard
          items={todayFoods}
          onAddPress={() => router.push('/food-search')}
          onItemPress={(item) => {}}
          onDeletePress={handleDeleteFood} // 삭제 함수 바인딩
        />

        {/* 오늘의 케어 */}
        <TodayCareCard />

        {/* 퀵 메뉴 */}
        <QuickMenu />
      </ScrollView>

      {/* 챗봇 플로팅 버튼 */}
      <ChatFAB onPress={() => router.push('/chat-modal')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
});