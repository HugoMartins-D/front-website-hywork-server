// src/components/MapComponent.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
import { useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ============================================
// بارگذاری داینامیک کامپوننت‌های Leaflet
// ============================================

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// ============================================
// تعریف نوع‌ها
// ============================================

/** موقعیت جغرافیایی */
interface Coordinates {
  lat: number;
  lng: number;
}

/** پست برای نمایش روی نقشه */
interface Post {
  id: number;
  title: string;
  latitude?: number;
  longitude?: number;
}

/** Props کامپوننت نقشه */
interface MapComponentProps {
  /** لیست پست‌ها برای نمایش روی نقشه */
  posts?: Post[];
  /** موقعیت مرکزی نقشه [latitude, longitude] */
  center?: LatLngTuple;
  /** سطح زوم نقشه (پیش‌فرض: 12) */
  zoom?: number;
  /** تابع فراخوانی هنگام کلیک روی نقشه */
  onLocationSelect?: (latlng: Coordinates) => void;
  /** ارتفاع نقشه (پیش‌فرض: 75) */
  height?: string | number;
  /** عرض نقشه (پیش‌فرض: 100%) */
  width?: string | number;
}

// ============================================
// کامپوننت داخلی LocationMarker
// ============================================

/**
 * کامپوننت مدیریت کلیک روی نقشه
 * از useMapEvents برای گوش دادن به رویدادها استفاده می‌کند
 * 
 * توجه: useMapEvents یک Hook است و نباید با dynamic بارگذاری شود
 */
const LocationMarker = ({ 
  onLocationSelect 
}: { 
  onLocationSelect?: (latlng: Coordinates) => void 
}) => {
  // استفاده مستقیم از useMapEvents (Hook)
  useMapEvents({
    click(e) {
      if (!onLocationSelect) return;

      const { lat, lng } = e.latlng;
      
      console.log('📍 کلیک روی نقشه:', { 
        lat, 
        lng,
        timestamp: new Date().toISOString(),
      });
      
      onLocationSelect({ lat, lng });
    },
  });

  return null;
};

// ============================================
// کامپوننت اصلی MapComponent
// ============================================

/**
 * کامپوننت نقشه با استفاده از Leaflet
 * 
 * ویژگی‌ها:
 * - نمایش پست‌ها روی نقشه با مارکر
 * - قابلیت کلیک و انتخاب موقعیت
 * - پشتیبانی از center و zoom دلخواه
 * - کاملاً واکنش‌گرا و بهینه برای SSR
 * - مدیریت resize خودکار
 */
export default function MapComponent({ 
  posts = [], 
  center, 
  zoom = 12,
  onLocationSelect,
  height = '75',
  width = '100%',
}: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Coordinates | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  // موقعیت پیش‌فرض (تهران)
  const defaultCenter: LatLngTuple = [35.6892, 51.3890];
  const finalCenter = center ?? defaultCenter;

  // ============================================
  // افکت‌ها
  // ============================================

  /**
   * مدیریت نصب کامپوننت و اصلاح آیکون‌های Leaflet
   * استفاده از setTimeout برای جلوگیری از cascading render
   */
  useEffect(() => {
    console.log('🗺️ بارگذاری نقشه...');

    // تاخیر برای نصب کامپوننت
    const mountTimer = setTimeout(() => {
      setIsMounted(true);
      console.log('✅ نقشه نصب شد');
    }, 0);

    // اصلاح آیکون‌های Leaflet
    if (typeof window !== 'undefined') {
      import('leaflet').then((L) => {
        // حذف خطا با استفاده از type assertion
        const iconDefault = L.Icon.Default.prototype as { _getIconUrl?: string };
        delete iconDefault._getIconUrl;
        
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
        
        console.log('✅ آیکون‌های Leaflet تنظیم شدند');
      }).catch((err) => {
        console.error('❌ خطا در بارگذاری Leaflet:', err);
      });
    }

    return () => {
      clearTimeout(mountTimer);
      console.log('🧹 نقشه unmount شد');
    };
  }, []);

  /**
   * مدیریت resize نقشه
   */
  useEffect(() => {
    if (isMounted && mapRef.current) {
      // تاخیر برای اطمینان از رندر کامل
      const resizeTimer = setTimeout(() => {
        mapRef.current?.invalidateSize();
        console.log('🔄 اندازه نقشه به‌روزرسانی شد');
      }, 300);

      return () => {
        clearTimeout(resizeTimer);
      };
    }
  }, [isMounted]);

  // ============================================
  // توابع
  // ============================================

  /**
   * مدیریت انتخاب موقعیت
   */
  const handleLocationSelect = useCallback((latlng: Coordinates) => {
    console.log('📍 انتخاب موقعیت:', {
      lat: latlng.lat,
      lng: latlng.lng,
      timestamp: new Date().toISOString(),
    });
    
    setSelectedPosition(latlng);
    
    if (onLocationSelect) {
      onLocationSelect(latlng);
    }
  }, [onLocationSelect]);

  // ============================================
  // رندر
  // ============================================

  // نمایش لودر تا زمانی که کامپوننت نصب شود
  if (!isMounted) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-(--color-bg-surface) rounded-lg"
        style={{ 
          height: typeof height === 'number' ? `${height}px` : height,
        }}
      >
        <span className="text-text-muted">
  Carregando mapa...
</span>
      </div>
    );
  }

  // تبدیل height به مقدار مناسب
  const heightValue = typeof height === 'number' ? `${height}px` : height;
  const widthValue = typeof width === 'number' ? `${width}px` : width;

  console.log('🗺️ رندر نقشه:', {
    center: finalCenter,
    zoom,
    postsCount: posts.length,
    hasSelectedPosition: !!selectedPosition,
    timestamp: new Date().toISOString(),
  });

  return (
    <div 
      className="w-full rounded-lg overflow-hidden"
      style={{ 
        height: heightValue,
        width: widthValue,
      }}
    >
      <MapContainer
        center={finalCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        whenReady={() => {
          console.log('✅ نقشه آماده شد');
          // اطمینان از resize بعد از بارگذاری کامل
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.invalidateSize();
              console.log('🔄 resize نقشه انجام شد');
            }
          }, 200);
        }}
      >
        {/* لایه پایه */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* مارکرهای پست‌ها */}
        {posts.map((post) => (
          post.latitude && post.longitude && (
            <Marker
              key={post.id}
              position={[post.latitude, post.longitude]}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{post.title}</strong>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* مارکر موقعیت انتخاب شده */}
        {selectedPosition && (
          <Marker
            position={[selectedPosition.lat, selectedPosition.lng]}
          >
            <Popup>
              <div className="text-sm">
                <strong>Localização selecionada</strong>
                <br />
                <span>Latitude: {selectedPosition.lat.toFixed(6)}</span>
                <br />
                <span>Longitude: {selectedPosition.lng.toFixed(6)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* کامپوننت مدیریت کلیک */}
        <LocationMarker onLocationSelect={handleLocationSelect} />
      </MapContainer>
    </div>
  );
}