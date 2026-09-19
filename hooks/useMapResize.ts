'use client';

import { useEffect, useRef } from 'react';
import type L from 'leaflet';

export function useMapResize(isVisible: boolean = true) {
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (isVisible && mapRef.current) {
      // تاخیر برای اطمینان از رندر شدن کامل
      const timeoutId = setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 200);

      // همچنین هنگام تغییر اندازه پنجره
      const handleResize = () => {
        mapRef.current?.invalidateSize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  return mapRef;
}