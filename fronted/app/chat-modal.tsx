import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ChatScreenContent from '../components/chat/ChatScreenContent';

export default function ChatModal() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  return <ChatScreenContent context={context} showBack />;
}