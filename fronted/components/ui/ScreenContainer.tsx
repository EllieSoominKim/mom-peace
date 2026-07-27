import React from 'react';
import { Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { PHONE_CONTENT_HEIGHT } from './WebPhoneFrame';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  paddingHorizontal?: number;
  variant?: 'flat' | 'gradient';
  growWhenShort?: boolean;
  edges?: Edge[];
};

const webMinHeight = Platform.OS === 'web' ? PHONE_CONTENT_HEIGHT : undefined;

export default function ScreenContainer({
  children,
  scroll = true,
  style,
  paddingHorizontal = 20,
  variant = 'flat',
  growWhenShort = false,
  edges = ['top', 'bottom', 'left', 'right'],
}: Props) {
  const Wrapper = scroll ? ScrollView : View;

  const content = (
    <Wrapper
      style={
        scroll
          ? [{ flex: 1, minHeight: webMinHeight }, style]
          : [{ flex: 1, minHeight: webMinHeight, paddingHorizontal }, style]
      }
      contentContainerStyle={
        scroll
          ? {
              paddingHorizontal,
              paddingBottom: 32,
              ...(growWhenShort ? { flexGrow: 1, minHeight: webMinHeight } : null),
            }
          : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </Wrapper>
  );

  if (variant === 'gradient') {
    return (
      <LinearGradient colors={[colors.primarySoft, colors.bg]} style={{ flex: 1, minHeight: webMinHeight }}>
        <SafeAreaView edges={edges} style={{ flex: 1, minHeight: webMinHeight }}>{content}</SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { minHeight: webMinHeight }]}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});