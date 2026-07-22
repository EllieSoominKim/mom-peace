import { StatusLevel } from '../theme/colors';

export const currentUser = {
  name: '유민',
  week: 21,
  day: 3,
  dueDate: '2026.10.26',
};

export const todayIntake = {
  caffeine: { current: 85, max: 200, unit: 'mg' },
  sugarDailyMax: 50,
  carbDailyMax: 175,
};

export type ChipTone = 'green' | 'amber' | 'peach' | 'gray';

export const summaryChips: { label: string; value: string; tone: ChipTone }[] = [
  { label: '당류', value: '충분', tone: 'green' },
  { label: '나트륨', value: '주의', tone: 'amber' },
  { label: '알레르기', value: '안전', tone: 'peach' },
  { label: '물', value: '4잔', tone: 'gray' },
];

export const todayFoodLog = [
  { time: '09:20', name: '디카페인 라떼', kcal: 15 },
  { time: '12:40', name: '김밥', kcal: 350 },
  { time: '15:10', name: '요거트', kcal: 120 },
];

export type AlternativeItem = {
  id: string;
  name: string;
  reason: string;
  level: StatusLevel;
};

export const scanResultMock = {
  productName: '카페모카 (톨 사이즈)',
  scannedAt: '2026.05.15 14:20',
  level: 'danger' as StatusLevel,
  message: '오늘 이미 카페인 85mg을 섭취하셨어요. 이 제품(에스프레소 2샷 기준 약 150mg)을 더하면 하루 권장량 200mg을 초과해요.',
  nutrients: [
    { label: '카페인', value: '150mg' },
    { label: '당류', value: '32g' },
    { label: '나트륨', value: '95mg' },
  ],
  alternatives: [
    { id: '1', name: '디카페인 카페라떼', reason: '카페인 0mg으로 안심하고 즐길 수 있어요', level: 'safe' },
    { id: '2', name: '하프샷 아메리카노', reason: '카페인 약 37mg, 오늘 잔여 허용량 안에 들어와요', level: 'safe' },
    { id: '3', name: '루이보스 티라떼', reason: '카페인 없이 따뜻하게 즐기기 좋아요', level: 'safe' },
  ] as AlternativeItem[],
};

export const todayGuide = {
  exercise: { title: '가벼운 걷기 15분', desc: '중기에는 혈액순환에 좋은 가벼운 유산소 운동을 추천해요' },
  nutrient: { title: '오늘은 철분이 필요해요', desc: '시금치, 소고기, 두부로 채워보세요' },
};

// 스캔/검색한 음식 이름에 포함된 키워드로 대략적인 카테고리를 추정해서,
// 그 카테고리에 맞는 "당류·탄수화물이 낮은" 대체 메뉴 3개를 보여줌.
export const foodCategoryKeywords: { category: string; keywords: string[] }[] = [
  { category: '유제품', keywords: ['요거트', '요구르트', '우유', '치즈'] },
  { category: '분식', keywords: ['떡볶이', '순대', '튀김', '어묵'] },
  { category: '면류', keywords: ['짜장면', '짬뽕', '라면', '국수', '파스타'] },
  { category: '고기류', keywords: ['제육', '고기', '삼겹', '불고기', '치킨'] },
  { category: '매운탕류', keywords: ['마라탕', '찌개', '탕'] },
  { category: '밥류', keywords: ['김밥', '밥', '초밥', '덮밥'] },
];

export const sugarCarbAlternativesByCategory: Record<string, AlternativeItem[]> = {
  유제품: [
    { id: 'a1', name: '무가당 그릭요거트', reason: '당류 4g으로 부담 없이 즐길 수 있어요', level: 'safe' },
    { id: 'a2', name: '두유', reason: '탄수화물이 낮고 단백질은 충분해요', level: 'safe' },
    { id: 'a3', name: '저지방 우유', reason: '당류·탄수화물 모두 상대적으로 낮아요', level: 'safe' },
  ],
  분식: [
    { id: 'a4', name: '어묵탕', reason: '떡 없이 국물과 어묵 위주라 탄수화물이 낮아요', level: 'safe' },
    { id: 'a5', name: '계란찜', reason: '탄수화물 거의 없이 든든해요', level: 'safe' },
    { id: 'a6', name: '오이무침', reason: '당류 낮고 아삭하게 즐길 수 있어요', level: 'safe' },
  ],
  면류: [
    { id: 'a7', name: '메밀소바', reason: '일반 면보다 혈당 부담이 적어요', level: 'safe' },
    { id: 'a8', name: '곤약면 요리', reason: '탄수화물이 매우 낮아요', level: 'safe' },
    { id: 'a9', name: '야채죽', reason: '부드럽고 당류·탄수화물 부담이 적어요', level: 'safe' },
  ],
  고기류: [
    { id: 'a10', name: '두부구이', reason: '탄수화물 없이 단백질을 채울 수 있어요', level: 'safe' },
    { id: 'a11', name: '닭가슴살구이', reason: '지방·탄수화물 부담이 적어요', level: 'safe' },
    { id: 'a12', name: '순두부찌개', reason: '부드럽고 자극이 적어요', level: 'safe' },
  ],
  매운탕류: [
    { id: 'a13', name: '맑은 채소국', reason: '자극적이지 않고 부담이 적어요', level: 'safe' },
    { id: 'a14', name: '계란국', reason: '단백질 위주로 가볍게 즐길 수 있어요', level: 'safe' },
    { id: 'a15', name: '두부탕', reason: '순하고 소화가 편해요', level: 'safe' },
  ],
  밥류: [
    { id: 'a16', name: '현미밥 한 공기', reason: '흰쌀밥보다 혈당 부담이 적어요', level: 'safe' },
    { id: 'a17', name: '잡곡밥 한 공기', reason: '식이섬유가 많아 혈당 상승이 완만해요', level: 'safe' },
    { id: 'a18', name: '채소쌈밥', reason: '탄수화물을 채소로 일부 대체해요', level: 'safe' },
  ],
  기본: [
    { id: 'a19', name: '무가당 그릭요거트', reason: '당류 4g으로 부담 없이 즐길 수 있어요', level: 'safe' },
    { id: 'a20', name: '삶은 계란', reason: '탄수화물 없이 든든해요', level: 'safe' },
    { id: 'a21', name: '제철 사과 반 개', reason: '당류는 있지만 식이섬유가 함께 있어 흡수가 완만해요', level: 'safe' },
  ],
};

export function guessFoodCategory(name: string): string {
  const found = foodCategoryKeywords.find((c) => c.keywords.some((k) => name.includes(k)));
  return found?.category ?? '기본';
}

export type CommunityPost = {
  id: string;
  category: '나눔' | '판매' | '질문';
  title: string;
  preview: string;
  author: string;
  week: number;
  price?: string;
  commentCount: number;
  createdAt: string;
};

export const communityPosts: CommunityPost[] = [
  {
    id: '1',
    category: '나눔',
    title: '안 쓰는 유축기 나눔합니다',
    preview: '2주 정도만 사용했어요. 필요하신 분 댓글 남겨주세요!',
    author: '채영맘',
    week: 24,
    commentCount: 3,
    createdAt: '10분 전',
  },
  {
    id: '2',
    category: '판매',
    title: '임산부 전용 베개 팝니다 (거의 새것)',
    preview: '사이즈가 안 맞아서 몇 번 못 썼어요.',
    author: '수민맘',
    week: 20,
    price: '20,000원',
    commentCount: 1,
    createdAt: '1시간 전',
  },
  {
    id: '3',
    category: '질문',
    title: '입덧 심할 때 다들 뭐 드세요?',
    preview: '밥 냄새가 너무 힘든데 대체할 만한 게 있을까요...',
    author: '유민맘',
    week: 9,
    commentCount: 8,
    createdAt: '3시간 전',
  },
];