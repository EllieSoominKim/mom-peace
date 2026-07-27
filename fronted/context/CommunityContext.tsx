import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { communityPosts as initialPosts, CommunityPost } from '../constants/mock-data';
import { useUser } from './UserContext';

const STORAGE_KEY = 'mompeace:community:posts';

export type NewPostInput = {
  category: CommunityPost['category'];
  title: string;
  content: string;
  price?: string;
  imageUri?: string;
};

type CommunityContextValue = {
  posts: CommunityPost[];
  isLoading: boolean;
  addPost: (input: NewPostInput) => Promise<CommunityPost>;
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

  const addPost: CommunityContextValue['addPost'] = async ({ category, title, content, price, imageUri }) => {
    const newPost: CommunityPost = {
      id: `${Date.now()}`,
      category,
      title,
      preview: content,
      author: user?.nickname ?? '회원',
      week: user?.week ?? 0,
      price: category === '판매' && price ? price : undefined,
      commentCount: 0,
      createdAt: '방금 전',
      imageUri,
    };
    const updated = [newPost, ...posts];
    setPosts(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newPost;
  };

  return (
    <CommunityContext.Provider value={{ posts, isLoading, addPost }}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error('useCommunity는 CommunityProvider 안에서만 사용할 수 있어요.');
  return ctx;
}