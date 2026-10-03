'use client';

import { useContext } from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import WalletCard from '@/components/WalletCard';
import { UserContext } from '@/contexts/UserContext';
import { PlusIcon, SendIcon, WalletIcon, CartIcon } from '@/components/icons';

// صفحه‌ی «کیف پول» فیگما (Wallet): کارت سه‌لایه، پنج کاشی ۷۰×۷۰ با گوشه‌ی ۱۵ (#ededed)،
// «تراکنش‌ها» ۱۸/۶۰۰ و ردیف‌هایی با دایره‌ی ۴۶ پیکسلی، عنوان ۱۴/۴۰۰، تاریخ خاکستری و مبلغ ۲۲/۴۰۰ سبز/قرمز

// داده‌ی نمونه تا آماده شدن API کیف پول
const TRANSACTIONS = [
  { group: 'امروز', items: [
    { id: 1, title: 'نظافت منزل', date: '۱۴۰۳/۰۷/۱۲', time: '۱۸:۳۰', amount: 230000 },
    { id: 2, title: 'نظافت منزل', date: '۱۴۰۳/۰۷/۱۲', time: '۱۸:۳۰', amount: 230000 },
    { id: 3, title: 'تعمیر لوله‌کشی', date: '۱۴۰۳/۰۷/۱۲', time: '۱۴:۱۰', amount: 230000 },
  ] },
  { group: 'دیروز', items: [
    { id: 4, title: 'خرید هدفون', date: '۱۴۰۳/۰۷/۱۱', time: '۲۰:۰۵', amount: -190000 },
    { id: 5, title: 'نظافت منزل', date: '۱۴۰۳/۰۷/۱۱', time: '۱۸:۳۰', amount: 230000 },
  ] },
];

const DownloadIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </svg>
);

const RequestIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />
  </svg>
);

const ACTIONS = [
  { label: 'پرداخت', icon: CartIcon },
  { label: 'برداشت', icon: DownloadIcon },
  { label: 'درخواست', icon: RequestIcon },
  { label: 'انتقال', icon: SendIcon },
  { label: 'افزایش موجودی', icon: PlusIcon },
];

const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.abs(n));

export default function WalletPage() {
  const { user } = useContext(UserContext);

  return (
    <AppShell>
      <PageHeader title="کیف پول" onMore={() => {}} />

      <div className="pt-4">
        <WalletCard balance={fa(50000000)} owner={user?.name || user?.username || 'کاربر'} />
      </div>

      <div className="mt-8 px-8 grid grid-cols-5 gap-2.25">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <button key={a.label} type="button" className="aspect-square rounded-[15px] bg-[#ededed] flex flex-col items-center justify-center gap-1 text-text-primary">
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium leading-3.75 text-center">{a.label}</span>
            </button>
          );
        })}
      </div>

      <section className="px-4 mt-10 pb-10">
        <h2 className="m-0 text-lg font-semibold text-text-primary">تراکنش‌ها</h2>
        {TRANSACTIONS.map((g) => (
          <div key={g.group}>
            <h3 className="m-0 mt-6 mb-3.5 text-lg font-medium text-text-primary">{g.group}</h3>
            <ul className="list-none m-0 p-0 flex flex-col gap-3.5">
              {g.items.map((t) => (
                <li key={t.id} className="flex items-center gap-4.5">
                  <span className="w-11.5 h-11.5 rounded-full bg-[#efefef] flex items-center justify-center shrink-0 text-[#d7d7d7]">
                    <WalletIcon className="w-4.5 h-4.5" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-text-primary">{t.title}</span>
                    <span className="block text-sm text-[#b2b2b2]">
                      {t.date} {t.time}
                    </span>
                  </span>
                  <span dir="ltr" className={`text-[22px] ${t.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                    {t.amount >= 0 ? '+' : '-'}
                    {fa(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
