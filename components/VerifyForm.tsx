// components/VerifyForm.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import OtpInput, { OtpInputRef } from '@/components/OtpInput';

interface VerifyFormProps {
  identifier: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isLoading: boolean;
  isResending: boolean;
}

export default function VerifyForm({
  identifier,
  onVerify,
  onResend,
  isLoading,
  isResending,
}: VerifyFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRef = useRef<OtpInputRef>(null);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleComplete = async (code: string) => {
    setError(false);
    await onVerify(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpRef.current?.getValue() || otp.join('');
    
    if (code.length === 6) {
      setError(false);
      await onVerify(code);
    } else {
      setError(true);
    }
  };

  const handleResendClick = async () => {
    if (canResend) {
      await onResend();
      setTimer(60);
      setCanResend(false);
      setError(false);
      otpRef.current?.clear();
      otpRef.current?.focus();
    }
  };

  const formatIdentifier = (value: string) => {
    if (value.includes('@')) {
      return value;
    }
    if (value.length > 4) {
      return `***${value.slice(-4)}`;
    }
    return value;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col min-h-[calc(100vh-2.25rem)] pt-32.5">
      <h1 className="m-0 text-[22px] font-semibold text-white text-center leading-6.75">کد تأیید</h1>
      <p className="mt-3 mb-11 text-sm text-text-secondary text-center">
        کد ارسال شده به{' '}
        <span dir="ltr" className="text-white">
          {formatIdentifier(identifier)}
        </span>{' '}
        را وارد کنید
      </p>

      <OtpInput
        ref={otpRef}
        value={otp}
        onChange={(value) => setOtp(Array.isArray(value) ? value : value.split(''))}
        onComplete={handleComplete}
        disabled={isLoading}
        error={error}
        length={6}
      />

      {error && (
        <p className="mt-3 text-center text-sm text-danger">
          کد وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.
        </p>
      )}

      <button
        type="button"
        onClick={handleResendClick}
        disabled={!canResend || isResending}
        className={`mt-6 mx-auto text-sm transition-colors ${
          canResend && !isResending ? 'text-white underline cursor-pointer' : 'text-text-secondary cursor-not-allowed'
        }`}
      >
        {isResending ? 'در حال ارسال...' : canResend ? 'ارسال مجدد کد' : `ارسال مجدد کد پس از ${timer} ثانیه`}
      </button>

      <button
        type="submit"
        disabled={isLoading || otp.some(d => d === '')}
        className="mt-auto w-full h-18.75 rounded-[20px] bg-white text-black text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {isLoading ? 'در حال بررسی...' : 'ادامه'}
      </button>
    </form>
  );
}