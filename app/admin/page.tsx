'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-(--color-bg-primary)">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-base text-(--color-text-secondary)">در حال انتقال به داشبورد مدیریت...</span>
      </div>
    </div>
  );
}