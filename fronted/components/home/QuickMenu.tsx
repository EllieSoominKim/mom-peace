import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const ITEMS = [
  {
    icon: require('../../assets/icons/home_nutrition.png'),
    title: '영양성분표 촬영',
    desc: '식품 안전 확인',
    href: '/(tabs)/scan',
  },
  {
    icon: require('../../assets/icons/home_coffee.png'),
    title: '카페인 검색',
    desc: '카페인 권장량 기준',
    href: '/(tabs)/caffeine-today',
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