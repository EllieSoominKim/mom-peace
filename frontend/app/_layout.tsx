import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme/colors';
import { fontFamily } from '../theme/typography';
import WebPhoneFrame from '../components/ui/WebPhoneFrame';
import { UserProvider } from '../context/UserContext';
import { DiaryProvider } from '../context/DiaryContext';
import { CommunityProvider } from '../context/CommunityContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [fontFamily.regular]: require('../assets/fonts/Pretendard-Regular.otf'),
    [fontFamily.medium]: require('../assets/fonts/Pretendard-Medium.otf'),
    [fontFamily.semiBold]: require('../assets/fonts/Pretendard-SemiBold.otf'),
    [fontFamily.bold]: require('../assets/fonts/Pretendard-Bold.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <DiaryProvider>
        <CommunityProvider>
          <WebPhoneFrame>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
              <Stack.Screen name="caffeine-today" />
              <Stack.Screen name="chat-modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
            </Stack>
          </WebPhoneFrame>
        </CommunityProvider>
      </DiaryProvider>
    </UserProvider>
  );
}