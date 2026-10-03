'use client';

import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { RowChevron } from '@/components/SettingsUI';

// صفحه‌ی «گزینه‌ها» فیگما (More Options Menu): ردیف «تیم من» با آیکون، به بقیه‌ی صفحه‌های تیم راه می‌دهد
const ITEMS = [
  { href: '/messages', label: 'تیم من' },
  { href: '/team/new', label: 'ساخت تیم' },
  { href: '/team/people', label: 'افراد' },
  { href: '/team/notifications', label: 'اعلان‌های اعضا' },
  { href: '/team/address', label: 'آدرس تیم' },
  { href: '/team/job', label: 'آگهی همکاری' },
];

export default function TeamOptionsPage() {
  return (
    <AppShell>
      <PageHeader title="گزینه‌ها" />
      <ul className="list-none m-0 mt-8 px-4">
        {ITEMS.map((it, i) => (
          <li key={it.href}>
            <Link href={it.href} className="flex items-center justify-between h-11 text-sm text-text-primary hover:text-text-primary">
              <span className="flex items-center gap-2">
                {it.label}
                {i === 0 && <span className="w-3.5 h-3.5 bg-accent-color rounded-[2px]" aria-hidden />}
              </span>
              <RowChevron />
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
