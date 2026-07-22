import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import Button from '../../../components/ui/Button';
import TextField from '../../../components/ui/TextField';
import { colors } from '../../../theme/colors';
import { radius, spacing, typography } from '../../../theme/typography';

const CATEGORIES = ['나눔', '판매', '질문'] as const;

export default function CommunityWrite() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('나눔');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    // TODO: FastAPI POST /community/posts 연동
    router.back();
  };

  return (
    <ScreenContainer>
      <Text style={[typography.h2, { marginTop: spacing.md, marginBottom: spacing.md }]}>글쓰기</Text>

      <View style={styles.filterRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCategory(c)}
            style={[styles.chip, category === c && styles.chipActive]}
          >
            <Text style={[typography.caption, category === c && { color: colors.textOnPrimary }]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        <TextField placeholder="제목을 입력하세요" value={title} onChangeText={setTitle} />
        {category === '판매' && (
          <TextField placeholder="가격 (예: 20,000원)" value={price} onChangeText={setPrice} keyboardType="numeric" />
        )}
        <TextInput
          placeholder="내용을 입력하세요"
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.textarea}
          placeholderTextColor={colors.textTertiary}
        />

        <Pressable style={styles.photoBox}>
          <Text style={{ fontSize: 22 }}>📷</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>사진 추가</Text>
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
        <Button label="등록하기" onPress={handleSubmit} disabled={!title || !content} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: 'row', gap: 8 },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  textarea: {
    minHeight: 140,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    padding: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
  photoBox: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
  },
});
