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

export type CareItem = { title: string; desc: string };

type Trimester = 'early' | 'mid' | 'late';

function getTrimester(week: number): Trimester {
  if (week <= 12) return 'early';
  if (week <= 27) return 'mid';
  return 'late';
}

// 오늘 날짜(연중 몇 번째 날인지)를 시드로 사용 → 매일 다른 항목이 뽑히되,
// 같은 날 안에서는(새로고침해도) 항상 같은 항목이 나옵니다.
function dayOfYearSeed(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000);
}

const exerciseByTrimester: Record<Trimester, CareItem[]> = {
  early: [
    { title: '가벼운 스트레칭 10분', desc: '초기엔 무리한 운동보다 몸을 이완하는 스트레칭이 좋아요' },
    { title: '천천히 산책 10분', desc: '입덧이 심하지 않다면 짧은 산책으로 기분 전환해보세요' },
    { title: '케겔 운동 익히기', desc: '지금부터 골반저근을 단련해두면 출산에 도움이 돼요' },
    { title: '충분한 휴식 취하기', desc: '초기엔 몸이 예민하니 무리하지 말고 푹 쉬어주세요' },
    { title: '가벼운 요가 자세', desc: '고양이 자세처럼 부드러운 스트레칭으로 몸을 풀어보세요' },
    { title: '짧은 실내 걷기', desc: '컨디션이 안 좋은 날은 실내에서 가볍게 움직여주세요' },
    { title: '심호흡 운동하기', desc: '긴장을 풀어주는 호흡 운동으로 마음을 편안하게 해보세요' },
  ],
  mid: [
    { title: '가벼운 걷기 15분', desc: '중기에는 혈액순환에 좋은 가벼운 유산소 운동을 추천해요' },
    { title: '임산부 요가', desc: '골반과 허리 스트레칭으로 몸의 균형을 잡아보세요' },
    { title: '수영·아쿠아로빅', desc: '관절 부담 없이 전신 운동을 할 수 있어요' },
    { title: '평지 위주로 산책', desc: '무리한 계단 오르내리기보다 평지 걷기를 추천해요' },
    { title: '골반 스트레칭', desc: '허리 통증 완화에 도움이 되는 스트레칭을 해보세요' },
    { title: '가벼운 밴드 운동', desc: '가벼운 근력 운동으로 체력을 유지해보세요' },
    { title: '바른 자세 유지하기', desc: '오래 앉아있다면 30분마다 일어나 스트레칭해주세요' },
  ],
  late: [
    { title: '가벼운 걷기 10분', desc: '후기엔 무리하지 않는 선에서 컨디션에 맞게 걸어보세요' },
    { title: '케겔 운동', desc: '출산을 위해 골반저근을 꾸준히 단련해보세요' },
    { title: '출산 호흡법 연습', desc: '라마즈 호흡을 미리 연습해두면 도움이 돼요' },
    { title: '골반 흔들기 운동', desc: '허리 통증 완화와 태아 위치에 도움이 될 수 있어요' },
    { title: '다리·발목 스트레칭', desc: '부종 완화를 위해 다리와 발목을 스트레칭해보세요' },
    { title: '짧은 실내 걷기', desc: '몸이 무거운 날은 무리하지 말고 짧게 움직여보세요' },
    { title: '휴식과 몸풀기 병행', desc: '충분히 쉬면서 컨디션에 맞게 가볍게 움직여보세요' },
  ],
};

const nutrientByTrimester: Record<Trimester, CareItem[]> = {
  early: [
    { title: '오늘은 엽산이 필요해요', desc: '브로콜리, 시금치, 아스파라거스로 채워보세요' },
    { title: '입덧엔 소량씩 자주', desc: '크래커, 바나나처럼 부담 없는 간식을 곁에 두세요' },
    { title: '철분도 챙겨주세요', desc: '붉은 살코기, 콩류로 빈혈을 예방해보세요' },
    { title: '충분한 수분 섭취', desc: '하루 물 6~8잔으로 컨디션을 관리해보세요' },
    { title: '비타민B6 식품', desc: '바나나, 견과류가 입덧 완화에 도움이 될 수 있어요' },
    { title: '생선은 익혀서 섭취', desc: '회나 날음식보다 익힌 음식으로 안전하게 드세요' },
    { title: '가벼운 단백질 간식', desc: '삶은 달걀, 두부로 부담 없이 단백질을 채워보세요' },
  ],
  mid: [
    { title: '오늘은 철분이 필요해요', desc: '시금치, 소고기, 두부로 채워보세요' },
    { title: '칼슘도 잊지 마세요', desc: '우유, 멸치, 두부로 뼈 건강을 챙겨보세요' },
    { title: '단백질 충분히 섭취', desc: '계란, 생선, 콩류로 태아 성장을 도와보세요' },
    { title: '오메가3 섭취하기', desc: '연어, 고등어 같은 생선으로 두뇌 발달을 도와보세요' },
    { title: '식이섬유로 변비 예방', desc: '현미, 채소, 과일을 챙겨 장 건강을 지켜보세요' },
    { title: '비타민D 챙기기', desc: '햇볕을 쬐거나 유제품으로 비타민D를 보충해보세요' },
    { title: '당·나트륨은 적당히', desc: '짜고 단 음식은 줄이고 균형 잡힌 식사를 해보세요' },
  ],
  late: [
    { title: '칼슘을 충분히', desc: '아기 뼈 발달을 위해 유제품을 챙겨보세요' },
    { title: '철분 보충 계속하기', desc: '출산 시 출혈에 대비해 철분을 꾸준히 챙겨보세요' },
    { title: '소화 잘되는 소량 식사', desc: '위가 눌리는 시기니 조금씩 자주 드세요' },
    { title: '수분 섭취 챙기기', desc: '부종 예방을 위해 충분한 물을 마셔보세요' },
    { title: '오메가3로 두뇌 발달', desc: '생선이나 견과류로 막바지 두뇌 발달을 도와보세요' },
    { title: '나트륨은 줄이기', desc: '부종과 혈압 관리를 위해 짠 음식을 줄여보세요' },
    { title: '가벼운 단백질 간식', desc: '출산을 위한 체력 비축에 단백질을 챙겨보세요' },
  ],
};

// 임신 주수(week)에 맞는 시기별 콘텐츠 중, 오늘 날짜를 기준으로 하나씩 골라 반환합니다.
// → 주수(시기)가 다르면 다른 카테고리에서, 날짜가 다르면 같은 시기 안에서도 다른 항목이 나와요.
export function getTodayGuide(week: number, date: Date = new Date()) {
  const trimester = getTrimester(week);
  const seed = dayOfYearSeed(date);
  const exerciseList = exerciseByTrimester[trimester];
  const nutrientList = nutrientByTrimester[trimester];
  return {
    exercise: exerciseList[seed % exerciseList.length],
    nutrient: nutrientList[seed % nutrientList.length],
  };
}

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
  authorId?: string;
  week: number;
  price?: string;
  commentCount: number;
  createdAt: string;
  imageUri?: string;
  reportCount?: number;
  reportedBy?: string[];
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