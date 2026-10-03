// components/ProfileHeader.tsx
'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { statusRingColor } from '@/components/MobileBottomNav';
import Link from 'next/link';
import { UserIcon } from '@/components/icons';

// آواتار صاحب پروفایل به صفحه‌ی وضعیت لینک می‌شود
const Wrapper = ({ href, className, children }: { href?: string; className: string; children: ReactNode }) =>
  href ? (
    <Link href={href} aria-label="تغییر وضعیت" className={className}>
      {children}
    </Link>
  ) : (
    <div className={className}>{children}</div>
  );

// سربرگ پروفایل فیگما (User Page / customer / seller):
// آواتار ۱۰۹ پیکسلی با حلقه‌ی ۵ پیکسلی وضعیت در سمت راست، ستاره‌ی زرد امتیاز روی لبه‌ی پایین آن،
// سه شمارنده (۲۵/۵۰۰ و برچسب ۱۲/۵۰۰) در سمت چپ، نام ۱۶/۶۰۰، عنوان ۱۵/۴۰۰ خاکستری و بیو ۱۲/۴۰۰

interface ProfileHeaderProps {
  avatar?: string | null;
  name: string;
  subtitle?: string;
  bio?: string;
  status?: string;
  rating?: number | null;
  stats: { label: string; value: string }[];
  topActions?: ReactNode;
  actions?: ReactNode;
  avatarHref?: string;
}

export default function ProfileHeader({ avatar, name, subtitle, bio, status, rating, stats, topActions, actions, avatarHref }: ProfileHeaderProps) {
  return (
    <section className="px-4">
      <div className="flex items-center justify-end gap-3 h-17 text-text-primary">{topActions}</div>

      <div className="flex items-start gap-7">
        <Wrapper href={avatarHref} className="relative shrink-0 block">
          <span
            className="relative block w-27.25 h-27.25 rounded-full overflow-hidden bg-placeholder border-[5px]"
            style={{ borderColor: statusRingColor(status) }}
          >
            {avatar ? (
              <Image src={avatar} alt="" fill sizes="109px" className="object-cover" />
            ) : (
              <UserIcon className="absolute inset-0 m-auto w-12 h-12 text-text-secondary" />
            )}
          </span>
          {rating != null && rating > 0 && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 flex items-center justify-center" aria-label={`امتیاز ${rating}`}>
              <svg viewBox="0 0 24 24" className="absolute inset-0 w-5 h-5 text-warning" fill="currentColor" aria-hidden>
                <path d="m12 2 3 6.3 6.9 1-5 4.8 1.2 6.9L12 17.8 5.9 21l1.2-6.9-5-4.8 6.9-1z" />
              </svg>
              <span className="relative text-[6px] font-medium text-text-primary mt-0.5">{Math.round(rating)}</span>
            </span>
          )}
        </Wrapper>

        <dl className="flex-1 m-0 grid grid-cols-3 pt-5">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <dd className="m-0 order-first text-[25px] font-medium leading-7.5 text-text-primary">{s.value}</dd>
              <dt className="mt-2 text-xs font-medium text-text-primary">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-3 text-right">
        <h1 className="m-0 text-base font-semibold leading-4.75 text-text-primary">{name}</h1>
        {subtitle && <p className="m-0 mt-0.5 text-[15px] text-placeholder">{subtitle}</p>}
        {bio && <p className="m-0 mt-1 text-xs leading-3.75 text-text-primary whitespace-pre-line max-w-50.5">{bio}</p>}
      </div>

      {actions && <div className="mt-4 flex items-center gap-2">{actions}</div>}
    </section>
  );
}

// ردیف دسته‌ها زیر سربرگ: متن ۱۲/۵۰۰ خاکستری، فعال مشکی با خط زیر
export function CategoryTabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mt-5 flex items-center gap-5 overflow-x-auto px-4 pb-1.5 [scrollbar-width:none]" role="tablist">
      {items.map((it) => {
        const active = it === value;
        return (
          <button
            key={it}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it)}
            className={`shrink-0 pb-1 text-xs font-medium whitespace-nowrap border-b ${
              active ? 'text-text-primary border-border-strong' : 'text-[#9e9e9e] border-transparent'
            }`}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}
