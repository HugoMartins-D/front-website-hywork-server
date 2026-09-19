'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: number;
  phone: string;

  username?: string;

  firstName?: string;
  lastName?: string;

  avatar?: string;

  city?: string;
  isVerified?: boolean;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: () => {},
  refreshUser: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // تابع برای دریافت کاربر از کوکی یا localStorage
  const fetchUser = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // اول از کوکی چک کن (با credentials: include)
      const response = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // همزمان در localStorage هم ذخیره کن
        localStorage.setItem('user', JSON.stringify(userData));
        return;
      }
    } catch (error) {
      console.log('Error fetching user from cookie:', error);
    }

    // اگر کوکی کار نکرد، از localStorage بخون
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
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

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}