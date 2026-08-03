import React, { useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import ScreenContainer from '../components/ui/ScreenContainer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { analyzeNutritionLabel, ApiError } from '../lib/api';
import { colors } from '../theme/colors';
import { radius, spacing, typography } from '../theme/typography';

const TITLE_COLOR = '#6A3A25';

export default function NutritionScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goToResultWithMock = () => {
    router.push({ pathname: '/scan-result', params: { source: 'ocr-mock' } });
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;
    setError(null);
    setAnalyzing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      if (!photo?.base64) throw new Error('사진을 가져오지 못했어요');

      const result = await analyzeNutritionLabel(photo.base64, 'image/jpeg');

      router.push({
        pathname: '/scan-result',
        params: {
          source: 'ocr',
          productName: result.productName || undefined,
          kcal: String(result.kcal),
          carbG: String(result.carbG),
          sugarG: String(result.sugarG),
        },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '분석 중 문제가 생겼어요. 다시 시도해주세요.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.backRow}>
        <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
          <Image source={require('../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
        <Text style={styles.title}>영양성분표 촬영</Text>
      </View>

      <Text style={styles.subtitle}>
        당·탄수화물 함량으로 혈당 위험도를 바로 확인해요
      </Text>

      <Card padding={16}>
        <View style={styles.cameraBox}>
          {Platform.OS === 'web' ? (
            <View style={styles.centerBox}>
              <Text style={{ fontSize: 32 }}>📷</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
                웹 미리보기에서는 실제 촬영이 안 돼요{'\n'}아래 버튼으로 흐름만 확인해주세요
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
            <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
          )}
        </View>

        {analyzing ? (
          <View style={styles.scanningRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={[styles.scanningLabel, { marginTop: 0, marginLeft: 8 }]}>영양정보를 읽고 있어요...</Text>
          </View>
        ) : (
          <Text style={styles.scanningLabel}>영양성분표를 촬영해주세요</Text>
        )}
      </Card>

      {!!error && (
        <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm, textAlign: 'center' }]}>
          {error}
        </Text>
      )}

      <View style={styles.cautionCard}>
        <Text style={[typography.captionBold, { color: colors.primary }]}>
          ⚠ 영양성분표가 없다면?
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
          '외식·집밥 메뉴 검색'으로 영양 성분을 확인하고 기록하세요
        </Text>
      </View>

      <View style={styles.tipRow}>
        <View style={styles.tipBox}>
          <Image source={require('../assets/icons/sun.png')} style={styles.tipIcon} resizeMode="contain" />
          <Text style={[typography.caption, { flex: 1, fontSize: 12 }]}>밝은 곳에서 촬영하기</Text>
        </View>
        <View style={styles.tipBox}>
          <Image source={require('../assets/icons/barcode.png')} style={styles.tipIcon} resizeMode="contain" />
          <Text style={[typography.caption, { flex: 1, fontSize: 12 }]}>영양성분표 전체 비추기</Text>
        </View>
      </View>

      <View style={{ marginTop: spacing.lg }}>
        <Button
          label={analyzing ? '분석 중...' : '결과 확인하기'}
          onPress={Platform.OS === 'web' ? goToResultWithMock : captureAndAnalyze}
          loading={analyzing}
        />
      </View>

      <Pressable
        style={{ marginTop: spacing.md, marginBottom: spacing.lg, alignItems: 'center' }}
        onPress={() => router.push('/food-search')}
      >
        <Text style={[typography.bodyBold, { color: colors.primary, textDecorationLine: 'underline' }]}>
          외식·집밥 메뉴 검색
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
  scanningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
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