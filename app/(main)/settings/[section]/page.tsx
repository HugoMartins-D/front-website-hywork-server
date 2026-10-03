'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import PostCard from '@/components/PostCard';
import { PrefGroup, PrefRow, RowChevron } from '@/components/SettingsUI';
import { SearchIcon, LocationIcon } from '@/components/icons';
import { useTheme } from '@/contexts/ThemeContext';
import { fetchAllPosts, fetchAllUsers } from '@/services/postService';
import { toPersianNumber } from '@/utils/numberUtils';
import type { Post } from '@/types';

// زیرصفحه‌های تنظیمات فیگما (صفحه‌ی login در فایل): هر بخش با هدر ۲۴/۴۰۰ و فهرست‌های ۱۴/۴۰۰

const TITLES: Record<string, string> = {
  locations: 'مکان‌ها',
  saved: 'ذخیره‌شده‌ها',
  notifications: 'اعلان‌ها',
  trending: 'پرطرفدارها',
  insights: 'آمار و تحلیل',
  archive: 'آرشیو',
  blocked: 'مسدودشده‌ها',
  language: 'زبان',
  permissions: 'دسترسی‌های دستگاه',
  accessibility: 'دسترس‌پذیری',
};

// جستجوی کپسولی صفحه‌های تنظیمات: ۴۰۸×۵۰، گوشه‌ی ۳۹، خط مشکی
function PillSearch({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="relative mb-6">
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="w-full h-12.5 rounded-[39px] border border-border-strong bg-bg-primary ps-5 pe-12 text-sm text-text-primary outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      <SearchIcon className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 w-5.5 h-5.5 text-[#1e1e1e]" />
    </div>
  );
}

function PostsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid grid-cols-3 gap-px">
      {posts.map((post) => (
        <Link key={post.id} href={`/post/${post.id}`} className="block min-w-0 text-text-primary hover:text-text-primary">
          <PostCard compact id={post.id} title={post.title} price={post.price} stock={post.stock} category={post.category} rating={post.rating} images={post.images || (post.image ? [post.image] : [])} />
        </Link>
      ))}
    </div>
  );
}

function Notifications() {
  return (
    <div className="px-4">
      <PrefGroup title="اعلان‌های فعالیت">
        <PrefRow prefKey="n_comments" label="نظرها و پاسخ‌ها" />
        <PrefRow prefKey="n_messages" label="پیام‌های جدید" defaultOn={false} />
        <PrefRow prefKey="n_likes" label="پسندها و واکنش‌ها" />
        <PrefRow prefKey="n_orders" label="به‌روزرسانی سفارش و رزرو" />
        <PrefRow prefKey="n_reviews" label="نقدها و امتیازها" defaultOn={false} />
      </PrefGroup>
      <PrefGroup title="اعلان‌های تبلیغاتی">
        <PrefRow prefKey="n_promos" label="پیشنهادها و تخفیف‌ها" />
        <PrefRow prefKey="n_news" label="اخبار و به‌روزرسانی‌ها" defaultOn={false} />
        <PrefRow prefKey="n_followed" label="از کاربران دنبال‌شده" defaultOn={false} />
      </PrefGroup>
      <PrefGroup title="اعلان‌های سیستم و یادآوری">
        <PrefRow prefKey="n_reminders" label="یادآوری‌ها" />
        <PrefRow prefKey="n_system" label="هشدارهای سیستم" />
        <PrefRow prefKey="n_email" label="اعلان‌های ایمیلی" />
      </PrefGroup>
    </div>
  );
}

function Insights() {
  return (
    <div className="px-4">
      <PrefGroup title="آمار پست‌ها و سرویس‌ها">
        <PrefRow prefKey="i_posts" label="کل پست‌ها" />
        <PrefRow prefKey="i_views" label="بازدیدها" defaultOn={false} />
        <PrefRow prefKey="i_interactions" label="تعامل‌ها" defaultOn={false} />
        <PrefRow prefKey="i_bookings" label="رزروها" defaultOn={false} />
        <PrefRow prefKey="i_sales" label="فروش" defaultOn={false} />
        <PrefRow prefKey="i_trending" label="سرویس‌های پرطرفدار" defaultOn={false} />
      </PrefGroup>
      <PrefGroup title="آمار کاربران و مشتریان">
        <PrefRow prefKey="i_followers" label="دنبال‌کنندگان جدید" />
        <PrefRow prefKey="i_customers" label="مشتریان برتر" />
        <PrefRow prefKey="i_feedback" label="بازخوردها" />
      </PrefGroup>
      <PrefGroup title="هشدارها و یادآوری‌ها">
        <PrefRow prefKey="i_limit" label="یادآوری محدودیت استفاده" />
        <PrefRow prefKey="i_unanswered" label="پیام‌های بی‌پاسخ" />
      </PrefGroup>
    </div>
  );
}

function Permissions() {
  const rows = ['دوربین', 'مخاطبین', 'سرویس موقعیت مکانی', 'میکروفون', 'اعلان‌ها', 'عکس‌ها و ویدیوها'];
  return (
    <ul className="list-none m-0 px-4">
      {rows.map((r) => (
        <li key={r} className="h-8.75 flex items-center justify-between text-sm">
          <span className="text-text-primary">{r}</span>
          <span className="flex items-center gap-4 text-[#a6a6a6]">
            مجاز
            <RowChevron />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Accessibility() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="px-4">
      <button type="button" onClick={toggleTheme} className="w-full h-8.75 flex items-center justify-between text-sm" aria-pressed={theme === 'dark'}>
        <span className="font-medium text-text-primary">حالت نمایش</span>
        <span className="flex items-center gap-4 text-[#a6a6a6]">
          {theme === 'dark' ? 'حالت تیره' : 'حالت روشن'}
          <RowChevron />
        </span>
      </button>
    </div>
  );
}

function Blocked() {
  const [q, setQ] = useState('');
  const users = useMemo(() => fetchAllUsers(), []);
  const [blocked, setBlocked] = usePrefList();
  const list = users.filter((u) => blocked.includes(u.username) && (u.name || u.username).includes(q.trim()));
  return (
    <div className="px-4">
      <PillSearch value={q} onChange={setQ} label="جستجوی کاربر" />
      {list.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-10">کاربری مسدود نشده است.</p>
      ) : (
        <ul className="list-none m-0 p-0 flex flex-col gap-3">
          {list.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <span className="relative w-11.25 h-11.25 rounded-full overflow-hidden bg-placeholder shrink-0">
                {u.avatar && <Image src={u.avatar} alt="" fill sizes="45px" className="object-cover" />}
              </span>
              <span className="flex-1 text-sm text-text-primary">{u.name || u.username}</span>
              <button
                type="button"
                onClick={() => setBlocked(blocked.filter((b) => b !== u.username))}
                className="h-8.75 px-4 rounded-[5px] bg-placeholder text-sm text-text-primary"
              >
                رفع مسدودی
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// فهرست مسدودشده‌ها؛ برای نمایش، کاربران نمونه به‌صورت پیش‌فرض مسدود فرض می‌شوند
function usePrefList(): [string[], (v: string[]) => void] {
  const [all] = useState(() => fetchAllUsers().map((u) => u.username));
  const [list, setList] = useState<string[]>(all);
  return [list, setList];
}

function Language() {
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('فارسی');
  const langs = ['فارسی', 'English', 'العربية', 'Türkçe', 'Español', 'Français', 'Deutsch', 'Русский', '中文', '日本語', 'हिन्दी', 'Português'];
  return (
    <div className="px-4">
      <PillSearch value={q} onChange={setQ} label="جستجوی زبان" />
      <ul className="list-none m-0 p-0">
        {langs
          .filter((l) => l.toLowerCase().includes(q.trim().toLowerCase()))
          .map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className="w-full h-9 flex items-center justify-between text-sm text-text-primary"
              >
                <span>{l}</span>
                <span className="w-3.5 h-3.5 rounded-full border border-border-strong flex items-center justify-center">
                  {lang === l && <span className="w-3 h-3 rounded-full bg-accent-color" />}
                </span>
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

function Locations() {
  const places = ['خانه', 'محل کار', 'مکان ۳', 'مکان ۴'];
  return (
    <div className="px-4 pb-10">
      {/* در فیگما اینجا تصویر نقشه است؛ به‌جای اسکرین‌شات، خود نقشه‌ی برنامه باز می‌شود */}
      <Link
        href="/full-map"
        className="w-full aspect-square rounded-xl border border-border-strong bg-placeholder flex flex-col items-center justify-center gap-2 text-text-primary hover:text-text-primary"
      >
        <LocationIcon className="w-8 h-8" />
        <span className="text-sm">مشاهده روی نقشه</span>
      </Link>
      <div className="mt-3 h-32.75 rounded-xl border border-border-strong p-4 flex flex-col justify-between">
        <div className="h-px bg-[#b8b8b8] mt-12" />
        <button type="button" className="flex items-center gap-2 self-end text-sm text-text-primary">
          افزودن مکان جدید
          <LocationIcon className="w-3 h-3" />
        </button>
      </div>
      <ul className="list-none m-0 mt-17 p-0 flex flex-col gap-1.5">
        {places.map((p) => (
          <li key={p} className="h-14 flex items-center px-5 rounded-xl border border-border-strong text-sm font-medium text-text-primary">
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Archive({ posts }: { posts: Post[] }) {
  return (
    <ul className="list-none m-0 px-4 flex flex-col gap-2">
      {posts.map((p, i) => (
        <li key={p.id} className="flex items-start gap-8">
          <span className="relative w-25.75 h-25.75 rounded-[5px] overflow-hidden bg-placeholder shrink-0">
            {(p.images?.[0] || p.image) && <Image src={(p.images?.[0] || p.image) as string} alt="" fill sizes="103px" className="object-cover" />}
          </span>
          <span className="flex-1 min-h-25.75 flex flex-col">
            <span className="text-sm text-text-primary">{p.title}</span>
            <span className="mt-auto text-sm text-[#d2d2d2]">{toPersianNumber(9 - i)} روز</span>
          </span>
          <span aria-hidden className="w-0.5 h-3.5 bg-accent-color" />
        </li>
      ))}
    </ul>
  );
}

export default function SettingsSectionPage() {
  const params = useParams();
  const section = String(params.section || '');
  const posts = useMemo(() => fetchAllPosts(), []);

  let body: React.ReactNode;
  switch (section) {
    case 'notifications':
      body = <Notifications />;
      break;
    case 'insights':
      body = <Insights />;
      break;
    case 'permissions':
      body = <Permissions />;
      break;
    case 'accessibility':
      body = <Accessibility />;
      break;
    case 'blocked':
      body = <Blocked />;
      break;
    case 'language':
      body = <Language />;
      break;
    case 'locations':
      body = <Locations />;
      break;
    case 'saved':
      body = (
        <>
          <h2 className="m-0 px-4 mb-1 text-lg font-normal text-text-primary">امروز</h2>
          <PostsGrid posts={posts} />
        </>
      );
      break;
    case 'trending':
      body = <div className="mt-8"><PostsGrid posts={posts} /></div>;
      break;
    case 'archive':
      body = <Archive posts={posts} />;
      break;
    default:
      body = <p className="px-4 py-12 text-center text-text-secondary">این بخش وجود ندارد.</p>;
  }

  return (
    <AppShell>
      <PageHeader title={TITLES[section] || 'تنظیمات'} />
      <div className="pt-2 pb-10">{body}</div>
    </AppShell>
  );
}
