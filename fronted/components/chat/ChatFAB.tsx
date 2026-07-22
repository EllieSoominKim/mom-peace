import React from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/typography';

type Props = {
  /** 어느 화면에서 열었는지 챗봇에게 넘길 맥락 (예: 스캔한 제품명) */
  context?: string;
};

export default function ChatFAB({ context }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
      onPress={() => router.push({ pathname: '/chat-modal', params: context ? { context } : {} })}
      hitSlop={8}
    >
      <Image source={require('../../assets/icons/chat.png')} style={styles.icon} resizeMode="contain" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 78,
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: { width: 26, height: 26 },
});