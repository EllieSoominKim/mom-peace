import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import ScreenContainer from '../../../components/ui/ScreenContainer';
import PostCard from '../../../components/community/PostCard';
import { communityPosts } from '../../../constants/mock-data';
import { colors } from '../../../theme/colors';
import { radius, spacing, typography } from '../../../theme/typography';

const CATEGORIES = ['전체', '나눔', '판매', '질문'] as const;

export default function CommunityList() {
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('전체');

  const posts =
    active === '전체' ? communityPosts : communityPosts.filter((p) => p.category === active);

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Text style={typography.h2}>커뮤니티</Text>
        <Pressable style={styles.writeBtn} onPress={() => router.push('/(tabs)/community/write')}>
          <Text style={[typography.captionBold, { color: colors.textOnPrimary }]}>+ 글쓰기</Text>
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setActive(c)}
            style={[styles.chip, active === c && styles.chipActive]}
          >
            <Text style={[typography.caption, active === c && { color: colors.textOnPrimary }]}>{c}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1, marginTop: spacing.sm }}>
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    marginBottom: spacing.sm,
  },
  writeBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
