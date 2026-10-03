// components/FormControls.tsx
'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';

// کنترل‌های پایه‌ی فیگما (nini)

// ==================== دکمه ====================
// primary: مشکی توپر · outline: دورخط مشکی · size lg = ۵۸ پیکسل با گوشه‌ی ۸ (دکمه‌های پایین صفحه)
// md = ۴۸ پیکسل کپسولی (برگه‌های دسترسی / فرم‌های دسکتاپ)

type ButtonVariant = 'primary' | 'outline';
type ButtonSize = 'lg' | 'md' | 'sm';

const buttonSize: Record<ButtonSize, string> = {
  lg: 'h-14.5 rounded-lg text-[22px] font-medium',
  md: 'h-12 rounded-full text-lg font-medium',
  sm: 'h-8.75 rounded-full text-sm',
};

export function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  const look =
    variant === 'primary'
      ? 'bg-accent-color text-on-accent hover:bg-accent-hover'
      : 'bg-transparent text-text-primary border border-border-strong hover:bg-bg-hover';
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 px-5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonSize[size]} ${look} ${className}`}
    />
  );
}

// ==================== فیلد متنی ====================
// ۴۰۸×۵۶، گوشه‌ی ۱۲، خط ۱ پیکسل مشکی، برچسب ۱۴/۴۰۰ بالای فیلد سمت راست

interface FieldShellProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  start?: ReactNode;
  end?: ReactNode;
  className?: string;
  strong?: boolean;
}

const fieldBox = (strong?: boolean, error?: ReactNode) =>
  `flex items-center gap-3 min-h-14 px-4 rounded-xl bg-bg-primary ${strong ? 'border-2' : 'border'} ${
    error ? 'border-danger' : 'border-border-strong'
  } focus-within:border-2`;

export function TextField({
  label,
  hint,
  error,
  start,
  end,
  className = '',
  strong,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & FieldShellProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block mb-2.5 text-sm text-text-primary">{label}</span>}
      <span className={fieldBox(strong, error)}>
        {start}
        <input
          {...props}
          className="flex-1 min-w-0 h-full bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-muted"
        />
        {end}
      </span>
      {error ? (
        <span className="block mt-1.5 text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="block mt-1.5 text-xs text-text-secondary">{hint}</span>
      ) : null}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  error,
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & FieldShellProps) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="block mb-2.5 text-sm text-text-primary">{label}</span>}
      <textarea
        {...props}
        className={`w-full min-h-37 p-4 rounded-[10px] bg-bg-primary border ${
          error ? 'border-danger' : 'border-border-strong'
        } outline-none text-lg text-text-primary placeholder:text-text-muted resize-none focus:border-2`}
      />
      {error ? (
        <span className="block mt-1.5 text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="block mt-1.5 text-sm text-text-secondary">{hint}</span>
      ) : null}
    </label>
  );
}

// ردیف انتخابی با فلش (مثل «دسته‌بندی»، «تگ و کلمه کلیدی» در ساخت پست): ۴۰۸×۴۰ دورخط مشکی
export function OptionRow({
  label,
  value,
  icon,
  onClick,
}: {
  label: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-12 flex items-center gap-3 px-4 rounded-[10px] border border-border-strong bg-bg-primary text-text-primary text-sm"
    >
      {icon && <span className="shrink-0 w-5 h-5 flex items-center justify-center">{icon}</span>}
      <span className="flex-1 text-right truncate">{value || label}</span>
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="m15 5-7 7 7 7" />
      </svg>
    </button>
  );
}

// ==================== چیپ ====================
// کپسولی؛ فعال: مشکی/سفید · عادی: دورخط مشکی · غیرفعال: دورخط و متن خاکستری

export function Chip({
  active = false,
  disabled = false,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const look = disabled
    ? 'border border-border-color text-text-muted'
    : active
      ? 'bg-accent-color text-on-accent border border-accent-color'
      : 'border border-border-strong text-text-primary';
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      {...props}
      className={`shrink-0 h-8 px-3.5 rounded-full text-sm whitespace-nowrap transition-colors ${look} ${className}`}
    />
  );
}

// ==================== تب‌های کپسولی ====================
// تب فعال: کپسول مشکی ۳۵ پیکسل با گوشه‌ی ۲۵؛ بقیه فقط متن ۱۴/۴۰۰

export function SegmentedTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
}: {
  tabs: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={`flex items-center justify-center gap-2 ${className}`}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`h-8.75 min-w-33.5 px-5 rounded-[25px] text-sm transition-colors ${
              active ? 'bg-accent-color text-on-accent' : 'text-text-primary'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ==================== فهرست کلید/مقدار ====================
// ردیف‌های ۴۴ پیکسلی با خط جداکننده‌ی ۰٫۵ پیکسلی #cecece؛ کلید سمت راست، مقدار سمت چپ، ۱۶/۴۰۰

export function SpecList({
  title,
  items,
  className = '',
}: {
  title?: ReactNode;
  items: { label: ReactNode; value: ReactNode }[];
  className?: string;
}) {
  return (
    <section className={className}>
      {title && <h2 className="m-0 mb-5 text-lg font-medium text-right">{title}</h2>}
      <dl className="m-0 px-2.5">
        {items.map((it, i) => (
          <div
            key={i}
            className={`flex items-center justify-between gap-4 h-11 ${
              i < items.length - 1 ? 'border-b-[0.5px] border-border-color' : ''
            }`}
          >
            <dt className="text-base text-text-primary">{it.label}</dt>
            <dd className="m-0 text-base text-text-primary text-left truncate">{it.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

// ==================== رادیو ====================
export function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-border-strong shrink-0"
    >
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-accent-color" />}
    </span>
  );
}
