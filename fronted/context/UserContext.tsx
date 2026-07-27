import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserProfile = {
  id: string;
  password: string;
  nickname: string;
  week: number;
  day: number;
  dueDate: string; // 예: "2026-12-07" 또는 "2026.10.26"
  // 마이페이지와의 호환성을 위한 선택적 호환 프로퍼티
  pregnancyWeeks?: number;
  pregnancyDays?: number;
};

type AccountsMap = Record<string, UserProfile>; // key: id

const ACCOUNTS_KEY = 'mompeace:accounts';
const SESSION_KEY = 'mompeace:session'; // 현재 로그인된(또는 가입 진행 중인) id

type RegisterResult = { ok: true } | { ok: false; error: string };
type LoginResult = { ok: true } | { ok: false; error: string };
type SaveDraftResult = { ok: true } | { ok: false; error: string };

// 정보 수정을 위한 파셜 타입
export type UpdateProfileInput = Partial<UserProfile> & {
  pregnancyWeeks?: number;
  pregnancyDays?: number;
};

type UserContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  register: (id: string, password: string, nickname: string) => Promise<RegisterResult>;
  saveDraft: (id: string, password: string, nickname: string) => Promise<SaveDraftResult>;
  login: (id: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  saveOnboarding: (week: number, day: number, dueDate: string) => Promise<void>;
  updateUser: (newData: UpdateProfileInput) => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

async function getAccounts(): Promise<AccountsMap> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function setAccounts(accounts: AccountsMap) {
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const sessionId = await AsyncStorage.getItem(SESSION_KEY);
        if (sessionId) {
          const accounts = await getAccounts();
          if (accounts[sessionId]) setUser(accounts[sessionId]);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const register: UserContextValue['register'] = async (id, password, nickname) => {
    const accounts = await getAccounts();
    if (accounts[id]) {
      return { ok: false, error: '이미 사용 중인 아이디예요.' };
    }
    const newUser: UserProfile = { id, password, nickname, week: 0, day: 0, dueDate: '' };
    accounts[id] = newUser;
    await setAccounts(accounts);
    await AsyncStorage.setItem(SESSION_KEY, id);
    setUser(newUser);
    return { ok: true };
  };

  const saveDraft: UserContextValue['saveDraft'] = async (id, password, nickname) => {
    const accounts = await getAccounts();

    if (!user) {
      return register(id, password, nickname);
    }

    if (id === user.id) {
      const updated: UserProfile = { ...user, password, nickname };
      accounts[id] = updated;
      await setAccounts(accounts);
      setUser(updated);
      return { ok: true };
    }

    if (accounts[id]) {
      return { ok: false, error: '이미 사용 중인 아이디예요.' };
    }

    const updated: UserProfile = { ...user, id, password, nickname };
    delete accounts[user.id];
    accounts[id] = updated;
    await setAccounts(accounts);
    await AsyncStorage.setItem(SESSION_KEY, id);
    setUser(updated);
    return { ok: true };
  };

  const login: UserContextValue['login'] = async (id, password) => {
    const accounts = await getAccounts();
    const found = accounts[id];
    if (!found || found.password !== password) {
      return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않아요.' };
    }
    await AsyncStorage.setItem(SESSION_KEY, id);
    setUser(found);
    return { ok: true };
  };

  const logout = async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  const saveOnboarding: UserContextValue['saveOnboarding'] = async (week, day, dueDate) => {
    if (!user) return;
    const updated: UserProfile = { ...user, week, day, dueDate };
    const accounts = await getAccounts();
    accounts[user.id] = updated;
    await setAccounts(accounts);
    setUser(updated);
  };

  // 마이페이지 정보 수정용 함수 추가
  const updateUser: UserContextValue['updateUser'] = async (newData) => {
    if (!user) return;

    // pregnancyWeeks / pregnancyDays 가 전달될 경우 week / day 에 호환 매핑
    const newWeek = newData.pregnancyWeeks ?? newData.week ?? user.week;
    const newDay = newData.pregnancyDays ?? newData.day ?? user.day;

    const updated: UserProfile = {
      ...user,
      ...newData,
      week: newWeek,
      day: newDay,
      pregnancyWeeks: newWeek,
      pregnancyDays: newDay,
    };

    const accounts = await getAccounts();
    accounts[user.id] = updated;
    await setAccounts(accounts);
    setUser(updated);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        register,
        saveDraft,
        login,
        logout,
        saveOnboarding,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser는 UserProvider 안에서만 사용할 수 있어요.');
  return ctx;
}