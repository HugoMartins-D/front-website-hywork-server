// components/PageHeader.tsx
'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { BackIcon, MoreIcon } from '@/components/icons';

// هدر صفحه‌ی فیگما: دکمه‌ی بازگشت ۴۰×۴۰ با فاصله‌ی ۱۶ پیکسل از لبه، عنوان ۲۴/۴۰۰،
// منوی سه‌نقطه در سمت مقابل؛ بدون پس‌زمینه و خط. نسخه‌ی تیره روی سربرگ مشکی سفید می‌شود

interface PageHeaderProps {
  title?: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  onMore?: () => void;
  end?: ReactNode;
  inverted?: boolean;
  className?: string;
}

export default function PageHeader({
  title,
  onBack,
  showBack = true,
  onMore,
  end,
  inverted = false,
  className = '',
}: PageHeaderProps) {
  const router = useRouter();
  const color = inverted ? 'text-white' : 'text-text-primary';

  return (
    <header className={`flex items-center h-17.5 px-4 gap-1.5 ${color} ${className}`}>
      {showBack && (
        <button
          type="button"
          onClick={onBack ?? (() => router.back())}
          aria-label="بازگشت"
          className="w-10 h-10 -me-1 flex items-center justify-center shrink-0"
        >
          <BackIcon className="w-5 h-5" />
        </button>
      )}
      {title && <h1 className="m-0 text-2xl font-normal leading-7.25 truncate">{title}</h1>}
      <div className="ms-auto flex items-center gap-2">
        {end}
        {onMore && (
          <button type="button" onClick={onMore} aria-label="گزینه‌های بیشتر" className="w-10 h-10 flex items-center justify-center">
            <MoreIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
}
