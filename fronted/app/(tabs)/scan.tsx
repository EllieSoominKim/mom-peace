import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

const TITLE_COLOR = '#6A3A25';

export default function NutritionScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [captured, setCaptured] = useState(false);

  const goToResult = () => {
    router.push({ pathname: '/scan-result', params: { source: 'ocr' } });
  };

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
          <Image source={require('../../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>영양성분표 스캔</Text>
      </View>

      <Text style={styles.subtitle}>
        찰칵 찍으면 끝! 당과 탄수화물 함량으로 혈당 위험도를 바로 확인해드려요
      </Text>

      <Card padding={16}>
        <View style={styles.cameraBox}>
          {Platform.OS === 'web' ? (
            <View style={styles.centerBox}>
              <Text style={{ fontSize: 32 }}>📷</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
                웹 미리보기에서는 카메라 촬영 대신{'\n'}아래 "결과 확인하기"로 흐름을 확인해주세요
              </Text>
            </View>
          ) : !permission ? null : !permission.granted ? (
            <View style={styles.centerBox}>
              {permission.canAskAgain ? (
                <>
                  <Text style={[typography.body, { textAlign: 'center', marginBottom: spacing.sm }]}>
                    영양성분표를 촬영하려면 카메라 접근 권한이 필요해요
                  </Text>
                  <Pressable style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={[typography.captionBold, { color: colors.textOnPrimary }]}>카메라 권한 허용하기</Text>
                  </Pressable>
                </>
              ) : (
                <Text style={[typography.body, { textAlign: 'center' }]}>
                  카메라 접근이 거부되었어요{'\n'}기기 설정에서 권한을 허용해주세요
                </Text>
              )}
            </View>
          ) : (
            <CameraView style={{ flex: 1 }} facing="back" onCameraReady={() => setCaptured(true)} />
          )}
        </View>
        <Text style={styles.scanningLabel}>스캔 중</Text>
      </Card>

      <View style={styles.cautionCard}>
        <Text style={[typography.captionBold, { color: colors.primary }]}>
          ⚠ 영양성분표가 없다면?
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
          외식·집밥 메뉴 검색으로 영양 성분을 빠르게 확인하고 기록하세요
        </Text>
      </View>

      <View style={styles.tipRow}>
        <View style={styles.tipBox}>
          <Image source={require('../../assets/icons/sun.png')} style={styles.tipIcon} resizeMode="contain" />
          <Text style={[typography.caption, { flex: 1 }]}>밝은 곳에서 촬영하기</Text>
        </View>
        <View style={styles.tipBox}>
          <Image source={require('../../assets/icons/barcode.png')} style={styles.tipIcon} resizeMode="contain" />
          <Text style={[typography.caption, { flex: 1 }]}>영양성분표 전체 스캔하기</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button label="결과 확인하기" onPress={goToResult} />
      </View>

      <Pressable
        style={{ marginTop: spacing.md, marginBottom: spacing.lg, alignItems: 'center' }}
        onPress={() => router.push('/food-search')}
      >
        <Text style={[typography.bodyBold, { color: colors.primary, textDecorationLine: 'underline' }]}>
          외식·집밥 검색하기
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: TITLE_COLOR,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  cameraBox: {
    height: 220,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bgSoft,
  },
  scanningLabel: {
    ...typography.bodyBold,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cautionCard: {
    marginTop: spacing.md,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tipBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    padding: spacing.sm,
  },
  tipIcon: { width: 24, height: 24 },
});