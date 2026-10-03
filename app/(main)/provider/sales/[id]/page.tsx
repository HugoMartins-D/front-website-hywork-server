'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ServiceSummary from '@/components/ServiceSummary';
import { SpecList } from '@/components/FormControls';
import { CalendarIcon, LocationIcon, PhoneIcon } from '@/components/icons';
import { fetchPostById } from '@/services/postService';
import { formatPrice, toPersianNumber } from '@/utils/numberUtils';

// صفحه‌ی «اطلاعات فروش» فیگما (Sale information): سربرگ مشکی با مبلغ سفارش ۶۰/۶۰۰،
// خلاصه‌ی سرویس، مشخصات، اطلاعات سفارش و اطلاعات مشتری با آیکون
export default function SaleInfoPage() {
  const params = useParams();
  const post = useMemo(() => (params.id ? fetchPostById(params.id as string) : null), [params.id]);

  if (!post) {
    return (
      <AppShell>
        <PageHeader title="اطلاعات فروش" />
        <p className="px-4 py-12 text-center text-text-secondary">فروشی یافت نشد.</p>
      </AppShell>
    );
  }

  const iconRow = (label: string, value: string, Icon: typeof CalendarIcon) => ({
    label: (
      <span className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    ),
    value,
  });

  return (
    <AppShell>
      <div className="bg-black text-white min-h-57.75">
        <PageHeader title="اطلاعات فروش" inverted onMore={() => {}} />
        <div className="text-center pt-2">
          <div className="text-[60px] font-semibold leading-18">{formatPrice(post.price)}</div>
          <div className="text-sm text-[#b7b7b7]">مبلغ سفارش (تومان)</div>
        </div>
      </div>

      <div className="pt-12">
        <ServiceSummary post={post} showPrice={false} />
      </div>

      <div className="px-4 pb-10">
        <SpecList
          title="مشخصات"
          className="mt-10"
          items={[
            { label: 'نوع خدمت', value: post.category },
            { label: 'واحد خدمت', value: 'ساعت' },
            { label: 'حداقل سفارش', value: '۱ ساعت' },
            { label: 'محدوده‌ی خدمت', value: post.author?.location || 'تهران' },
          ]}
        />
        <SpecList
          title="اطلاعات سفارش"
          className="mt-10"
          items={[
            { label: 'واحد', value: 'ساعت' },
            { label: 'تعداد', value: '۱ ساعت' },
            { label: 'مبلغ', value: formatPrice(post.price) },
          ]}
        />
        <SpecList
          title="اطلاعات مشتری"
          className="mt-10"
          items={[
            iconRow('تاریخ و ساعت', '۲۱:۰۰ | ۱۴۰۴/۰۷/۱۷', CalendarIcon),
            iconRow('مکان', 'تهران، خیابان ولیعصر', LocationIcon),
            iconRow('شماره تماس', toPersianNumber('09120000000'), PhoneIcon),
          ]}
        />
      </div>
    </AppShell>
  );
}
