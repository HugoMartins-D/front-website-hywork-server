'use client';

import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { SETTINGS_ITEMS, RowChevron } from '@/components/SettingsUI';

// صفحه‌ی «تنظیمات» فیگما (Setting): عنوان بخش ۱۶/۶۰۰، ردیف‌های ۳۹ پیکسلی با متن ۱۴/۴۰۰ و فلش کوچک سمت چپ

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader title="تنظیمات" />
      <section className="px-4 pb-10">
        <h2 className="m-0 mt-1 mb-3 text-base font-semibold text-text-primary">عمومی</h2>
        <ul className="list-none m-0 p-0">
          {SETTINGS_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between h-9.75 text-sm text-text-primary hover:text-text-primary"
              >
                <span>{item.label}</span>
                <RowChevron />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
