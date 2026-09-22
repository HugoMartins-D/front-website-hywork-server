'use client';

import { useState, useEffect } from 'react';

interface AvatarWithStatusProps {
  src?: string;
  alt?: string;
  size?: number;
  status?: 'online' | 'offline' | 'busy' | 'away';
  showStatus?: boolean;
}

export default function AvatarWithStatus({
  src,
  alt = 'کاربر',
  size = 77,
  status = 'online',
  showStatus = true,
}: AvatarWithStatusProps) {
  const [imgSrc, setImgSrc] = useState(src || '/images/avatars/default.png');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setImgSrc(src);
      setHasError(false);
    }
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setImgSrc('/images/avatars/default.png');
      setHasError(true);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#4ade80';
      case 'busy':
        return '#f87171';
      case 'away':
        return '#fbbf24';
      default:
        return '#9ca3af';
    }
  };

  const statusSize = Math.max(12, size * 0.2);
  const borderWidth = Math.max(2, size * 0.04);

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full rounded-full object-cover border-2 border-border-color"
        onError={handleError}
        loading="lazy"
        style={{ width: size, height: size }}
      />
      {showStatus && (
        <div
          className="absolute bottom-0 right-0 rounded-full border-2 border-bg-primary"
          style={{
            width: statusSize,
            height: statusSize,
            backgroundColor: getStatusColor(),
            borderColor: 'var(--color-bg-primary)',
            bottom: -statusSize * 0.1,
            right: -statusSize * 0.1,
          }}
        />
      )}
    </div>
  );
}