import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors } from '../theme/colors';

const SPLASH_DURATION_MS = 3000;

// 앱 최초 실행 화면 — 3초간 로고만 보여주고 자동으로 시작 화면(welcome)으로 이동
export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/welcome');
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={[colors.bg, colors.primarySoft]} style={styles.container}>
      <Image
        source={require('../assets/images/first_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
});