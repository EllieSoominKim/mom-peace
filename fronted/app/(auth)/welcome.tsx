import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const SHEET_MIN_HEIGHT = 530;

const FEATURES = [
  {
    icon: require('../../assets/images/onboarding_barcode.png'),
    title: '음식 바코드 스캔',
    desc: '스캔 한 번으로 안전 확인',
    iconBg: colors.primarySoft,
  },
  {
    icon: require('../../assets/images/onboarding_ai.png'),
    title: '위험한 음식은 대체메뉴 추천',
    desc: 'AI가 판단해서 바로 알려드려요',
    iconBg: '#EDE9FE',
  },
  {
    icon: require('../../assets/images/onboarding_today.png'),
    title: '주차별 오늘 챙길 것',
    desc: '운동·영양제 가이드를 매일 챙겨드려요',
    iconBg: '#FFE9DD',
  },
  {
    icon: require('../../assets/images/onboarding_diary.png'),
    title: '매일 기록하는 섭취량',
    desc: '오늘 먹은 음식과 누적 섭취량을 한눈에',
    iconBg: colors.safeSoft,
  },
];

export default function Welcome() {
  return (
    <ScreenContainer scroll={false} variant="gradient">
      <View style={styles.logoArea}>
        <Image
          source={require('../../assets/images/onboarding_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          안전한 선택을, <Text style={{ color: colors.primary }}>맘편하게</Text>
        </Text>
        <Text style={styles.subtitle}>
          임신 주차별 식품 안전 확인부터{'\n'}대체 메뉴와 맞춤 건강 가이드까지
        </Text>
      </View>

      <View style={{ gap: 8}}>
        {FEATURES.map((f) => (
          <Card key={f.title} style={styles.featureCard} padding={18}>
            <View style={[styles.iconBox, { backgroundColor: f.iconBg }]}>
              <Image source={f.icon} style={styles.featureIcon} resizeMode="contain" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyBold, { color: '#6A3A25' }]}>{f.title}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{f.desc}</Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={{ marginTop: 'auto', paddingBottom: 0}}>
        <Button label="시작하기" onPress={() => router.replace('/(auth)/login')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoArea: {
  alignItems: 'center',
  paddingTop: 50,
  paddingBottom: spacing.sm,
},
  logo: { width: 140, height: 140, marginBottom: spacing.sm },
  title: {
  ...typography.h1,
  color: '#6A3A25',
  textAlign: 'center',
},
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: 10,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    // padding={18}로 가로 여백은 유지하고, 세로 여백만 별도로 좁힘
    paddingVertical: 10,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: { width: 32, height: 32 },
});