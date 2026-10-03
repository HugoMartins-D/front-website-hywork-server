// components/BottomSheet.tsx
'use client';

import { useEffect, type ReactNode } from 'react';

// شیت پایین مشکی فیگما: دستگیره‌ی سفید ۴۱×۲ پیکسل، گوشه‌های صاف،
// در دسکتاپ هم داخل ستون ۴۴۰ پیکسلی وسط صفحه باز می‌شود

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function BottomSheet({ open, onClose, title, children, footer, className = '' }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-2000 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full max-w-110 max-h-[85vh] flex flex-col bg-black text-white animate-fade-in ${className}`}
      >
        <div className="flex justify-center pt-3.5 pb-2">
          <span className="block w-10.25 h-0.5 bg-white" />
        </div>
        {title && <div className="px-4 pt-2 pb-3 text-base font-medium text-right">{title}</div>}
        <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="px-4 pb-6 pt-2">{footer}</div>}
      </div>
    </div>
  );
}

// دو دکمه‌ی پایین شیت: «انصراف» دورخط سفید و «تأیید» سفید توپر
export function SheetActions({
  onCancel,
  onConfirm,
  cancelLabel = 'انصراف',
  confirmLabel = 'تأیید',
  confirmDisabled = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
}) {
  return (
    <div className="flex gap-5">
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className="flex-1 h-12.5 rounded-[10px] bg-white text-black text-[22px] disabled:opacity-50"
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 h-12.5 rounded-[10px] border border-white text-white text-[22px]"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
