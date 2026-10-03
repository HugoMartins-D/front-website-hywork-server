// src/components/LoginForm.tsx
'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

// ==================== TYPES ====================
interface LoginFormData {
  identifier: string;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
}

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError('لطفاً شماره تلفن یا ایمیل را وارد کنید');
      return;
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedIdentifier);
    const isPhone = /^09[0-9]{9}$/.test(trimmedIdentifier);

    if (!isEmail && !isPhone) {
      setError('لطفاً یک ایمیل معتبر یا شماره تلفن همراه معتبر وارد کنید');
      return;
    }

    try {
      await onSubmit({ identifier: trimmedIdentifier });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ارسال کد');
    }
  };

  // ورود با گوگل در طراحی هست ولی هنوز در بک‌اند پیاده نشده
  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100vh-2.25rem)] pt-30" dir="rtl" noValidate>
      <h1 className="m-0 text-[22px] font-semibold text-white text-center leading-6.75">ورود</h1>

      <label className="block mt-61.5">
        <span className="sr-only">شماره موبایل یا ایمیل</span>
        <span
          className={`flex items-center gap-3 h-14 px-3.5 rounded-xl border-2 ${
            error ? 'border-danger' : 'border-white'
          } focus-within:border-[3px]`}
        >
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="موبایل یا ایمیل"
            disabled={isLoading}
            autoComplete="tel"
            className="flex-1 min-w-0 h-full bg-transparent border-none outline-none text-base font-medium text-white placeholder:text-[#b2b2b2] text-right disabled:opacity-60"
          />
          <span dir="ltr" className="flex items-center gap-2.5 shrink-0 text-base font-medium text-white">
            <span aria-hidden className="block w-6 h-4 overflow-hidden rounded-[1px]">
              <span className="block h-1/3 bg-[#6da544]" />
              <span className="block h-1/3 bg-white" />
              <span className="block h-1/3 bg-[#d80027]" />
            </span>
            +98
          </span>
        </span>
      </label>
      {error && <p className="mt-2 text-sm text-danger text-right">{error}</p>}

      <div className="mt-55 flex flex-col items-center gap-2.5">
        <button
          type="button"
          disabled
          title="به‌زودی"
          className="w-15.5 h-15.5 rounded-[11px] border border-white/40 flex items-center justify-center disabled:cursor-not-allowed"
          aria-label="ورود با گوگل (به‌زودی)"
        >
          <Image src="/images/brand/google.png" alt="" width={34} height={34} />
        </button>
        <span className="text-sm text-placeholder">ورود با گوگل</span>
      </div>

      <button
        type="submit"
        disabled={isLoading || !identifier.trim()}
        className="mt-auto w-full h-18.75 rounded-[20px] bg-white text-black text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isLoading ? 'در حال ارسال کد...' : 'تأیید'}
      </button>
    </form>
  );
}