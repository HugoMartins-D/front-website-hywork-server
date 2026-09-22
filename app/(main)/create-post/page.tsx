// src/app/(main)/create-post/page.tsx
'use client';

import { useState, useContext, useEffect, useRef, useLayoutEffect, useSyncExternalStore, useCallback, useMemo } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileBottomNav from '@/components/MobileBottomNav';
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
      <span className="text-sm text-text-muted">Carregando mapa...</span>
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

const UploadIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

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

const CalendarDaysIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);

const CaretDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
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

/**
 * کامپوننت سلکت سفارشی با قابلیت جستجو و انتخاب
 */
const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback((val: string) => {
    console.log('📝 انتخاب گزینه:', { value: val });
    onChange(val);
    setIsOpen(false);
  }, [onChange]);

  // بستن dropdown هنگام کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تنظیم موقعیت dropdown برای جلوگیری از خروج از صفحه
  useLayoutEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        dropdownRef.current.style.top = 'auto';
        dropdownRef.current.style.bottom = '100%';
        dropdownRef.current.style.marginTop = '0';
        dropdownRef.current.style.marginBottom = '8px';
      } else {
        dropdownRef.current.style.top = '100%';
        dropdownRef.current.style.bottom = 'auto';
        dropdownRef.current.style.marginTop = '8px';
        dropdownRef.current.style.marginBottom = '0';
      }
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={selectRef} className="relative w-full">
      <div
        onClick={() => {
          console.log('🔄 تغییر وضعیت dropdown:', { isOpen: !isOpen });
          setIsOpen(!isOpen);
        }}
        className={`flex items-center justify-between px-4 py-3 bg-bg-primary border rounded-2xl text-sm cursor-pointer transition-all duration-200 text-text-primary ${
          isOpen ? 'border-accent-color shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' : 'border-border-color'
        }`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`inline-flex transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <CaretDownIcon className="w-4.5 h-4.5 text-text-muted" />
        </span>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bg-bg-card border border-border-color rounded-xl shadow-lg z-100 overflow-hidden mt-2"
          role="listbox"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors duration-150 text-text-primary ${
                opt.value === value ? 'bg-bg-surface' : 'hover:bg-bg-surface'
              }`}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// کامپوننت Loader
// ============================================

const Loader = () => (
  <div className="fixed inset-0 bg-black/50 z-3000 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-white/30 border-t-accent-color rounded-full animate-spin"></div>
    <p className="mt-4 text-white text-base font-medium">Enviando imagens...</p>
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  
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

  // ============================================
  // داده‌های ثابت با useMemo
  // ============================================

  const userAddresses = useMemo(
    () => currentUser?.addresses || [],
    [currentUser?.addresses]
  );

  const categoryOptions: SelectOption[] = useMemo(() => [
    { value: '', label: "Selecione" },
    { value: "Eletrônicos", label: "Eletrônicos" },
    { value: "Moda e vestuário", label: "Moda e vestuário" },
    { value: "Livros", label: "Livros" },
    { value: "Casa e cozinha", label: "Casa e cozinha" },
    { value: "Esportes", label: "Esportes" },
    { value: "Serviços", label: "Serviços" },
  ], []);

  const postTypeOptions: SelectOption[] = useMemo(() => [
    { value: POST_TYPES.PRODUCT, label: "Produto" },
    { value: POST_TYPES.SERVICE, label: "Serviço" },
  ], []);

  const unitOptions: SelectOption[] = useMemo(() => [
    { value: '', label: "Selecione" },
    { value: "unidades", label: "unidades" },
    { value: "Quilograma", label: "Quilograma" },
    { value: "Grama", label: "Grama" },
    { value: "Litro", label: "Litro" },
    { value: "Metro", label: "Metro" },
    { value: "Centímetro", label: "Centímetro" },
    { value: "Hora", label: "Hora" },
    { value: "Dia", label: "Dia" },
    { value: "Mês", label: "Mês" },
  ], []);

  // ============================================
  // توابع کمکی
  // ============================================

  /**
   * فرمت بازه زمانی به فارسی
   */
  const formatDateRange = useCallback((range: DateRange | null) => {
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
    return `${start.toLocaleDateString('pt-BR', options)} até ${end.toLocaleDateString('pt-BR', options)}`;
  }, []);

  /**
   * بررسی حجم تصاویر
   */
  const validateImages = useCallback((files: File[]): boolean => {
    const oversizedFiles = files.filter((file) => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      warning("Cada imagem deve ter menos de 5 MB");
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
      warning(`Você pode enviar no máximo ${MAX_IMAGES} imagens`);
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
            success(`${files.length} Imagem enviada`);
          }
        };
        reader.onerror = () => {
          setUploading(false);
          console.error('❌ خطا در آپلود تصویر:', file.name);
          error("Não foi possível enviar as imagens");
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
    
    info("Imagem removida");
  }, [previews, images, currentIndex, info]);

  /**
   * تغییر اسلاید
   */
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % previews.length);
  }, [previews.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);
  }, [previews.length]);

  // ============================================
  // مدیریت بازه‌های زمانی
  // ============================================

  const handleDateRangeSelect = useCallback((range: DateRange) => {
    console.log('📅 انتخاب بازه زمانی:', range);
    setSelectedDateRange(range);
    setShowDateRangePicker(false);
    success("Período definido");
  }, [success]);

  const handleDiscountDateRangeSelect = useCallback((range: DateRange) => {
    console.log('📅 انتخاب بازه تخفیف:', range);
    setDiscountDateRange(range);
    setShowDiscountDateRangePicker(false);
    success("Período do desconto definido");
  }, [success]);

  // ============================================
  // مدیریت آدرس‌ها
  // ============================================

  const handleAddAddress = useCallback(() => {
    if (tempAddress.trim() === '') {
      warning("Informe o endereço");
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
    success("Endereço adicionado");
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
    
    success("Endereço removido");
  }, [userAddresses, currentUser, setUser, success]);

  const handleSelectAddress = useCallback((selectedAddress: string) => {
    console.log('📍 انتخاب آدرس:', selectedAddress);
    setUserLocation(selectedAddress);
    setShowLocationModal(false);
    success("Localização selecionada");
  }, [success]);

  const handleLocationSelect = useCallback((latlng: Coordinates) => {
    console.log('📍 انتخاب مختصات:', latlng);
    setSelectedLocationCoords(latlng);
    success("Coordenadas registradas");
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
      warning("Selecione pelo menos uma imagem");
      return false;
    }

    if (!selectedDateRange) {
      warning("Selecione as datas e os horários do serviço");
      return false;
    }

    if (!title.trim()) {
      warning("Informe o título do produto ou serviço");
      return false;
    }

    if (!category) {
      warning("Selecione uma categoria");
      return false;
    }

    if (!price || parseFloat(price) <= 0) {
      warning("Informe um preço válido");
      return false;
    }

    if (discountPrice && parseFloat(discountPrice) >= parseFloat(price)) {
      warning("O preço com desconto deve ser menor que o preço original");
      return false;
    }

    if (!stock || parseInt(stock) <= 0) {
      warning("Informe um estoque ou uma capacidade válida");
      return false;
    }

    if (!description.trim()) {
      warning("Preencha a descrição completa");
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
    };

    console.log('✅ داده‌های پست:', postData);
    success("Publicação criada com sucesso!");

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
    images.length, selectedDateRange, discountDateRange,
    validateForm, success
  ]);

  /**
   * لغو و پاک کردن فرم
   */
  const handleCancel = useCallback(() => {
    const hasData = title || description || price || previews.length > 0;
    
    if (hasData) {
      if (window.confirm("Deseja limpar o formulário? Todos os dados preenchidos serão removidos.")) {
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
        info("Formulário limpo");
      }
    } else {
      info("O formulário está vazio");
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

  return (
    <>
      {/* نوار کناری و ناوبری موبایل */}
      {!isMobile && <Sidebar />}
      {isMobile && <MobileBottomNav />}

      {/* محتوای اصلی */}
      <div className="h-screen overflow-y-auto p-5 md:p-10 bg-bg-primary">
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap gap-6 md:gap-10 max-w-7xl mx-auto bg-bg-secondary rounded-2xl p-4 md:p-8 border border-border-color shadow-[0_4px_20px_var(--color-shadow)]"
        >
          {/* ستون راست - آپلود تصاویر */}
          <div className="flex-1 min-w-70">
            <div className="aspect-square border-2 border-dashed border-border-color rounded-2xl bg-bg-primary overflow-hidden relative hover:border-accent-color transition-colors">
              {previews.length > 0 ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previews[currentIndex]}
                    alt={`Imagem ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* دکمه حذف */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 bg-black/60 text-white border-none rounded-full w-8 h-8 text-lg cursor-pointer z-10 flex items-center justify-center hover:bg-black/80 transition-colors"
                    onClick={() => removeImage(currentIndex)}
                    aria-label="Remover imagem"
                  >
                    ✕
                  </button>

                  {/* دکمه‌های اسلاید */}
                  {previews.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="absolute top-1/2 -translate-y-1/2 left-2 bg-black/50 text-white border-none rounded-full w-9 h-9 text-2xl cursor-pointer z-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                        onClick={prevSlide}
                        aria-label="Imagem anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="absolute top-1/2 -translate-y-1/2 right-2 bg-black/50 text-white border-none rounded-full w-9 h-9 text-2xl cursor-pointer z-10 flex items-center justify-center hover:bg-black/70 transition-colors"
                        onClick={nextSlide}
                        aria-label="Próxima imagem"
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* شمارنده */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs z-10">
                    {currentIndex + 1} / {previews.length}
                  </div>

                  {/* دکمه افزودن تصویر */}
                  <button
                    type="button"
                    className="absolute bottom-3 right-3 bg-black/50 text-white border-none rounded-full w-9 h-9 text-2xl font-light cursor-pointer z-10 flex items-center justify-center transition-colors hover:bg-black/70"
                    onClick={() => document.getElementById('imageInput')?.click()}
                    aria-label="Adicionar imagem"
                  >
                    +
                  </button>
                </div>
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-center text-text-muted hover:bg-bg-surface transition-colors"
                  onClick={() => document.getElementById('imageInput')?.click()}
                >
                  <UploadIcon className="w-12 h-12 text-text-muted" />
                  <p className="mt-3 text-sm font-medium text-text-primary">
                    Clique para enviar uma ou mais imagens
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Até 10 imagens, com no máximo 5 MB cada
                  </p>
                </div>
              )}
              <input
                type="file"
                id="imageInput"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* متن جایگزین */}
            <div className="mt-4">
              <label className="block mb-2 font-semibold text-sm text-text-primary">
                Texto alternativo das imagens
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
                placeholder="Descreva brevemente as imagens"
              />
            </div>
          </div>

          {/* ستون چپ - اطلاعات */}
          <div className="flex-1 min-w-70">
            {/* عنوان */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">
                Título do produto ou serviço
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
                placeholder="Exemplo: criação de sites"
                required
              />
            </div>

            {/* دسته‌بندی */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">Categoria</label>
              <CustomSelect
                options={categoryOptions}
                value={category}
                onChange={setCategory}
                placeholder="Selecione"
              />
            </div>

            {/* نوع پست */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">Tipo de publicação</label>
              <CustomSelect
                options={postTypeOptions}
                value={postType}
                onChange={setPostType}
                placeholder="Selecione"
              />
            </div>

            {/* قیمت */}
            <div className="flex flex-col md:flex-row gap-4 mb-5">
              <div className="flex-1">
                <label className="block mb-2 font-semibold text-sm text-text-primary">
                  Preço (tomans)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
                  placeholder="Exemplo: 1250000"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 font-semibold text-sm text-text-primary">
                  Preço com desconto (tomans)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="flex-1 px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
                    placeholder="Preço com desconto"
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-bg-surface border border-border-color rounded-2xl cursor-pointer transition-colors hover:bg-border-color text-text-primary"
                    onClick={() => setShowDiscountDateRangePicker(true)}
                    title="Selecionar período do desconto"
                    aria-label="Selecionar período do desconto"
                  >
                    <CalendarDaysIcon className="w-5 h-5" />
                  </button>
                </div>
                {discountDateRange && (
                  <div className="flex items-center justify-between gap-2 mt-2 bg-green-500/15 rounded-xl border border-green-500/30 px-3 py-2">
                    <span className="text-xs text-green-500 truncate">
                      {formatDateRange(discountDateRange)}
                    </span>
                    <button
                      type="button"
                      className="bg-transparent border-none cursor-pointer px-2 py-1 rounded-lg transition-colors hover:bg-green-500/20 text-green-500"
                      onClick={() => setDiscountDateRange(null)}
                      aria-label="Remover período do desconto"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* واحد */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">Unidade</label>
              <CustomSelect
                options={unitOptions}
                value={unit}
                onChange={setUnit}
                placeholder="Selecione"
              />
            </div>

            {/* موجودی */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">
                Estoque / capacidade
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
                placeholder="Quantidade disponível ou vagas restantes"
                required
              />
            </div>

            {/* لوکیشن */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">Localização</label>
              <div
                className="flex items-center gap-3 px-4 py-3 bg-bg-surface border border-border-color rounded-2xl cursor-pointer transition-colors hover:bg-border-color text-text-primary"
                onClick={() => setShowLocationModal(true)}
                role="button"
                tabIndex={0}
                aria-label="Selecionar localização"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowLocationModal(true);
                  }
                }}
              >
                <MapIcon className="w-5 h-5" />
                <span>{userLocation || "Selecionar um endereço salvo"}</span>
              </div>
            </div>

            {/* بازه زمانی */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">
                Período do serviço
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={formatDateRange(selectedDateRange)}
                  placeholder="Selecionar datas e horários"
                  readOnly
                  className="flex-1 px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary cursor-pointer"
                  onClick={() => setShowDateRangePicker(true)}
                  aria-label="Selecionar período"
                />
                <button
                  type="button"
                  className="px-4 py-3 bg-bg-surface border border-border-color rounded-2xl cursor-pointer transition-colors hover:bg-border-color text-text-primary"
                  onClick={() => setShowDateRangePicker(true)}
                  aria-label="Abrir calendário"
                >
                  <CalendarIcon className="w-5 h-5" />
                </button>
              </div>
              {selectedDateRange && (
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-red-500/15 text-red-500 border-none rounded-lg text-xs cursor-pointer transition-colors hover:bg-red-500/30"
                  onClick={() => setSelectedDateRange(null)}
                >
                  Remover período
                </button>
              )}
            </div>

            {/* توضیحات */}
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-text-primary">
                Descrição completa
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary resize-vertical"
                rows={5}
                placeholder="Descreva o produto ou serviço..."
                required
              />
            </div>

            {/* دکمه‌ها */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-accent-color text-white border-none rounded-4xl text-base font-semibold cursor-pointer transition-all text-center hover:bg-accent-hover hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={uploading}
              >
                {uploading ? "Enviando..." : "Publicar"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-3 bg-bg-secondary text-text-primary border border-border-color rounded-4xl text-base font-semibold cursor-pointer transition-all text-center hover:bg-bg-surface"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </div>

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
            Selecionar localização
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
              placeholder="Digite o novo endereço..."
              className="flex-1 px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all focus:border-accent-color focus:shadow-[0_0_0_2px_rgba(187,134,252,0.2)] bg-bg-primary text-text-primary"
              onKeyDown={(e) => e.key === 'Enter' && handleAddAddress()}
            />
            <button
              type="button"
              onClick={handleAddAddress}
              className="w-11.5 h-11.5 bg-accent-color text-white border-none rounded-2xl cursor-pointer transition-colors flex items-center justify-center hover:bg-accent-hover"
              aria-label="Adicionar endereço"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>

          {/* لیست آدرس‌ها */}
          <div className="max-h-62.5 overflow-y-auto mb-4">
            <label className="block text-sm font-semibold mb-3 text-text-primary">
              Seus endereços salvos:
            </label>
            {userAddresses.length === 0 ? (
              <p className="text-center text-text-muted py-5">Nenhum endereço cadastrado</p>
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
                    aria-label={`Selecionar endereço ${addr}`}
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
                    aria-label={`Remover endereço ${addr}`}
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
              Fechar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

// ============================================
// تنظیمات خروجی
// ============================================

/** جلوگیری از کش استاتیک Next.js */
export const dynamic = 'force-dynamic';