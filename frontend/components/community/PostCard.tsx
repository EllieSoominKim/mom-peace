import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Card from '../ui/Card';
import { CommunityPost } from '../../constants/mock-data';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const CATEGORY_COLOR: Record<CommunityPost['category'], string> = {
  나눔: colors.safe,
  판매: colors.primary,
  질문: colors.caution,
};

export default function PostCard({ post }: { post: CommunityPost }) {
  return (
    <Pressable onPress={() => router.push(`/community-post/${post.id}`)}>
      <Card style={{ marginBottom: spacing.sm }} padding={16}>
        <View style={styles.topRow}>
          <View style={[styles.tag, { backgroundColor: `${CATEGORY_COLOR[post.category]}22` }]}>
            <Text style={[typography.small, { color: CATEGORY_COLOR[post.category] }]}>{post.category}</Text>
          </View>
          <Text style={[typography.small, { color: colors.textTertiary }]}>{post.createdAt}</Text>
        </View>

        <Text style={[typography.bodyBold, { marginTop: 8 }]} numberOfLines={1}>
          {post.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>
          {post.preview}
        </Text>

        <View style={styles.bottomRow}>
          <Text style={[typography.small, { color: colors.textTertiary }]}>
            {post.author} · {post.week}주차
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
            {post.price && <Text style={[typography.captionBold, { color: colors.primary }]}>{post.price}</Text>}
            <Text style={[typography.small, { color: colors.textTertiary }]}>💬 {post.commentCount}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});