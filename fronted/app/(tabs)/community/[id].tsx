import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import Card from '../../../components/ui/Card';
import { communityPosts } from '../../../constants/mock-data';
import { colors } from '../../../theme/colors';
import { radius, spacing, typography } from '../../../theme/typography';

const TITLE_COLOR = '#6A3A25';

const MOCK_COMMENTS = [
  { id: '1', author: '채영맘', content: '저도 궁금했어요! 댓글 감사합니다', createdAt: '5분 전' },
  { id: '2', author: '수민맘', content: '저는 하프샷 아메리카노로 대체했어요', createdAt: '12분 전' },
];

export default function CommunityDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = communityPosts.find((p) => p.id === id) ?? communityPosts[0];
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleAddComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [
      ...prev,
      { id: String(Date.now()), author: '나', content: comment, createdAt: '방금' },
    ]);
    setComment('');
  };

  return (
    <ScreenContainer scroll={false} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/(tabs)/community')} hitSlop={12}>
          <Image source={require('../../../assets/images/back.png')} style={styles.backIcon} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>게시글</Text>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <Card>
            <View style={styles.topRow}>
              <View style={styles.tag}>
                <Text style={[typography.small, { color: colors.primary }]}>{post.category}</Text>
              </View>
              <Text style={[typography.small, { color: colors.textTertiary }]}>{post.createdAt}</Text>
            </View>
            <Text style={[typography.h3, { marginTop: 8 }]}>{post.title}</Text>
            <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 4 }]}>
              {post.author} · {post.week}주차
            </Text>
            <Text style={[typography.body, { marginTop: spacing.md }]}>{post.preview}</Text>
            {post.price && (
              <Text style={[typography.h3, { color: colors.primary, marginTop: spacing.md }]}>{post.price}</Text>
            )}
          </Card>

          <Text style={[typography.bodyBold, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            댓글 {comments.length}
          </Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentRow}>
              <Text style={typography.captionBold}>{c.author}</Text>
              <Text style={[typography.body, { marginTop: 2 }]}>{c.content}</Text>
              <Text style={[typography.small, { color: colors.textTertiary, marginTop: 2 }]}>{c.createdAt}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.commentInputRow, { marginBottom: keyboardHeight }]}>
          <TextInput
            placeholder="댓글을 입력하세요"
            value={comment}
            onChangeText={setComment}
            style={styles.commentInput}
            placeholderTextColor={colors.textTertiary}
          />
          <Pressable style={styles.sendBtn} onPress={handleAddComment}>
            <Text style={{ color: colors.textOnPrimary, fontSize: 16 }}>↑</Text>
          </Pressable>
        </View>
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
    paddingBottom: spacing.sm,
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
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: colors.primarySoft,
  },
  commentRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingVertical: spacing.sm,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  commentInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});