'use client';

import { useState, useContext } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { UserContext } from '@/contexts/UserContext';
import BottomSheet, { SheetActions } from '@/components/BottomSheet';
import { statusRingColor } from '@/components/MobileBottomNav';
import {
  HomeIcon,
  SearchIcon,
  MessageIcon,
  CartIcon,
  PlusIcon,
  DashboardIcon,
  LogoutIcon,
  UserIcon,
} from '@/components/icons';

// ==================== کامپوننت اصلی سایدبار ====================
// نوار آیکونی فیگما در دسکتاپ: ۸۵ پیکسل، چسبیده به راست، خط ۰٫۵ پیکسلی مشکی،
// لوگو بالا، آیکون‌ها با فاصله‌ی ثابت، داشبورد و خروج پایین

interface SidebarProps {
  disableHover?: boolean;
  suppressActiveProfile?: boolean;
}

interface MenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menuItems: MenuItem[] = [
  { name: 'خانه', path: '/', icon: HomeIcon },
  { name: 'جستجو', path: '/search', icon: SearchIcon },
  { name: 'پیام‌ها', path: '/messages', icon: MessageIcon },
  { name: 'سبد خرید', path: '/cart', icon: CartIcon },
  { name: 'ساخت پست', path: '/create-post', icon: PlusIcon },
];

export default function Sidebar({ suppressActiveProfile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
    setShowLogout(false);
  };

  const itemClass = (active: boolean) =>
    `flex items-center justify-center w-11 h-11 rounded-full text-text-primary transition-colors hover:bg-bg-surface ${
      active ? 'bg-bg-surface' : ''
    }`;

  const profileActive = !suppressActiveProfile && pathname === '/profile';

  return (
    <>
      <aside className="fixed right-0 top-0 h-screen w-21.25 bg-bg-primary border-l-[0.5px] border-border-strong z-1000 flex flex-col items-center pt-4.75 pb-8">
        <Link href="/" aria-label="خانه" className="block w-9.5 h-9.5 relative mb-10">
          <Image src="/images/brand/logo.png" alt="Hywork" fill sizes="38px" className="object-contain dark:invert" />
        </Link>

        <nav className="flex flex-col items-center gap-7">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                title={item.name}
                aria-label={item.name}
                aria-current={active ? 'page' : undefined}
                className={itemClass(active)}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
          <Link
            href="/profile"
            title="پروفایل"
            aria-label="پروفایل"
            aria-current={profileActive ? 'page' : undefined}
            className="flex items-center justify-center w-11 h-11"
          >
            <span
              className="relative w-8.75 h-8.75 rounded-full overflow-hidden bg-placeholder flex items-center justify-center"
              style={{ boxShadow: `0 0 0 2px ${statusRingColor(user?.status)}` }}
            >
              {user?.avatar ? (
                <Image src={user.avatar} alt="" fill sizes="35px" className="object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-text-secondary" />
              )}
            </span>
          </Link>
        </nav>

        <div className="mt-auto flex flex-col items-center gap-7">
          <Link href="/dashboard" title="داشبورد" aria-label="داشبورد" className={itemClass(pathname === '/dashboard')}>
            <DashboardIcon className="w-5 h-5" />
          </Link>
          <button type="button" title="خروج" aria-label="خروج" onClick={() => setShowLogout(true)} className={itemClass(false)}>
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </aside>

      <BottomSheet
        open={showLogout}
        onClose={() => setShowLogout(false)}
        title="خروج از حساب کاربری"
        footer={<SheetActions onCancel={() => setShowLogout(false)} onConfirm={handleLogout} confirmLabel="خروج" />}
      >
        <p className="text-sm text-white/60 text-right">آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟</p>
      </BottomSheet>
    </>
  );
}
