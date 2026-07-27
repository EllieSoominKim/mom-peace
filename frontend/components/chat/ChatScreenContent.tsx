import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { sendChatMessage } from '../../lib/api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const QUICK_RECOMMENDATIONS = [
  '식단 관리',
  '음식 안전성',
  '주수별 주의사항',
  '주수별 증상',
];

export function ChatScreenContent() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "안녕하세요! '맘편하게' AI 케어 매니저입니다 :) 오늘 산모 건강이나 식단관리에 대해 궁금한 점이 있으신가요?",
    },
  ]);
  consgit mv fronted frontend
git commit -m "rename fronted to frontend"
git pusht [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

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

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const response = await sendChatMessage(text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply || '답변을 불러오지 못했습니다.',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '죄송합니다. 네트워크 요청 중 오류가 발생했습니다.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* 상단 헤더 (back.png 버튼 포함) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoHome}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/images/back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>맘편하게 챗봇</Text>
      </View>

      {/* 메시지 스크롤 영역 */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.sender === 'user' ? styles.userRow : styles.aiRow,
            ]}
          >
            {msg.sender === 'ai' && (
              <View style={styles.avatarContainer}>
                <Ionicons name="sparkles" size={18} color="#FFF" />
              </View>
            )}
            <View
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  msg.sender === 'user'
                    ? styles.userMessageText
                    : styles.aiMessageText,
                ]}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.messageRow, styles.aiRow]}>
            <View style={styles.avatarContainer}>
              <Ionicons name="sparkles" size={18} color="#FFF" />
            </View>
            <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* 빠른 추천 칩 영역 */}
      <View style={styles.chipSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipScrollContainer}
        >
          {QUICK_RECOMMENDATIONS.map((chip, index) => (
            <TouchableOpacity
              key={index}
              style={styles.chipButton}
              onPress={() => handleSend(`${chip}에 대해 알려줘`)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 하단 입력창 (게시글 댓글 입력창과 동일한 방식: 키보드 높이만큼만 밀어 올림) */}
      <View style={[styles.inputContainer, { marginBottom: keyboardHeight }]}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || loading}
        >
          <Ionicons name="paper-plane" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F7',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FAF8F7',
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE8',
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6A3A25',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  aiRow: {
    justifyContent: 'flex-start',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiBubble: {
    backgroundColor: '#F3EFEF',
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 4,
  },
  loadingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  aiMessageText: {
    color: '#333333',
  },
  userMessageText: {
    color: '#222222',
  },
  chipSection: {
    paddingVertical: 8,
    backgroundColor: '#FAF8F7',
  },
  chipScrollContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: colors.primary,
    backgroundColor: '#FFF8F7',
  },
  chipText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FAF8F7',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E8E1DE',
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5C4C0',
  },
});