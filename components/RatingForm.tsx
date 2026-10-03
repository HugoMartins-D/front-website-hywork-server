// components/RatingForm.tsx
'use client';

import { useState } from 'react';
import { MicIcon, CameraIcon, SendIcon } from '@/components/icons';

// فرم امتیاز و نظر فیگما (rate & comments / user order status):
// پنج ستاره‌ی ۳۷ پیکسلی با خط ۳، راهنما ۱۴/۴۰۰ خاکستری، کادر نظر ۱۴۹ پیکسلی با گوشه‌ی ۱۰
// و آیکون‌های میکروفون، دوربین و ارسال. tone: light روی سفید، dark روی شیت مشکی

export interface RatingValue {
  stars: number;
  comment: string;
}

export default function RatingForm({
  value,
  onChange,
  onSend,
  tone = 'light',
}: {
  value: RatingValue;
  onChange: (v: RatingValue) => void;
  onSend?: () => void;
  tone?: 'light' | 'dark';
}) {
  const [hover, setHover] = useState(0);
  const fg = tone === 'dark' ? 'text-white' : 'text-text-primary';
  const border = tone === 'dark' ? 'border-white' : 'border-border-strong';
  const shown = hover || value.stars;

  return (
    <div>
      <div className={`flex justify-center gap-4.25 ${fg}`} role="radiogroup" aria-label="امتیاز">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value.stars === n}
            aria-label={`${n} ستاره`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange({ ...value, stars: n })}
          >
            <svg viewBox="0 0 24 24" className="w-9.25 h-8.75" fill={n <= shown ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
              <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9z" />
            </svg>
          </button>
        ))}
      </div>
      <p className="m-0 mt-5.5 text-sm text-[#868686] text-center">امتیاز بدهید و به دیگران در انتخاب سرویس خوب کمک کنید!</p>

      <div className={`mt-10 relative h-37.25 rounded-[10px] border ${border}`}>
        <textarea
          value={value.comment}
          onChange={(e) => onChange({ ...value, comment: e.target.value })}
          placeholder="نوشتن..."
          aria-label="نظر شما"
          className={`w-full h-full p-3 pb-12 bg-transparent resize-none outline-none text-lg ${fg} placeholder:text-[#4e4444]`}
        />
        <div className={`absolute bottom-3 left-4 flex items-center gap-4 ${fg}`}>
          <button type="button" aria-label="ارسال" onClick={onSend} disabled={!value.stars && !value.comment.trim()} className="disabled:opacity-40">
            <SendIcon className="w-4.75 h-4.75" />
          </button>
          <button type="button" aria-label="افزودن عکس">
            <CameraIcon className="w-4.75 h-4.5" />
          </button>
          <button type="button" aria-label="پیام صوتی">
            <MicIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <p className="m-0 mt-2.5 text-sm text-[#868686] text-center">نظر خود را بنویسید تا دیگران هم از تجربه‌ی شما استفاده کنند.</p>
    </div>
  );
}
