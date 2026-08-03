import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { communityPosts as initialPosts, CommunityPost } from '../constants/mock-data';
import { useUser } from './UserContext';

const STORAGE_KEY = 'mompeace:community:posts';
const REPORT_THRESHOLD = 5;

export type NewPostInput = {
  category: CommunityPost['category'];
  title: string;
  content: string;
  price?: string;
  imageUri?: string;
};

export type ReportResult = 'reported' | 'already-reported' | 'removed';

type CommunityContextValue = {
  posts: CommunityPost[];
  isLoading: boolean;
  addPost: (input: NewPostInput) => Promise<CommunityPost>;
  updatePost: (id: string, input: NewPostInput) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  reportPost: (id: string) => Promise<ReportResult>;
  isOwner: (post: CommunityPost) => boolean;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setPosts(JSON.parse(raw));
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const persist = async (updated: CommunityPost[]) => {
    setPosts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addPost: CommunityContextValue['addPost'] = async ({ category, title, content, price, imageUri }) => {
    const newPost: CommunityPost = {
      id: `${Date.now()}`,
      category,
      title,
      preview: content,
      author: user?.nickname ?? '회원',
      authorId: user?.id,
      week: user?.week ?? 0,
      price: category === '판매' && price ? price : undefined,
      commentCount: 0,
      createdAt: '방금 전',
      imageUri,
      reportCount: 0,
      reportedBy: [],
    };
    const updated = [newPost, ...posts];
    await persist(updated);
    return newPost;
  };

  const updatePost: CommunityContextValue['updatePost'] = async (id, { category, title, content, price, imageUri }) => {
    const updated = posts.map((p) =>
      p.id === id
        ? {
            ...p,
            category,
            title,
            preview: content,
            price: category === '판매' && price ? price : undefined,
            imageUri,
          }
        : p
    );
    await persist(updated);
  };

  const deletePost: CommunityContextValue['deletePost'] = async (id) => {
    const updated = posts.filter((p) => p.id !== id);
    await persist(updated);
  };

  const reportPost: CommunityContextValue['reportPost'] = async (id) => {
    const target = posts.find((p) => p.id === id);
    if (!target) return 'already-reported';

    const reportedBy = target.reportedBy ?? [];
    const reporterKey = user?.id ?? 'guest';
    if (reportedBy.includes(reporterKey)) {
      return 'already-reported';
    }

    const nextReportCount = (target.reportCount ?? 0) + 1;

    if (nextReportCount >= REPORT_THRESHOLD) {
      await persist(posts.filter((p) => p.id !== id));
      return 'removed';
    }

    const updated = posts.map((p) =>
      p.id === id
        ? { ...p, reportCount: nextReportCount, reportedBy: [...reportedBy, reporterKey] }
        : p
    );
    await persist(updated);
    return 'reported';
  };

  const isOwner = (post: CommunityPost) => !!user && !!post.authorId && post.authorId === user.id;

  return (
    <CommunityContext.Provider
      value={{ posts, isLoading, addPost, updatePost, deletePost, reportPost, isOwner }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity는 CommunityProvider 안에서만 사용할 수 있어요.');
  return ctx;
}