// components/ServiceSummary.tsx
'use client';

import Image from 'next/image';
import { formatPrice, formatRating } from '@/utils/numberUtils';
import type { Post } from '@/types';

// خلاصه‌ی سرویس/محصول در صفحه‌های رزرو، فاکتور و وضعیت سفارش فیگما:
// تصویر ۱۰۰×۱۰۰ با گوشه‌ی ۸، فروشنده با آواتار ۳۰ پیکسلی، عنوان ۱۴/۶۰۰ و قیمت ۱۶/۶۰۰ با واحد

// imageSide: «end» = تصویر سمت چپ (صفحه‌ی رزرو)، «start» = تصویر سمت راست (فاکتور و سبد)
export default function ServiceSummary({
  post,
  unit = 'تومان',
  showPrice = true,
  imageSide = 'start',
}: {
  post: Post;
  unit?: string;
  showPrice?: boolean;
  imageSide?: 'start' | 'end';
}) {
  const image = post.images?.[0] || post.image || '/images/posts/placeholder.svg';
  return (
    <div className="flex gap-5 px-4">
      <div className="flex-1 min-w-0 flex flex-col items-end text-right">
        <div className="flex items-center gap-2">
          <span className="text-end">
            <span className="block text-sm font-semibold text-text-primary leading-4.25">{post.authorUsername || post.authorName}</span>
            <span className="flex items-center justify-end gap-1 text-[8px] text-[#cfcfcf]">
              <span>{post.author?.location || 'تهران'}</span>
              <span className="text-text-primary">|</span>
              <svg viewBox="0 0 24 24" className="w-2 h-2 text-text-primary" fill="currentColor" aria-hidden>
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
              </svg>
              <span className="text-text-primary">{formatRating(post.rating || 0)}</span>
            </span>
          </span>
          <span className="relative w-7.5 h-7.5 rounded-full overflow-hidden bg-placeholder shrink-0 order-first">
            {post.authorAvatar && <Image src={post.authorAvatar} alt="" fill sizes="30px" className="object-cover" />}
          </span>
        </div>
        <h3 className="m-0 mt-4 text-sm font-semibold leading-4.25 text-text-primary line-clamp-2">{post.title}</h3>
        {showPrice && (
          <div className="mt-auto pt-2 flex items-baseline gap-1 self-start">
            <span className="text-base font-semibold text-text-primary">{formatPrice(post.price)}</span>
            <span className="text-[10px] text-[#cfcfcf]">/ {unit}</span>
          </div>
        )}
      </div>
      <div className={`relative w-25 h-25 rounded-lg overflow-hidden bg-[#eff3f4] shrink-0 ${imageSide === 'start' ? 'order-first' : ''}`}>
        <Image src={image} alt={post.title} fill sizes="100px" className="object-cover" />
      </div>
    </div>
  );
}
