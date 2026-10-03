// src/app/(main)/create-post/page.tsx
'use client';

import { useState, useContext, useSyncExternalStore, useCallback, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import BottomSheet, { SheetActions } from '@/components/BottomSheet';
import { Button, OptionRow, TextField } from '@/components/FormControls';
import { SearchIcon, ImageIcon, HashIcon, LayersIcon, CloseIcon } from '@/components/icons';
import { toPersianNumber } from '@/utils/numberUtils';
import DateRangePicker from '@/components/DateRangePicker';
import Modal from '@/components/Modal';
import { UserContext } from '@/contexts/UserContext';
import { useToast } from '@/components/NotificationToast';
import nextDynamic from 'next/dynamic';

// ============================================
// نقشه - بارگذاری داینامیک برای جلوگیری از خطاهای SSR
// ============================================
const MapComponent = nextDynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-surface rounded-lg">
      <span className="text-sm text-text-muted">در حال بارگذاری نقشه...</span>
    </div>
  ),
});

// ============================================
// تعریف نوع‌های محلی
// ============================================

/** 
 * نوع داده کاربر توسعه یافته با فیلدهای اضافی
 * توجه: id همیشه از نوع number است (مطابق با Backend)
 */
interface ExtendedUser {
  id: number;
  username: string;
  phone: string;
  name?: string;
  email?: string;
  avatar?: string;
  addresses?: string[];
  [key: string]: unknown;
}

// ============================================
// ثابت‌های برنامه
// ============================================

/** حداکثر تعداد تصاویر */
const MAX_IMAGES = 10;

/** حداکثر حجم هر تصویر (۵ مگابایت) */
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** زمان تاخیر برای شبیه‌سازی آپلود (میلی‌ثانیه) */
const UPLOAD_DELAY = 1500;

/** زمان تاخیر برای ریست فرم (میلی‌ثانیه) */
const RESET_DELAY = 2000;

/** 
 * مختصات پیش‌فرض (تهران)
 * توجه: استفاده از type [number, number] به جای as const برای سازگاری با Leaflet
 */
const DEFAULT_COORDINATES: [number, number] = [35.6892, 51.3890];

/** نوع پست */
const POST_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
} as const;

/** فهرست نوع پست در فیگما (post type) */
const TYPE_GROUPS = [
  {
    title: 'محصولات فیزیکی',
    type: POST_TYPES.PRODUCT,
    items: ['موبایل، تبلت، لپ‌تاپ', 'لباس، کفش، اکسسوری', 'لوازم خانگی', 'لوازم آشپزخانه', 'تجهیزات ورزشی', 'آرایشی و بهداشتی', 'قطعات خودرو', 'ابزار و یراق', 'اسباب‌بازی', 'غذای آماده'],
  },
  {
    title: 'محصولات دیجیتال',
    type: POST_TYPES.PRODUCT,
    items: ['کتاب الکترونیکی', 'لایسنس نرم‌افزار', 'قالب‌های گرافیکی', 'موسیقی، ویدیو و صوت', 'دوره‌های آموزشی'],
  },
  {
    title: 'خدمات',
    type: POST_TYPES.SERVICE,
    items: ['آرایشگری', 'ماساژ', 'مراقبت از سالمند و کودک', 'تعمیرات منزل', 'برق‌کاری', 'لوله‌کشی', 'نظافت', 'نقاشی ساختمان', 'تعمیر لوازم خانگی', 'برنامه‌نویسی', 'طراحی گرافیک', 'ترجمه', 'حسابداری', 'مشاوره', 'عکاسی', 'تدوین ویدیو', 'تدریس خصوصی'],
  },
];

/** تگ‌های پیشنهادی (Tag & Keyword) */
const TAG_OPTIONS = ['جدید', 'پرطرفدار', 'فروش ویژه', 'تخفیف', 'محدود', 'داغ', 'ویژه', 'آنلاین', 'دیجیتال', 'دست‌ساز', 'سفارشی', 'ارسال رایگان', 'اورجینال', 'هدیه'];

// ============================================
// هوک‌های سفارشی - استاندارد React 19
// ============================================

/**
 * هوک تشخیص دستگاه موبایل با استفاده از useSyncExternalStore
 * این روش استاندارد React 19 برای اشتراک‌گذاری state با سیستم‌های خارجی است
 */
const useMediaQuery = (query: string) => {
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

// ============================================
// آیکون‌های SVG
// ============================================

const MapIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

// ============================================
// تعریف نوع‌های داده
// ============================================

interface SelectOption {
  value: string;
  label: string;
}

interface DateRange {
  start: Date;
  end: Date;
}

interface Coordinates {
  lat: number;
  lng: number;
}

// ============================================
// کامپوننت سلکت سفارشی
// ============================================


// ============================================
// کامپوننت Loader
// ============================================

const Loader = () => (
  <div className="fixed inset-0 bg-black/50 z-3000 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-white/30 border-t-accent-color rounded-full animate-spin"></div>
    <p className="mt-4 text-white text-base font-medium">در حال آپلود تصاویر...</p>
  </div>
);

// ============================================
// کامپوننت اصلی
// ============================================

/**
 * صفحه ایجاد پست جدید
 * 
 * روند کار:
 * 1. آپلود تصاویر محصول/خدمت
 * 2. وارد کردن اطلاعات (عنوان، قیمت، توضیحات و...)
 * 3. انتخاب دسته‌بندی و نوع پست
 * 4. انتخاب بازه زمانی و لوکیشن
 * 5. اعتبارسنجی و ثبت پست
 */
export default function CreatePostPage() {
  // ============================================
  // هوک‌های ری‌اکت
  // ============================================
  const { user, setUser } = useContext(UserContext);
  const { success, error, warning, info } = useToast();
  const isMobile = useMediaQuery('(max-width: 767px)');
  
  // تبدیل user به نوع توسعه یافته با id از نوع number
  const currentUser = user as ExtendedUser | null;

  // ============================================
  // وضعیت‌های کامپوننت
  // ============================================
  
  // اطلاعات پایه
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [postType, setPostType] = useState<string>(POST_TYPES.PRODUCT);
  const [altText, setAltText] = useState('');
  const [unit, setUnit] = useState('');

  // لوکیشن
  const [userLocation, setUserLocation] = useState('');
  const [selectedLocationCoords, setSelectedLocationCoords] = useState<Coordinates | null>(null);

  // تصاویر
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // بازه‌های زمانی
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [showDiscountDateRangePicker, setShowDiscountDateRangePicker] = useState(false);
  const [discountDateRange, setDiscountDateRange] = useState<DateRange | null>(null);

  // مودال لوکیشن
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempAddress, setTempAddress] = useState('');

  // مراحل و شیت‌های فیگما
  const [step, setStep] = useState<'type' | 'media' | 'details'>('type');
  const [sheet, setSheet] = useState<null | 'alt' | 'tags' | 'unit' | 'discount' | 'info'>(null);
  const [typeQuery, setTypeQuery] = useState('');
  const [mediaKind, setMediaKind] = useState<'photo' | 'video' | 'file'>('photo');
  const [tags, setTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState('');
  const [features, setFeatures] = useState<{ key: string; value: string }[]>([]);
  const [featureKey, setFeatureKey] = useState('');
  const [featureValue, setFeatureValue] = useState('');

  // ============================================
  // داده‌های ثابت با useMemo
  // ============================================

  const userAddresses = useMemo(
    () => currentUser?.addresses || [],
    [currentUser?.addresses]
  );



  const unitOptions: SelectOption[] = useMemo(() => [
    { value: '', label: 'انتخاب کنید' },
    { value: 'عدد', label: 'عدد' },
    { value: 'کیلوگرم', label: 'کیلوگرم' },
    { value: 'گرم', label: 'گرم' },
    { value: 'لیتر', label: 'لیتر' },
    { value: 'متر', label: 'متر' },
    { value: 'سانتی‌متر', label: 'سانتی‌متر' },
    { value: 'ساعت', label: 'ساعت' },
    { value: 'روز', label: 'روز' },
    { value: 'ماه', label: 'ماه' },
  ], []);

  // ============================================
  // توابع کمکی
  // ============================================

  /**
   * فرمت بازه زمانی به فارسی
   */
  const formatPersianDateRange = useCallback((range: DateRange | null) => {
    if (!range) return '';
    const start = new Date(range.start);
    const end = new Date(range.end);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return `${start.toLocaleDateString('fa-IR', options)} تا ${end.toLocaleDateString('fa-IR', options)}`;
  }, []);

  /**
   * بررسی حجم تصاویر
   */
  const validateImages = useCallback((files: File[]): boolean => {
    const oversizedFiles = files.filter((file) => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      warning('حجم هر تصویر باید کمتر از ۵ مگابایت باشد');
      return false;
    }
    return true;
  }, [warning]);

  // ============================================
  // مدیریت تصاویر
  // ============================================

  /**
   * آپلود تصاویر
   */
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    console.log('📸 انتخاب تصاویر:', { count: files.length });

    if (files.length === 0) return;

    // بررسی تعداد
    if (images.length + files.length > MAX_IMAGES) {
      warning(`حداکثر می‌توانید ${MAX_IMAGES} تصویر آپلود کنید`);
      return;
    }

    // بررسی حجم
    if (!validateImages(files)) return;

    setUploading(true);

    // شبیه‌سازی آپلود
    setTimeout(() => {
      const newPreviews: string[] = [];
      const newImages = [...images];
      let processed = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          newImages.push(file);
          processed++;
          
          if (processed === files.length) {
            setPreviews((prev) => [...prev, ...newPreviews]);
            setImages(newImages);
            setUploading(false);
            
            if (previews.length === 0 && newPreviews.length > 0) {
              setCurrentIndex(0);
            }
            
            console.log('✅ تصاویر آپلود شدند:', { count: files.length });
            success(`${files.length} تصویر با موفقیت آپلود شد`);
          }
        };
        reader.onerror = () => {
          setUploading(false);
          console.error('❌ خطا در آپلود تصویر:', file.name);
          error('خطا در آپلود تصاویر');
        };
        reader.readAsDataURL(file);
      });
    }, UPLOAD_DELAY);
  }, [images, previews.length, validateImages, success, warning, error]);

  /**
   * حذف تصویر
   */
  const removeImage = useCallback((indexToRemove: number) => {
    console.log('🗑️ حذف تصویر:', { index: indexToRemove });

    const newPreviews = previews.filter((_preview: string, idx: number) => idx !== indexToRemove);
    const newImages = images.filter((_image: File, idx: number) => idx !== indexToRemove);
    
    setPreviews(newPreviews);
    setImages(newImages);
    
    if (newPreviews.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= newPreviews.length) {
      setCurrentIndex(newPreviews.length - 1);
    }
    
    info('تصویر حذف شد');
  }, [previews, images, currentIndex, info]);

  /**
   * تغییر اسلاید
   */


  // ============================================
  // مدیریت بازه‌های زمانی
  // ============================================

  const handleDateRangeSelect = useCallback((range: DateRange) => {
    console.log('📅 انتخاب بازه زمانی:', range);
    setSelectedDateRange(range);
    setShowDateRangePicker(false);
    success('بازه زمانی با موفقیت ثبت شد');
  }, [success]);

  const handleDiscountDateRangeSelect = useCallback((range: DateRange) => {
    console.log('📅 انتخاب بازه تخفیف:', range);
    setDiscountDateRange(range);
    setShowDiscountDateRangePicker(false);
    success('بازه زمانی تخفیف با موفقیت ثبت شد');
  }, [success]);

  // ============================================
  // مدیریت آدرس‌ها
  // ============================================

  const handleAddAddress = useCallback(() => {
    if (tempAddress.trim() === '') {
      warning('لطفاً آدرس را وارد کنید');
      return;
    }

    console.log('📍 اضافه کردن آدرس:', tempAddress);
    const newAddresses = [...userAddresses, tempAddress.trim()];
    
    if (setUser && currentUser) {
      // ایجاد آبجکت کامل ExtendedUser
      const updatedUser: ExtendedUser = {
        id: currentUser.id,
        username: currentUser.username,
        phone: currentUser.phone,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        addresses: newAddresses,
      };
      setUser(updatedUser);
    }
    
    setTempAddress('');
    success('آدرس با موفقیت اضافه شد');
  }, [tempAddress, userAddresses, currentUser, setUser, success, warning]);

  const handleRemoveAddress = useCallback((index: number) => {
    console.log('🗑️ حذف آدرس:', { index });
    const newAddresses = userAddresses.filter((_addr: string, i: number) => i !== index);
    
    if (setUser && currentUser) {
      const updatedUser: ExtendedUser = {
        id: currentUser.id,
        username: currentUser.username,
        phone: currentUser.phone,
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        addresses: newAddresses,
      };
      setUser(updatedUser);
    }
    
    success('آدرس با موفقیت حذف شد');
  }, [userAddresses, currentUser, setUser, success]);

  const handleSelectAddress = useCallback((selectedAddress: string) => {
    console.log('📍 انتخاب آدرس:', selectedAddress);
    setUserLocation(selectedAddress);
    setShowLocationModal(false);
    success('لوکیشن با موفقیت انتخاب شد');
  }, [success]);

  const handleLocationSelect = useCallback((latlng: Coordinates) => {
    console.log('📍 انتخاب مختصات:', latlng);
    setSelectedLocationCoords(latlng);
    success('مختصات مکانی با موفقیت ثبت شد');
  }, [success]);

  // ============================================
  // اعتبارسنجی و ثبت
  // ============================================

  /**
   * اعتبارسنجی فرم
   */
  const validateForm = useCallback((): boolean => {
    console.log('🔍 شروع اعتبارسنجی فرم');

    if (images.length === 0) {
      warning('حداقل یک تصویر انتخاب کنید');
      return false;
    }

    if (!selectedDateRange) {
      warning('لطفاً بازه تاریخ و زمان ارائه خدمت را انتخاب کنید');
      return false;
    }

    if (!title.trim()) {
      warning('لطفاً عنوان محصول/خدمت را وارد کنید');
      return false;
    }

    if (!category) {
      warning('لطفاً دسته‌بندی را انتخاب کنید');
      return false;
    }

    if (!price || parseFloat(price) <= 0) {
      warning('لطفاً قیمت معتبر وارد کنید');
      return false;
    }

    if (discountPrice && parseFloat(discountPrice) >= parseFloat(price)) {
      warning('قیمت تخفیف دار باید کمتر از قیمت اصلی باشد');
      return false;
    }

    if (!stock || parseInt(stock) <= 0) {
      warning('لطفاً موجودی/ظرفیت معتبر وارد کنید');
      return false;
    }

    if (!description.trim()) {
      warning('لطفاً توضیحات کامل را وارد کنید');
      return false;
    }

    console.log('✅ اعتبارسنجی موفق');
    return true;
  }, [images.length, selectedDateRange, title, category, price, discountPrice, stock, description, warning]);

  /**
   * ثبت پست
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 شروع ثبت پست');

    if (!validateForm()) return;

    const postData = {
      title,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      category,
      stock: parseInt(stock),
      postType,
      altText,
      location: userLocation,
      unit,
      coordinates: selectedLocationCoords,
      imagesCount: images.length,
      dateRange: selectedDateRange,
      discountDateRange: discountDateRange,
      tags,
      features,
    };

    console.log('✅ داده‌های پست:', postData);
    success('پست با موفقیت ایجاد شد!');

    // ریست فرم بعد از تاخیر
    setTimeout(() => {
      console.log('🔄 ریست فرم');
      setTitle('');
      setDescription('');
      setPrice('');
      setDiscountPrice('');
      setCategory('');
      setStock('');
      setPostType(POST_TYPES.PRODUCT);
      setAltText('');
      setUserLocation('');
      setUnit('');
      setPreviews([]);
      setImages([]);
      setCurrentIndex(0);
      setSelectedDateRange(null);
      setDiscountDateRange(null);
      setSelectedLocationCoords(null);
    }, RESET_DELAY);
  }, [
    title, description, price, discountPrice, category, stock,
    postType, altText, userLocation, unit, selectedLocationCoords,
    images.length, selectedDateRange, discountDateRange, tags, features,
    validateForm, success
  ]);

  /**
   * لغو و پاک کردن فرم
   */
  const handleCancel = useCallback(() => {
    const hasData = title || description || price || previews.length > 0;
    
    if (hasData) {
      if (window.confirm('آیا از پاک کردن فرم مطمئن هستید؟ تمام اطلاعات حذف خواهد شد.')) {
        console.log('🗑️ پاک کردن فرم');
        setTitle('');
        setDescription('');
        setPrice('');
        setDiscountPrice('');
        setCategory('');
        setStock('');
        setPostType(POST_TYPES.PRODUCT);
        setAltText('');
        setUserLocation('');
        setUnit('');
        setPreviews([]);
        setImages([]);
        setCurrentIndex(0);
        setSelectedDateRange(null);
        setDiscountDateRange(null);
        setSelectedLocationCoords(null);
        info('فرم با موفقیت پاک شد');
      }
    } else {
      info('فرم خالی است');
    }
  }, [title, description, price, previews.length, info]);

  // ============================================
  // لاگ‌های رندر
  // ============================================

  console.log('🖥️ رندر صفحه ایجاد پست:', {
    isMobile,
    imagesCount: images.length,
    hasDateRange: !!selectedDateRange,
    hasDiscountRange: !!discountDateRange,
    userAddressesCount: userAddresses.length,
    timestamp: new Date().toISOString(),
  });

  // ============================================
  // رندر
  // ============================================

  const filteredTypes = TYPE_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((it) => it.includes(typeQuery.trim())),
  })).filter((g) => g.items.length > 0);

  const pickType = (type: string, label: string) => {
    setPostType(type);
    if (!category) setCategory(label);
    setStep('media');
  };

  const filteredTags = TAG_OPTIONS.filter((t) => t.includes(tagQuery.trim()));

  // ============================================
  // رندر - فیگما (create post): نوع پست ← تصاویر و ویدیو ← عنوان، توضیح و گزینه‌ها
  // ============================================
  return (
    <AppShell>
      {step === 'type' && (
        <>
          <PageHeader title="نوع پست" />
          <div className="px-4 pb-10">
            <label className="flex items-center gap-3 h-12.5 px-4 rounded-[10px] border border-border-strong">
              <SearchIcon className="w-4 h-4 shrink-0" />
              <input
                value={typeQuery}
                onChange={(e) => setTypeQuery(e.target.value)}
                placeholder="جستجو"
                aria-label="جستجوی نوع پست"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-placeholder"
              />
            </label>
            {filteredTypes.map((g) => (
              <section key={g.title} className="mt-5">
                <h2 className="m-0 mb-1 text-[10px] font-semibold text-text-primary">{g.title}</h2>
                <ul className="list-none m-0 p-0">
                  {g.items.map((it) => (
                    <li key={it}>
                      <button
                        type="button"
                        onClick={() => pickType(g.type, it)}
                        className="w-full h-6 text-right text-[10px] text-text-primary hover:font-semibold"
                      >
                        {it}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      {step === 'media' && (
        <>
          <PageHeader
            title="تصاویر و ویدیو"
            onBack={() => setStep('type')}
            end={
              <button type="button" onClick={() => setStep('details')} className="text-lg text-[#0a0a0a]">
                بعدی
              </button>
            }
          />
          {/* پیش‌نمایش بزرگ تصویر انتخاب‌شده */}
          <div className="relative w-full aspect-[440/322] bg-bg-surface flex items-center justify-center">
            {previews[currentIndex] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previews[currentIndex]} alt="" className="w-full h-full object-contain" />
            ) : (
              <ImageIcon className="w-35 h-35 text-placeholder" />
            )}
          </div>
          {/* گالری سه‌ستونه با دکمه‌ی افزودن */}
          <div className="relative grid grid-cols-3 gap-px bg-[#f2f2f2] min-h-80">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square bg-bg-primary">
                <button type="button" onClick={() => setCurrentIndex(i)} className="block w-full h-full" aria-label={`تصویر ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="حذف تصویر"
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
                {i === currentIndex && <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-black border-2 border-white" />}
              </div>
            ))}
            {previews.length < MAX_IMAGES && (
              <label className="aspect-square bg-bg-primary flex items-center justify-center cursor-pointer text-placeholder">
                <PlusIcon className="w-10 h-10" />
                <input
                  type="file"
                  accept={mediaKind === 'video' ? 'video/*' : mediaKind === 'file' ? '*/*' : 'image/*'}
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="افزودن رسانه"
                />
              </label>
            )}
            {/* انتخاب نوع رسانه: کپسول مشکی */}
            <div className="sticky bottom-20 col-span-3 flex justify-center pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-1 h-12.5 px-3 rounded-full bg-black text-white text-sm">
                {(['photo', 'video', 'file'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setMediaKind(k)}
                    aria-pressed={mediaKind === k}
                    className={`h-9 px-4 rounded-full ${mediaKind === k ? 'bg-white text-black' : ''}`}
                  >
                    {k === 'photo' ? 'عکس' : k === 'video' ? 'ویدیو' : 'فایل'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'details' && (
        <form onSubmit={handleSubmit} noValidate>
          <PageHeader
            title="ساخت پست"
            onBack={() => setStep('media')}
            end={
              <button type="submit" className="text-lg text-[#0a0a0a]">
                انتشار
              </button>
            }
          />

          {/* شبکه‌ی رسانه‌ها ۱۴۷ پیکسلی با خط #f2f2f2 */}
          <div className="grid grid-cols-3">
            {Array.from({ length: Math.max(3, Math.ceil((previews.length + 1) / 3) * 3) }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep('media')}
                className="aspect-square border border-[#f2f2f2] bg-bg-primary flex items-center justify-center"
                aria-label={previews[i] ? `تصویر ${i + 1}` : 'افزودن تصویر'}
              >
                {previews[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previews[i]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-14 h-14 text-placeholder" />
                )}
              </button>
            ))}
          </div>

          <div className="px-4 pb-12">
            <span className="block mt-6.5 mb-4 text-base text-text-primary">نوع پست</span>
            <button
              type="button"
              onClick={() => setStep('type')}
              className="w-full h-12.5 rounded-[10px] border border-border-strong text-lg text-text-primary"
            >
              {postType === POST_TYPES.SERVICE ? 'خدمت' : 'محصول'} · {category || 'انتخاب دسته‌بندی'}
            </button>

            <label className="block mt-4">
              <span className="block mb-6.5 text-base text-text-primary">عنوان</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="عنوان"
                className="w-full h-12.5 px-4 rounded-xl border border-border-strong bg-bg-primary text-base text-text-primary outline-none focus:border-2"
              />
            </label>

            <label className="block mt-8">
              <span className="block mb-3.5 text-base text-text-primary">توضیحات</span>
              <span className="block rounded-xl border border-border-strong overflow-hidden">
                <span className="flex items-center gap-3 h-9 px-3 border-b border-border-color text-text-primary" aria-hidden>
                  <span className="text-[10px]">عنوان ۲</span>
                  <b className="text-sm">B</b>
                  <i className="text-sm">I</i>
                  <span className="text-xs">⁝≡</span>
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  aria-label="توضیحات"
                  className="w-full h-40 p-3 bg-transparent border-none outline-none resize-none text-sm text-text-primary"
                />
              </span>
            </label>

            <div className="mt-14 flex flex-col gap-3">
              <OptionRow icon={<ImageIcon className="w-5 h-5" />} label="نوشتن متن جایگزین" value={altText} onClick={() => setSheet('alt')} />
              <OptionRow
                icon={<CalendarIcon className="w-4 h-4.5" />}
                label="زمان‌بندی پست"
                value={selectedDateRange ? formatPersianDateRange(selectedDateRange) : ''}
                onClick={() => setShowDateRangePicker(true)}
              />
              <OptionRow icon={<HashIcon className="w-4 h-4" />} label="تگ و کلمه‌ی کلیدی" value={tags.join('، ')} onClick={() => setSheet('tags')} />
              <OptionRow icon={<MapIcon className="w-5 h-5" />} label="آدرس" value={userLocation} onClick={() => setShowLocationModal(true)} />
              <OptionRow
                icon={<LayersIcon className="w-5 h-5" />}
                label="مشخصات"
                value={features.length ? `${toPersianNumber(features.length)} ویژگی` : ''}
                onClick={() => setSheet('info')}
              />
            </div>

            <h2 className="m-0 mt-10 mb-4 text-lg font-medium text-text-primary">قیمت و موجودی</h2>
            <div className="flex flex-col gap-3">
              <TextField type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="قیمت (تومان)" aria-label="قیمت" />
              <TextField type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="موجودی / ظرفیت" aria-label="موجودی" />
              <OptionRow label="واحد" value={unit} onClick={() => setSheet('unit')} />
              <OptionRow
                label="تخفیف زمان‌دار"
                value={discountPrice ? `${toPersianNumber(discountPrice)} تومان` : ''}
                onClick={() => setSheet('discount')}
              />
            </div>

            <div className="mt-10 flex gap-5">
              <Button type="submit" className="flex-1">انتشار</Button>
              <Button variant="outline" className="flex-1" onClick={handleCancel}>پاک کردن</Button>
            </div>
          </div>
        </form>
      )}

      {/* شیت متن جایگزین: کنار هر تصویر یک کادر نوشتن (#424242) */}
      <BottomSheet
        open={sheet === 'alt'}
        onClose={() => setSheet(null)}
        title={<span className="text-xl font-normal">متن جایگزین</span>}
        footer={<SheetActions onCancel={() => setSheet(null)} onConfirm={() => setSheet(null)} />}
      >
        <div className="flex flex-col gap-2">
          {(previews.length ? previews : [null]).map((src, i) => (
            <div key={i} className="flex gap-3.75">
              <span className="w-25 h-25 shrink-0 bg-placeholder overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {src && <img src={src} alt="" className="w-full h-full object-cover" />}
              </span>
              <textarea
                value={i === 0 ? altText : ''}
                onChange={(e) => i === 0 && setAltText(e.target.value)}
                placeholder="نوشتن..."
                aria-label={`متن جایگزین تصویر ${i + 1}`}
                className="flex-1 h-25 p-2.5 rounded-[10px] border border-[#424242] bg-transparent text-white text-sm placeholder:text-[#6b6b6b] outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </BottomSheet>

      {/* شیت تگ‌ها (Tag & Keyword): جستجو + ردیف‌های دورخط، انتخاب‌شده سفید */}
      <BottomSheet
        open={sheet === 'tags'}
        onClose={() => setSheet(null)}
        title={<span className="text-xl font-normal">تگ و کلمه‌ی کلیدی</span>}
        footer={<SheetActions onCancel={() => setSheet(null)} onConfirm={() => setSheet(null)} />}
      >
        <input
          value={tagQuery}
          onChange={(e) => setTagQuery(e.target.value)}
          placeholder="جستجو"
          aria-label="جستجوی تگ"
          className="w-full h-12 px-4 mb-3 rounded-[10px] bg-white text-black text-sm outline-none"
        />
        <div className="flex flex-col gap-2">
          {filteredTags.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => setTags(on ? tags.filter((x) => x !== t) : [...tags, t])}
                className={`h-10 px-4 rounded-[10px] border text-right text-sm ${on ? 'bg-white text-black border-white' : 'border-white/60 text-white'}`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* شیت واحد (unit) */}
      <BottomSheet
        open={sheet === 'unit'}
        onClose={() => setSheet(null)}
        title={<span className="text-xl font-normal">واحد</span>}
        footer={<SheetActions onCancel={() => setSheet(null)} onConfirm={() => setSheet(null)} />}
      >
        <ul className="list-none m-0 p-0">
          {unitOptions.filter((u) => u.value).map((u) => (
            <li key={u.value}>
              <button
                type="button"
                onClick={() => setUnit(u.value)}
                aria-pressed={unit === u.value}
                className={`w-full h-10 text-right text-base ${unit === u.value ? 'text-white font-semibold' : 'text-white/70'}`}
              >
                {u.label}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* شیت تخفیف زمان‌دار (Limited-Time Discount) */}
      <BottomSheet
        open={sheet === 'discount'}
        onClose={() => setSheet(null)}
        title={<span className="text-xl font-normal">تخفیف زمان‌دار</span>}
        footer={<SheetActions onCancel={() => setSheet(null)} onConfirm={() => setSheet(null)} />}
      >
        <input
          type="number"
          inputMode="numeric"
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
          placeholder="قیمت با تخفیف (تومان)"
          aria-label="قیمت با تخفیف"
          className="w-full h-14 px-4 rounded-[10px] bg-white text-black text-base outline-none"
        />
        <button
          type="button"
          onClick={() => setShowDiscountDateRangePicker(true)}
          className="mt-3 w-full h-14 px-4 rounded-[10px] border border-white text-right text-sm text-white"
        >
          {discountDateRange ? formatPersianDateRange(discountDateRange) : 'بازه‌ی زمانی تخفیف'}
        </button>
      </BottomSheet>

      {/* شیت مشخصات (Information / Feature): کلید و مقدار */}
      <BottomSheet
        open={sheet === 'info'}
        onClose={() => setSheet(null)}
        title={<span className="text-xl font-normal">مشخصات</span>}
        footer={<SheetActions onCancel={() => setSheet(null)} onConfirm={() => setSheet(null)} />}
      >
        <p className="m-0 mb-3 text-xs text-white/60">یک ویژگی موجود را جستجو کنید یا ویژگی جدید بسازید.</p>
        <div className="flex gap-2 mb-4">
          <input
            value={featureKey}
            onChange={(e) => setFeatureKey(e.target.value)}
            placeholder="ویژگی (مثلاً رنگ)"
            aria-label="نام ویژگی"
            className="flex-1 min-w-0 h-12 px-3 rounded-[10px] bg-white text-black text-sm outline-none"
          />
          <input
            value={featureValue}
            onChange={(e) => setFeatureValue(e.target.value)}
            placeholder="مقدار"
            aria-label="مقدار ویژگی"
            className="flex-1 min-w-0 h-12 px-3 rounded-[10px] bg-white text-black text-sm outline-none"
          />
          <button
            type="button"
            aria-label="افزودن ویژگی"
            onClick={() => {
              if (!featureKey.trim() || !featureValue.trim()) return;
              setFeatures([...features, { key: featureKey.trim(), value: featureValue.trim() }]);
              setFeatureKey('');
              setFeatureValue('');
            }}
            className="w-12 h-12 rounded-[10px] border border-white text-white flex items-center justify-center"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <ul className="list-none m-0 p-0 flex flex-col gap-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 h-9.5 px-4 rounded-[5px] bg-white text-black text-sm">
              <span className="flex-1">{f.key}</span>
              <span>{f.value}</span>
              <button type="button" aria-label="حذف ویژگی" onClick={() => setFeatures(features.filter((_, j) => j !== i))}>
                <CloseIcon className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {/* لودر */}
      {uploading && <Loader />}

      {/* مودال‌ها */}
      <Modal
        isOpen={showDateRangePicker}
        onClose={() => setShowDateRangePicker(false)}
        size="sm"
        noPadding
      >
        <DateRangePicker
          key={selectedDateRange ? `${selectedDateRange.start}-${selectedDateRange.end}` : 'empty'}
          onSelect={handleDateRangeSelect}
          onClose={() => setShowDateRangePicker(false)}
          initialStartDate={selectedDateRange?.start ? new Date(selectedDateRange.start) : null}
          initialEndDate={selectedDateRange?.end ? new Date(selectedDateRange.end) : null}
        />
      </Modal>

      <Modal
        isOpen={showDiscountDateRangePicker}
        onClose={() => setShowDiscountDateRangePicker(false)}
        size="sm"
        noPadding
      >
        <DateRangePicker
          key={discountDateRange ? `${discountDateRange.start}-${discountDateRange.end}` : 'empty'}
          onSelect={handleDiscountDateRangeSelect}
          onClose={() => setShowDiscountDateRangePicker(false)}
          initialStartDate={discountDateRange?.start ? new Date(discountDateRange.start) : null}
          initialEndDate={discountDateRange?.end ? new Date(discountDateRange.end) : null}
        />
      </Modal>

      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        size="lg"
        noPadding
      >
        <div className="p-5">
          <h3 className="text-lg font-semibold mb-4 text-center text-text-primary">
            انتخاب لوکیشن
          </h3>
          
          {/* نقشه */}
          <div className="w-full h-75 rounded-2xl overflow-hidden mb-4 border border-border-color">
            <MapComponent
              center={
                selectedLocationCoords
                  ? ([selectedLocationCoords.lat, selectedLocationCoords.lng] as [number, number])
                  : DEFAULT_COORDINATES
              }
              zoom={12}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* افزودن آدرس */}
          <div className="flex gap-2.5 mb-4">
            <input
              type="text"
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="آدرس جدید را وارد کنید..."
              className="flex-1 px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddAddress()}
            />
            <button
              type="button"
              onClick={handleAddAddress}
              className="w-11.5 h-11.5 bg-accent-color text-on-accent border-none rounded-2xl cursor-pointer transition-colors flex items-center justify-center hover:bg-accent-hover"
              aria-label="افزودن آدرس"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* لیست آدرس‌ها */}
          <div className="max-h-62.5 overflow-y-auto mb-4">
            <label className="block text-sm font-semibold mb-3 text-text-primary">
              آدرس‌های ذخیره شده شما:
            </label>
            {userAddresses.length === 0 ? (
              <p className="text-center text-text-muted py-5">هیچ آدرسی ثبت نشده است</p>
            ) : (
              userAddresses.map((addr: string, idx: number) => (
                <div
                  key={idx}
                  className="flex justify-between items-center px-3 py-2.5 bg-bg-surface rounded-xl mb-2"
                >
                  <span
                    className="text-sm text-text-primary flex-1 cursor-pointer hover:text-accent-color hover:underline"
                    onClick={() => handleSelectAddress(addr)}
                    role="button"
                    tabIndex={0}
                    aria-label={`انتخاب آدرس ${addr}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSelectAddress(addr);
                      }
                    }}
                  >
                    {addr}
                  </span>
                  <button
                    onClick={() => handleRemoveAddress(idx)}
                    className="bg-transparent border-none cursor-pointer text-red-500 flex items-center p-1 rounded-lg transition-colors hover:bg-red-500/20"
                    aria-label={`حذف آدرس ${addr}`}
                  >
                    <TrashIcon className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* دکمه بستن */}
          <div className="flex justify-end pt-4 border-t border-border-color">
            <button
              onClick={() => setShowLocationModal(false)}
              className="px-6 py-2.5 bg-bg-surface border-none rounded-4xl text-sm cursor-pointer transition-colors text-text-primary hover:bg-border-color"
            >
              بستن
            </button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

// ============================================
// تنظیمات خروجی
// ============================================

/** جلوگیری از کش استاتیک Next.js */
export const dynamic = 'force-dynamic';