'use client';

import { useState, useEffect, useCallback } from 'react';

export function useOtpTimer(initialSeconds: number = 120) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    // اگر تایمر غیرفعال است یا زمان تمام شده، تایمر را متوقف کن
    if (!isActive || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        // اگر زمان به صفر رسید، تایمر را غیرفعال کن
        if (newTime <= 0) {
          setIsActive(false);
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive]);

  const resetTimer = useCallback(() => {
    setTimeLeft(initialSeconds);
    setIsActive(true);
  }, [initialSeconds]);

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    timeLeft,
    isActive,
    resetTimer,
    formatTime,
  };
}