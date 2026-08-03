import React, { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ScreenContainer from '../components/ui/ScreenContainer';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import { useCommunity } from '../context/CommunityContext';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/typography';

const CATEGORIES = ['나눔', '판매', '질문'] as const;
const TITLE_COLOR = '#6A3A25';

export default function CommunityWrite() {
  const { addPost } = useCommunity();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('나눔');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '사진을 추가하려면 갤러리 접근 권한을 허용해주세요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    try {
      await addPost({
        category,
        title: title.trim(),
        content: content.trim(),
        price: category === '판매' ? price.trim() : undefined,
        imageUri: imageUri ?? undefined,
      });
      router.push('/(tabs)/community');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/(tabs)/community')} hitSlop={12}>
          <Image source={require('../assets/images/back.png')} style={styles.backIcon} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>글쓰기</Text>
      </View>

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

        <Pressable style={styles.photoBox} onPress={pickImage}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.photoPreview} resizeMode="cover" />
              <Pressable
                style={styles.photoRemoveBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  setImageUri(null);
                }}
                hitSlop={8}
              >
                <Text style={{ color: colors.textOnPrimary, fontSize: 12, fontWeight: '700' }}>✕</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 22 }}>📷</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>사진 추가</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={{ marginTop: spacing.lg, marginBottom: spacing.lg }}>
        <Button
          label={submitting ? '등록 중...' : '등록하기'}
          onPress={handleSubmit}
          disabled={!title.trim() || !content.trim() || submitting}
          loading={submitting}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: TITLE_COLOR,
  },
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
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoRemoveBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});