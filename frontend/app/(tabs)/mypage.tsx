import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '../../components/ui/ScreenContainer';
import { useUser } from '../../context/UserContext';
import { spacing, typography } from '../../theme/typography';

const TITLE_COLOR = '#6A3A25';

export default function MyPageScreen() {
  const router = useRouter();
  const { user, updateUser, logout } = useUser();

  // 정보 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nickname, setNickname] = useState<string>('');
  const [weeks, setWeeks] = useState<string>('0');
  const [days, setDays] = useState<string>('0');
  const [dueDate, setDueDate] = useState<string>('');

  // 핵심: user 데이터가 불러와지거나 변경될 때마다 Form State를 최신화
  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '');
      setWeeks(String(user.week ?? user.pregnancyWeeks ?? 0));
      setDays(String(user.day ?? user.pregnancyDays ?? 0));
      setDueDate(user.dueDate || '');
    }
  }, [user]);

  const handleSaveInfo = async () => {
  if (!user) {
    Alert.alert('알림', '사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  try {
    await updateUser({
      nickname,
      week: Number(weeks) || 0,
      day: Number(days) || 0,
      pregnancyWeeks: Number(weeks) || 0,
      pregnancyDays: Number(days) || 0,
      dueDate,
    });
    setIsEditModalOpen(false);
    Alert.alert('완료', '정보가 수정되었습니다.');
  } catch (e) {
    console.error('User update error:', e); // <-- 터미널/콘솔에 실제 에러 내용 출력
    Alert.alert('오류', '정보 수정 중 문제가 발생했습니다.');
  }
};

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const currentWeek = user?.week ?? user?.pregnancyWeeks ?? 0;
  const currentDay = user?.day ?? user?.pregnancyDays ?? 0;

  return (
    <ScreenContainer style={{ flex: 1 }} paddingHorizontal={0}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 헤더 (다른 화면과 동일한 back.png + title 패턴) */}
        <View style={styles.backRow}>
          <Pressable onPress={() => router.push('/(tabs)/home')} hitSlop={12}>
            <Image
              source={require('../../assets/images/back.png')}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </Pressable>
          <Text style={styles.title}>마이 페이지</Text>
        </View>

        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileName}>
              {user?.nickname || '회원'}님 👶
            </Text>
          </View>
          <Text style={styles.profileSub}>
            {currentWeek}주 {currentDay}일 · 예정일 {user?.dueDate || '미설정'}
          </Text>
        </View>

        {/* 메뉴 목록 */}
        <View style={styles.menuContainer}>
          <Pressable
            style={styles.menuItem}
            onPress={() => setIsEditModalOpen(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
              <Image
                source={require('../../assets/images/calender.png')}
                style={styles.menuIconImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>정보 수정</Text>
              <Text style={styles.menuSub}>임신 주차 및 예정일 수정</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        {/* 로그아웃 버튼 */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃 하기</Text>
        </Pressable>

        {/* 정보 수정 모달 */}
        <Modal visible={isEditModalOpen} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>정보 수정</Text>

              <Text style={styles.inputLabel}>닉네임</Text>
              <TextInput
                style={styles.input}
                value={nickname}
                onChangeText={setNickname}
              />

              <View style={styles.rowInput}>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.inputLabel}>임신 주차 (주)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={weeks}
                    onChangeText={setWeeks}
                  />
                </View>
                <View style={styles.halfInputContainer}>
                  <Text style={styles.inputLabel}>일수 (일)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="number-pad"
                    value={days}
                    onChangeText={setDays}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>출산 예정일 (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="2026-10-26"
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setIsEditModalOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>취소</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleSaveInfo}
                >
                  <Text style={styles.saveBtnText}>저장</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    fontSize: 20,
    color: TITLE_COLOR,
  },
  profileCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE3E3',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
  },
  profileSub: {
    fontSize: 14,
    color: '#666666',
  },
  menuContainer: {
    gap: 12,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuIconImage: {
    width: 24,
    height: 24,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222222',
    marginBottom: 2,
  },
  menuSub: {
    fontSize: 13,
    color: '#888888',
  },
  chevron: {
    fontSize: 22,
    color: '#C4C4C4',
    fontWeight: '300',
  },
  logoutButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 14,
    color: '#888888',
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancelBtn: {
    backgroundColor: '#F2F2F2',
  },
  cancelBtnText: {
    color: '#666666',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#FF6B6B',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});