import React from 'react';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { colors } from '../../theme/colors';

const ICONS: Record<string, ReturnType<typeof require>> = {
  home: require('../../assets/tabbar/bottom_home.png'),
  diary: require('../../assets/tabbar/bottom_diary.png'),
  'community/index': require('../../assets/tabbar/tab_community.png'),
  chat: require('../../assets/icons/chat.png'),
  mypage: require('../../assets/tabbar/bottom_my.png'),
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: colors.bgWhite,
          borderTopColor: colors.divider,
        },
        tabBarLabelStyle: { fontSize: 11 },
        tabBarIcon: ({ focused }) => (
          <Image
            source={ICONS[route.name]}
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? colors.primary : colors.textTertiary,
            }}
            resizeMode="contain"
          />
        ),
      })}
    >
      <Tabs.Screen name="home" options={{ title: '홈' }} />
      <Tabs.Screen name="diary" options={{ title: '오늘의 섭취' }} />
      <Tabs.Screen name="community/index" options={{ title: '커뮤니티' }} />
      <Tabs.Screen name="chat" options={{ title: '챗봇', tabBarHideOnKeyboard: true }} />
      <Tabs.Screen name="mypage" options={{ title: '마이' }} />

      {/* 탭바는 보이되, 탭바 버튼으로는 노출되지 않는 화면들 (href: null) */}
      <Tabs.Screen name="scan" options={{ href: null }} />
      <Tabs.Screen name="scan-result" options={{ href: null }} />
      <Tabs.Screen name="food-search" options={{ href: null }} />
      <Tabs.Screen name="community-write" options={{ href: null }} />
      <Tabs.Screen name="community-post/[id]" options={{ href: null }} />
      <Tabs.Screen name="food-alternatives" options={{ href: null }} />
    </Tabs>
  );
}