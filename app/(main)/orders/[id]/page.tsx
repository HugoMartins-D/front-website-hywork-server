'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import BottomSheet from '@/components/BottomSheet';
import RatingForm, { type RatingValue } from '@/components/RatingForm';
import { Button } from '@/components/FormControls';
import { ClockIcon, TruckIcon, BoxIcon } from '@/components/icons';
import { useToast } from '@/components/NotificationToast';

// صفحه‌ی «وضعیت سفارش» فیگما (user order status): تصویر سه‌بعدی، خط زمانی عمودی با دایره‌های
// ۳۰ پیکسلی خاکستری، عنوان‌های ۲۲/۶۰۰، زمان ۱۶/۴۰۰، کپسول «رهگیری» و دکمه‌ی «تأیید تحویل».
// تأیید تحویل برگه‌ی مشکی امتیازدهی (محصول / فروشنده / ارسال) را باز می‌کند

// تا وقتی API سفارش‌ها آماده نیست، مراحل نمونه نمایش داده می‌شوند
const STEPS = [
  { key: 'received', title: 'سفارش دریافت شد', time: '۲۱:۰۰، ۲۹ اردیبهشت ۱۴۰۴', icon: ClockIcon },
  { key: 'shipping', title: 'در راه', time: '۲۱:۲۰، ۲۹ اردیبهشت ۱۴۰۴', icon: TruckIcon, tracking: true },
  { key: 'delivered', title: 'تحویل', time: 'زمان تحویل تا ۱۵ دقیقه‌ی دیگر', icon: BoxIcon },
];

const RATE_TARGETS = [
  { key: 'product', label: 'محصول', image: '/images/illustrations/rate-product.png' },
  { key: 'seller', label: 'فروشنده', image: '/images/illustrations/rate-seller.png' },
  { key: 'shipping', label: 'ارسال', image: '/images/illustrations/rate-shipping.png' },
];

export default function OrderStatusPage() {
  const router = useRouter();
  const { success } = useToast();
  const [rateOpen, setRateOpen] = useState(false);
  const [target, setTarget] = useState(1);
  const [ratings, setRatings] = useState<Record<string, RatingValue>>({});

  const current = RATE_TARGETS[target];
  const value = ratings[current.key] ?? { stars: 0, comment: '' };

  const finish = () => {
    setRateOpen(false);
    success('از ثبت نظر شما متشکریم');
    router.push('/');
  };

  return (
    <AppShell>
      <PageHeader title="وضعیت سفارش" onMore={() => {}} />

      <div className="relative mx-auto w-65.5 h-63.25 -mt-2">
        <Image src="/images/illustrations/order-cart.png" alt="" fill sizes="262px" className="object-contain" priority />
      </div>

      <ol className="list-none m-0 mt-4 px-4 relative">
        <span aria-hidden className="absolute top-6 bottom-8 right-8.75 w-px bg-[#d4d4d4]" />
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.key} className={`relative flex items-start gap-5 ${i < STEPS.length - 1 ? 'pb-28' : ''}`}>
              <span className="relative z-1 w-7.5 h-7.5 mt-0.5 rounded-full bg-placeholder flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </span>
              <div>
                <h2 className="m-0 text-[22px] font-semibold leading-6.75 text-text-primary">{step.title}</h2>
                <p className="m-0 mt-0.5 flex items-center gap-1.5 text-base text-text-primary">
                  {step.time}
                  <ClockIcon className="w-3 h-3" />
                </p>
                {step.tracking && (
                  <Link
                    href="/full-map"
                    className="mt-1.5 inline-flex items-center gap-2 h-5 px-2 rounded-[10px] bg-placeholder text-xs font-semibold text-text-primary hover:text-text-primary"
                  >
                    رهگیری
                    <span className="w-3 h-3 rounded-full border border-border-strong flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-color" />
                    </span>
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="px-4 mt-14 mb-8">
        <Button className="w-full" onClick={() => setRateOpen(true)}>
          تأیید تحویل
        </Button>
      </div>

      <BottomSheet
        open={rateOpen}
        onClose={() => setRateOpen(false)}
        footer={
          <button type="button" onClick={finish} className="w-full h-18.75 rounded-[10px] border border-white text-white text-[22px] font-semibold">
            ثبت
          </button>
        }
      >
        {/* چرخ‌فلک سه کارت: کارت انتخاب‌شده ۱۸۱ پیکسل، کناری‌ها ۱۵۳ پیکسل */}
        <div className="-mx-4 flex items-end justify-center gap-4 overflow-hidden pt-4" role="tablist" aria-label="موضوع امتیاز">
          {RATE_TARGETS.map((t, i) => {
            const active = i === target;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTarget(i)}
                className="flex flex-col items-center shrink-0"
              >
                <span
                  className={`relative block rounded-[10px] border border-white overflow-hidden ${
                    active ? 'w-45.25 h-45.25' : 'w-38.25 h-38.25 opacity-70'
                  }`}
                >
                  <Image src={t.image} alt="" fill sizes="181px" className="object-contain p-2" />
                </span>
                <span className={`mt-2 text-white ${active ? 'text-xl font-medium' : 'text-lg font-medium opacity-70'}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <RatingForm
            tone="dark"
            value={value}
            onChange={(v) => setRatings((prev) => ({ ...prev, [current.key]: v }))}
            onSend={() => setTarget((t) => Math.min(t + 1, RATE_TARGETS.length - 1))}
          />
        </div>
      </BottomSheet>
    </AppShell>
  );
}
