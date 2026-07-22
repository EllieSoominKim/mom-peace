import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { sendChatMessage, ApiError } from '../../lib/api';
import { useUser } from '../../context/UserContext';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type Props = {
  context?: string;
  showBack?: boolean;
};

export default function ChatScreenContent({ context, showBack = false }: Props) {
  const { user } = useUser();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: context
        ? `${context}에 대해 궁금한 점을 물어보세요 :)`
        : '안녕하세요! 식품 안전, 임신 주차별 정보, 가벼운 운동에 대해 물어보세요 :)',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(text, user?.week, context);
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', text: res.reply }]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : '답변을 가져오지 못했어요. 다시 시도해주세요.';
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        {showBack && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text style={typography.h3}>맘편하게 챗봇</Text>
          {!!context && (
            <Text style={[typography.small, { color: colors.textTertiary }]} numberOfLines={1}>
              {context}
            </Text>
          )}
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
            ]}
          >
            <Text style={[typography.body, { color: item.role === 'user' ? colors.textOnPrimary : colors.textPrimary }]}>
              {item.text}
            </Text>
          </View>
        )}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={{ paddingLeft: spacing.md, paddingBottom: spacing.xs }}>
          <ActivityIndicator color={colors.primary} size="small" />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="궁금한 점을 물어보세요"
          placeholderTextColor={colors.textTertiary}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <Pressable style={styles.sendBtn} onPress={handleSend} disabled={loading}>
          <Text style={{ color: colors.textOnPrimary, fontSize: 16 }}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.bgWhite,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
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