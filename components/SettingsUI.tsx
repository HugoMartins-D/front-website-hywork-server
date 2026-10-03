// components/SettingsUI.tsx
'use client';

import { useCallback, useSyncExternalStore, type ReactNode } from 'react';

// اجزای مشترک صفحه‌های تنظیمات فیگما (Setting، Notifications، Insights، Device permissions و ...)

export const SETTINGS_ITEMS: { href: string; label: string }[] = [
  { href: '/profile/edit', label: 'تنظیمات پروفایل' },
  { href: '/status', label: 'وضعیت من' },
  { href: '/notifications', label: 'صندوق اعلان‌ها' },
  { href: '/settings/locations', label: 'مکان‌ها' },
  { href: '/wallet', label: 'کیف پول' },
  { href: '/team', label: 'تیم' },
  { href: '/settings/saved', label: 'ذخیره‌شده‌ها' },
  { href: '/settings/notifications', label: 'اعلان‌ها' },
  { href: '/settings/trending', label: 'پرطرفدارها' },
  { href: '/settings/insights', label: 'آمار و تحلیل' },
  { href: '/settings/archive', label: 'محتوای زمان‌بندی‌شده' },
  { href: '/settings/blocked', label: 'مسدودشده‌ها' },
  { href: '/settings/language', label: 'زبان' },
  { href: '/settings/permissions', label: 'دسترسی‌های دستگاه' },
  { href: '/settings/accessibility', label: 'دسترس‌پذیری' },
];

export const RowChevron = () => (
  <svg viewBox="0 0 24 24" className="w-2 h-2 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
    <path d="m15 5-7 7 7 7" />
  </svg>
);

// ==================== ترجیحات محلی ====================
// تا وقتی API تنظیمات آماده نیست، انتخاب‌ها فقط در مرورگر همین کاربر ذخیره می‌شوند

const PREFS_KEY = 'settings_prefs';
const listeners = new Set<() => void>();

const readPrefs = (): Record<string, boolean> => {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
  } catch {
    return {};
  }
};

let cache: string | null = null;
const snapshot = () => {
  try {
    cache = localStorage.getItem(PREFS_KEY) || '{}';
  } catch {
    cache = '{}';
  }
  return cache;
};

export function usePref(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  const subscribe = useCallback((cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }, []);
  const raw = useSyncExternalStore(subscribe, snapshot, () => '{}');
  const prefs = JSON.parse(raw) as Record<string, boolean>;
  const value = key in prefs ? prefs[key] : fallback;
  const set = (v: boolean) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ ...readPrefs(), [key]: v }));
    } catch {
      // در حالت خصوصی مرورگر ذخیره نمی‌شود؛ مقدار فقط در همین نما تغییر نمی‌کند
    }
    listeners.forEach((l) => l());
  };
  return [value, set];
}

// ردیف تیک‌دار فیگما: متن ۱۴/۴۰۰ سمت راست، دایره‌ی ۱۴ پیکسلی سمت چپ (پر = روشن)
export function PrefRow({ prefKey, label, defaultOn = true }: { prefKey: string; label: string; defaultOn?: boolean }) {
  const [on, setOn] = usePref(prefKey, defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn(!on)}
      className="w-full h-9 flex items-center justify-between text-sm text-text-primary"
    >
      <span>{label}</span>
      <span className="w-3.5 h-3.5 rounded-full border border-border-strong flex items-center justify-center">
        {on && <span className="w-3 h-3 rounded-full bg-accent-color" />}
      </span>
    </button>
  );
}

export function PrefGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-2">
      <h2 className="m-0 h-9 flex items-center text-sm font-semibold text-text-primary">{title}</h2>
      {children}
    </section>
  );
}
