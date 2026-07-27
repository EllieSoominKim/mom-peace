import React from 'react';
import { Platform, View } from 'react-native';

// iPhone 15 논리 해상도 (pt 기준)
export const PHONE_WIDTH = 393;
export const PHONE_HEIGHT = 852;
// frameStyle의 padding(12+12=24)을 뺀, 화면이 실제로 쓸 수 있는 내부 높이.
// 웹에서 React Navigation 내부 레이어들이 height:100%를 안 이어받아
// flex:1이 깨지는 경우가 있어서, 각 화면에서 이 값을 minHeight로 강제할 때 씀.
export const PHONE_CONTENT_HEIGHT = PHONE_HEIGHT - 24;

type Props = { children: React.ReactNode };

export default function WebPhoneFrame({ children }: Props) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={outerStyle as any}>
      <View style={frameStyle as any}>
        <View style={screenStyle as any}>{children}</View>
      </View>
    </View>
  );
}

const outerStyle = {
  flex: 1,
  minHeight: '100vh',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#EDEDED',
  padding: 24,
};

const frameStyle = {
  width: PHONE_WIDTH,
  height: PHONE_HEIGHT,
  borderRadius: 48,
  padding: 12,
  backgroundColor: '#111111',
  boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
};

const screenStyle = {
  flex: 1,
  borderRadius: 36,
  overflow: 'hidden',
  backgroundColor: '#FFFFFF',
};