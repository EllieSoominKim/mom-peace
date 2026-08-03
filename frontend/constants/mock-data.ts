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