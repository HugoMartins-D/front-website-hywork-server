'use client';

import { useContext } from 'react';
import Image from 'next/image';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { UserContext, type UserStatus } from '@/contexts/UserContext';
import { UserIcon } from '@/components/icons';

// صفحه‌ی «وضعیت کاربر» فیگما (user Status): سه آواتار ۱۰۹ پیکسلی با حلقه‌ی ۵ پیکسلی،
// سه دکمه‌ی ۳۷۷×۶۲ با گوشه‌ی ۱۵ (آفلاین مشکی، مشغول قرمز، آنلاین سبز) و آواتار بزرگ ۲۵۱ پیکسلی

const OPTIONS: { status: UserStatus; label: string; ring: string; button: string }[] = [
  { status: 'ready', label: 'شما آنلاین هستید', ring: '#00ca18', button: '#00e03c' },
  { status: 'busy', label: 'شما مشغول هستید', ring: '#ff0000', button: '#e00000' },
  { status: 'inactive', label: 'شما آفلاین هستید', ring: '#9e9e9e', button: '#000000' },
];

function Avatar({ src, size, ring, width }: { src?: string; size: number; ring: string; width: number }) {
  return (
    <span
      className="relative block rounded-full overflow-hidden bg-placeholder"
      style={{ width: size, height: size, border: `${width}px solid ${ring}` }}
    >
      {src ? (
        <Image src={src} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <UserIcon className="absolute inset-0 m-auto w-1/2 h-1/2 text-text-secondary" />
      )}
    </span>
  );
}

export default function StatusPage() {
  const { user, updateUserStatus } = useContext(UserContext);
  const current = OPTIONS.find((o) => o.status === user?.status) ?? OPTIONS[2];

  return (
    <AppShell>
      <PageHeader title="وضعیت من" />

      <div className="flex justify-between px-4 mt-1" role="radiogroup" aria-label="وضعیت">
        {OPTIONS.map((o) => (
          <button
            key={o.status}
            type="button"
            role="radio"
            aria-checked={current.status === o.status}
            aria-label={o.label}
            onClick={() => updateUserStatus(o.status)}
            className={current.status === o.status ? '' : 'opacity-60'}
          >
            <Avatar src={user?.avatar} size={109} ring={o.ring} width={5} />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6.25 px-7.75 mt-18.75">
        {[...OPTIONS].reverse().map((o) => (
          <button
            key={o.status}
            type="button"
            onClick={() => updateUserStatus(o.status)}
            aria-pressed={current.status === o.status}
            className="h-15.5 rounded-[15px] text-white text-lg"
            style={{ backgroundColor: o.button }}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mt-25 mb-10">
        <Avatar src={user?.avatar} size={251} ring={current.ring} width={10} />
      </div>
    </AppShell>
  );
}
