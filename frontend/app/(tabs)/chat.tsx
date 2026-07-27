import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatScreenContent } from '../../components/chat/ChatScreenContent';

export default function ChatTabScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ChatScreenContent />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F7',
  },
});