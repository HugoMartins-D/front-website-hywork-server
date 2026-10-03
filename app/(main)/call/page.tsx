'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MicIcon, VideoIcon, PhoneIcon, CameraIcon, MoreIcon } from '@/components/icons';
import { toPersianNumber } from '@/utils/numberUtils';

// صفحه‌ی تماس صوتی/تصویری فیگما (Voice Call / Video Call): زمینه‌ی مشکی، حلقه‌های هم‌مرکز #121212،
// آواتار ۱۵۴ پیکسلی، نام ۲۵/۶۰۰، زمان ۲۰/۴۰۰، دکمه‌های گرد ۵۰ پیکسلی نیمه‌شفاف و دکمه‌ی قرمز ۷۰ پیکسلی قطع تماس

function CallScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const isVideo = params.get('type') === 'video';
  const name = params.get('name') || 'مخاطب';
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(isVideo);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  const round = 'w-12.5 h-12.5 rounded-full bg-black/36 flex items-center justify-center text-white';

  return (
    <main className="fixed inset-0 z-1200 bg-black text-white overflow-hidden flex justify-center">
      <div className="relative w-full max-w-110 h-full">
        <h1 className="absolute top-21 inset-x-0 m-0 text-center text-xl font-normal">{isVideo ? 'تماس تصویری' : 'تماس صوتی'}</h1>

        {/* حلقه‌های هم‌مرکز پشت آواتار */}
        <div className="absolute left-1/2 top-1/2 w-0 h-0" aria-hidden>
          {[500, 400, 300, 200].map((d, i) => (
            <span
              key={d}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border-solid border-[#121212]"
              style={{ width: d, height: d, borderWidth: [1, 3, 5, 8][i] }}
            />
          ))}
          <span className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 w-38.5 h-38.5 rounded-full bg-placeholder" />
        </div>

        <div className="absolute inset-x-0 top-[61%] text-center">
          <div className="text-[25px] font-semibold">{name}</div>
          <div className="mt-3 text-xl">
            {toPersianNumber(mm)}:{toPersianNumber(ss)}
          </div>
        </div>

        <div className="absolute inset-x-0 top-[71%] flex items-center justify-center gap-5">
          <button type="button" className={round} aria-label="بیشتر">
            <MoreIcon className="w-5 h-5 rotate-90" />
          </button>
          <button type="button" className={round} aria-pressed={muted} aria-label="بی‌صدا" onClick={() => setMuted((m) => !m)}>
            <MicIcon className={`w-5 h-5 ${muted ? 'opacity-40' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="قطع تماس"
            className="w-17.5 h-17.5 rounded-full bg-[#fe4848] flex items-center justify-center"
          >
            <PhoneIcon className="w-8 h-8 rotate-[135deg]" />
          </button>
          <button type="button" className={round} aria-pressed={cameraOn} aria-label="دوربین" onClick={() => setCameraOn((c) => !c)}>
            <VideoIcon className={`w-5 h-5 ${cameraOn ? '' : 'opacity-40'}`} />
          </button>
          <button type="button" className={round} aria-label="چرخش دوربین">
            <CameraIcon className="w-5 h-5" />
          </button>
        </div>

        <button type="button" className="absolute bottom-8 right-11 flex flex-col items-center gap-1.5 text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-white" aria-hidden />
          ضبط
        </button>
      </div>
    </main>
  );
}

export default function CallPage() {
  return (
    <Suspense fallback={null}>
      <CallScreen />
    </Suspense>
  );
}
