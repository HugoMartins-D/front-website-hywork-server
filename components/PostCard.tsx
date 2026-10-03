'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageWithFallback from './ImageWithFallback';
import DropdownMenu from './DropdownMenu';
import AvatarWithStatus from './AvatarWithStatus';
import { toPersianNumber, formatPrice, formatRating } from '@/utils/numberUtils';

interface PostCardProps {
  id: number;
  title: string;
  price: number;
  images?: string[];
  rating?: number;
  sellerName?: string;
  sellerUsername?: string;
  sellerAvatar?: string;
  category?: string;
  stock?: number;
  description?: string;
  hideHeader?: boolean;
  compact?: boolean;
  sellerId?: number;
}

export default function PostCard({
  id,
  title,
  price,
  images = [],
  rating = 0,
  sellerName,
  sellerUsername,
  sellerAvatar,
  category,
  stock = 0,
  description,
  hideHeader = false,
  compact = false,
  sellerId,
}: PostCardProps) {
  const router = useRouter();
  const getDisplayImage = () => {
    if (images && Array.isArray(images) && images.length > 0) return images[0];
    return '/images/posts/placeholder.svg';
  };

  const displayImage = getDisplayImage();
  const formattedPrice = formatPrice(price);
  const formattedRating = formatRating(rating);
  const formattedStock = toPersianNumber(stock || 0);
  const isService = category === 'خدمات';

  const truncateTitle = (text: string, maxLength = compact ? 30 : 35) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + '...';
  };

  const truncateDescription = (text?: string, maxLength = 70) => {
    if (!text) return 'توضیحاتی برای این محصول موجود نیست.';
    return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + '...';
  };

  const handleReport = () => alert(`گزارش محصول "${title}" با موفقیت ثبت شد`);
  const handleShare = () => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    alert('لینک محصول کپی شد');
  };
  const handleSave = () => alert(`محصول "${title}" در لیست ذخیره شده‌ها قرار گرفت`);
  const handleViewSeller = () => {
    if (sellerUsername && sellerUsername !== 'unknown') {
      router.push(`/profile?user=${sellerUsername}`);
    } else if (sellerId) {
      router.push(`/profile?user=${sellerId}`);
    } else {
      alert('اطلاعات فروشنده در دسترس نیست');
    }
  };

  const dropdownItems = [
    { label: 'مشاهده فروشنده', icon: '👤', onClick: handleViewSeller },
    { label: 'ذخیره', icon: '🔖', onClick: handleSave },
    { label: 'اشتراک گذاری', icon: '📤', onClick: handleShare },
    { label: 'گزارش', icon: '🚫', onClick: handleReport },
  ];

  // حالت فشرده (compact) - خانه‌ی شبکه‌ی سه‌ستونه‌ی فیگما (نتایج جستجو، پروفایل)
  // تصویر مربعی، زیرش ۷۲ پیکسل سفید: عنوان ۱۰/۳۰۰، دسته ۶/۳۰۰ خاکستری، موجودی ۶/۴۰۰ قرمز، قیمت ۱۰/۴۰۰
  if (compact) {
    const lowStock = stock > 0 && stock <= 5;
    return (
      <div className="bg-bg-card overflow-hidden cursor-pointer relative">
        <div className="relative aspect-square overflow-hidden bg-placeholder">
          <ImageWithFallback
            src={displayImage}
            alt={title}
            fallbackSrc="/images/posts/placeholder.svg"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative h-18 px-1.5 pt-px text-right">
          <h3 className="m-0 text-[10px] font-light leading-3 text-text-primary line-clamp-2" title={title}>
            {title}
          </h3>
          {category && <p className="m-0 mt-px text-[6px] font-light leading-2 text-[#8d8d8d]">{category}</p>}
          {stock === 0 ? (
            <p className="m-0 text-[6px] leading-2 text-danger">ناموجود</p>
          ) : lowStock ? (
            <p className="m-0 text-[6px] leading-2 text-danger">{formattedStock} عدد موجود</p>
          ) : null}
          <div className="absolute bottom-2 inset-x-1.5 flex items-end justify-between">
            <span className="text-[10px] leading-3 text-text-primary">{formattedPrice}</span>
            {rating > 0 && (
              <span className="flex items-center gap-px text-[4px] leading-none text-text-primary">
                <svg viewBox="0 0 24 24" className="w-2 h-2" fill="currentColor" aria-hidden>
                  <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
                </svg>
                {formattedRating}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // حالت کامل (پیش‌فرض)
  return (
    <div className="bg-(--color-bg-card) overflow-hidden cursor-pointer relative ">
      {!hideHeader && (
        <div className="flex justify-between items-center px-3 py-2.5 bg-(--color-bg-card) border-b border-(--color-border-light) relative">
          <Link
            href={sellerUsername && sellerUsername !== 'unknown' ? `/profile?user=${sellerUsername}` : sellerId ? `/profile?user=${sellerId}` : '/profile'}
            className="no-underline flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <AvatarWithStatus
                src={sellerAvatar || '/images/avatars/default.png'}
                alt={sellerName || sellerUsername || 'کاربر'}
                size={32}
                status="online"
                showStatus={true}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-(--color-text-primary) line-clamp-1">
                  {sellerName || sellerUsername || 'نامشخص'}
                </span>
                <span className="text-[10px] text-(--color-text-muted) line-clamp-1">
                  @{sellerUsername || 'unknown'}
                </span>
              </div>
            </div>
          </Link>
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu items={dropdownItems} iconSize={20} />
          </div>
        </div>
      )}

      <div className="relative aspect-square overflow-hidden bg-(--color-bg-surface)">
        <ImageWithFallback
          src={displayImage}
          alt={title}
          fallbackSrc="/images/posts/placeholder.svg"
          className="w-full h-full object-cover"
        />
        {isService && (
          <span className="absolute top-2 right-2 bg-green-500 text-white px-2.5 py-1 text-[11px] font-medium z-[2] rounded-full">
            خدمات
          </span>
        )}
        {stock === 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2.5 py-1 text-[11px] font-medium z-[2] rounded-full">
            ناموجود
          </span>
        )}
      </div>

      <div className="p-3 pb-3">
        <h3
          className="text-sm font-semibold m-0 mb-1.5 text-(--color-text-primary) leading-tight truncate"
          title={title}
        >
          {truncateTitle(title)}
        </h3>
        <p
          className="text-xs leading-relaxed text-(--color-text-secondary) m-0 mb-3 line-clamp-2 min-h-[36px]"
          title={description}
        >
          {truncateDescription(description)}
        </p>
        <div className="flex items-center mb-1.5 w-full justify-between">
          <div />
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-(--color-text-muted)">موجودی</span>
            <span className="font-medium">{formattedStock} عدد</span>
          </div>
          {rating > 0 && (
            <div className="flex items-center px-1.5">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden>
                <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
              </svg>
              <span className="text-[11px] font-semibold text-text-primary">{formattedRating}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end">
          <div className="text-[15px] font-bold text-(--color-accent-color)">
            {formattedPrice} تومان
          </div>
        </div>
      </div>
    </div>
  );
}