'use client';

import { useContext, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ServiceSummary from '@/components/ServiceSummary';
import DateTimeSheet, { formatJalaliDateTime } from '@/components/DateTimeSheet';
import { Button } from '@/components/FormControls';
import { ClockIcon, LocationIcon, CheckIcon } from '@/components/icons';
import { UserContext } from '@/contexts/UserContext';
import { fetchPostById } from '@/services/postService';

// صفحه‌ی «تکمیل سفارش» فیگما (Reservation page and description):
// خلاصه‌ی سرویس، «ارسال برای خودم»، زمان سفارش (برگه‌ی تقویم مشکی)، مکان، دکمه‌های انصراف و ارسال

const fieldClass = 'w-full h-14 flex items-center gap-4 px-4 rounded-xl border border-border-strong text-right';

const Chevron = () => (
  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 shrink-0" fill="none" stroke="#0a090b" strokeWidth="2.5" aria-hidden>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

export default function ReservePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useContext(UserContext);
  const post = useMemo(() => (params.id ? fetchPostById(params.id as string) : null), [params.id]);

  const [forMyself, setForMyself] = useState(true);
  const [when, setWhen] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const address = typeof user?.location === 'string' && user.location ? user.location : '';

  if (!post) {
    return (
      <AppShell>
        <PageHeader title="تکمیل سفارش" />
        <p className="px-4 py-12 text-center text-text-secondary">سرویسی یافت نشد.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="تکمیل سفارش" onMore={() => {}} />

      <div className="pt-6.5">
        <ServiceSummary post={post} unit="ساعت" imageSide="end" />
      </div>

      <div className="px-4">
        <button
          type="button"
          role="checkbox"
          aria-checked={forMyself}
          onClick={() => setForMyself((v) => !v)}
          className="mt-21 w-full flex items-center justify-between text-base text-text-primary"
        >
          <span>ارسال برای خودم</span>
          <span className="w-4 h-4 rounded-[3px] border border-border-strong flex items-center justify-center">
            {forMyself && <CheckIcon className="w-3 h-3" />}
          </span>
        </button>

        <span className="block mt-12 mb-2.5 text-sm text-text-primary">زمان سفارش</span>
        <button type="button" onClick={() => setSheetOpen(true)} className={fieldClass}>
          <ClockIcon className="w-4 h-4.5 shrink-0" />
          <span className={`flex-1 text-sm ${when ? 'text-text-primary' : 'text-[#b5b5b5]'}`}>
            {when ? formatJalaliDateTime(when) : 'همین حالا'}
          </span>
          <Chevron />
        </button>

        <span className="block mt-2.5 mb-2.5 text-sm text-text-primary">مکان</span>
        <button type="button" onClick={() => router.push('/full-map')} className={fieldClass}>
          <LocationIcon className="w-5 h-5 shrink-0" />
          <span className={`flex-1 text-sm truncate ${address ? 'text-text-primary' : 'text-text-muted'}`}>
            {address || 'انتخاب آدرس روی نقشه'}
          </span>
          <Chevron />
        </button>

        <div className="mt-28 mb-6 flex gap-5">
          <Button className="flex-1" onClick={() => router.push('/checkout')}>
            ارسال
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => router.back()}>
            انصراف
          </Button>
        </div>
      </div>

      <DateTimeSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        initial={when}
        onConfirm={(d) => {
          setWhen(d);
          setSheetOpen(false);
        }}
      />
    </AppShell>
  );
}
