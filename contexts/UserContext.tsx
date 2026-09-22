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
    // 1. Carrega imediatamente do localStorage para resposta instantânea
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch {
      // ignore JSON parse error
    }

    // 2. Tenta checar o backend com timeout curto (1.5s) para não travar a aplicação caso o backend não esteja ativo
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
      // Backend inacessível ou timeout - mantém o usuário do localStorage se houver
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