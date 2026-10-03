'use client';

import { useState } from 'react';
import Image from 'next/image';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { SearchIcon } from '@/components/icons';

// صفحه‌ی «آدرس» تیم فیگما (Address): جستجو و حالت خالی «هنوز آدرسی ندارید»
export default function TeamAddressPage() {
  const [q, setQ] = useState('');
  return (
    <AppShell>
      <PageHeader title="آدرس" />
      <div className="px-4 pb-10">
        <label className="flex items-center gap-3 h-11 px-4 rounded-[10px] border border-border-strong">
          <SearchIcon className="w-4 h-4 shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو"
            aria-label="جستجوی آدرس"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <div className="flex flex-col items-center mt-16">
          <Image src="/images/illustrations/empty-posts.png" alt="" width={200} height={197} />
          <p className="m-0 text-[10px] text-text-primary">هنوز آدرسی ثبت نکرده‌اید</p>
        </div>
      </div>
    </AppShell>
  );
}
