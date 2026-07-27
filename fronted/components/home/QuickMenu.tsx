import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const ITEMS = [
  {
    icon: require('../../assets/icons/home_nutrition.png'),
    title: '오늘의 음식',
    desc: '영양성분표 스캔',
    href: '/(tabs)/scan',
  },
  {
    icon: require('../../assets/icons/home_coffee.png'),
    title: '오늘의 카페인',
    desc: '카페인 함유량 검색',
    href: '/caffeine-today',
  },
] as const;

export default function QuickMenu() {
  return (
    <View style={styles.row}>
      {ITEMS.map((item) => (
        <Pressable key={item.title} style={styles.box} onPress={() => router.push(item.href as any)}>
          <Image source={item.icon} style={styles.icon} resizeMode="contain" />
          <View style={styles.textCol}>
            <Text style={typography.bodyBold}>{item.title}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  box: {
    flex: 1,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
  },
  icon: { width: 32, height: 32 },
});