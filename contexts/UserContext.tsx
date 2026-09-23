'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type UserStatus = 'active' | 'busy' | 'ready' | 'inactive';

export interface User {
  id: number;
  phone?: string;

  username?: string;

  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;

  avatar?: string;
  status?: UserStatus;
  bio?: string;
  birthDate?: string;
  gender?: string;
  addresses?: string[];

  city?: string;
  // موقعیت انتخاب‌شده روی نقشه یا متن آدرس
  location?: { lat: number; lng: number } | string | null;
  isVerified?: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserStatus: (status: UserStatus) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
  updateUserStatus: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // تابع برای دریافت کاربر از کوکی یا localStorage
  const fetchUser = async () => {
    // ۱. بارگذاری فوری کاربر از localStorage برای پاسخ سریع
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // خطای parse نادیده گرفته می‌شود
    }

    // ۲. بررسی بک‌اند با تایم‌اوت کوتاه (۱.۵ ثانیه) تا اگر بک‌اند فعال نبود برنامه قفل نشود
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(`${API_URL}/auth/me`, {
        signal: controller.signal,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch {
      // بک‌اند در دسترس نیست یا تایم‌اوت شد - کاربر localStorage حفظ می‌شود
    }
  };

  useEffect(() => {
    const initUser = async () => {
      setLoading(true);
      await fetchUser();
      setLoading(false);
    };
    initUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const updateUserStatus = (status: UserStatus) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, status };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, refreshUser, updateUserStatus }}>
      {children}
    </UserContext.Provider>
  );
}