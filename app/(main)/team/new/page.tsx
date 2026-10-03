'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import DateTimeSheet, { formatJalaliDateTime } from '@/components/DateTimeSheet';
import { Button, TextField, TextArea, OptionRow } from '@/components/FormControls';
import { CalendarIcon } from '@/components/icons';
import { useToast } from '@/components/NotificationToast';

// صفحه‌ی «ساخت تیم» فیگما (add team): بخش «عمومی» با نام تیم و توضیح، و زمان شروع در شیت تقویم مشکی
export default function NewTeamPage() {
  const router = useRouter();
  const { success } = useToast();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [start, setStart] = useState<Date | null>(null);
  const [sheet, setSheet] = useState(false);

  return (
    <AppShell>
      <PageHeader title="تیم" />
      <form
        className="px-4 pb-10"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          success('تیم ساخته شد');
          router.push('/team/people');
        }}
      >
        <h2 className="m-0 mt-3 mb-2 text-[10px] font-normal text-text-primary">عمومی</h2>
        <div className="flex flex-col gap-3">
          <TextField value={name} onChange={(e) => setName(e.target.value)} placeholder="نام تیم" aria-label="نام تیم" />
          <TextArea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="توضیحات" aria-label="توضیحات" />
          <OptionRow
            icon={<CalendarIcon className="w-4 h-4" />}
            label="زمان شروع همکاری"
            value={start ? formatJalaliDateTime(start) : ''}
            onClick={() => setSheet(true)}
          />
        </div>
        <Button type="submit" className="w-full mt-10" disabled={!name.trim()}>
          ساخت تیم
        </Button>
      </form>

      <DateTimeSheet
        open={sheet}
        onClose={() => setSheet(false)}
        initial={start}
        onConfirm={(d) => {
          setStart(d);
          setSheet(false);
        }}
      />
    </AppShell>
  );
}
