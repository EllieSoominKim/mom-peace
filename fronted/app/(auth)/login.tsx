import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';
import { useUser } from '../../context/UserContext';

const SHEET_MIN_HEIGHT = 530;

export default function Login() {
  const { login } = useUser();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!id.trim() || !password) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    const result = await login(id.trim(), password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace('/(tabs)/home');
  };

  return (
    <ScreenContainer scroll={false} variant="gradient" paddingHorizontal={0}>
      <View style={styles.topSection}>
        <Image
          source={require('../../assets/images/login_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          <Text style={{ color: colors.primary }}>맘편하게</Text> 시작해요
        </Text>
        <Text style={styles.subtitle}>
          로그인 하고 바코드 스캔부터 푸드 다이어리까지,{'\n'}맘편하게 이용해 보세요 :)
        </Text>
      </View>

      <View style={styles.sheet}>
        <View style={{ gap: spacing.md }}>
          <TextField placeholder="Enter your ID" value={id} onChangeText={setId} autoCapitalize="none" />
          <TextField
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {!!error && (
          <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm }]}>{error}</Text>
        )}

        <View style={{ marginTop: spacing.lg }}>
          <Button label="로그인" fullWidth onPress={handleLogin} loading={loading} />
        </View>

        {/* 시트에 최소 높이가 보장되어 있어서 marginTop: 'auto'로 맨 아래에 확실히 고정됨 */}
        <Pressable style={styles.registerRow} onPress={() => router.replace('/(auth)/register')}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>아직 계정이 없나요? </Text>
          <Text style={[typography.bodyBold, { color: colors.primary, textDecorationLine: 'underline' }]}>
            회원가입 ›
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topSection: {
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  logo: { width: 100, height: 100, marginTop: 20, marginBottom: spacing.md },
  title: {
  ...typography.h1,
  color: '#6A3A25',
  marginTop: -15,
},
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sheet: {
    flex: 1,
    minHeight: SHEET_MIN_HEIGHT,
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingTop: spacing.xl,
    paddingBottom: 32,
  },
  registerRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});