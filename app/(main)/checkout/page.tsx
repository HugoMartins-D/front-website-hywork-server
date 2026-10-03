// src/app/(main)/checkout/page.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import BottomSheet, { SheetActions } from '@/components/BottomSheet';
import { Button, TextField, RadioDot } from '@/components/FormControls';
import { toPersianNumber, formatPrice } from '@/utils/numberUtils';
import { useToast } from '@/components/NotificationToast';

// ============================================
// ثابت‌های برنامه
// ============================================

/** روش‌های ارسال */
const SHIPPING_METHODS = {
  POST: 'post',
  COURIER: 'courier',
  PICKUP: 'pickup',
} as const;

/** روش‌های پرداخت */
const PAYMENT_METHODS = {
  ONLINE: 'online',
  CASH: 'cash',
} as const;

/** هزینه‌های ارسال */
const SHIPPING_COSTS: Record<string, number> = {
  [SHIPPING_METHODS.POST]: 50000,
  [SHIPPING_METHODS.COURIER]: 80000,
  [SHIPPING_METHODS.PICKUP]: 0,
};

/** الگوی شماره موبایل */
const PHONE_REGEX = /^09[0-9]{9}$/;

/** الگوی ایمیل */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================
// هوک‌های سفارشی - استاندارد React 19
// ============================================


// ============================================
// تعریف نوع‌های داده
// ============================================

/** آیتم سبد خرید */
interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

/** اطلاعات فرم */
interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
}

/** گزینه‌های روش ارسال */
interface ShippingOption {
  id: string;
  label: string;
  price: number;
  desc: string;
  icon: React.ComponentType;
}

/** گزینه‌های روش پرداخت */
interface PaymentOption {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType;
}

// ============================================
// آیکون‌های SVG
// ============================================

const LightningFilledIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const HouseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const MotorcycleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 16a2 2 0 100-4 2 2 0 000 4zM20 16a2 2 0 100-4 2 2 0 000 4z" />
    <path d="M4 14h12M17 8h3l3 4-3 2M9 8l3-3h3l3 4" />
    <path d="M6 14l-3-3h9l-3-3" />
  </svg>
);

// ============================================
// کامپوننت‌های زیرمجموعه
// ============================================

// استان‌های برگه‌ی انتخاب استان در فیگما (map / Address)
const PROVINCES = [
  'تهران', 'خراسان رضوی', 'اصفهان', 'البرز', 'فارس', 'آذربایجان شرقی', 'قم', 'خوزستان',
  'کرمانشاه', 'آذربایجان غربی', 'گیلان', 'زنجان', 'مازندران', 'کرمان', 'یزد', 'همدان',
];

// بانک‌های صفحه‌ی پرداخت فیگما
const BANKS = [
  { id: 'melli', name: 'بانک ملی', logo: '/images/brand/bank-melli.png', size: 64 },
  { id: 'mellat', name: 'بانک ملت', logo: '/images/brand/bank-mellat.png', size: 34 },
  { id: 'saman', name: 'بانک سامان', logo: '/images/brand/bank-saman.png', size: 56 },
];

// ردیف انتخابی فیگما: ۷۶ پیکسل، گوشه‌ی ۱۰، خط #d8d8d8، رادیو سمت راست
const ChoiceRow = ({
  selected,
  onSelect,
  title,
  desc,
  end,
}: {
  selected: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  desc?: React.ReactNode;
  end?: React.ReactNode;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={`w-full min-h-19 flex items-center gap-4 px-4 rounded-[10px] border text-right ${
      selected ? 'border-border-strong' : 'border-[#d8d8d8]'
    }`}
  >
    <RadioDot checked={selected} />
    <span className="flex-1 min-w-0">
      <span className="block text-base text-text-primary">{title}</span>
      {desc && <span className="block text-xs text-text-secondary mt-0.5">{desc}</span>}
    </span>
    {end}
  </button>
);

// ============================================
// کامپوننت اصلی
// ============================================

/**
 * صفحه تکمیل سفارش
 * 
 * روند کار:
 * 1. نمایش اطلاعات سبد خرید
 * 2. دریافت اطلاعات شخصی کاربر
 * 3. انتخاب روش ارسال
 * 4. انتخاب روش پرداخت
 * 5. اعتبارسنجی و ثبت سفارش
 * 6. هدایت به صفحه موفقیت
 */
export default function CheckoutPage() {
  // ============================================
  // هوک‌های ری‌اکت
  // ============================================
  const router = useRouter();
  const { success, error } = useToast();
  

  // ============================================
  // وضعیت‌های کامپوننت
  // ============================================

  // داده‌های نمونه - در آینده از Context یا API دریافت می‌شود
  const [cartItems] = useState<CartItem[]>([
    {
      id: 1,
      title: 'هدفون بی‌سیم سونی',
      price: 3250000,
      quantity: 1,
      image: '/images/posts/1.jpg',
    },
    {
      id: 2,
      title: 'بلیت دورهمی آنلاین',
      price: 89000,
      quantity: 2,
      image: '/images/posts/2.jpg',
    },
  ]);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
  });

  const [shippingMethod, setShippingMethod] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bank, setBank] = useState<string>(BANKS[1].id);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [provinceQuery, setProvinceQuery] = useState('');
  const [pendingProvince, setPendingProvince] = useState('');

  // ============================================
  // محاسبات
  // ============================================

  /** محاسبه مجموع قیمت */
  const totalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  /** محاسبه مجموع با هزینه ارسال */
  const getTotalWithShipping = useCallback(() => {
    return totalPrice + (SHIPPING_COSTS[shippingMethod] || 0);
  }, [totalPrice, shippingMethod]);

  // ============================================
  // گزینه‌های روش ارسال
  // ============================================
  const shippingOptions: ShippingOption[] = useMemo(() => [
    {
      id: SHIPPING_METHODS.POST,
      label: 'پست پیشتاز',
      price: SHIPPING_COSTS[SHIPPING_METHODS.POST],
      desc: 'زمان تحویل ۲ تا ۵ روز کاری',
      icon: LightningFilledIcon,
    },
    {
      id: SHIPPING_METHODS.COURIER,
      label: 'پیک موتوری',
      price: SHIPPING_COSTS[SHIPPING_METHODS.COURIER],
      desc: 'زمان تحویل ۱ روز کاری',
      icon: MotorcycleIcon,
    },
    {
      id: SHIPPING_METHODS.PICKUP,
      label: 'تحویل حضوری',
      price: SHIPPING_COSTS[SHIPPING_METHODS.PICKUP],
      desc: 'تهران، شعبه مرکزی',
      icon: BuildingIcon,
    },
  ], []);

  /** گزینه‌های روش پرداخت */
  const paymentOptions: PaymentOption[] = useMemo(() => [
    {
      id: PAYMENT_METHODS.ONLINE,
      label: 'پرداخت آنلاین',
      desc: 'اتصال به درگاه بانکی',
      icon: CreditCardIcon,
    },
    {
      id: PAYMENT_METHODS.CASH,
      label: 'پرداخت در محل',
      desc: 'پرداخت هنگام تحویل',
      icon: HouseIcon,
    },
  ], []);

  // ============================================
  // توابع
  // ============================================

  /**
   * مدیریت تغییرات فرم
   */
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    console.log('📝 تغییر فیلد فرم:', { name, value });

    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // پاک کردن خطای مربوط به فیلد
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  /**
   * انتخاب روش ارسال
   */
  const handleShippingSelect = useCallback((method: string) => {
    console.log('🚚 انتخاب روش ارسال:', { method });
    setShippingMethod(shippingMethod === method ? '' : method);
  }, [shippingMethod]);

  /**
   * انتخاب روش پرداخت
   */
  const handlePaymentSelect = useCallback((method: string) => {
    console.log('💳 انتخاب روش پرداخت:', { method });
    setPaymentMethod(paymentMethod === method ? '' : method);
  }, [paymentMethod]);

  /**
   * اعتبارسنجی فرم
   */
  const validate = useCallback((): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    // اعتبارسنجی نام
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'نام و نام خانوادگی الزامی است';
    }

    // اعتبارسنجی شماره تماس
    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره تماس الزامی است';
    } else if (!PHONE_REGEX.test(formData.phone)) {
      newErrors.phone = 'شماره تماس معتبر نیست (مثال: 09123456789)';
    }

    // اعتبارسنجی آدرس
    if (!formData.address.trim()) {
      newErrors.address = 'آدرس الزامی است';
    }

    // اعتبارسنجی ایمیل (اختیاری)
    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'ایمیل معتبر نیست';
    }

    console.log('✅ نتیجه اعتبارسنجی:', {
      hasErrors: Object.keys(newErrors).length > 0,
      errors: newErrors,
    });

    return newErrors;
  }, [formData]);

  /**
   * ثبت سفارش
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📋 شروع ثبت سفارش');

    // اعتبارسنجی
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      error('لطفاً اطلاعات را کامل کنید');
      return;
    }

    // بررسی انتخاب روش ارسال
    if (!shippingMethod) {
      error('لطفاً روش ارسال را انتخاب کنید');
      return;
    }

    // بررسی انتخاب روش پرداخت
    if (!paymentMethod) {
      error('لطفاً روش پرداخت را انتخاب کنید');
      return;
    }

    setIsSubmitting(true);

    try {
      // شبیه‌سازی ارسال به سرور
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const orderNumber = Math.floor(100000 + Math.random() * 900000);
      const orderTotal = getTotalWithShipping();

      // لاگ اطلاعات سفارش
      console.log('✅ سفارش ثبت شد:', {
        orderNumber,
        total: orderTotal,
        customer: {
          name: formData.fullName,
          phone: formData.phone,
          email: formData.email,
        },
        address: {
          city: formData.city,
          address: formData.address,
          postalCode: formData.postalCode,
        },
        shippingMethod,
        paymentMethod,
        items: cartItems,
        subtotal: totalPrice,
        shippingCost: SHIPPING_COSTS[shippingMethod] || 0,
      });

      success('سفارش شما با موفقیت ثبت شد');

      // هدایت به صفحه موفقیت
      router.push(`/order-success?order=${orderNumber}&total=${orderTotal}`);

    } catch (err) {
      console.error('❌ خطا در ثبت سفارش:', err);
      error('خطا در ثبت سفارش. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, shippingMethod, paymentMethod, getTotalWithShipping, formData, cartItems, totalPrice, router, success, error]);

  // ============================================
  // رندر
  // ============================================

  // اگر سبد خرید خالی است
  if (cartItems.length === 0) {
    return (
      <AppShell>
        <PageHeader title="اطلاعات سفارش" />
        <div className="text-center py-16 px-4">
          <h2 className="text-lg font-medium text-text-primary mb-5">سبد خرید شما خالی است</h2>
          <Button size="md" onClick={() => router.push('/')}>بازگشت به فروشگاه</Button>
        </div>
      </AppShell>
    );
  }

  const filteredProvinces = PROVINCES.filter((p) => p.includes(provinceQuery.trim()));

  // فیگما (invioce customer / Address / Payment): سربرگ مشکی با مبلغ قابل پرداخت، اقلام،
  // فرم آدرس با فیلدهای ۵۶ پیکسلی، روش ارسال و پرداخت با ردیف‌های رادیویی، جمع کل و دکمه‌ی پرداخت
  return (
    <AppShell>
      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-black text-white min-h-57.75">
          <PageHeader title="اطلاعات سفارش" inverted />
          <div className="px-4 pt-2 text-center">
            <div className="text-[60px] font-semibold leading-18">{formatPrice(getTotalWithShipping())}</div>
            <div className="text-sm text-[#b7b7b7]">مبلغ قابل پرداخت (تومان)</div>
          </div>
        </div>

        <div className="px-4">
          <ul className="list-none m-0 mt-12 p-0 flex flex-col gap-5">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center gap-6">
                <div className="relative w-25 h-25 rounded-lg overflow-hidden shrink-0 bg-placeholder">
                  <Image src={item.image} alt={item.title} fill sizes="100px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg text-text-primary leading-5.5">{item.title}</div>
                  <div className="mt-2 text-sm text-text-secondary">
                    {toPersianNumber(item.quantity)} × {formatPrice(item.price)}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="m-0 mt-12 mb-5 text-lg font-medium text-text-primary">آدرس</h2>
          <div className="flex flex-col gap-3">
            <TextField name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="نام و نام خانوادگی" error={errors.fullName} aria-invalid={!!errors.fullName} />
            <TextField name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="شماره تماس" error={errors.phone} aria-invalid={!!errors.phone} />
            <TextField name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ایمیل (اختیاری)" error={errors.email} aria-invalid={!!errors.email} />
            <button
              type="button"
              onClick={() => setProvinceOpen(true)}
              className="w-full h-14 flex items-center gap-3 px-4 rounded-xl border border-border-strong text-right"
            >
              <span className={`flex-1 text-base ${formData.city ? 'text-text-primary' : 'text-text-muted'}`}>
                {formData.city || 'استان / شهر'}
              </span>
              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="m15 5-7 7 7 7" />
              </svg>
            </button>
            <label className="block">
              <span className="sr-only">آدرس دقیق</span>
              <textarea
                name="address"
                value={formData.address}
                onChange={(e) => handleInputChange(e as unknown as React.ChangeEvent<HTMLInputElement>)}
                placeholder="آدرس دقیق"
                aria-invalid={!!errors.address}
                className={`w-full h-26 p-4 rounded-xl border ${errors.address ? 'border-danger' : 'border-border-strong'} bg-bg-primary text-base text-text-primary placeholder:text-text-muted outline-none resize-none focus:border-2`}
              />
              {errors.address && <span className="block mt-1.5 text-xs text-danger">{errors.address}</span>}
            </label>
            <TextField name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="کد پستی (اختیاری)" />
          </div>

          <h2 className="m-0 mt-12 mb-5 text-lg font-medium text-text-primary">روش ارسال</h2>
          <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="روش ارسال">
            {shippingOptions.map((option) => (
              <ChoiceRow
                key={option.id}
                selected={shippingMethod === option.id}
                onSelect={() => handleShippingSelect(option.id)}
                title={option.label}
                desc={option.desc}
                end={<span className="text-sm text-text-primary whitespace-nowrap">{option.price === 0 ? 'رایگان' : formatPrice(option.price)}</span>}
              />
            ))}
          </div>

          <h2 className="m-0 mt-12 mb-5 text-lg font-medium text-text-primary">پرداخت</h2>
          <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="روش پرداخت">
            {paymentOptions.map((option) => (
              <ChoiceRow
                key={option.id}
                selected={paymentMethod === option.id}
                onSelect={() => handlePaymentSelect(option.id)}
                title={option.label}
                desc={option.desc}
              />
            ))}
          </div>

          {paymentMethod === PAYMENT_METHODS.ONLINE && (
            <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="انتخاب بانک">
              {BANKS.map((b) => (
                <ChoiceRow
                  key={b.id}
                  selected={bank === b.id}
                  onSelect={() => setBank(b.id)}
                  title={b.name}
                  end={
                    <span className="w-16 h-16 flex items-center justify-center shrink-0">
                      <Image src={b.logo} alt="" width={b.size} height={b.size} className="object-contain" />
                    </span>
                  }
                />
              ))}
            </div>
          )}

          <div className="mt-12 h-15.5 flex items-center justify-between px-5 rounded-[10px] border border-border-strong">
            <span className="text-sm font-medium text-text-primary">مجموع</span>
            <span className="text-2xl text-text-primary">{formatPrice(getTotalWithShipping())}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-10 mb-10 w-full h-15.5 rounded-[10px] bg-accent-color text-on-accent text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'در حال ثبت سفارش...' : 'تأیید و پرداخت'}
          </button>
        </div>
      </form>

      <BottomSheet
        open={provinceOpen}
        onClose={() => setProvinceOpen(false)}
        title={<span className="text-xl font-bold">استان</span>}
        footer={
          <SheetActions
            onCancel={() => setProvinceOpen(false)}
            onConfirm={() => {
              if (pendingProvince) setFormData((prev) => ({ ...prev, city: pendingProvince }));
              setProvinceOpen(false);
            }}
          />
        }
      >
        <input
          value={provinceQuery}
          onChange={(e) => setProvinceQuery(e.target.value)}
          aria-label="جستجوی استان"
          className="w-full h-14 px-4 rounded-[10px] bg-white text-black text-base outline-none mb-3"
        />
        <ul className="list-none m-0 p-0" role="listbox" aria-label="استان‌ها">
          {filteredProvinces.map((p) => (
            <li key={p}>
              <button
                type="button"
                role="option"
                aria-selected={pendingProvince === p}
                onClick={() => setPendingProvince(p)}
                className={`w-full h-10 text-right text-lg ${pendingProvince === p ? 'text-white font-semibold' : 'text-white/70'}`}
              >
                {p}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </AppShell>
  );
}

// ============================================
// تنظیمات خروجی
// ============================================

/** جلوگیری از کش استاتیک Next.js */
export const dynamic = 'force-dynamic';