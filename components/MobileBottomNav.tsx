'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserContext } from '@/contexts/UserContext';
import { HomeIcon, CartIcon, PlusIcon, SearchIcon, UserIcon } from '@/components/icons';

// ==================== کامپوننت اصلی ====================
// نوار پایین فیگما: ۵۶ پیکسل، سفید، خط بالای مشکی، فقط آیکون (بدون برچسب)

interface MobileBottomNavProps {
  suppressActiveProfile?: boolean;
  cartCount?: number;
}

// رنگ حلقه‌ی آواتار بر اساس وضعیت کاربر
export const statusRingColor = (status?: string) => {
  switch (status) {
    case 'ready':
    case 'active':
      return 'var(--color-online)';
    case 'busy':
      return 'var(--color-danger)';
    default:
      return 'var(--color-text-muted)';
  }
};

export default function MobileBottomNav({
  suppressActiveProfile = false,
  cartCount = 0,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { user } = useContext(UserContext);

  const isActive = (path: string) => pathname === path;
  const profileActive = !suppressActiveProfile && isActive('/profile');

  const iconLink = (path: string, label: string, icon: React.ReactNode, badge?: number) => (
    <Link
      href={path}
      aria-label={label}
      aria-current={isActive(path) ? 'page' : undefined}
      className="relative flex items-center justify-center w-11 h-11 text-text-primary"
    >
      {icon}
      {badge ? (
        <span className="absolute top-2 left-2 min-w-2.5 h-2.5 px-0.5 rounded-full bg-danger text-white text-[5px] font-semibold leading-2.5 text-center">
          {badge > 9 ? '+9' : badge}
        </span>
      ) : null}
    </Link>
  );

  const iconClass = (path: string) =>
    `w-5 h-5 ${isActive(path) ? 'stroke-[2.6]' : ''}`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-14 bg-bg-primary border-t border-border-strong flex justify-around items-center px-4 z-1100">
      {iconLink('/', 'خانه', <HomeIcon className={iconClass('/')} />)}
      {iconLink('/cart', 'سبد خرید', <CartIcon className={iconClass('/cart')} />, cartCount)}
      {iconLink('/create-post', 'ساخت پست', <PlusIcon className={iconClass('/create-post')} />)}
      {iconLink('/search', 'جستجو', <SearchIcon className={iconClass('/search')} />)}
      <Link
        href="/profile"
        aria-label="پروفایل"
        aria-current={profileActive ? 'page' : undefined}
        className="flex items-center justify-center w-11 h-11"
      >
        <span
          className="relative w-6.25 h-6.25 rounded-full overflow-hidden bg-placeholder flex items-center justify-center"
          style={{ boxShadow: `0 0 0 2px ${statusRingColor(user?.status)}` }}
        >
          {user?.avatar ? (
            <Image src={user.avatar} alt="" fill sizes="25px" className="object-cover" />
          ) : (
            <UserIcon className="w-4 h-4 text-text-secondary" />
          )}
        </span>
      </Link>
    </nav>
  );
}
