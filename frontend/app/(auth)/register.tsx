import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import TextField from '../../components/ui/TextField';
import Button from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';
import { useUser } from '../../context/UserContext';

const LABEL_COLOR = '#6A3A25';

export default function Register() {
  const { user, saveDraft } = useUser();
  const [username, setUsername] = useState(user?.nickname ?? '');
  const [id, setId] = useState(user?.id ?? '');
  const [password, setPassword] = useState(user?.password ?? '');
  const [confirm, setConfirm] = useState(user?.password ?? '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setError('');
    if (!username.trim() || !id.trim() || !password || !confirm) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    setLoading(true);
    const result = await saveDraft(id.trim(), password, username.trim());
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace('/(auth)/onboarding');
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm, marginBottom: spacing.md }}>
        <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={12}>
          <Image
            source={require('../../assets/images/back.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={[typography.h1, { fontSize: 20, color: LABEL_COLOR }]}>회원가입</Text>
      </View>

      <View style={{ gap: spacing.md }}>
        <TextField label="닉네임*" labelColor={LABEL_COLOR} placeholder="Enter your username" value={username} onChangeText={setUsername} />
        <TextField label="아이디*" labelColor={LABEL_COLOR} placeholder="Enter your ID" value={id} onChangeText={setId} autoCapitalize="none" />
        <TextField label="비밀번호*" labelColor={LABEL_COLOR} placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextField label="비밀번호 확인*" labelColor={LABEL_COLOR} placeholder="Confirm your password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      </View>

      {!!error && (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm }]}>{error}</Text>
      )}

      <View style={{ marginTop: spacing.lg }}>
        <Button label="다음" onPress={handleNext} loading={loading} />
      </View>
    </ScreenContainer>
  );
}