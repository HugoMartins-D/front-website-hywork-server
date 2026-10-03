'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { SpecList } from '@/components/FormControls';
import { ImageIcon } from '@/components/icons';
import { useToast } from '@/components/NotificationToast';
import { fetchPostById } from '@/services/postService';
import { formatPrice, toPersianNumber } from '@/utils/numberUtils';

// صفحه‌ی «ویرایش پست» فیگما (edit post): تصویر تمام‌عرض با کپسول مشکی «متن جایگزین»،
// عنوان و توضیح قابل ویرایش، مشخصات و نوار مشکی پایین با «انصراف / تأیید»
export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const { success } = useToast();
  const post = useMemo(() => (params.id ? fetchPostById(params.id as string) : null), [params.id]);

  const [title, setTitle] = useState(post?.title ?? '');
  const [caption, setCaption] = useState(post?.caption ?? '');
  const [alt, setAlt] = useState('');
  const [altOpen, setAltOpen] = useState(false);

  if (!post) {
    return (
      <AppShell>
        <PageHeader title="ویرایش پست" />
        <p className="px-4 py-12 text-center text-text-secondary">پستی یافت نشد.</p>
      </AppShell>
    );
  }

  const image = post.images?.[0] || post.image || '/images/posts/placeholder.svg';

  const save = () => {
    // تا وقتی API ویرایش پست آماده نیست، فقط پیام موفقیت نمایش داده می‌شود
    success('تغییرات پست ذخیره شد');
    router.push(`/post/${post.id}`);
  };

  return (
    <AppShell hideBottomNav>
      <PageHeader title="ویرایش پست" />

      <div className="flex items-center justify-between px-4 pb-12">
        <span className="text-sm font-semibold text-text-primary">{post.authorUsername}</span>
        <span className="text-lg font-medium text-[#404040]">{new Date(post.createdAt).toLocaleDateString('fa-IR')}</span>
      </div>

      <div className="relative w-full aspect-[440/434] bg-placeholder">
        <Image src={image} alt={alt || post.title} fill sizes="440px" className="object-cover" unoptimized />
        <button
          type="button"
          onClick={() => setAltOpen((v) => !v)}
          className="absolute bottom-5 left-4 h-9 px-4 rounded-[28px] bg-black text-white text-sm flex items-center gap-2"
        >
          متن جایگزین
          <ImageIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 pb-32">
        {altOpen && (
          <textarea
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="نوشتن..."
            aria-label="متن جایگزین"
            className="mt-4 w-full h-25 p-3 rounded-[10px] border border-[#424242] text-sm text-text-primary placeholder:text-[#6b6b6b] outline-none resize-none"
          />
        )}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="عنوان"
          className="mt-8 w-full pb-2 bg-transparent border-0 border-b border-border-color outline-none text-lg font-semibold text-text-primary"
        />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          aria-label="توضیحات"
          className="mt-4 w-full min-h-40 p-0 bg-transparent border-none outline-none resize-y text-xs leading-relaxed text-text-primary"
        />

        <SpecList
          title="مشخصات"
          className="mt-8"
          items={[
            { label: 'دسته‌بندی', value: post.category },
            { label: 'موجودی', value: `${toPersianNumber(post.stock)} عدد` },
          ]}
        />

        <div className="mt-10 flex flex-col items-end">
          <span className="text-[40px] leading-12 text-text-primary">{formatPrice(post.price)}</span>
        </div>
      </div>

      {/* نوار مشکی پایین فیگما: ۹۰ پیکسل، دکمه‌های ۱۹۰×۵۰ */}
      <div className="fixed bottom-0 inset-x-0 z-1100 flex justify-center">
        <div className="w-full max-w-110 h-22.5 bg-black border-t border-[#373737] flex items-center gap-5 px-5.75">
          <button type="button" onClick={save} className="flex-1 h-12.5 rounded-[10px] bg-white text-black text-[22px]">
            تأیید
          </button>
          <button type="button" onClick={() => router.back()} className="flex-1 h-12.5 rounded-[10px] border border-white text-white text-[22px]">
            انصراف
          </button>
        </div>
      </div>
    </AppShell>
  );
}
