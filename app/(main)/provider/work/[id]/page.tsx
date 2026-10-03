'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/PageHeader';
import { fetchPostById } from '@/services/postService';
import { formatPrice, toPersianNumber } from '@/utils/numberUtils';

// صفحه‌ی «شروع کار» متخصص در فیگما (specialist): زمینه‌ی مشکی، سه دایره‌ی نیمه‌شفاف هم‌مرکز،
// دکمه‌ی گرد ۹۶ پیکسلی شروع/توقف، زمان ۴۵/۴۰۰، راهنما ۱۴/۵۰۰ و «قیمت هر ساعت» با مبلغ ۴۰/۴۰۰
export default function WorkTimerPage() {
  const params = useParams();
  const post = useMemo(() => (params.id ? fetchPostById(params.id as string) : null), [params.id]);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  const pad = (n: number) => toPersianNumber(String(n).padStart(2, '0'));
  const time = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;

  return (
    <main className="min-h-screen bg-black text-white flex justify-center">
      <div className="relative w-full max-w-110 min-h-screen">
        <PageHeader inverted onMore={() => {}} />

        <div className="relative mx-auto mt-29 w-61.25 h-61.25 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-[#eaeaea]/17" aria-hidden />
          <span className="absolute inset-5.5 rounded-full bg-[#dedede]/12" aria-hidden />
          <span className="absolute inset-12.25 rounded-full bg-[#d7d7d7]/15" aria-hidden />
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            aria-pressed={running}
            aria-label={running ? 'توقف کار' : 'شروع کار'}
            className="relative w-24 h-24 rounded-full bg-black flex items-center justify-center"
          >
            {running ? (
              <span className="w-4 h-4.75 bg-white" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden>
                <path d="M7 4v16l13-8z" />
              </svg>
            )}
          </button>
        </div>

        <div className="mt-11.75 text-center text-[45px] leading-13.5" dir="ltr">{time}</div>
        <p className="m-0 text-center text-sm font-medium">با زدن دکمه، زمان کار شروع می‌شود.</p>

        <div className="absolute bottom-20 inset-x-4 flex items-end justify-between">
          <div>
            <div className="text-xl">قیمت هر ساعت</div>
            <div className="mt-4 text-[40px] leading-12">{formatPrice(post?.price ?? 37500)}</div>
          </div>
          <svg viewBox="0 0 24 24" className="w-3 h-3 mb-4" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
            <path d="m15 5-7 7 7 7" />
          </svg>
        </div>
      </div>
    </main>
  );
}
