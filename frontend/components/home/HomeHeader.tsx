import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { spacing } from '../../theme/typography';

// 로고+워드마크가 합쳐진 실제 브랜드 에셋 사용 (assets/images/logo-full.png)
export default function HomeHeader() {
  return (
    <View style={styles.wrap}>
      <Image source={require('../../assets/images/logo-full.png')} style={styles.logo} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  logo: { width: 140, height: 37 },
});