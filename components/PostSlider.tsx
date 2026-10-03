'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface PostSliderProps {
  images: string[];
  postTitle: string;
}

// اسلایدر تصویر پست در فیگما: بدون فلش، جابه‌جایی با کشیدن انگشت،
// صفحه‌شمار کپسولی مشکی (نقطه‌های ۸ پیکسلی سفید، تصویر فعلی میله‌ی ۲۰ پیکسلی) پایین سمت چپ
export default function PostSlider({ images, postTitle }: PostSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-placeholder text-text-secondary">
        تصویری وجود ندارد
      </div>
    );
  }

  const go = (delta: number) =>
    setCurrentIndex((prev) => (prev + delta + images.length) % images.length);

  return (
    <div
      className="relative w-full h-full bg-placeholder"
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        // در راست‌چین کشیدن به راست یعنی تصویر بعدی
        if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
        touchStartX.current = null;
      }}
    >
      <Image
        src={images[currentIndex]}
        alt={`${postTitle} - تصویر ${currentIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 440px"
        unoptimized
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <div className="absolute bottom-5 left-4 h-5 px-1.75 rounded-[15px] bg-black flex items-center gap-1.25" dir="ltr">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`تصویر ${index + 1}`}
              aria-current={index === currentIndex}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 bg-white transition-all ${index === currentIndex ? 'w-5 rounded-[5px]' : 'w-2 rounded-full'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
