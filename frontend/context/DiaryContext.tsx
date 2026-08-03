import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from './UserContext';

export type DiaryEntry = {
  id: string;
  time: string;
  name: string;
  kcal: number;
  caffeineMg: number;
  sugarG: number;
  sodiumMg: number;
  carbG: number;
};

const DIARY_KEY_PREFIX = 'mompeace:diary';

export const DAILY_LIMITS = { caffeine: 200, sugar: 50, sodium: 2000, carb: 175 };

function todayKey(userId: string) {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return `${DIARY_KEY_PREFIX}:${userId}:${dateStr}`;
}

type DiaryContextValue = {
  entries: DiaryEntry[];
  isLoading: boolean;
  caffeineTotal: number;
  sugarTotal: number;
  carbTotal: number;
  addEntry: (entry: Omit<DiaryEntry, 'id' | 'time'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
};

const DiaryContext = createContext<DiaryContextValue | null>(null);

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) {
        setEntries([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(todayKey(user.id));
      setEntries(raw ? JSON.parse(raw) : []);
      setIsLoading(false);
    })();
  }, [user?.id]);

  const addEntry: DiaryContextValue['addEntry'] = async (entry) => {
    if (!user) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newEntry: DiaryEntry = { ...entry, id: `${Date.now()}`, time };
    const updated = [...entries, newEntry];
    setEntries(updated);
    await AsyncStorage.setItem(todayKey(user.id), JSON.stringify(updated));
  };

  const deleteEntry: DiaryContextValue['deleteEntry'] = async (id) => {
    if (!user) return;
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    await AsyncStorage.setItem(todayKey(user.id), JSON.stringify(updated));
  };

  const caffeineTotal = entries.reduce((sum, e) => sum + (e.caffeineMg || 0), 0);
  const sugarTotal = entries.reduce((sum, e) => sum + (e.sugarG || 0), 0);
  const carbTotal = entries.reduce((sum, e) => sum + (e.carbG || 0), 0);

  return (
    <DiaryContext.Provider
      value={{ entries, isLoading, caffeineTotal, sugarTotal, carbTotal, addEntry, deleteEntry }}
    >
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiary() {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary는 DiaryProvider 안에서만 사용할 수 있어요.');
  return ctx;
}