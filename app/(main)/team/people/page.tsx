'use client';

import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { SearchIcon } from '@/components/icons';
import { TEAM_PEOPLE } from '@/data/team';
import { formatPrice } from '@/utils/numberUtils';

// صفحه‌ی «افراد» فیگما (People): جستجوی کپسولی و شبکه‌ی سه‌ستونه‌ی آواتارهای ۶۱ پیکسلی
// با نام ۹/۴۰۰، تخصص خاکستری، قیمت ۱۱/۴۰۰ و کپسول کوچک مشکی واحد
export default function PeoplePage() {
  const [q, setQ] = useState('');
  const list = TEAM_PEOPLE.filter((p) => `${p.name} ${p.role}`.includes(q.trim()));

  return (
    <AppShell>
      <PageHeader title="افراد" onMore={() => {}} />
      <div className="px-4 pb-10">
        <label className="flex items-center gap-3 h-11 px-4 rounded-[10px] border border-border-strong">
          <SearchIcon className="w-4 h-4 shrink-0" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو"
            aria-label="جستجوی افراد"
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-placeholder [&::-webkit-search-cancel-button]:hidden"
          />
        </label>

        <ul className="list-none m-0 mt-5 p-0 grid grid-cols-3 gap-y-6">
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/team/add-member?id=${p.id}`} className="flex flex-col items-center text-text-primary hover:text-text-primary">
                <span className="w-15.25 h-15.25 rounded-full bg-placeholder" aria-hidden />
                <span className="mt-1.5 text-[9px]">{p.name}</span>
                <span className="text-[8px] text-placeholder">{p.role}</span>
                <span className="mt-1 text-[11px]">{formatPrice(p.price)}</span>
                <span className="mt-0.5 h-2 px-1.5 rounded-full bg-black text-white text-[4px] leading-2">{p.unit}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
