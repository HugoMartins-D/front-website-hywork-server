'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { toPersianNumber, formatPrice } from '@/utils/numberUtils';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-placeholder" />,
});

// صفحه‌ی «تاکسی / پیک موتوری» فیگما (Taxi Service): نقشه‌ی بالا و شیت مشکی پایین با کارت مسیر
// (مبدأ «من» و مقصد با خط عمودی) و کارت سفید راننده: نام ۱۸/۶۰۰، کرایه‌ی ۲۵/۶۰۰، زمان رسیدن و نوار امتیاز زرد

// داده‌ی نمونه تا آماده شدن API ارسال
const TRIP = { origin: 'تهران، میدان ونک', destination: 'میدان تجریش، تهران', driver: 'David Miller', fare: 12000, eta: '۲٫۵', time: 'امروز، ۱۵:۴۵', rating: 4 };

function DeliveryContent() {
  const params = useSearchParams();
  const courier = params.get('mode') === 'courier';

  return (
    <AppShell>
      <div className="relative h-[57vh] min-h-80 [&_.leaflet-tile-pane]:grayscale [&_.leaflet-tile-pane]:contrast-[0.88]">
        <MapComponent height="100%" />
      </div>

      <section className="relative -mt-4 bg-black text-white px-3.5 pt-3.5 pb-8 min-h-[45vh]">
        <div className="flex justify-center mb-4">
          <span className="block w-10.25 h-0.5 bg-white" aria-hidden />
        </div>

        {/* کارت مسیر */}
        <div className="rounded-[10px] border border-white px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="flex-1 text-right">
              <span className="block text-[8px] text-white/60">مبدأ من</span>
              <span className="block text-sm">{TRIP.origin}</span>
            </span>
            <span className="w-3 h-3 mt-3 bg-[#1e1e1e] border border-white/60" aria-hidden />
          </div>
          <div className="flex items-center gap-3 my-1">
            <span className="w-3 h-3 border border-white" aria-hidden />
            <span className="flex-1 h-px bg-white/40" aria-hidden />
            <span className="w-0.5 h-6 bg-white me-1.25" aria-hidden />
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-1 text-right">
              <span className="block text-[8px] text-white/60">مقصد</span>
              <span className="block text-sm">{TRIP.destination}</span>
            </span>
            <span className="w-3 h-3 mt-3 rounded-full border-2 border-white" aria-hidden />
          </div>
        </div>

        {/* کارت راننده / پیک */}
        <div className="mt-3 rounded-[10px] bg-white text-black flex overflow-hidden">
          <div className="flex-1 p-4">
            <div className="text-[10px] text-[#9e9e9e]">{TRIP.time}</div>
            <div className="mt-1 text-lg font-semibold">{TRIP.driver}</div>
            <hr className="my-2 border-0 border-t border-black w-23.5" />
            <div className="text-[25px] font-semibold leading-7.5">{formatPrice(TRIP.fare)}</div>
            <div className="text-[8px] text-[#9e9e9e]">رسیدن تا {TRIP.eta} دقیقه‌ی دیگر</div>
          </div>
          <div className="relative w-34 bg-placeholder flex items-end justify-center pb-2">
            <span className="text-[10px] text-text-secondary absolute top-2 right-2">{courier ? 'موتور' : 'خودرو'}</span>
            <span className="flex gap-0.5" aria-label={`امتیاز ${toPersianNumber(TRIP.rating)} از ۵`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`w-2.5 h-1.25 ${n <= TRIP.rating ? 'bg-warning' : 'bg-white'}`} />
              ))}
            </span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

export default function DeliveryPage() {
  return (
    <Suspense fallback={null}>
      <DeliveryContent />
    </Suspense>
  );
}
