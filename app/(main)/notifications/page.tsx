'use client';

import { useState } from 'react';
import Image from 'next/image';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { SearchIcon } from '@/components/icons';

// صفحه‌ی «اعلان‌ها» فیگما (Notification): جستجوی کپسولی ۴۰۶×۵۰ با گوشه‌ی ۳۴،
// ردیف‌ها با آواتار ۴۴ پیکسلی، نشان قرمز ۱۹ پیکسلی، عنوان ۱۲/۶۰۰، متن ۱۰/۴۰۰ و زمان ۱۲/۵۰۰ خاکستری

// داده‌ی نمونه تا آماده شدن API اعلان‌ها
const NOTIFICATIONS = [
  { id: 1, from: 'هایورک', text: 'یک سفارش جدید دارید.', time: '۱ دقیقه پیش', unread: 1, logo: true },
  { id: 2, from: 'PipeMaster', text: 'درخواست اضافه‌کاری', time: 'الان', unread: 1, avatar: '' },
  { id: 3, from: 'سارا محمدی', text: 'نظر شما را پسندید.', time: 'دیروز', unread: 0, avatar: '' },
];

export default function NotificationsPage() {
  const [q, setQ] = useState('');
  const list = NOTIFICATIONS.filter((n) => `${n.from} ${n.text}`.includes(q.trim()));

  return (
    <AppShell>
      <PageHeader title="اعلان‌ها" />

      <div className="px-4">
        <label className="flex items-center gap-3 h-12.5 px-4.5 rounded-[34px] border border-border-strong">
          <SearchIcon className="w-4 h-4 text-[#1e1e1e] shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو"
            aria-label="جستجوی اعلان‌ها"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-[#b9b9b9] [&::-webkit-search-cancel-button]:hidden"
          />
        </label>

        <ul className="list-none m-0 mt-6.5 p-0 flex flex-col gap-4">
          {list.map((n) => (
            <li key={n.id} className="flex items-start gap-4">
              <span className="relative shrink-0">
                <span
                  className={`relative block w-11 h-11 rounded-full overflow-hidden ${n.logo ? 'bg-black' : 'bg-placeholder'}`}
                  style={n.logo ? undefined : { boxShadow: '0 0 0 2px var(--color-online)' }}
                >
                  {n.logo ? (
                    <Image src="/images/brand/logo.png" alt="" fill sizes="44px" className="object-contain p-1.5 invert" />
                  ) : (
                    n.avatar && <Image src={n.avatar} alt="" fill sizes="44px" className="object-cover" />
                  )}
                </span>
                {n.unread > 0 && (
                  <span className="absolute -top-1.5 -right-1 w-4.75 h-4.75 rounded-full bg-[#ff0f00] text-white text-[10px] font-bold flex items-center justify-center">
                    {n.unread}
                  </span>
                )}
              </span>
              <span className="flex-1 min-w-0 pt-0.5">
                <span className="block text-xs font-semibold text-text-primary">{n.from}</span>
                <span className="block mt-1 text-[10px] text-text-primary">{n.text}</span>
              </span>
              <span className="pt-3.5 text-xs font-medium text-[#6c6c6c] whitespace-nowrap">{n.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
