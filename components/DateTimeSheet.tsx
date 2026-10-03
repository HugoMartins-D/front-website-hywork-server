// components/DateTimeSheet.tsx
'use client';

import { useMemo, useState } from 'react';
import moment from 'moment-jalaali';
import BottomSheet, { SheetActions } from '@/components/BottomSheet';
import { toPersianNumber } from '@/utils/numberUtils';

// برگه‌ی انتخاب تاریخ و ساعت فیگما (Reservation / Scheduled posts):
// شیت مشکی، تب‌های «ساعت | تقویم» با خط جداکننده، تقویم ۷ ستونه با خانه‌های ۴۲ پیکسلی،
// روز انتخاب‌شده دایره‌ی سفید، ردیف نام روزها پایین تقویم

const MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const WEEK_DAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

interface DateTimeSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initial?: Date | null;
  title?: string;
}

export default function DateTimeSheet({ open, onClose, onConfirm, initial, title }: DateTimeSheetProps) {
  const [tab, setTab] = useState<'time' | 'calendar'>('calendar');
  const [selected, setSelected] = useState(() => moment(initial ?? new Date()));
  const [month, setMonth] = useState(() => moment(initial ?? new Date()).startOf('jMonth'));

  const cells = useMemo(() => {
    const start = month.clone().startOf('jMonth');
    // هفته‌ی ایرانی از شنبه شروع می‌شود (day() شنبه = ۶)
    const lead = (start.day() + 1) % 7;
    const days = moment.jDaysInMonth(start.jYear(), start.jMonth());
    const list: (moment.Moment | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= days; d++) list.push(start.clone().jDate(d));
    return list;
  }, [month]);

  const setTime = (h: number, m: number) => setSelected((prev) => prev.clone().hour(h).minute(m).second(0));

  const tabClass = (active: boolean) => `flex-1 h-8.5 text-lg text-center ${active ? 'text-white' : 'text-white/50'}`;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      footer={<SheetActions onCancel={onClose} onConfirm={() => onConfirm(selected.toDate())} />}
    >
      <div className="-mx-4 flex items-center border-b border-[#484848] pb-3">
        <button type="button" className={tabClass(tab === 'calendar')} onClick={() => setTab('calendar')}>
          تقویم
        </button>
        <span className="w-px h-8.5 bg-[#4e4e4e]" aria-hidden />
        <button type="button" className={tabClass(tab === 'time')} onClick={() => setTab('time')}>
          ساعت
        </button>
      </div>

      {tab === 'calendar' ? (
        <div className="mx-auto w-74.25 pt-7.5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[18.5px] font-medium text-[#ebffee]">
              {MONTHS[month.jMonth()]} {toPersianNumber(month.jYear())}
            </span>
            <span className="flex items-center gap-8 text-[#f5f5f5]">
              <button type="button" aria-label="ماه قبل" onClick={() => setMonth((m) => m.clone().subtract(1, 'jMonth'))}>
                <svg viewBox="0 0 24 24" className="w-3 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 5 7 7-7 7" /></svg>
              </button>
              <button type="button" aria-label="ماه بعد" onClick={() => setMonth((m) => m.clone().add(1, 'jMonth'))}>
                <svg viewBox="0 0 24 24" className="w-3 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 5-7 7 7 7" /></svg>
              </button>
            </span>
          </div>
          <div className="grid grid-cols-7" role="grid">
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelected((prev) => d.clone().hour(prev.hour()).minute(prev.minute()))}
                  aria-pressed={d.isSame(selected, 'day')}
                  className="h-10.5 flex items-center justify-center"
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[18.5px] ${
                      d.isSame(selected, 'day') ? 'bg-white text-black' : 'text-white'
                    }`}
                  >
                    {toPersianNumber(d.jDate())}
                  </span>
                </button>
              ) : (
                <span key={i} />
              )
            )}
          </div>
          <div className="grid grid-cols-7 mt-5">
            {WEEK_DAYS.map((w, i) => (
              <span key={w} className={`h-10.5 flex items-center justify-center text-base ${i >= 5 ? 'text-white' : 'text-white/60'}`}>
                {w}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-6 flex gap-4" dir="ltr">
          <div className="flex-1 h-64 overflow-y-auto grid grid-cols-4 gap-2 content-start">
            {HOURS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setTime(h, selected.minute())}
                className={`h-10 rounded-full text-base ${selected.hour() === h ? 'bg-white text-black' : 'text-white border border-white/30'}`}
              >
                {toPersianNumber(String(h).padStart(2, '0'))}
              </button>
            ))}
          </div>
          <div className="w-20 flex flex-col gap-2">
            {MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTime(selected.hour(), m)}
                className={`h-10 rounded-full text-base ${selected.minute() === m ? 'bg-white text-black' : 'text-white border border-white/30'}`}
              >
                :{toPersianNumber(String(m).padStart(2, '0'))}
              </button>
            ))}
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

// نمایش کوتاه تاریخ و ساعت جلالی، مثل «۱۴۰۴/۰۷/۱۲ ۲۱:۰۰»
export const formatJalaliDateTime = (date: Date) => toPersianNumber(moment(date).format('jYYYY/jMM/jDD HH:mm'));
