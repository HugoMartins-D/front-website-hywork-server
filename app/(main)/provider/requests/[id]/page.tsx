'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import ProfileHeader from '@/components/ProfileHeader';
import { CalendarIcon, LocationIcon } from '@/components/icons';
import { fetchPostById } from '@/services/postService';
import { formatPrice, toPersianNumber } from '@/utils/numberUtils';

// صفحه‌ی «درخواست جدید» تعمیرکار در فیگما (repairman page): پروفایل بالا و شیت مشکی ثابت پایین
// با شماره‌ی صف، مبلغ ۲۵/۶۰۰، کارت مشتری (تاریخ و مکان)، کارت سرویس، جدول ساعت/تعداد و «رد / پذیرش»

// داده‌ی نمونه‌ی درخواست تا آماده شدن API سفارش‌های فروشنده
const REQUEST = { queue: 11, customer: 'kaban.j', city: 'تهران', date: '۱۴۰۴/۰۷/۱۷', time: '۲۱:۰۰', address: 'تهران، خیابان ولیعصر' };

export default function ProviderRequestPage() {
  const params = useParams();
  const router = useRouter();
  const post = useMemo(() => (params.id ? fetchPostById(params.id as string) : null), [params.id]);
  if (!post) return <p className="p-10 text-center text-text-secondary">درخواستی یافت نشد.</p>;

  const image = post.images?.[0] || post.image || '/images/posts/placeholder.svg';
  const row = 'flex items-center justify-between text-sm';

  return (
    <main className="min-h-screen bg-bg-primary flex justify-center">
      <div className="w-full max-w-110">
        <ProfileHeader
          avatar={post.authorAvatar}
          name={post.authorUsername || post.authorName || ''}
          subtitle="فروشگاه و خدمات"
          bio={post.caption}
          stats={[
            { label: 'پست', value: toPersianNumber(385) },
            { label: 'علاقه‌مندی', value: toPersianNumber('1,051') },
            { label: 'مشتری', value: toPersianNumber('1.5K') },
          ]}
        />

        <section className="mt-6 min-h-[60vh] bg-black text-white px-3 pt-3.5 pb-8">
          <div className="flex justify-center mb-5">
            <span className="block w-10.25 h-0.5 bg-white" aria-hidden />
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="w-9.25 h-9.25 border border-white flex items-center justify-center text-sm" aria-label="شماره در صف">
              {toPersianNumber(REQUEST.queue)}
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-[10px] text-white/60">تومان</span>
              <span className="text-[25px] font-semibold">{formatPrice(post.price)}</span>
            </span>
          </div>

          {/* کارت مشتری */}
          <div className="mt-6 rounded-[10px] border border-white p-3">
            <div className="flex items-start justify-between">
              <span>
                <span className="block text-xl">{REQUEST.customer}</span>
                <span className="block text-[8px] text-white/60">{REQUEST.city}</span>
              </span>
              <span className="w-9 h-9 bg-placeholder shrink-0" aria-hidden />
            </div>
            <div className={`${row} mt-5`}>
              <span className="flex items-center gap-2">تاریخ و ساعت <CalendarIcon className="w-3.5 h-3.5" /></span>
              <span>{REQUEST.time} | {REQUEST.date}</span>
            </div>
            <div className={`${row} mt-3`}>
              <span className="flex items-center gap-2">مکان <LocationIcon className="w-3.5 h-3.5" /></span>
              <span className="truncate max-w-55">{REQUEST.address}</span>
            </div>
          </div>

          {/* کارت سرویس و جدول ساعت/تعداد */}
          <div className="mt-3 rounded-[10px] border border-white overflow-hidden">
            <div className="flex gap-3 p-3">
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-semibold">{post.authorUsername}</div>
                <div className="mt-1 text-[10px] text-white/70 line-clamp-2">{post.title}</div>
                <div className="mt-2 text-base font-semibold">{formatPrice(post.price)}</div>
              </div>
              <span className="relative w-30 h-21 shrink-0 bg-placeholder">
                <Image src={image} alt="" fill sizes="120px" className="object-cover" unoptimized />
              </span>
            </div>
            <div className="border-t border-white/40 px-3 py-2">
              <div className={row}><span>واحد</span><span>ساعت</span></div>
              <div className={`${row} mt-1`}><span>تعداد</span><span>۱ ساعت</span></div>
            </div>
          </div>

          <div className="mt-12 flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/provider/work/${post.id}`)}
              className="flex-1 h-12.5 rounded-[10px] bg-white text-black text-lg"
            >
              پذیرش
            </button>
            <button type="button" onClick={() => router.back()} className="flex-1 h-12.5 rounded-[10px] border border-white text-lg">
              رد
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
