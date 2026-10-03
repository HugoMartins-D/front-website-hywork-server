'use client';

import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/FormControls';

// صفحه‌ی آگهی همکاری فیگما (Building painter): عنوان تیم، زیرعنوان خاکستری،
// بخش «توضیحات» و «وظایف» با متن کوچک راست‌چین
export default function TeamJobPage() {
  return (
    <AppShell>
      <PageHeader title="فروش فعال است" onMore={() => {}} />
      <article className="px-4 pb-10 text-text-primary">
        <h1 className="m-0 mt-6 text-[13px] font-normal text-center">تیم طراحی و ساخت ساختمان</h1>
        <p className="m-0 text-[8px] text-placeholder text-left">ساخت‌وساز</p>

        <h2 className="m-0 mt-6 mb-2 text-[13px] font-normal">توضیحات</h2>
        <p className="m-0 text-[8px] leading-3">
          به تیم طراحی و ساخت ساختمان خوش آمدید. پروژه‌ی ما شامل طراحی، ساخت و تکمیل ساختمان‌های مسکونی و تجاری است. به‌عنوان نقاش،
          نقش شما ارائه‌ی پایانی حرفه‌ای، باکیفیت و زیبا برای فضاهای ماست. شما در کنار تیم‌های طراحی و ساخت کار می‌کنید تا رنگ‌ها و
          پوشش‌ها را مطابق مشخصات پروژه اجرا کنید.
        </p>

        <h2 className="m-0 mt-8 mb-2 text-[13px] font-normal">وظایف</h2>
        <ul className="m-0 ps-4 text-[8px] leading-3 list-disc">
          <li>آماده‌سازی سطوح داخلی و خارجی با تمیزکاری، سنباده و ترمیم عیوب</li>
          <li>اجرای آستر، بتونه، رنگ و پوشش‌های نهایی با قلم‌مو، غلتک یا پیستوله</li>
          <li>محافظت از سطوح اطراف با پوشاندن مبلمان، کف و وسایل</li>
          <li>هماهنگی رنگ‌ها مطابق نیاز پروژه و دستور کارفرما</li>
          <li>رعایت استانداردهای کیفیت، ایمنی و ماندگاری کار</li>
        </ul>

        <Button className="w-full mt-10">درخواست همکاری</Button>
      </article>
    </AppShell>
  );
}
