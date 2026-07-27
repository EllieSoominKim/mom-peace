// Pretendard 폰트 패밀리 이름 (app/_layout.tsx의 useFonts에서 이 이름들로 로드함)
export const fontFamily = {
  regular: 'Pretendard-Regular',
  medium: 'Pretendard-Medium',
  semiBold: 'Pretendard-SemiBold',
  bold: 'Pretendard-Bold',
};

export const typography = {
  h1: { fontSize: 24, fontFamily: fontFamily.bold, lineHeight: 32 },
  h2: { fontSize: 20, fontFamily: fontFamily.bold, lineHeight: 28 },
  h3: { fontSize: 17, fontFamily: fontFamily.semiBold, lineHeight: 24 },
  body: { fontSize: 15, fontFamily: fontFamily.regular, lineHeight: 22 },
  bodyBold: { fontSize: 15, fontFamily: fontFamily.semiBold, lineHeight: 22 },
  caption: { fontSize: 13, fontFamily: fontFamily.regular, lineHeight: 18 },
  captionBold: { fontSize: 13, fontFamily: fontFamily.semiBold, lineHeight: 18 },
  small: { fontSize: 11, fontFamily: fontFamily.regular, lineHeight: 16 },
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};