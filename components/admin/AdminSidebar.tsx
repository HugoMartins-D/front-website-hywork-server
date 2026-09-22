'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function AdminSidebar({ isOpen = true, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { path: '/admin/dashboard', label: 'داشبورد', icon: '📊' },
    { path: '/admin/postmanagments', label: 'محصولات', icon: '📦' },
    { path: '/admin/usersmanagement', label: 'کاربران', icon: '👥' },
    { path: '/admin/orders', label: 'سفارشات', icon: '🛒' },
    { path: '/admin/chats', label: 'چت‌ها', icon: '💬' },
    { path: '/admin/settings', label: 'تنظیمات', icon: '⚙️' },
  ];

  return (
    <>
      {/* سایدبار */}
      <aside 
        className={`fixed start-0 top-0 h-full w-[260px] bg-(--color-bg-secondary) border-e border-(--color-border-color) overflow-y-auto z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-(--color-border-color)">
          <Link href="/admin/dashboard" className="flex items-center gap-2 no-underline">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-bold text-(--color-text-primary)">پنل مدیریت</span>
          </Link>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
                    pathname === item.path
                      ? 'bg-blue-500/15 text-blue-500'
                      : 'text-(--color-text-secondary) hover:bg-(--color-bg-surface) hover:text-(--color-text-primary)'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* دکمه همبرگر */}
      <button
        onClick={onToggle}
        className="fixed top-4 right-4 z-[60] md:hidden p-2 bg-(--color-bg-card) rounded-lg border border-(--color-border-color) text-(--color-text-primary)"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}