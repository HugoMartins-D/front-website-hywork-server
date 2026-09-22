'use client';

import { useEffect, ReactNode } from 'react';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
  maxWidth?: string | null;
  width?: string | null;
  height?: string | null;
  noPadding?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  maxWidth = null,
  width = null,
  height = null,
  noPadding = false,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getSizeClasses = (): string => {
    const sizes: Record<ModalSize, string> = {
      sm: 'max-w-[360px] w-full',
      md: 'max-w-[500px] w-full',
      lg: 'max-w-[700px] w-full',
      xl: 'max-w-[1100px] w-full',
      full: 'max-w-[95vw] w-[95vw] h-[90vh]',
    };
    return sizes[size] || sizes.md;
  };

  const customStyle: React.CSSProperties = {};
  if (maxWidth) customStyle.maxWidth = maxWidth;
  if (width) customStyle.width = width;
  if (height) customStyle.height = height;

  // کلاس‌های دکمه بستن در یک متغیر جداگانه
  const closeButtonClasses = [
    'absolute top-3 left-3 z-10 w-8 h-8 rounded-full flex items-center justify-center',
    'bg-[var(--color-bg-surface)] border-none text-[18px] cursor-pointer',
    'text-[var(--color-text-primary)] shadow-[0_1px_3px_var(--color-shadow)]',
    'transition-all duration-200 hover:bg-[var(--color-bg-hover)] hover:scale-105',
    'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-color)]',
  ].join(' ');

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-5 bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      style={{
        animation: 'fadeIn 0.25s ease-out forwards',
      }}
    >
      <div
        className={`
          relative bg-[var(--color-bg-secondary)] rounded-2xl overflow-hidden flex flex-col
          shadow-[0_20px_35px_var(--color-shadow)] border border-[var(--color-border-color)]
          ${getSizeClasses()} ${noPadding ? 'p-0' : 'p-6'} ${className}
        `}
        style={{
          ...customStyle,
          animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className={closeButtonClasses}
            aria-label="بستن"
          >
            ✕
          </button>
        )}
        {children}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}