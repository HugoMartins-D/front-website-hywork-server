// src/app/(main)/full-map/page.tsx
'use client';

import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import type {
  Map as LeafletMap,
  Marker as LeafletMarker
} from 'leaflet';
import { formatPrice } from '@/utils/numberUtils';

// ============================================================
// 1️⃣ تعریف نوع Leaflet برای بارگذاری داینامیک
// ============================================================

/** نوع ماژول Leaflet برای بارگذاری داینامیک */
type LeafletType = typeof import('leaflet');

/** ماژول Leaflet - در زمان اجرا مقداردهی می‌شود */
let LeafletModule: LeafletType | null = null;

// ============================================================
// 2️⃣ هوک تشخیص Media Query - React 19 استاندارد
// ============================================================

/**
 * هوک تشخیص Media Query با استفاده از useSyncExternalStore
 * این روش استاندارد React 19 برای اشتراک‌گذاری state با سیستم‌های خارجی است
 */
const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') {
        return () => {};
      }
      const media = window.matchMedia(query);
      media.addEventListener('change', callback);
      return () => media.removeEventListener('change', callback);
    },
    [query]
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

// ============================================================
// 3️⃣ تعریف نوع‌ها
// ============================================================

/** نوع داده پست */
interface Post {
  id: number;
  userId: number;
  title: string;
  price: number;
  caption: string;
  category: string;
  rating: number;
  likesCount: number;
  commentsCount: number;
  image: string;
  location: { lat: number; lng: number };
}

/** نوع داده کاربر */
interface User {
  id: number;
  name: string;
  username: string;
  avatar: string;
}

/** نوع خطای موقعیت */
interface LocationErrorEvent {
  code: number;
  message: string;
}

/** نوع موقعیت پیدا شده */
interface LocationFoundEvent {
  latlng: { lat: number; lng: number };
}

// ============================================================
// 4️⃣ بارگذاری داینامیک Leaflet
// ============================================================

/**
 * بارگذاری داینامیک Leaflet و تنظیم آیکون‌ها
 * این کار برای جلوگیری از خطاهای SSR انجام می‌شود
 * 
 * توجه: در نسخه‌های جدید Leaflet، نیازی به حذف _getIconUrl نیست
 * و فقط با mergeOptions آیکون‌ها تنظیم می‌شوند
 */
const loadLeaflet = async (): Promise<boolean> => {
  console.log('🗺️ شروع بارگذاری Leaflet');
  
  if (typeof window !== 'undefined') {
    try {
      const leaflet = await import('leaflet');
      await import('leaflet/dist/leaflet.css');
      LeafletModule = leaflet.default || leaflet;
      
      // تنظیم آیکون‌های پیش‌فرض Leaflet
      // در نسخه‌های جدید Leaflet، نیازی به حذف _getIconUrl نیست
      LeafletModule.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });
      
      console.log('✅ Leaflet بارگذاری شد');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ خطا در بارگذاری Leaflet:', errorMessage);
      return false;
    }
  }
  return false;
};

// ============================================================
// 5️⃣ کامپوننت‌های داینامیک Leaflet
// ============================================================

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex items-center justify-center h-full text-text-secondary">
        در حال بارگذاری نقشه...
      </div>
    ) 
  }
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

// ============================================================
// 6️⃣ ایمپورت‌های Swiper
// ============================================================

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

// ============================================================
// 7️⃣ ثابت‌های برنامه
// ============================================================

/** سرورهای Tile نقشه */
const TILE_SERVERS = [
  {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'OSM France'
  },
  {
    url: 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'OSM Germany'
  },
  {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    name: 'CartoDB'
  }
];

/** مختصات پیش‌فرض (تهران) */
const DEFAULT_CENTER: [number, number] = [35.6892, 51.3890];

/** زوم پیش‌فرض */
const DEFAULT_ZOOM = 12;

/** داده‌های نمونه پست‌ها */
const SAMPLE_POSTS: Post[] = [
  { 
    id: 1, 
    userId: 1, 
    title: 'هدفون بی‌سیم سونی', 
    price: 3250000, 
    caption: 'هدفون بی‌سیم با کیفیت صدای فوق‌العاده', 
    category: 'الکترونیک', 
    rating: 4.8, 
    likesCount: 45, 
    commentsCount: 12, 
    image: '/images/posts/1.jpg', 
    location: { lat: 35.6997, lng: 51.3380 } 
  },
  { 
    id: 2, 
    userId: 1, 
    title: 'بلیت دورهمی آنلاین برنامه‌نویسان', 
    price: 89000, 
    caption: 'دورهمی اختصاصی برنامه‌نویس‌های ری اکت', 
    category: 'رویداد', 
    rating: 4.5, 
    likesCount: 89, 
    commentsCount: 23, 
    image: '/images/posts/2.jpg', 
    location: { lat: 35.7219, lng: 51.3347 } 
  },
  { 
    id: 3, 
    userId: 2, 
    title: 'قالب حرفه‌ای UI/UX', 
    price: 350000, 
    caption: 'مجموعه کامل قالب‌های رابط کاربری', 
    category: 'طراحی', 
    rating: 4.9, 
    likesCount: 112, 
    commentsCount: 31, 
    image: '/images/posts/3.jpg', 
    location: { lat: 35.7463, lng: 51.4163 } 
  },
  { 
    id: 4, 
    userId: 2, 
    title: 'تابلو الهامات طبیعت', 
    price: 0, 
    caption: 'تابلو دیجیتال با کیفیت چاپ بالا', 
    category: 'هنر', 
    rating: 4.2, 
    likesCount: 67, 
    commentsCount: 14, 
    image: '/images/posts/4.jpg', 
    location: { lat: 35.6892, lng: 51.3890 } 
  },
  { 
    id: 5, 
    userId: 3, 
    title: 'دوره فول‌استک جاوااسکریپت', 
    price: 1280000, 
    caption: 'از صفر تا صد توسعه وب با React', 
    category: 'آموزش', 
    rating: 5.0, 
    likesCount: 203, 
    commentsCount: 58, 
    image: '/images/posts/5.jpg', 
    location: { lat: 35.7000, lng: 51.3500 } 
  },
  { 
    id: 6, 
    userId: 3, 
    title: 'چالش کدنویسی روزانه', 
    price: 0, 
    caption: 'دریافت مسئله‌های برنامه‌نویسی روزانه', 
    category: 'آموزش', 
    rating: 4.7, 
    likesCount: 78, 
    commentsCount: 19, 
    image: '/images/posts/6.jpg', 
    location: { lat: 35.6800, lng: 51.4200 } 
  },
  { 
    id: 7, 
    userId: 4, 
    title: 'مجموعه آثار ترکیب رنگ‌های گرم', 
    price: 450000, 
    caption: 'پکیج ۱۰ اثر هنری دیجیتال', 
    category: 'هنر', 
    rating: 4.9, 
    likesCount: 156, 
    commentsCount: 42, 
    image: '/images/posts/7.jpg', 
    location: { lat: 35.7100, lng: 51.3600 } 
  },
  { 
    id: 8, 
    userId: 4, 
    title: 'نقاشی دیجیتال آرامش', 
    price: 290000, 
    caption: 'اثر هنری با موضوع آرامش و مدیتیشن', 
    category: 'هنر', 
    rating: 4.4, 
    likesCount: 94, 
    commentsCount: 27, 
    image: '/images/posts/8.jpg', 
    location: { lat: 35.7300, lng: 51.4000 } 
  }
];

/** داده‌های نمونه کاربران */
const SAMPLE_USERS: User[] = [
  { id: 1, name: 'آریا حسینی', username: 'aria_react', avatar: '/images/avatars/1.jpg' },
  { id: 2, name: 'سارا حسینی', username: 'sara_h', avatar: '/images/avatars/2.jpg' },
  { id: 3, name: 'محمد رضایی', username: 'mohammad_r', avatar: '/images/avatars/3.jpg' },
  { id: 4, name: 'علی محمدی', username: 'ali_m', avatar: '/images/avatars/4.jpg' }
];

// ============================================================
// 8️⃣ توابع کمکی
// ============================================================

/**
 * دریافت کاربر بر اساس ID
 */
const getUserById = (userId: number): User => {
  return SAMPLE_USERS.find(user => user.id === userId) || SAMPLE_USERS[0];
};

// ============================================================
// 9️⃣ آیکون‌ها
// ============================================================

const SearchIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="10.5" cy="10.5" r="7.5" />
    <line x1="16" y1="16" x2="22" y2="22" />
  </svg>
);

const ArrowBackIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

const MapLayersIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6v15l6-3 6 3 6-3V3l-6 3-6-3-6 3z" />
    <path d="M9 3v15M15 6v15" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
    <line x1="12" y1="2" x2="12" y2="4" />
    <line x1="12" y1="20" x2="12" y2="22" />
    <line x1="2" y1="12" x2="4" y2="12" />
    <line x1="20" y1="12" x2="22" y2="12" />
  </svg>
);

// ============================================================
// 🔟 کامپوننت‌های زیرمجموعه
// ============================================================

/**
 * کارت محصول افقی
 */
const HorizontalProductCard: React.FC<{ 
  post: Post; 
  user: User; 
  onClick: (post: Post) => void 
}> = ({ post, user, onClick }) => {
  console.log('🔄 رندر کارت محصول:', { id: post.id, title: post.title });

  return (
    <div
      onClick={() => {
        console.log('🖱️ کلیک روی کارت محصول:', { id: post.id, title: post.title });
        onClick(post);
      }}
      className={`
        flex items-stretch gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200
        bg-black text-white hover:bg-neutral-900 shadow-[0_4px_14px_rgba(0,0,0,0.25)]
        min-h-28 w-full rtl
      `}
      role="button"
      tabIndex={0}
      aria-label={`مشاهده ${post.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onClick(post);
        }
      }}
    >
      {/* تصویر */}
      <div className="w-22 h-22 self-center relative shrink-0 rounded-xl overflow-hidden bg-white p-1">
        <div className="relative w-full h-full rounded-lg overflow-hidden">
          <Image
            src={post.image || '/images/posts/placeholder.svg'}
            alt={post.title}
            fill
            className="object-cover"
            sizes="88px"
          />
        </div>
        <span className="absolute top-1 left-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-[8px] font-bold leading-4 text-center text-white">
          {post.likesCount}
        </span>
      </div>

      {/* اطلاعات */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="text-xs font-bold leading-snug line-clamp-2 m-0">
              {post.title}
            </h4>
            <p className="text-[9px] text-white/70 line-clamp-2 leading-relaxed m-0 mt-0.5">
              {post.caption}
            </p>
          </div>
          <span className="shrink-0 flex items-center gap-0.5 text-[9px] text-white/80">
            ★ {post.rating}
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 mt-2">
          <span className="shrink-0 px-3 py-0.5 rounded-full bg-red-600 text-[9px] font-semibold">
            خرید
          </span>
          <div className="flex flex-col items-end gap-1 min-w-0">
            <span className="max-w-full truncate px-2 py-0.5 rounded-full bg-white/15 text-[8px] text-white/80">
              {post.category || user?.name || 'ناشناس'}
            </span>
            <span className={`text-base font-bold leading-none ${post.price === 0 ? 'text-emerald-400' : 'text-white'}`}>
              {post.price === 0 ? 'رایگان' : formatPrice(post.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * اسلایدر افقی برای موبایل
 */
const HorizontalSlider: React.FC<{ 
  products: Post[]; 
  onProductClick: (post: Post) => void 
}> = ({ products, onProductClick }) => {
  if (products.length === 0) {
    console.log('📦 هیچ محصولی برای نمایش در اسلایدر وجود ندارد');
    return null;
  }

  console.log('🔄 رندر اسلایدر:', { productsCount: products.length });

  return (
    <div className="w-full relative rtl">
      <Swiper
        modules={[Pagination]}
        spaceBetween={16}
        slidesPerView={1.25}
        centeredSlides={true}
        pagination={{ clickable: true, dynamicBullets: true }}
        dir="rtl"
        className="pb-10"
        breakpoints={{
          320: { slidesPerView: 1.2, spaceBetween: 12 },
          480: { slidesPerView: 1.35, spaceBetween: 16 },
          640: { slidesPerView: 1.5, spaceBetween: 20 },
        }}
      >
        {products.map((post) => (
          <SwiperSlide key={post.id} className="flex justify-center">
            <HorizontalProductCard
              post={post}
              user={getUserById(post.userId)}
              onClick={onProductClick}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #1a1a1a !important;
          opacity: 0.4;
          transition: all 0.2s;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
          background: #000000 !important;
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

/**
 * سایدبار دسکتاپ
 */
const DesktopSidebar: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  products: Post[];
  onProductClick: (post: Post) => void;
  onBack: () => void;
}> = ({ searchTerm, onSearchChange, products, onProductClick, onBack }) => {
  // فیگما: بدون پنل؛ جستجوی کپسولی مشکی و دکمه‌ی گرد بازگشت بالا، کارت‌های مشکی شناور زیر آن
  return (
    <div className="absolute top-4 right-4 bottom-4 w-77.5 flex flex-col z-1000 rtl">
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onBack}
          className="w-10.75 h-10.75 rounded-full bg-black text-white flex items-center justify-center shrink-0"
          aria-label="بازگشت"
        >
          <ArrowBackIcon />
        </button>
        <div className="flex-1 flex items-center gap-2 h-10.75 px-4 rounded-[30px] bg-black text-white">
          <input
            type="text"
            placeholder="جستجو"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-0 border-none bg-transparent text-[15px] outline-none text-white placeholder:text-[#373737] font-sans"
            aria-label="جستجوی محصولات"
          />
          <SearchIcon />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        {products.map((post) => (
          <HorizontalProductCard
            key={post.id}
            post={post}
            user={getUserById(post.userId)}
            onClick={onProductClick}
          />
        ))}
        {products.length === 0 && (
          <div className="text-center py-10 px-5 rounded-2xl bg-black text-white/70 text-sm font-sans">
            هیچ محصولی یافت نشد.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * هدر موبایل
 */
const MobileHeader: React.FC<{
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
}> = ({ searchTerm, onSearchChange, onBack }) => {
  // فیگما (map): فلش بازگشت و جستجوی کپسولی مشکی، روی خود نقشه و بدون نوار
  return (
    <div className="absolute top-0 left-0 right-0 px-4 pt-3 flex items-center gap-2 z-1000 rtl">
      <button
        onClick={onBack}
        className="w-10 h-10 flex items-center justify-center text-black shrink-0"
        aria-label="بازگشت"
      >
        <ArrowBackIcon />
      </button>
      <div className="flex-1 flex items-center gap-2.5 h-10.75 px-4 rounded-[30px] bg-black text-white">
        <input
          type="text"
          placeholder="جستجو"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border-none bg-transparent text-[15px] outline-none text-white placeholder:text-[#373737] font-sans"
          aria-label="جستجوی محصولات"
        />
        <SearchIcon />
      </div>
    </div>
  );
};

/**
 * دکمه موقعیت دسکتاپ
 */
const DesktopLocationButton: React.FC<{ 
  onLocate: () => void; 
  isLocating: boolean;
  onBack: () => void;
}> = ({ onLocate, isLocating }) => {
  // فیگما: دو دکمه‌ی گرد مشکی ۴۳ پیکسلی روی هم
  return (
    <div className="absolute bottom-9 left-5 z-1000 flex flex-col items-center gap-3">
      <button
        className="w-10.75 h-10.75 rounded-full flex items-center justify-center bg-black text-white"
        aria-label="لایه‌های نقشه"
      >
        <MapLayersIcon />
      </button>
      <button
        onClick={onLocate}
        disabled={isLocating}
        className="w-10.75 h-10.75 rounded-full flex items-center justify-center bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="پیدا کردن موقعیت من"
      >
        {isLocating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <TargetIcon />}
      </button>
    </div>
  );
};

/**
 * دکمه موقعیت موبایل
 */
const MobileLocationButton: React.FC<{
  onLocate: () => void;
  isLocating: boolean;
  showTooltip: boolean;
  onShowTooltipChange: (show: boolean) => void;
}> = ({ onLocate, isLocating, showTooltip, onShowTooltipChange }) => {
  return (
    <div className="relative flex flex-col items-center gap-3">
      <button
        className="w-10.75 h-10.75 rounded-full flex items-center justify-center bg-black text-white"
        aria-label="لایه‌های نقشه"
      >
        <MapLayersIcon />
      </button>
      <button
        onClick={onLocate}
        disabled={isLocating}
        onMouseEnter={() => onShowTooltipChange(true)}
        onMouseLeave={() => onShowTooltipChange(false)}
        className="w-10.75 h-10.75 rounded-full flex items-center justify-center bg-black text-white disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="پیدا کردن موقعیت من"
      >
        {isLocating ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <TargetIcon />
        )}
      </button>
      {showTooltip && (
        <div className="absolute bottom-full mb-2 right-1/2 translate-x-1/2 bg-black text-white px-3 py-1.5 rounded-[14px] text-xs whitespace-nowrap z-1001 pointer-events-none animate-fade-in">
          موقعیت من
        </div>
      )}
    </div>
  );
};

// ============================================================
// 1️⃣1️⃣ کامپوننت اصلی
// ============================================================

/**
 * صفحه نقشه کامل
 * 
 * روند کار:
 * 1. نمایش نقشه با تمام محصولات
 * 2. نمایش مارکرها با قیمت روی نقشه
 * 3. جستجوی محصولات
 * 4. نمایش لیست محصولات در سایدبار (دسکتاپ) یا اسلایدر (موبایل)
 * 5. قابلیت یافتن موقعیت کاربر
 * 6. کلیک روی محصول برای مشاهده جزئیات
 */
// useSearchParams نیاز به Suspense دارد تا صفحه در build پیش‌رندر شود
export default function FullMapPage() {
  return (
    <Suspense fallback={null}>
      <FullMapPageContent />
    </Suspense>
  );
}

function FullMapPageContent() {
  // ============================================================
  // 11.1 هوک‌های ری‌اکت
  // ============================================================
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 767px)');

  // ============================================================
  // 11.2 وضعیت‌های کامپوننت
  // ============================================================
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);
  const [mapInstance, setMapInstance] = useState<LeafletMap | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [locationMarker, setLocationMarker] = useState<LeafletMarker | null>(null);

  // ============================================================
  // 11.3 بارگذاری Leaflet
  // ============================================================
  useEffect(() => {
    const initLeaflet = async () => {
      console.log('🗺️ شروع بارگذاری Leaflet برای صفحه نقشه');
      const success = await loadLeaflet();
      setLeafletLoaded(success);
      if (success) {
        console.log('✅ Leaflet بارگذاری شد');
      } else {
        console.error('❌ خطا در بارگذاری Leaflet');
      }
    };
    initLeaflet();
  }, []);

  // ============================================================
  // 11.4 فیلتر پست‌ها - با useMemo بدون state اضافی
  // ============================================================
  const postsWithLocation = useMemo(() => SAMPLE_POSTS, []);

  // filteredPosts مستقیماً با useMemo محاسبه می‌شود (بدون state و useEffect)
  const filteredPosts = useMemo(() => {
    console.log('🔍 فیلتر پست‌ها:', { searchTerm });
    
    if (searchTerm.trim() === '') {
      return postsWithLocation;
    }
    const searchLower = searchTerm.toLowerCase();
    return postsWithLocation.filter(
      (post) =>
        post.title.toLowerCase().includes(searchLower) ||
        (post.caption && post.caption.toLowerCase().includes(searchLower)) ||
        post.category.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, postsWithLocation]);

  // ============================================================
  // 11.5 توابع موقعیت
  // ============================================================

  /**
   * ایجاد آیکون موقعیت کاربر
   */
  const createUserLocationIcon = useCallback(async () => {
    console.log('📍 ایجاد آیکون موقعیت کاربر');
    if (!LeafletModule) {
      console.warn('⚠️ Leaflet برای ایجاد آیکون آماده نیست');
      return null;
    }
    return LeafletModule.divIcon({
      className: 'user-location-marker',
      html: `
        <div class="relative w-6 h-6">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black border-[3px] border-white rounded-full outline-2 outline-black z-2"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/20 rounded-full animate-pulse-ring"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });
  }, []);

  /**
   * حذف مارکر موقعیت
   */
  const removeLocationMarker = useCallback(() => {
    if (locationMarker && mapInstance) {
      console.log('🗑️ حذف مارکر موقعیت');
      mapInstance.removeLayer(locationMarker);
      setLocationMarker(null);
    }
  }, [locationMarker, mapInstance]);

  /**
   * افزودن مارکر موقعیت
   */
  const addLocationMarker = useCallback(
    async (latlng: { lat: number; lng: number }) => {
      if (!mapInstance || !LeafletModule) {
        console.warn('⚠️ نقشه یا Leaflet برای افزودن مارکر آماده نیست');
        return;
      }
      
      console.log('📍 افزودن مارکر موقعیت:', latlng);
      removeLocationMarker();
      const customIcon = await createUserLocationIcon();
      if (!customIcon) {
        console.warn('⚠️ ایجاد آیکون موقعیت با شکست مواجه شد');
        return;
      }
      const marker = LeafletModule.marker([latlng.lat, latlng.lng], { icon: customIcon })
        .bindPopup('📍 موقعیت شما')
        .openPopup();
      marker.addTo(mapInstance);
      setLocationMarker(marker);
    },
    [mapInstance, removeLocationMarker, createUserLocationIcon]
  );

  /**
   * پیدا کردن موقعیت کاربر
   */
  const handleLocate = useCallback(() => {
    console.log('📍 شروع پیدا کردن موقعیت');
    
    if (!mapInstance) {
      console.warn('⚠️ نقشه برای پیدا کردن موقعیت آماده نیست');
      return;
    }
    
    setIsLocating(true);
    removeLocationMarker();

    mapInstance
      .locate({ 
        setView: true, 
        maxZoom: 16, 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      })
      .on('locationfound', (e: LocationFoundEvent) => {
        console.log('✅ موقعیت پیدا شد:', e.latlng);
        setIsLocating(false);
        addLocationMarker(e.latlng);
        mapInstance.flyTo([e.latlng.lat, e.latlng.lng], 16);
      })
      .on('locationerror', (e: LocationErrorEvent) => {
        console.error('❌ خطا در پیدا کردن موقعیت:', e);
        setIsLocating(false);
        
        let errorMessage = 'امکان یافتن موقعیت شما وجود ندارد. ';
        errorMessage += e.code === 1
          ? 'لطفاً دسترسی به موقعیت مکانی را در مرورگر خود فعال کنید.'
          : 'لطفاً تنظیمات موقعیت مکانی را بررسی کنید.';
        alert(errorMessage);
      });
  }, [mapInstance, removeLocationMarker, addLocationMarker]);

  /**
   * پاک‌سازی مارکر موقعیت هنگام unmount
   */
  useEffect(() => {
    return () => {
      if (locationMarker && mapInstance) {
        console.log('🧹 پاک‌سازی مارکر موقعیت');
        mapInstance.removeLayer(locationMarker);
      }
    };
  }, [locationMarker, mapInstance]);

  // ============================================================
  // 11.6 هندلرها
  // ============================================================

  /**
   * کلیک روی محصول
   */
  const handleProductClick = useCallback((post: Post) => {
    console.log('🖱️ کلیک روی محصول:', { id: post.id, title: post.title });
    setMapCenter([post.location.lat, post.location.lng]);
    setMapZoom(15);
    router.push(`/product/${post.id}`);
  }, [router]);

  /**
   * کلیک روی مارکر
   */
  const handleMarkerClick = useCallback((post: Post) => {
    console.log('📍 کلیک روی مارکر:', { id: post.id, title: post.title });
    router.push(`/product/${post.id}`);
  }, [router]);

  /**
   * بازگشت به صفحه قبل
   */
  const handleBack = useCallback(() => {
    console.log('🔙 بازگشت به صفحه قبل');
    router.back();
  }, [router]);

  /**
   * تغییر عبارت جستجو
   */
  const handleSearchChange = useCallback((value: string) => {
    console.log('🔍 تغییر جستجو:', value);
    setSearchTerm(value);
  }, []);

  // ============================================================
  // 11.7 ایجاد آیکون محصول
  // ============================================================

  const createProductIcon = useCallback(
    (post: Post) => {
      if (!LeafletModule) {
        console.warn('⚠️ Leaflet برای ایجاد آیکون آماده نیست');
        return null;
      }

      const user = getUserById(post.userId);

      // فیگما: آواتار فروشنده با حلقه‌ی مشکی، یا نقطه‌ی مشکی با حلقه‌ی سفید
      if (user?.avatar) {
        return LeafletModule.divIcon({
          className: 'custom-marker',
          html: `
            <div class="map-avatar-marker">
              <img src="${user.avatar}" alt="" />
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
          popupAnchor: [0, -18],
        });
      }

      return LeafletModule.divIcon({
        className: 'custom-marker',
        html: `<div class="map-dot-marker"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10],
      });
    },
    [] // حذف وابستگی LeafletModule
  );

  // ============================================================
  // 11.8 لاگ‌های رندر
  // ============================================================

  console.log('🖥️ رندر صفحه نقشه کامل:', {
    isMobile,
    leafletLoaded,
    filteredPostsCount: filteredPosts.length,
    searchTerm,
    mapCenter,
    mapZoom,
    timestamp: new Date().toISOString(),
  });

  // ============================================================
  // 11.9 نمایش لودینگ
  // ============================================================

  if (!leafletLoaded) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-bg-primary">
        <div className="text-text-secondary">در حال بارگذاری نقشه...</div>
      </div>
    );
  }

  // ============================================================
  // 11.10 رندر اصلی
  // ============================================================

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* کانتینر نقشه */}
      <div className="w-full h-full">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
            className="w-full h-full z-1 map-monochrome"
          zoomControl={false}
          ref={setMapInstance}
        >
          {/* لایه نقشه */}
          <TileLayer
            url={TILE_SERVERS[0].url}
            attribution={TILE_SERVERS[0].attribution}
          />
          
          {/* مارکرهای محصولات */}
          {filteredPosts.map((post) => {
            const icon = createProductIcon(post);
            if (!icon) return null;
            
            return (
              <Marker
                key={post.id}
                position={[post.location.lat, post.location.lng]}
                icon={icon}
                eventHandlers={{ click: () => handleMarkerClick(post) }}
              >
                <Popup>
                  <div className="text-center min-w-55 rtl font-sans">
                    <div className="w-25 h-25 relative mx-auto mb-3 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={post.image || '/images/posts/placeholder.svg'}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h4 className="my-2 text-base text-text-primary">{post.title}</h4>
                    <p className="text-text-secondary text-xs my-1">{post.caption}</p>
                    <div className="my-2">
                      <span className="bg-bg-surface px-2 py-1 rounded-xl text-[11px] text-text-secondary">
                        {post.category}
                      </span>
                    </div>
                    <p className={`font-bold my-2 text-lg ${post.price === 0 ? 'text-emerald-500' : 'text-accent-color'}`}>
                      {post.price === 0 ? 'رایگان' : formatPrice(post.price)}
                    </p>
                    <div className="flex justify-between items-center my-2 text-xs text-text-secondary">
                      <span>⭐ {post.rating}</span>
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                    <button
                      onClick={() => handleMarkerClick(post)}
                      className="w-full bg-accent-color text-on-accent border-none py-2 px-4 rounded-lg cursor-pointer mt-2 font-sans"
                    >
                      مشاهده محصول
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* رابط کاربری دسکتاپ */}
      {!isMobile && (
        <>
          <DesktopLocationButton onLocate={handleLocate} isLocating={isLocating} onBack={handleBack} />
          <DesktopSidebar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            products={filteredPosts}
            onProductClick={handleProductClick}
            onBack={handleBack}
          />
        </>
      )}

      {/* رابط کاربری موبایل */}
      {isMobile && (
        <>
          <MobileHeader
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onBack={handleBack}
          />
          <div className="absolute bottom-10 left-0 right-0 z-1000 pointer-events-auto">
            <HorizontalSlider products={filteredPosts} onProductClick={handleProductClick} />
          </div>
          <div className="absolute bottom-45 left-4 z-1001 pointer-events-auto">
            <MobileLocationButton
              onLocate={handleLocate}
              isLocating={isLocating}
              showTooltip={showTooltip}
              onShowTooltipChange={setShowTooltip}
            />
          </div>
        </>
      )}

      {/* پیام عدم وجود محصول */}
      {filteredPosts.length === 0 && !isMobile && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg-card/90 px-6 py-5 rounded-[40px] text-text-primary text-sm z-1000 whitespace-nowrap border border-border-color font-sans shadow-lg">
          هیچ محصولی یافت نشد.
        </div>
      )}

      {/* استایل‌های گلوبال */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          direction: rtl;
          background: var(--color-bg-card);
          color: var(--color-text-primary);
        }
        .leaflet-popup-tip {
          background: var(--color-bg-card);
        }
        .leaflet-container {
          font-family: var(--font-sans);
          background: var(--color-bg-primary);
        }
        .map-monochrome .leaflet-tile-pane {
          filter: grayscale(1) saturate(0) contrast(0.88) brightness(1.06);
        }
        [data-theme='dark'] .map-monochrome .leaflet-tile-pane {
          filter: grayscale(1) saturate(0) invert(0.9) contrast(0.9) brightness(0.72);
        }
        /* کنترل‌های بالای نقشه (زوم) زیر هدر جستجو پنهان نشوند */
        .leaflet-top {
          top: 64px;
        }
        .custom-marker {
          transition: transform 0.2s ease;
        }
        .custom-marker:hover {
          transform: scale(1.1);
        }
        .map-avatar-marker {
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          padding: 2px;
          background: #ffffff;
          border: 2px solid #000000;
        }
        .map-avatar-marker img {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: inherit;
          object-fit: cover;
          background: var(--color-placeholder);
        }
        .map-dot-marker {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #000000;
          box-shadow: inset 0 0 0 3px #000000, inset 0 0 0 5px #ffffff;
        }
        .user-location-marker {
          z-index: 1000;
        }
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.5s ease-out infinite;
        }
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: var(--color-bg-secondary);
          border-radius: 10px;
          margin: 4px 0;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--color-border-color);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}
