// 맘편하게 디자인 시안에서 추출한 컬러 시스템
export const colors = {
  // Background
  bg: '#FEFAF9',
  bgWhite: '#FFFFFF',
  bgSoft: '#FFF3F2',
  bgSofter: '#FFF6F6',

  // Primary (coral pink)
  primary: '#F47E8A',
  primaryDark: '#E8677A',
  primaryLight: '#FCC7CC',
  primarySoft: '#FFE4E6',

  // Status
  safe: '#5FBE7A',
  safeSoft: '#E7F6EB',
  caution: '#F0B23D',
  cautionSoft: '#FDF3DE',
  danger: '#F0555C',
  dangerSoft: '#FDE7E8',

  // Text
  textPrimary: '#2B2422',
  textSecondary: '#8A7B78',
  textTertiary: '#B7ABA8',
  textOnPrimary: '#FFFFFF',

  // Border / Divider
  border: '#F3E5E4',
  divider: '#F6EDEC',

  // Card / Shadow
  cardBg: '#FFFFFF',
  shadow: 'rgba(232, 103, 122, 0.12)',

  // 홈 화면 "오늘의 섭취 요약" 칩 색상 (시안에서 실측)
  heroText: '#6A3A25',
  remainingBoxBg: '#FEF2F2',
  chipGreenBg: '#F4F8EF',
  chipGreenText: '#5B9926',
  chipAmberBg: '#FDF7EC',
  chipAmberText: '#E37808',
  chipPeachBg: '#FEF2E8',
  chipPeachText: '#E37808',
  chipGrayBg: '#F5F5F8',
  chipGrayText: '#67677A',
} as const;

export type StatusLevel = 'safe' | 'caution' | 'danger';

export const statusColor = (level: StatusLevel) => {
  switch (level) {
    case 'safe':
      return { main: colors.safe, soft: colors.safeSoft, label: '안전' };
    case 'caution':
      return { main: colors.caution, soft: colors.cautionSoft, label: '주의' };
    case 'danger':
      return { main: colors.danger, soft: colors.dangerSoft, label: '위험' };
  }
};