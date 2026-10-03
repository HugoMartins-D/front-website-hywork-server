'use client';

import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import DateTimeSheet from '@/components/DateTimeSheet';
import { Button } from '@/components/FormControls';
import { CameraIcon, UserIcon } from '@/components/icons';
import Modal from '@/components/Modal';
import { useToast } from '@/components/NotificationToast';
import { UserContext } from '@/contexts/UserContext';

// ==================== DYNAMIC IMPORTS ====================

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false, loading: () => <div className="h-[250px] flex items-center justify-center bg-bg-surface rounded-xl text-text-secondary">در حال بارگذاری نقشه...</div> }
);

// ==================== ICONS ====================

const LocationIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ==================== HOOKS ====================
const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};

// ==================== VALIDATION FUNCTIONS ====================
const usernameValidation = {
  pattern: /^[a-zA-Z0-9._]+$/,
  minLength: 3,
  maxLength: 30,
  noStartEndDot: /^[^.].*[^.]$/,
  noStartUnderscore: /^[^_]/,
  noSpaces: /^\S*$/,
  noConsecutiveDots: /^(?!.*\.\.).*$/,
  noConsecutiveUnderscores: /^(?!.*__).*$/,
  
  reservedUsernames: [
    'admin', 'administrator', 'root', 'superuser',
    'moderator', 'support', 'help', 'info',
    'system', 'test', 'user', 'login',
    'signup', 'register', 'profile', 'settings'
  ],
  
  validate(username: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const trimmed = username.trim();
    
    if (!trimmed) {
      errors.push('نام کاربری نمی‌تواند خالی باشد');
      return { valid: false, errors };
    }
    
    if (trimmed.length < this.minLength) {
      errors.push(`نام کاربری باید حداقل ${this.minLength} کاراکتر باشد`);
    }
    if (trimmed.length > this.maxLength) {
      errors.push(`نام کاربری باید حداکثر ${this.maxLength} کاراکتر باشد`);
    }
    
    if (!this.pattern.test(trimmed)) {
      errors.push('نام کاربری فقط می‌تواند شامل حروف انگلیسی، اعداد، زیرخط (_) و نقطه (.) باشد');
    }
    
    if (!this.noSpaces.test(trimmed)) {
      errors.push('نام کاربری نمی‌تواند شامل فاصله باشد');
    }
    
    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      errors.push('نام کاربری نمی‌تواند با نقطه شروع یا خاتمه یابد');
    }
    
    if (!this.noConsecutiveDots.test(trimmed)) {
      errors.push('نام کاربری نمی‌تواند شامل نقطه‌های پشت سر هم باشد');
    }
    
    if (!this.noConsecutiveUnderscores.test(trimmed)) {
      errors.push('نام کاربری نمی‌تواند شامل زیرخط‌های پشت سر هم باشد');
    }
    
    if (this.reservedUsernames.includes(trimmed.toLowerCase())) {
      errors.push('این نام کاربری قابل استفاده نیست');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

// ==================== TYPES ====================
interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  birthDate?: string;
  gender?: string;
  bio?: string;
  addresses?: string[];
  avatar?: string;
  location?: { lat: number; lng: number };
}

// ==================== MAIN COMPONENT ====================
export default function EditProfilePage() {
  const { user, setUser, loading: isLoading } = useContext(UserContext);
  const router = useRouter();
  const isMobile = useMobileDetect();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error, warning, info } = useToast();
  
  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [usernameErrors, setUsernameErrors] = useState<string[]>([]);
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  
  // ✅ تغییر: فقط یک فیلد name (نام کامل)
  const [formData, setFormData] = useState({
    name: '',        // ← فقط یک فیلد برای نام کامل
    username: '',
    email: '',
    birthDate: '',
    gender: '',
    bio: '',
    addresses: [] as string[],
    avatar: '',
  });
  
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBirthDate, setSelectedBirthDate] = useState<Date | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // ==================== AUTH CHECK ====================
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      warning('لطفاً ابتدا وارد حساب کاربری خود شوید');
      router.replace('/login');
    }
  }, [user, isLoading, router, warning]);

  // ==================== INIT FORM ====================
  useEffect(() => {
    if (user && !isInitialized) {
      // ✅ فقط name رو مستقیم می‌گیریم (نام کامل)
      setFormData({
        name: user.name || '',  // ← فقط name
        username: user.username || '',
        email: user.email || '',
        birthDate: user.birthDate || '',
        gender: user.gender || '',
        bio: user.bio || '',
        addresses: user.addresses || [],
        avatar: user.avatar || '',
      });
      
      setAvatarPreview(user.avatar || '');
      setSelectedLocation(typeof user.location === 'object' ? user.location : null);
      setSelectedBirthDate(user.birthDate ? new Date(user.birthDate) : null);
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  // ==================== HANDLERS ====================
  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      const result = usernameValidation.validate(value);
      setUsernameErrors(result.errors);
      setIsUsernameValid(result.valid);
    }
  }, []);

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      warning('حجم فایل باید کمتر از ۲ مگابایت باشد');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      error('لطفاً فقط فایل تصویری انتخاب کنید');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      handleInputChange('avatar', result);
      success('آواتار با موفقیت آپلود شد');
    };
    reader.onerror = () => error('خطا در آپلود آواتار');
    reader.readAsDataURL(file);
  }, [handleInputChange, success, error, warning]);

  const handleAddAddress = useCallback(() => {
    if (newAddress.trim() === '') {
      warning('لطفاً آدرس را وارد کنید');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, newAddress.trim()]
    }));
    setNewAddress('');
    success('آدرس با موفقیت اضافه شد');
  }, [newAddress, success, warning]);

  const handleRemoveAddress = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index)
    }));
    success('آدرس با موفقیت حذف شد');
  }, [success]);

  const handleLocationSelect = useCallback((latlng: { lat: number; lng: number }) => {
    setSelectedLocation(latlng);
    success('موقعیت مکانی با موفقیت انتخاب شد');
  }, [success]);

  const handleDateSelect = useCallback((date: Date) => {
    setSelectedBirthDate(date);
    handleInputChange('birthDate', date.toISOString().split('T')[0]);
    setIsCalendarOpen(false);
    success('تاریخ تولد با موفقیت ثبت شد');
  }, [handleInputChange, success]);

  const clearBirthDate = useCallback(() => {
    setSelectedBirthDate(null);
    handleInputChange('birthDate', '');
    info('تاریخ تولد حذف شد');
  }, [handleInputChange, info]);

  // ==================== VALIDATION ====================
  const validateForm = useCallback(() => {
    const errors: string[] = [];
    
    // ✅ نام کامل اختیاری است - فقط اگر وارد شده باشد اعتبارسنجی می‌شود
    if (formData.name && formData.name.length > 100) {
      errors.push('نام کامل نباید بیشتر از ۱۰۰ کاراکتر باشد');
    }
    
    // اعتبارسنجی نام کاربری (اجباری)
    if (!formData.username.trim()) {
      errors.push('نام کاربری خود را وارد کنید');
    } else {
      const result = usernameValidation.validate(formData.username);
      if (!result.valid) {
        errors.push(...result.errors);
      }
    }
    
    // اعتبارسنجی ایمیل (اجباری)
    if (!formData.email.trim()) {
      errors.push('ایمیل خود را وارد کنید');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.push('ایمیل معتبر وارد کنید');
      }
    }
    
    if (errors.length > 0) {
      error(errors[0]);
      return false;
    }
    
    return true;
  }, [formData, error]);

  // ==================== SUBMIT ====================
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (isSubmitting || !user) return;

    const usernameCheck = usernameValidation.validate(formData.username);
    if (!usernameCheck.valid) {
      error(usernameCheck.errors[0]);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // ✅ فقط name رو ارسال می‌کنیم (بدون lastName)
      const updatedUser = {
        ...user,
        name: formData.name.trim() || '',  // ← فقط name (اختیاری)
        username: formData.username.trim().toLowerCase(),
        email: formData.email.trim(),
        birthDate: formData.birthDate || '',
        gender: formData.gender || '',
        bio: formData.bio || '',
        addresses: formData.addresses,
        avatar: formData.avatar || user?.avatar || '',
        location: selectedLocation || user?.location || null,
      };
      
      if (setUser) {
        await setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        success('پروفایل شما با موفقیت به‌روزرسانی شد!');
        
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        throw new Error('setUser is not available');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      error('خطایی رخ داده است. لطفاً دوباره تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, user, selectedLocation, setUser, validateForm, isSubmitting, success, error, router]);

  const handleCancel = useCallback(() => {
    if (window.confirm('آیا از انصراف مطمئن هستید؟ تغییرات ذخیره نخواهد شد.')) {
      router.push('/profile');
    }
  }, [router]);

  const formatPersianDate = useCallback((date: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // ==================== LOADING ====================
  if (isLoading || !isInitialized) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-10 h-10 border-3 border-placeholder border-t-accent-color rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">در حال بارگذاری اطلاعات کاربری...</p>
        </div>
      </AppShell>
    );
  }

  if (!user) return null;

  const fieldBox = 'w-full h-14 flex items-center gap-3 px-5 rounded-xl border border-border-strong bg-bg-primary text-right';
  const fieldInput = 'flex-1 min-w-0 h-full bg-transparent border-none outline-none text-sm font-medium text-text-primary placeholder:text-text-primary';

  // ==================== RENDER ====================
  // فیگما (Profile setting): آواتار ۱۴۷ پیکسلی خاکستری با دکمه‌ی دوربین مشکی ۴۱ پیکسلی،
  // فیلدهای ۴۰۸×۵۶ با گوشه‌ی ۱۲ و برچسب ۱۴/۵۰۰ داخل فیلد، بیو ۱۳۹ پیکسلی
  return (
    <AppShell>
      <PageHeader title="تنظیمات پروفایل" />

      <form onSubmit={handleSubmit} className="px-4 pb-10" noValidate>
        <div className="flex justify-center mt-12 mb-15.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="تغییر تصویر پروفایل"
            className="relative w-36.75 h-36.75 rounded-full bg-[#f0f0f0] flex items-center justify-center"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="" width={147} height={147} className="w-full h-full object-cover rounded-full" />
            ) : (
              <UserIcon className="w-19.5 h-19.5 text-[#aeaeae]" />
            )}
            <span className="absolute bottom-0 left-2 w-10.25 h-10.25 rounded-full bg-[#010101] text-[#fafafa] flex items-center justify-center">
              <CameraIcon className="w-5 h-4.5" />
            </span>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={fieldBox}>
            <span className="sr-only">نام کامل</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={fieldInput}
              placeholder="نام و نام خانوادگی"
              disabled={isSubmitting}
              maxLength={100}
            />
          </label>

          <div>
            <label
              className={`${fieldBox} ${
                formData.username && !isUsernameValid ? '!border-danger' : formData.username && isUsernameValid ? '!border-success' : ''
              }`}
            >
              <span className="sr-only">نام کاربری</span>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`${fieldInput} text-left`}
                disabled={isSubmitting}
                required
                dir="ltr"
                placeholder="نام کاربری"
              />
            </label>
            {formData.username && usernameErrors.length > 0 && (
              <ul className="list-none m-0 mt-1.5 p-0">
                {usernameErrors.map((err, idx) => (
                  <li key={idx} className="text-danger text-xs">{err}</li>
                ))}
              </ul>
            )}
            {formData.username && isUsernameValid && (
              <p className="m-0 mt-1.5 text-success text-xs">نام کاربری معتبر است</p>
            )}
          </div>

          <label className={fieldBox}>
            <span className="sr-only">ایمیل</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`${fieldInput} text-left`}
              disabled={isSubmitting}
              required
              dir="ltr"
              placeholder="ایمیل"
            />
          </label>

          <button type="button" onClick={() => !isSubmitting && setIsCalendarOpen(true)} className={fieldBox}>
            <span className="flex-1 text-sm font-medium text-text-primary">
              {selectedBirthDate ? formatPersianDate(selectedBirthDate) : 'تاریخ تولد'}
            </span>
            <CalendarIcon />
          </button>
          {formData.birthDate && (
            <button type="button" onClick={clearBirthDate} disabled={isSubmitting} className="self-start text-xs text-danger">
              حذف تاریخ
            </button>
          )}

          <div className={fieldBox} role="radiogroup" aria-label="جنسیت">
            <span className="flex-1 text-sm font-medium text-text-primary">جنسیت</span>
            {[
              { v: 'male', l: 'مرد' },
              { v: 'female', l: 'زن' },
              { v: 'other', l: 'سایر' },
            ].map((g) => (
              <button
                key={g.v}
                type="button"
                role="radio"
                aria-checked={formData.gender === g.v}
                onClick={() => handleInputChange('gender', g.v)}
                disabled={isSubmitting}
                className={`h-8 px-3 rounded-full text-xs ${
                  formData.gender === g.v ? 'bg-accent-color text-on-accent' : 'border border-border-strong text-text-primary'
                }`}
              >
                {g.l}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setIsAddressModalOpen(true)} disabled={isSubmitting} className={fieldBox}>
            <span className="flex-1 text-sm font-medium text-text-primary truncate">
              {formData.addresses.length > 0 ? formData.addresses.join('، ') : 'آدرس‌ها'}
            </span>
            <LocationIcon />
          </button>

          <label className="block">
            <span className="sr-only">بیوگرافی</span>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="بیو"
              className="w-full h-34.75 px-5 py-4 rounded-xl border border-border-strong bg-bg-primary text-sm font-medium text-text-primary placeholder:text-text-primary outline-none resize-none"
              disabled={isSubmitting}
            />
          </label>
        </div>

        <div className="flex gap-5 mt-8">
          <Button type="submit" className="flex-1" disabled={isSubmitting || (!!formData.username && !isUsernameValid)}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={isSubmitting}>
            انصراف
          </Button>
        </div>
      </form>

      {/* Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        maxWidth={isMobile ? '90%' : '550px'}
      >
        <div className="p-5 rtl sm:p-4">
          <h3 className="text-lg font-semibold mb-4 text-center text-text-primary sm:text-base sm:mb-3">مدیریت آدرس‌ها</h3>
          
          <div className="w-full h-[250px] rounded-xl overflow-hidden mb-4 border border-border-color sm:h-[200px]">
            <MapComponent
              key={isAddressModalOpen ? 'open' : 'closed'}
              center={
                selectedLocation
                  ? [selectedLocation.lat, selectedLocation.lng]
                  : [35.6892, 51.3890]
              }
              zoom={12}
              onLocationSelect={handleLocationSelect}
            />
          </div>
          
          <div className="flex gap-2.5 mb-4">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="آدرس خود را وارد کنید..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddAddress()}
              className="flex-1 px-4 py-3 border border-border-color rounded-2xl text-sm outline-none transition-all bg-bg-primary text-text-primary text-right rtl focus:border-accent-color  sm:px-3.5 sm:py-2.5 sm:text-xs sm:rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddAddress}
              className="w-[46px] h-[46px] bg-accent-color text-on-accent border-none rounded-2xl cursor-pointer flex items-center justify-center transition-all hover:bg-accent-hover hover:scale-105 sm:w-[42px] sm:h-[42px]"
            >
              <PlusIcon />
            </button>
          </div>
          
          <div className="max-h-[250px] overflow-y-auto mb-4">
            {formData.addresses.length === 0 ? (
              <p className="text-center text-text-muted py-5 sm:py-4 sm:text-sm">هیچ آدرسی ثبت نشده است</p>
            ) : (
              formData.addresses.map((addr, idx) => (
                <div key={idx} className="flex justify-between items-center px-3 py-2.5 bg-bg-surface rounded-xl mb-2 break-words gap-2 text-right text-text-primary border border-border-color sm:px-2.5 sm:py-2 sm:text-sm">
                  <span>{addr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddress(idx)}
                    className="bg-none border-none cursor-pointer text-red-500 flex items-center flex-shrink-0 transition-all hover:text-red-600 hover:scale-110"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t border-border-color">
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(false)}
              className="px-6 py-2.5 bg-bg-surface border-none rounded-[40px] text-sm cursor-pointer text-text-primary transition-all hover:bg-bg-hover hover:-translate-y-px sm:px-5 sm:py-2 sm:text-xs"
            >
              بستن
            </button>
          </div>
        </div>
      </Modal>

      {/* تقویم تاریخ تولد در شیت مشکی فیگما */}
      <DateTimeSheet
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        initial={selectedBirthDate}
        title="تاریخ تولد"
        onConfirm={(d) => {
          handleDateSelect(d);
          setIsCalendarOpen(false);
        }}
      />
    </AppShell>
  );
}