import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

// TODO: '오늘의 카페인'은 아직 전용 화면이 없어서 임시로 Food Diary 탭으로 연결해둠.
const ITEMS = [
  {
    icon: require('../../assets/icons/barcode.png'),
    title: '오늘의 음식',
    desc: '식품 안전 확인',
    href: '/(tabs)/scan',
  },
  {
    icon: require('../../assets/icons/menu.png'),
    title: '오늘의 카페인',
    desc: '카페인 권장량 기준',
    href: '/(tabs)/diary',
  },
] as const;

export default function QuickMenu() {
  return (
    <View style={styles.row}>
      {ITEMS.map((item) => (
        <Pressable key={item.title} style={styles.box} onPress={() => router.push(item.href as any)}>
          <View style={styles.iconCircle}>
            <Image source={item.icon} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={typography.bodyBold}>{item.title}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{item.desc}</Text>
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
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  icon: { width: 22, height: 22 },
});