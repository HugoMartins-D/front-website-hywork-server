'use client';

import { useState } from 'react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ImageWithFallback({
  src,
  alt,
  fallbackSrc = '/images/posts/placeholder.svg',
  className = '',
  style,
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // اگر تصویر قبل از هیدریت شدن خطا داده باشد، onError دیگر صدا زده نمی‌شود؛
  // پس هنگام اتصال به DOM وضعیت بارگذاری را خودمان بررسی می‌کنیم
  const checkLoaded = (img: HTMLImageElement | null) => {
    if (img && img.complete && img.naturalWidth === 0) handleError();
  };

  return (
    <img
      ref={checkLoaded}
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
}