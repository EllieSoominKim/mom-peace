import React, { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';
import { useUser } from '../../context/UserContext';

const DARK = '#6A3A25';

function formatDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}.`;
}

// 안전한 Date 파싱 함수
function parseDateString(dateStr: string): Date {
  try {
    const cleaned = dateStr.replace(/\.$/, '').replace(/\./g, '-');
    const date = new Date(cleaned);
    return isNaN(date.getTime()) ? new Date() : date;
  } catch {
    return new Date();
  }
}

export default function Onboarding() {
  const { saveOnboarding } = useUser();
  const [week, setWeek] = useState('21');
  const [day, setDay] = useState('3');
  const [dueDate, setDueDate] = useState('2026.10.26.');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    await saveOnboarding(parseInt(week, 10) || 0, parseInt(day, 10) || 0, dueDate.replace(/\.$/, ''));
    setLoading(false);
    router.replace('/(tabs)/home');
  };

  const handleDateChange = (_event: any, selected?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (selected) setDueDate(formatDate(selected));
  };

  return (
    <ScreenContainer>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: spacing.sm, marginBottom: spacing.sm }}>
        <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={12}>
          <Image source={require('../../assets/images/back.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
        </Pressable>
      </View>

      <Image
        source={require('../../assets/images/login_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>
        <Text style={{ color: colors.primary }}>기본 정보를</Text>{'\n'}
        <Text style={{ color: DARK }}>입력해 주세요</Text>
      </Text>
      <Text style={styles.subtitle}>
        주차와 출산 예정일을 입력하면{'\n'}맞춤 정보를 받을 수 있어요
      </Text>

      <Card style={{ marginTop: spacing.lg }} padding={20}>
        <View style={styles.rowHeader}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/images/baby.png')} style={styles.rowIcon} resizeMode="contain" />
          </View>
          <Text style={[typography.bodyBold, { color: DARK }]}>임신 주차</Text>
        </View>
        <View style={styles.weekRow}>
          <TextInput
            style={styles.numberInput}
            value={week}
            onChangeText={setWeek}
            keyboardType="number-pad"
            textAlign="center"
          />
          <Text style={[typography.bodyBold, styles.unitLabel]}>주차</Text>
          <TextInput
            style={styles.numberInput}
            value={day}
            onChangeText={setDay}
            keyboardType="number-pad"
            textAlign="center"
          />
          <Text style={[typography.bodyBold, styles.unitLabel]}>일</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.rowHeader}>
          <View style={styles.iconCircle}>
            <Image source={require('../../assets/images/calender.png')} style={styles.rowIcon} resizeMode="contain" />
          </View>
          <Text style={[typography.bodyBold, { color: DARK }]}>출산 예정일</Text>
        </View>

        {/* 출산 예정일 선택 영역 (전체 영역 또는 아이콘 클릭 시 달력 열기) */}
        <Pressable style={styles.dateInputRow} onPress={() => setShowPicker(true)}>
          <Text style={[typography.h3, { color: colors.textPrimary }]}>{dueDate}</Text>
          <Image
            source={require('../../assets/images/calender_gray.png')}
            style={styles.calendarIcon}
            resizeMode="contain"
          />
        </Pressable>

        {/* 달력 피커 */}
        {showPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={parseDateString(dueDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              onChange={handleDateChange}
              accentColor={colors.primary}
              themeVariant="light"
            />
            {Platform.OS === 'ios' && (
              <Button label="선택 완료" variant="ghost" onPress={() => setShowPicker(false)} />
            )}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            ⓘ 정확한 정보일수록 더 맘편한 추천을 받을 수 있어요
          </Text>
        </View>
      </Card>

      <View style={{ marginTop: spacing.lg, paddingBottom: 16 }}>
        <Button label="등록" fullWidth onPress={handleNext} loading={loading} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logo: { width: 88, height: 88, marginTop: 0, marginBottom: -5 },
  title: {
    ...typography.h1,
    lineHeight: 34,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIcon: { width: 24, height: 24 },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  numberInput: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unitLabel: { color: DARK },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.lg,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  calendarIcon: { width: 22, height: 22 },
  pickerContainer: {
    marginTop: spacing.sm,
  },
  infoBox: {
    marginTop: spacing.md,
    backgroundColor: colors.bgSoft,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
});