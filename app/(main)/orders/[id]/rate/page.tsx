'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import RatingForm, { type RatingValue } from '@/components/RatingForm';
import { useToast } from '@/components/NotificationToast';
import { fetchPostById } from '@/services/postService';

// صفحه‌ی «امتیاز و نظر» فیگما (rate & comments): آواتار ۱۲۸ پیکسلی فروشنده، نام ۲۲/۴۰۰،
// ستاره‌ها و کادر نظر روی زمینه‌ی سفید
export default function RateOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { success } = useToast();
  const post = useMemo(() => (params.id ? fetchPostById(params.id as string) : null), [params.id]);
  const [value, setValue] = useState<RatingValue>({ stars: 0, comment: '' });

  return (
    <AppShell>
      <PageHeader title="امتیاز" onMore={() => {}} />

      <div className="flex flex-col items-center mt-13.75">
        <span className="relative w-32 h-32 rounded-full overflow-hidden bg-placeholder">
          {post?.authorAvatar && <Image src={post.authorAvatar} alt="" fill sizes="128px" className="object-cover" />}
        </span>
        <span className="mt-0.5 text-[22px] text-text-primary">{post?.authorUsername || post?.authorName || 'فروشنده'}</span>
      </div>

      <div className="px-4 mt-16 mb-10">
        <RatingForm
          value={value}
          onChange={setValue}
          onSend={() => {
            success('از ثبت نظر شما متشکریم');
            router.back();
          }}
        />
      </div>
    </AppShell>
  );
}
