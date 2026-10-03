// components/AppShell.tsx
'use client';

import type { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';

// قالب صفحه‌های فیگما: در موبایل نوار پایین، در دسکتاپ نوار آیکونی سمت راست
// و محتوا در ستون ۴۴۰ پیکسلی وسط صفحه. صفحه‌های عریض (نقشه، ساخت پست) از wide استفاده می‌کنند

interface AppShellProps {
  children: ReactNode;
  wide?: boolean;
  hideBottomNav?: boolean;
  suppressActiveProfile?: boolean;
  className?: string;
}

export default function AppShell({
  children,
  wide = false,
  hideBottomNav = false,
  suppressActiveProfile = false,
  className = '',
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="hidden md:block">
        <Sidebar suppressActiveProfile={suppressActiveProfile} />
      </div>

      <main
        className={`${
          wide ? 'w-full md:pe-0 md:ps-21.25' : 'mx-auto w-full max-w-110'
        } min-h-screen ${hideBottomNav ? '' : 'pb-14'} md:pb-0 ${className}`}
      >
        {children}
      </main>

      {!hideBottomNav && (
        <div className="md:hidden">
          <MobileBottomNav suppressActiveProfile={suppressActiveProfile} />
        </div>
      )}
    </div>
  );
}
