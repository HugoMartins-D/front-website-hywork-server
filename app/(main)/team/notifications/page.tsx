'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { SearchIcon } from '@/components/icons';

// صفحه‌ی «اعلان‌های اعضا» فیگما (member notification): جستجو و کارت‌های دورخط با گوشه‌ی ۱۰،
// عنوان «فروش فعال شد» ۹/۶۰۰، متن ۷/۴۰۰، زمان سمت چپ و آواتار با حلقه و نشان قرمز
const ITEMS = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: 'آگهی همکاری فعال شد',
  text: 'یک فرصت همکاری جدید برای تیم شما منتشر شده است. برای دیدن جزئیات بزنید.',
  time: '۱ دقیقه پیش',
  unread: 2,
}));

export default function MemberNotificationsPage() {
  const [q, setQ] = useState('');
  const list = ITEMS.filter((n) => `${n.title} ${n.text}`.includes(q.trim()));

  return (
    <AppShell>
      <PageHeader title="اعلان‌ها" />
      <div className="px-4 pb-10">
        <label className="flex items-center gap-3 h-11 px-4 rounded-[10px] border border-border-strong">
          <SearchIcon className="w-4 h-4 shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو"
            aria-label="جستجوی اعلان‌ها"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
          />
        </label>

        <ul className="list-none m-0 mt-4 p-0 flex flex-col gap-2.5">
          {list.map((n) => (
            <li key={n.id}>
              <Link href="/team/job" className="flex items-center gap-3 min-h-17.5 px-3 rounded-[10px] border border-border-strong text-text-primary hover:text-text-primary">
                <span className="relative shrink-0">
                  <span className="block w-9 h-9 rounded-full bg-placeholder ring-2 ring-[#1e2f4d]" aria-hidden />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#ff0f00] text-white text-[9px] flex items-center justify-center">
                    {n.unread}
                  </span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[9px] font-semibold">{n.title}</span>
                  <span className="block text-[7px] leading-2.5">{n.text}</span>
                </span>
                <span className="text-[8px] text-[#6c6c6c] w-8">{n.time}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
