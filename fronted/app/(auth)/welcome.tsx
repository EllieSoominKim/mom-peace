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
    title: '영양성분표 스캔',
    desc: '탄수화물·당류·열량 확인 및 섭취 안전도 분석',
    iconBg: colors.primarySoft,
  },
  {
    icon: require('../../assets/images/onboarding_today.png'),
    title: '카페인 누적 관리',
    desc: '메뉴 검색으로 하루 권장량 준수 여부 확인',
    iconBg: '#EDE9FE',
  },
  {
    icon: require('../../assets/images/onboarding_diary.png'),
    title: '오늘의 섭취 현황',
    desc: '스캔·검색한 오늘 식단을 기록하고 한눈에 관리',
    iconBg: '#FFE9DD',
  },
  {
    icon: require('../../assets/images/onboarding_ai.png'),
    title: 'AI 챗봇상담',
    desc: '임신·영양·건강에 대한 궁금증을 해결',
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

      <View style={{ gap: 8 }}>
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

      <View style={{ marginTop: 'auto', paddingBottom: 0 }}>
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