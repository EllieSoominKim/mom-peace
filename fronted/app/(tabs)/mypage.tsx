import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Card from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';
import { useUser } from '../../context/UserContext';

const MENU = [
  { icon: '👤', label: '정보 수정' },
  { icon: '📔', label: '알림 설정' },
  { icon: '👑', label: 'Premium' },
];

export default function MyPage() {
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h2, { marginTop: spacing.md, marginBottom: spacing.md }]}>맘 편하게</Text>

      <Card style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 24 }}>🤰</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyBold}>{user?.nickname ?? '회원'}님</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {user?.week ? `${user.week}주 ${user.day}일` : '기본 정보 미입력'}
            {user?.dueDate ? ` · 예정일 ${user.dueDate}` : ''}
          </Text>
        </View>
      </Card>

      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        {MENU.map((m) => (
          <Pressable key={m.label}>
            <Card style={styles.menuRow} padding={16}>
              <Text style={{ fontSize: 18 }}>{m.icon}</Text>
              <Text style={[typography.body, { flex: 1 }]}>{m.label}</Text>
              <Text style={{ color: colors.textTertiary }}>›</Text>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card style={[styles.premium, { marginTop: spacing.md }]}>
        <Text style={[typography.bodyBold, { color: colors.textOnPrimary }]}>Premium 🎗</Text>
        <Text style={[typography.caption, { color: colors.textOnPrimary, marginTop: 4 }]}>
          주간 리포트, 무제한 스캔 기록을 확인해보세요
        </Text>
      </Card>

      <Pressable onPress={handleLogout} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.textTertiary }]}>로그아웃</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  premium: { backgroundColor: colors.primary },
});