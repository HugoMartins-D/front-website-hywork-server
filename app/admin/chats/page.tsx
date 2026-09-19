// app/admin/chats/page.tsx
'use client';

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import Image from 'next/image';
import Modal from '@/components/Modal';
import DateRangePicker from '@/components/DateRangePicker';
import { useToast } from '@/components/NotificationToast';

// ==================== تایپ‌ها ====================
interface ChatUser {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

interface Conversation {
  id: number;
  user1: ChatUser;
  user2: ChatUser;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isBlocked: boolean;
  blockedUntil: string | null;
  blockStartDate: string | null;
  blockReason: string | null;
  reportedCount: number;
  warningCount: number;
  selected: boolean;
  blockDuration?: string;
  blockDateRange?: DateRangeValue | null;
}

type MessageType = 'text' | 'image' | 'video' | 'audio' | 'location';

interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  receiverId: number;
  receiverName: string;
  text: string;
  type: MessageType;
  timestamp: string;
  isReported: boolean;
  isPinned: boolean;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  location?: { lat: number; lng: number };
}

interface DateRangeValue {
  start: string;
  end: string;
}

interface WarningHistoryItem {
  id: number;
  conversationId: number;
  message: string;
  date: string;
  time: string;
  admin: string;
}

interface ModalConfigState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  type: string;
}

interface StatsState {
  totalMessages: number;
  reportedCount: number;
  activeConversations: number;
}

// ==================== آیکون‌های SVG ====================
const ChatCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChatConversationCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const Lightning01Icon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z" />
  </svg>
);

const BellRingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const StopSignIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

const FileCodeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="m10 13-2 2 2 2" />
    <path d="m14 17 2-2-2-2" />
  </svg>
);

const TriangleWarningIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
    <path d="M12 3L2 21h20L12 3z" />
  </svg>
);

const SquareCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const NotificationSquare01Icon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const FileDownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M12 18v-6" />
    <path d="m9 15 3 3 3-3" />
  </svg>
);

const TrashFullIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const CheckboxCheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

const CaretDownSmIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 17v5" />
    <path d="M9 10.5a2 2 0 0 1 6 0 2 2 0 0 1-6 0z" />
    <path d="M17 10.5c0-2.76-2.24-5-5-5s-5 2.24-5 5c0 2.76 2.24 5 5 5s5-2.24 5-5z" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const EditPencilIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
  </svg>
);

// ==================== کامپوننت سلکت سفارشی ====================
interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomSelect = ({ options, value, onChange, placeholder }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        dropdownRef.current.style.top = 'auto';
        dropdownRef.current.style.bottom = '100%';
        dropdownRef.current.style.marginTop = '0';
        dropdownRef.current.style.marginBottom = '8px';
      } else {
        dropdownRef.current.style.top = '100%';
        dropdownRef.current.style.bottom = 'auto';
        dropdownRef.current.style.marginTop = '8px';
        dropdownRef.current.style.marginBottom = '0';
      }
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={selectRef} className="relative min-w-32.5">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-3.5 py-2 border rounded-xl text-[13px] font-inherit bg-(--color-bg-primary) cursor-pointer transition-all duration-200 text-(--color-text-primary) ${
          isOpen 
            ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' 
            : 'border-(--color-border-color)'
        }`}
      >
        <span className="text-[13px]">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`inline-flex transition-transform duration-200 mr-2 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <CaretDownSmIcon />
        </span>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 left-0 bg-(--color-bg-card) border border-(--color-border-color) rounded-xl shadow-lg z-50 overflow-hidden mt-2"
        >
          {options.map(opt => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`px-4 py-2.5 text-[13px] cursor-pointer transition-all duration-150 whitespace-nowrap text-(--color-text-primary) hover:bg-(--color-bg-surface) ${
                opt.value === value ? 'bg-(--color-bg-surface) font-medium' : ''
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== کامپوننت منوی سه نقطه برای پیام ====================
interface MessageDropdownProps {
  messageId: number;
  isOpen: boolean;
  onClose: () => void;
  onPin: () => void;
  onReport: () => void;
  onDelete: () => void;
  anchorRefs: React.RefObject<Record<number, HTMLDivElement | null>>;
}

const MessageDropdown = ({ messageId, isOpen, onClose, onPin, onReport, onDelete, anchorRefs }: MessageDropdownProps) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [menuHeight, setMenuHeight] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const anchorEl = anchorRefs.current?.[messageId];
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const estimatedMenuHeight = menuHeight > 0 ? menuHeight : 140;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
        top = rect.top - estimatedMenuHeight - 8;
      } else {
        top = rect.bottom + 8;
      }
      top = Math.max(8, Math.min(top, viewportHeight - estimatedMenuHeight - 8));
      let left = rect.right - 180;
      left = Math.max(8, Math.min(left, viewportWidth - 190));
      setMenuPosition({ top, left });
    }
  }, [isOpen, menuHeight, anchorRefs, messageId]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const height = menuRef.current.offsetHeight;
      if (height !== menuHeight) setMenuHeight(height);
    }
  }, [isOpen, menuHeight]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const anchorEl = anchorRefs.current?.[messageId];
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          anchorEl && !anchorEl.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleScrollOrResize = () => onClose();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen, onClose, anchorRefs, messageId]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-(--color-bg-card) rounded-xl shadow-lg min-w-45 z-[9999] overflow-hidden border border-(--color-border-color)"
      style={{ top: menuPosition.top, left: menuPosition.left }}
    >
      <button onClick={() => { onPin(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
        <span className="w-4 h-4"><PinIcon /></span>
        <span>پین کردن پیام</span>
      </button>
      <button onClick={() => { onReport(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
        <span className="w-4 h-4"><TriangleWarningIcon /></span>
        <span>گزارش پیام</span>
      </button>
      <button onClick={() => { onDelete(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-red-500 hover:bg-red-500/10">
        <span className="w-4 h-4"><TrashFullIcon /></span>
        <span>حذف پیام</span>
      </button>
    </div>
  );
};

// ==================== کامپوننت منوی سه نقطه برای مکالمه ====================
interface ConversationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onBlock: () => void;
  onEditBlock: () => void;
  onUnblock: () => void;
  onWarningHistory: () => void;
  onNewWarning: () => void;
  onExport: () => void;
  onClear: () => void;
  anchorRef: React.RefObject<HTMLDivElement | null>;
}

const ConversationDropdown = ({
  isOpen, onClose, conversation, onBlock, onEditBlock, onUnblock,
  onWarningHistory, onNewWarning, onExport, onClear, anchorRef
}: ConversationDropdownProps) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [menuHeight, setMenuHeight] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const isBlocked = conversation?.isBlocked || false;
  const warningCount = conversation?.warningCount || 0;

  useLayoutEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const estimatedMenuHeight = menuHeight > 0 ? menuHeight : 300;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top;
      if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
        top = rect.top - estimatedMenuHeight - 8;
      } else {
        top = rect.bottom + 8;
      }
      top = Math.max(8, Math.min(top, viewportHeight - estimatedMenuHeight - 8));
      let left = rect.right - 220;
      left = Math.max(8, Math.min(left, viewportWidth - 230));
      setMenuPosition({ top, left });
    }
  }, [isOpen, menuHeight, anchorRef]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const height = menuRef.current.offsetHeight;
      if (height !== menuHeight) setMenuHeight(height);
    }
  }, [isOpen, menuHeight]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          anchorRef?.current && !anchorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleScrollOrResize = () => onClose();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !conversation) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-(--color-bg-card) rounded-xl shadow-lg min-w-55 z-[9999] overflow-hidden border border-(--color-border-color)"
      style={{ top: menuPosition.top, left: menuPosition.left }}
    >
      {!isBlocked ? (
        <button onClick={() => { onBlock(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
          <span className="w-4 h-4"><StopSignIcon /></span>
          <span>مسدود کردن مکالمه</span>
        </button>
      ) : (
        <>
          <button onClick={() => { onUnblock(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
            <span className="w-4 h-4"><CloseSmIcon /></span>
            <span>رفع مسدودیت</span>
          </button>
          <button onClick={() => { onEditBlock(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
            <span className="w-4 h-4"><EditPencilIcon /></span>
            <span>ویرایش مسدودیت</span>
          </button>
          {conversation.blockStartDate && (
            <div className="px-4 py-2.5 bg-amber-500/15 border-t border-b border-(--color-border-color)">
              <div className="text-[11px] font-semibold text-amber-600">🔒 اطلاعات مسدودیت:</div>
              <div className="text-[10px] text-(--color-text-primary) leading-relaxed">
                از {conversation.blockStartDate} تا {conversation.blockedUntil || 'دائم'}
                {conversation.blockReason && <div>دلیل: {conversation.blockReason}</div>}
              </div>
            </div>
          )}
        </>
      )}
      <button onClick={() => { onWarningHistory(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
        <span className="w-4 h-4"><TriangleWarningIcon /></span>
        <span>تاریخچه اخطارها ({warningCount})</span>
      </button>
      <button onClick={() => { onNewWarning(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
        <span className="w-4 h-4"><NotificationSquare01Icon /></span>
        <span>ارسال اخطار جدید</span>
      </button>
      <button onClick={() => { onExport(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
        <span className="w-4 h-4"><FileDownloadIcon /></span>
        <span>خروجی مکالمه</span>
      </button>
      <button onClick={() => { onClear(); onClose(); }} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-right transition-colors duration-200 text-red-500 hover:bg-red-500/10">
        <span className="w-4 h-4"><TrashFullIcon /></span>
        <span>پاک کردن کل مکالمه</span>
      </button>
    </div>
  );
};

// ==================== توابع کمکی ====================
const toPersianNumber = (num: number) => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return num.toString().replace(/\d/g, d => persianDigits[parseInt(d)]);
};

const badWords = ['فحش', 'کلمه بد', 'اسپم', 'توهین', 'فحاشی'];
const containsBadWord = (text: string) => badWords.some(word => text?.includes(word));

// ==================== داده‌های نمونه (mock) ====================
const getInitialConversations = (): Conversation[] => [
  { id: 1, user1: { id: 101, name: 'علی محمدی', avatar: 'ع', status: 'online' }, user2: { id: 102, name: 'زهرا کریمی', avatar: 'ز', status: 'offline' }, lastMessage: 'سلام چطوری؟', lastMessageTime: '۱۴۰۳/۰۲/۱۶ ۱۴:۳۰', unreadCount: 3, isBlocked: false, blockedUntil: null, blockStartDate: null, blockReason: null, reportedCount: 0, warningCount: 0, selected: false },
  { id: 2, user1: { id: 103, name: 'محمد رضایی', avatar: 'م', status: 'online' }, user2: { id: 104, name: 'سارا حسینی', avatar: 'س', status: 'online' }, lastMessage: 'فیلم رو دیدی؟', lastMessageTime: '۱۴۰۳/۰۲/۱۶ ۱۳:۱۵', unreadCount: 0, isBlocked: false, blockedUntil: null, blockStartDate: null, blockReason: null, reportedCount: 2, warningCount: 1, selected: false },
  { id: 3, user1: { id: 105, name: 'رضا احمدی', avatar: 'ر', status: 'offline' }, user2: { id: 106, name: 'نازنین کریمی', avatar: 'ن', status: 'offline' }, lastMessage: 'ممنون از راهنماییت', lastMessageTime: '۱۴۰۳/۰۲/۱۵ ۲۲:۱۰', unreadCount: 1, isBlocked: true, blockedUntil: '۱۴۰۳/۰۳/۰۱', blockStartDate: '۱۴۰۳/۰۲/۲۰', blockReason: 'توهین و الفاظ نامناسب', reportedCount: 5, warningCount: 3, selected: false },
];

const getInitialWarningHistory = (): WarningHistoryItem[] => [
  { id: 1, conversationId: 2, message: 'استفاده از الفاظ نامناسب', date: '۱۴۰۳/۰۲/۱۰', time: '۱۴:۳۰', admin: 'مدیر سایت' },
  { id: 2, conversationId: 3, message: 'ارسال محتوای نامرتبط', date: '۱۴۰۳/۰۲/۰۵', time: '۱۱:۲۰', admin: 'مدیر سایت' },
  { id: 3, conversationId: 3, message: 'توهین به کاربر دیگر', date: '۱۴۰۳/۰۲/۰۱', time: '۰۹:۱۵', admin: 'مدیر ارشد' },
];

const getMockMessages = (conversation: Conversation): ChatMessage[] => [
  { id: 1, senderId: conversation.user1.id, senderName: conversation.user1.name, senderAvatar: conversation.user1.avatar, receiverId: conversation.user2.id, receiverName: conversation.user2.name, text: 'سلام چطوری؟', type: 'text', timestamp: '۱۴۰۳/۰۲/۱۶ ۱۰:۰۰', isReported: false, isPinned: false },
  { id: 2, senderId: conversation.user2.id, senderName: conversation.user2.name, senderAvatar: conversation.user2.avatar, receiverId: conversation.user1.id, receiverName: conversation.user1.name, text: 'سلام خوبم تو چطوری؟', type: 'text', timestamp: '۱۴۰۳/۰۲/۱۶ ۱۰:۰۵', isReported: false, isPinned: false },
  { id: 3, senderId: conversation.user1.id, senderName: conversation.user1.name, senderAvatar: conversation.user1.avatar, receiverId: conversation.user2.id, receiverName: conversation.user2.name, text: 'خوبم ممنون 😊', type: 'text', timestamp: '۱۴۰۳/۰۲/۱۶ ۱۰:۱۰', isReported: false, isPinned: false },
  { id: 4, senderId: conversation.user2.id, senderName: conversation.user2.name, senderAvatar: conversation.user2.avatar, receiverId: conversation.user1.id, receiverName: conversation.user1.name, text: 'عکس محصول', type: 'image', imageUrl: 'https://picsum.photos/300/200?random=1', timestamp: '۱۴۰۳/۰۲/۱۶ ۱۰:۱۵', isReported: false, isPinned: false },
];

// ==================== کامپوننت اصلی ====================
export default function ChatManagement() {
  const { addToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>(getInitialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [loading, setLoading] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<number[]>([]);
  const [isBulkDeleteMode, setIsBulkDeleteMode] = useState(false);
  const [stats, setStats] = useState<StatsState>(() => ({
    totalMessages: 245,
    reportedCount: 8,
    activeConversations: getInitialConversations().length,
  }));
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [showGroupActions, setShowGroupActions] = useState(false);
  const [selectAllMode, setSelectAllMode] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockDuration, setBlockDuration] = useState('permanent');
  const [blockDateRange, setBlockDateRange] = useState<DateRangeValue | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [warningHistory, setWarningHistory] = useState<WarningHistoryItem[]>(getInitialWarningHistory);
  const [showWarningHistoryModal, setShowWarningHistoryModal] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [isEditingBlock, setIsEditingBlock] = useState(false);
  const [bulkBlockDuration, setBulkBlockDuration] = useState('permanent');
  const [bulkBlockDateRange, setBulkBlockDateRange] = useState<DateRangeValue | null>(null);
  const [bulkBlockReason, setBulkBlockReason] = useState('');
  const [showBulkBlockModal, setShowBulkBlockModal] = useState(false);
  const [showBulkDateRangePicker, setShowBulkDateRangePicker] = useState(false);

  const [modalConfig, setModalConfig] = useState<ModalConfigState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'confirm'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const convDropdownAnchorRef = useRef<HTMLDivElement>(null);
  const messageButtonRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const dateRangeBtnRef = useRef<HTMLButtonElement>(null);
  const bulkDateRangeBtnRef = useRef<HTMLButtonElement>(null);

  // اسکرول به پایین وقتی پیام‌های مکالمه بارگذاری می‌شوند
  useEffect(() => {
    if (messages.length > 0) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  const showConfirmModal = (title: string, message: string, onConfirm: () => void) => {
    setModalConfig({ isOpen: true, title, message, onConfirm, type: 'confirm' });
  };

  // انتخاب مکالمه و بارگذاری پیام‌ها
  const handleSelectConversation = useCallback((conv: Conversation) => {
    setSelectedConversation(conv);
    setSelectedMessages([]);
    setIsBulkDeleteMode(false);
    const mockMessages = getMockMessages(conv);
    setMessages(mockMessages);
    setStats(prev => ({ ...prev, totalMessages: mockMessages.length, reportedCount: mockMessages.filter(m => m.isReported).length }));
    setLoading(false);
  }, []);

  // عملیات‌ها
  const handleDeleteMessage = useCallback((messageId: number) => {
    showConfirmModal('حذف پیام', 'آیا از حذف این پیام مطمئن هستید؟', () => {
      setMessages(prev => prev.filter(m => m.id !== messageId));
      addToast('پیام با موفقیت حذف شد', 'success');
      setOpenDropdownId(null);
    });
  }, [addToast]);

  const handleBulkDeleteMessages = useCallback(() => {
    if (selectedMessages.length === 0) { addToast('لطفا حداقل یک پیام را انتخاب کنید', 'warning'); return; }
    showConfirmModal('حذف گروهی پیام‌ها', `آیا از حذف ${toPersianNumber(selectedMessages.length)} پیام انتخاب شده مطمئن هستید؟`, () => {
      setMessages(prev => prev.filter(m => !selectedMessages.includes(m.id)));
      setSelectedMessages([]);
      setIsBulkDeleteMode(false);
      addToast(`${toPersianNumber(selectedMessages.length)} پیام با موفقیت حذف شد`, 'success');
    });
  }, [addToast, selectedMessages]);

  const handleBulkWarningMessages = useCallback(() => {
    if (selectedMessages.length === 0) { addToast('لطفا حداقل یک پیام را انتخاب کنید', 'warning'); return; }
    showConfirmModal('اخطار گروهی پیام‌ها', `آیا از ارسال اخطار برای ${toPersianNumber(selectedMessages.length)} پیام انتخاب شده مطمئن هستید؟`, () => {
      addToast(`${toPersianNumber(selectedMessages.length)} پیام با اخطار مواجه شد`, 'info');
      setSelectedMessages([]);
      setIsBulkDeleteMode(false);
    });
  }, [addToast, selectedMessages]);

  const handleClearConversation = useCallback(() => {
    showConfirmModal('پاک کردن مکالمه', `آیا از پاک کردن تمام پیام‌های این مکالمه مطمئن هستید؟`, () => {
      setMessages([]);
      addToast('کل مکالمه با موفقیت پاک شد', 'success');
      setOpenDropdownId(null);
    });
  }, [addToast]);

  const handlePinMessage = useCallback((messageId: number) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !m.isPinned } : m));
    addToast('پیام با موفقیت پین شد', 'success');
    setOpenDropdownId(null);
  }, [addToast]);

  const handleReportMessage = useCallback((messageId: number) => {
    showConfirmModal('گزارش پیام', 'آیا از گزارش این پیام مطمئن هستید؟', () => {
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isReported: true } : m));
      addToast('پیام گزارش شد', 'info');
      setOpenDropdownId(null);
    });
  }, [addToast]);

  const handleBlockConversation = useCallback(() => {
    if (!selectedConversation) return;
    let untilText = '', blockEndDate: string | null = null, blockStartDate: string | null = null;
    if (blockDateRange) {
      blockStartDate = new Date(blockDateRange.start).toLocaleDateString('fa-IR');
      blockEndDate = new Date(blockDateRange.end).toLocaleDateString('fa-IR');
      untilText = ` از ${blockStartDate} تا ${blockEndDate}`;
    } else if (blockDuration !== 'permanent') {
      const days = parseInt(blockDuration);
      blockStartDate = new Date().toLocaleDateString('fa-IR');
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      blockEndDate = endDate.toLocaleDateString('fa-IR');
      untilText = ` تا تاریخ ${blockEndDate}`;
    }
    const confirmMessage = isEditingBlock ? `آیا از ویرایش مسدودیت مکالمه${untilText} مطمئن هستید؟` : `آیا از مسدود کردن مکالمه${untilText} مطمئن هستید؟`;
    showConfirmModal(isEditingBlock ? 'ویرایش مسدودیت' : 'مسدود کردن مکالمه', confirmMessage, () => {
      const updated = conversations.map(c => c.id === selectedConversation.id ? { ...c, isBlocked: true, blockedUntil: blockEndDate, blockStartDate: blockStartDate, blockReason: blockReason } : c);
      setConversations(updated);
      setSelectedConversation(updated.find(c => c.id === selectedConversation.id) || null);
      addToast(isEditingBlock ? `مسدودیت مکالمه ویرایش شد${untilText}` : `مکالمه مسدود شد${untilText}`, 'warning');
      setShowBlockModal(false);
      setBlockDuration('permanent');
      setBlockDateRange(null);
      setBlockReason('');
      setOpenDropdownId(null);
      setIsEditingBlock(false);
    });
  }, [addToast, selectedConversation, blockDateRange, blockDuration, blockReason, isEditingBlock, conversations]);

  const handleUnblockConversation = useCallback(() => {
    if (!selectedConversation) return;
    showConfirmModal('رفع مسدودیت مکالمه', 'آیا از رفع مسدودیت این مکالمه مطمئن هستید؟', () => {
      const updated = conversations.map(c => c.id === selectedConversation.id ? { ...c, isBlocked: false, blockedUntil: null, blockStartDate: null, blockReason: null } : c);
      setConversations(updated);
      setSelectedConversation(updated.find(c => c.id === selectedConversation.id) || null);
      addToast('مسدودیت مکالمه لغو شد', 'success');
      setOpenDropdownId(null);
    });
  }, [addToast, selectedConversation, conversations]);

  const handleEditBlock = useCallback(() => {
    const conv = selectedConversation;
    if (!conv) return;
    if (conv.blockDuration && conv.blockDuration !== 'permanent') setBlockDuration(conv.blockDuration);
    else if (conv.blockDateRange) { setBlockDuration('custom'); setBlockDateRange(conv.blockDateRange); }
    else setBlockDuration('permanent');
    setBlockReason(conv.blockReason || '');
    setIsEditingBlock(true);
    setShowBlockModal(true);
    setOpenDropdownId(null);
  }, [selectedConversation]);

  const handleSendWarning = useCallback(() => {
    if (!warningMessage.trim()) { addToast('لطفا متن اخطار را وارد کنید', 'warning'); return; }
    if (!selectedConversation) return;
    const newWarning: WarningHistoryItem = { id: Date.now(), conversationId: selectedConversation.id, message: warningMessage, date: new Date().toLocaleDateString('fa-IR'), time: new Date().toLocaleTimeString('fa-IR'), admin: 'مدیر سایت' };
    showConfirmModal('ارسال اخطار', `آیا از ارسال اخطار به ${selectedConversation.user1.name} و ${selectedConversation.user2.name} مطمئن هستید؟\nمتن: ${warningMessage}`, () => {
      setWarningHistory(prev => [...prev, newWarning]);
      const updated = conversations.map(c => c.id === selectedConversation.id ? { ...c, warningCount: (c.warningCount || 0) + 1 } : c);
      setConversations(updated);
      setSelectedConversation(updated.find(c => c.id === selectedConversation.id) || null);
      addToast(`اخطار ارسال شد`, 'info');
      setWarningMessage('');
      setShowWarningModal(false);
      setOpenDropdownId(null);
    });
  }, [addToast, warningMessage, selectedConversation, conversations]);

  const handleExportConversation = useCallback(() => {
    if (!selectedConversation) return;
    const exportData = { conversation: selectedConversation, messages, warningHistory: warningHistory.filter(w => w.conversationId === selectedConversation.id), exportDate: new Date().toISOString() };
    const dataStr = JSON.stringify(exportData, null, 2);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    link.download = `conversation_${selectedConversation.user1.name}_${selectedConversation.user2.name}_${Date.now()}.json`;
    link.click();
    addToast('مکالمه با موفقیت ذخیره شد', 'success');
    setOpenDropdownId(null);
  }, [addToast, selectedConversation, warningHistory]);

  const handleSendBroadcast = useCallback(() => {
    if (!broadcastMessage.trim()) { addToast('لطفا متن پیام را وارد کنید', 'warning'); return; }
    addToast(`اعلان سراسری ارسال شد: ${broadcastMessage}`, 'success');
    setShowBroadcastModal(false);
    setBroadcastMessage('');
  }, [addToast, broadcastMessage]);

  const handleBulkBlock = useCallback(() => {
    const selectedConvs = selectAllMode ? conversations : conversations.filter(c => c.selected);
    if (selectedConvs.length === 0) { addToast('لطفا حداقل یک مکالمه را انتخاب کنید', 'warning'); return; }
    setShowBulkBlockModal(true);
  }, [addToast, selectAllMode, conversations]);

  const confirmBulkBlock = useCallback(() => {
    const selectedConvs = selectAllMode ? conversations : conversations.filter(c => c.selected);
    const selectedIds = selectedConvs.map(c => c.id);
    let blockEndDate: string | null = null, blockStartDate: string | null = null;
    if (bulkBlockDateRange) {
      blockStartDate = new Date(bulkBlockDateRange.start).toLocaleDateString('fa-IR');
      blockEndDate = new Date(bulkBlockDateRange.end).toLocaleDateString('fa-IR');
    } else if (bulkBlockDuration !== 'permanent') {
      blockStartDate = new Date().toLocaleDateString('fa-IR');
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(bulkBlockDuration));
      blockEndDate = endDate.toLocaleDateString('fa-IR');
    }
    showConfirmModal('مسدودیت گروهی', `آیا از مسدود کردن ${toPersianNumber(selectedConvs.length)} مکالمه مطمئن هستید؟`, () => {
      const updated = conversations.map(conv => selectedIds.includes(conv.id) ? { ...conv, isBlocked: true, blockedUntil: blockEndDate, blockStartDate: blockStartDate, blockReason: bulkBlockReason } : conv);
      setConversations(updated);
      if (selectedConversation && selectedIds.includes(selectedConversation.id))
        setSelectedConversation(updated.find(c => c.id === selectedConversation.id) || null);
      addToast(`${toPersianNumber(selectedConvs.length)} مکالمه مسدود شد`, 'warning');
      setShowBulkBlockModal(false);
      setBulkBlockDuration('permanent');
      setBulkBlockDateRange(null);
      setBulkBlockReason('');
      setSelectAllMode(false);
      setConversations(prev => prev.map(c => ({ ...c, selected: false })));
    });
  }, [addToast, selectAllMode, conversations, bulkBlockDateRange, bulkBlockDuration, bulkBlockReason, selectedConversation]);

  const handleBulkExport = useCallback(() => {
    const selectedConvs = selectAllMode ? conversations : conversations.filter(c => c.selected);
    if (selectedConvs.length === 0) { addToast('لطفا حداقل یک مکالمه را انتخاب کنید', 'warning'); return; }
    const exportData = { exportDate: new Date().toISOString(), conversations: selectedConvs.map((conv) => ({ ...conv, messages: [], warningHistory: warningHistory.filter(w => w.conversationId === conv.id) })) };
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    link.download = `conversations_export_${Date.now()}.json`;
    link.click();
    addToast(`خروجی ${toPersianNumber(selectedConvs.length)} مکالمه گرفته شد`, 'success');
    setSelectAllMode(false);
    setConversations(prev => prev.map(c => ({ ...c, selected: false })));
  }, [addToast, selectAllMode, conversations, warningHistory]);

  // رفع خطای set-state-in-effect با استفاده از useCallback و setTimeout
  const handleOpenMenu = useCallback((menuId: string | null) => {
    setTimeout(() => {
      setOpenDropdownId(menuId);
    }, 0);
  }, []);

  const filteredMessages = messages.filter((msg) => {
    if (filterType !== 'all' && msg.type !== filterType) return false;
    if (filterDate !== 'all') {
      const msgDate = new Date(msg.timestamp);
      const now = new Date();
      if (filterDate === 'today' && msgDate.toDateString() !== now.toDateString()) return false;
      if (filterDate === 'week') { const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); if (msgDate < weekAgo) return false; }
    }
    if (searchTerm && !msg.text?.includes(searchTerm) && !msg.senderName?.includes(searchTerm)) return false;
    return true;
  });

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const conversationWarnings = warningHistory.filter(w => w.conversationId === selectedConversation?.id);

  const renderMessageContent = (msg: ChatMessage) => {
    const hasBadWord = containsBadWord(msg.text);
    switch (msg.type) {
      case 'image':
        return (
          <div>
            {msg.imageUrl && (
              <Image
                src={msg.imageUrl}
                alt="تصویر"
                width={200}
                height={133}
                unoptimized
                className="max-w-50 w-full h-auto rounded-lg cursor-pointer"
                onClick={() => window.open(msg.imageUrl)}
              />
            )}
            {msg.text && <div className="text-[11px] mt-1">{msg.text}</div>}
          </div>
        );
      case 'video':
        return (
          <div>
            <video controls src={msg.videoUrl} className="max-w-62.5 rounded-lg" />
            {msg.text && <div>{msg.text}</div>}
          </div>
        );
      case 'audio':
        return (
          <div>
            <audio controls src={msg.audioUrl} className="w-50" />
            {msg.text && <div>{msg.text}</div>}
          </div>
        );
      case 'location':
        return (
          <div>
            <div>📍 موقعیت مکانی:</div>
            <a href={`https://www.google.com/maps?q=${msg.location?.lat},${msg.location?.lng}`} target="_blank" rel="noopener noreferrer" className="text-blue-500">مشاهده روی نقشه</a>
          </div>
        );
      default:
        return (
          <div>
            {hasBadWord && (
              <div className="bg-red-100 text-red-500 text-[10px] px-1.5 py-0.5 rounded mb-1">⚠️ محتوای نامناسب شناسایی شد</div>
            )}
            <div>{msg.text}</div>
          </div>
        );
    }
  };

  if (loading && !selectedConversation) {
    return (
      <div className="flex items-center justify-center min-h-100 text-(--color-text-secondary)">
        در حال بارگذاری...
      </div>
    );
  }

  return (
    <div className="w-full max-w-350 mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[28px] font-bold text-(--color-text-primary) m-0">مدیریت چت‌های کاربران</h1>
        <p className="text-sm text-(--color-text-secondary) mt-1">مشاهده و مدیریت پیام‌های بین کاربران</p>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 mb-5 p-3 px-5 bg-(--color-bg-card) rounded-2xl border border-(--color-border-color)">
        <div className="flex items-center gap-1.5 text-[13px] text-(--color-text-secondary) px-3 py-1 bg-(--color-bg-surface) rounded-full">
          <ChatCircleIcon /> مکالمات فعال: {toPersianNumber(stats.activeConversations)}
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-(--color-text-secondary) px-3 py-1 bg-(--color-bg-surface) rounded-full">
          <ChatConversationCircleIcon /> کل پیام‌ها: {toPersianNumber(stats.totalMessages)}
        </div>
        <div className="flex items-center gap-1.5 text-[13px] text-(--color-text-secondary) px-3 py-1 bg-(--color-bg-surface) rounded-full">
          <TriangleWarningIcon /> پیام‌های گزارش شده: {toPersianNumber(stats.reportedCount)}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex flex-col lg:flex-row bg-(--color-bg-card) rounded-2xl overflow-hidden border border-(--color-border-color) min-h-162.5">
        {/* Conversations Sidebar */}
        <div className="w-full lg:w-105 border-b lg:border-b-0 lg:border-l border-(--color-border-color) bg-(--color-bg-card) flex flex-col">
          <div className="p-4 border-b border-(--color-border-color)">
            <div className="flex items-center gap-2">
              <SearchIcon />
              <input
                type="text"
                placeholder="جستجوی مکالمات..."
                className="flex-1 px-3.5 py-2.5 rounded-full border border-(--color-border-color) text-[13px] outline-none bg-(--color-bg-primary) text-(--color-text-primary)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setShowGroupActions(!showGroupActions)}
                className="w-10 h-10 rounded-full bg-purple-500 border-none cursor-pointer flex items-center justify-center hover:bg-purple-600 transition-colors"
              >
                <Lightning01Icon />
              </button>
            </div>
            {showGroupActions && (
              <div className="mt-3 p-3 bg-(--color-bg-surface) rounded-xl border border-(--color-border-color)">
                <h4 className="text-[13px] font-semibold text-(--color-text-primary) mb-2">عملیات گروهی</h4>
                <button onClick={() => setShowBroadcastModal(true)} className="flex items-center w-full p-2 bg-(--color-bg-card) border border-(--color-border-color) rounded-lg text-[12px] cursor-pointer mb-1.5 text-right text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
                  <BellRingIcon /> <span className="mr-2">ارسال اعلان سراسری</span>
                </button>
                <button onClick={handleBulkBlock} className="flex items-center w-full p-2 bg-(--color-bg-card) border border-(--color-border-color) rounded-lg text-[12px] cursor-pointer mb-1.5 text-right text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
                  <StopSignIcon /> <span className="mr-2">مسدودیت گروهی مکالمات</span>
                </button>
                <button onClick={handleBulkExport} className="flex items-center w-full p-2 bg-(--color-bg-card) border border-(--color-border-color) rounded-lg text-[12px] cursor-pointer mb-1.5 text-right text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
                  <FileCodeIcon /> <span className="mr-2">خروجی گروهی مکالمات</span>
                </button>
                <button onClick={() => addToast('گزارش تخلفات صادر شد', 'info')} className="flex items-center w-full p-2 bg-(--color-bg-card) border border-(--color-border-color) rounded-lg text-[12px] cursor-pointer mb-1.5 text-right text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
                  <TriangleWarningIcon /> <span className="mr-2">گزارش تخلفات</span>
                </button>
                <button onClick={() => setSelectAllMode(!selectAllMode)} className="flex items-center w-full p-2 bg-(--color-bg-card) border border-(--color-border-color) rounded-lg text-[12px] cursor-pointer text-right text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
                  <SquareCheckIcon /> <span className="mr-2">{selectAllMode ? 'لغو انتخاب همه' : 'انتخاب همه مکالمات'}</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.filter((c) => c.user1.name.includes(searchTerm) || c.user2.name.includes(searchTerm)).map((conv) => (
              <div
                key={conv.id}
                className={`flex items-center gap-3 p-3.5 px-4 cursor-pointer transition-colors duration-200 border-b border-(--color-border-light) ${
                  selectedConversation?.id === conv.id ? 'bg-(--color-bg-surface)' : ''
                } ${conv.isBlocked ? 'bg-red-500/10 opacity-70' : ''}`}
                onClick={() => handleSelectConversation(conv)}
              >
                <input
                  type="checkbox"
                  checked={conv.selected || selectAllMode}
                  onChange={(e) => { e.stopPropagation(); setConversations(prev => prev.map((c) => c.id === conv.id ? { ...c, selected: e.target.checked } : c)); }}
                  className="cursor-pointer"
                />
                <div className="flex flex-col gap-0.5">
                  <div className="w-8 h-8 rounded-full bg-(--color-bg-surface) flex items-center justify-center font-bold text-sm text-(--color-text-primary)">{conv.user1.avatar}</div>
                  <div className="w-8 h-8 rounded-full bg-(--color-bg-surface) flex items-center justify-center font-bold text-sm text-(--color-text-primary)">{conv.user2.avatar}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-(--color-text-primary) flex items-center gap-1.5 flex-wrap">
                    {conv.user1.name} ↔ {conv.user2.name}
                    {conv.isBlocked && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">مسدود</span>}
                    {conv.warningCount > 0 && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full">{toPersianNumber(conv.warningCount)} اخطار</span>}
                  </div>
                  <div className="text-[11px] text-(--color-text-muted) truncate">{conv.lastMessage}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {conv.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-4.5 text-center">
                      {toPersianNumber(conv.unreadCount)}
                    </div>
                  )}
                  <div className="text-[9px] text-(--color-text-muted)">{conv.lastMessageTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Main */}
        <div className="flex-1 flex flex-col bg-(--color-bg-primary)">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 px-5 bg-(--color-bg-card) border-b border-(--color-border-color) flex-wrap flex justify-between items-center gap-2.5">
                <div>
                  <div className="text-[15px] font-semibold text-(--color-text-primary)">
                    {selectedConversation.user1.name} ↔ {selectedConversation.user2.name}
                  </div>
                  <div className="text-[11px] text-(--color-text-muted) mt-0.5">
                    {selectedConversation.isBlocked
                      ? `🔒 مسدود شده ${selectedConversation.blockedUntil ? `تا ${selectedConversation.blockedUntil}` : 'دائم'}`
                      : `${selectedConversation.user1.status === 'online' ? '🟢 آنلاین' : '⚫ آفلاین'} | ${selectedConversation.user2.status === 'online' ? '🟢 آنلاین' : '⚫ آفلاین'}`
                    }
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div ref={convDropdownAnchorRef} className="relative">
                    <button
                      onClick={() => handleOpenMenu(openDropdownId === 'conv' ? null : 'conv')}
                      className="px-3 py-1.5 bg-(--color-bg-surface) border border-(--color-border-color) rounded-lg cursor-pointer flex items-center"
                    >
                      <MoreVerticalIcon />
                    </button>
                    <ConversationDropdown
                      isOpen={openDropdownId === 'conv'}
                      onClose={() => setOpenDropdownId(null)}
                      conversation={selectedConversation}
                      onBlock={() => { setIsEditingBlock(false); setBlockDuration('permanent'); setBlockDateRange(null); setBlockReason(''); setShowBlockModal(true); }}
                      onEditBlock={handleEditBlock}
                      onUnblock={handleUnblockConversation}
                      onWarningHistory={() => setShowWarningHistoryModal(true)}
                      onNewWarning={() => { setWarningMessage(''); setShowWarningModal(true); }}
                      onExport={handleExportConversation}
                      onClear={handleClearConversation}
                      anchorRef={convDropdownAnchorRef}
                    />
                  </div>
                  <button
                    onClick={() => setIsBulkDeleteMode(!isBulkDeleteMode)}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-(--color-bg-surface) border border-(--color-border-color) rounded-full text-[12px] cursor-pointer text-(--color-text-primary)"
                  >
                    {isBulkDeleteMode ? (
                      <><CloseSmIcon /> لغو</>
                    ) : (
                      <><CheckboxCheckIcon /> انتخاب گروهی پیام</>
                    )}
                  </button>
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'همه پیام‌ها' },
                      { value: 'text', label: 'متن' },
                      { value: 'image', label: 'تصاویر' },
                      { value: 'video', label: 'ویدیوها' },
                      { value: 'audio', label: 'صوت‌ها' },
                      { value: 'location', label: 'لوکیشن' }
                    ]}
                    value={filterType}
                    onChange={setFilterType}
                    placeholder="نوع پیام"
                  />
                  <CustomSelect
                    options={[
                      { value: 'all', label: 'همه زمان‌ها' },
                      { value: 'today', label: 'امروز' },
                      { value: 'week', label: 'هفته جاری' }
                    ]}
                    value={filterDate}
                    onChange={setFilterDate}
                    placeholder="زمان"
                  />
                </div>
              </div>

              {/* Pinned Messages */}
              {pinnedMessages.length > 0 && (
                <div className="p-3 px-5 bg-amber-500/10 border-b border-(--color-border-color)">
                  <div className="text-[12px] font-bold text-amber-600 mb-2">📌 پیام‌های پین شده</div>
                  {pinnedMessages.map((msg) => (
                    <div key={msg.id} className="text-[12px] text-(--color-text-primary) py-1">
                      <strong>{msg.senderName}:</strong> {msg.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
                {loading ? (
                  <div className="text-center py-10 text-(--color-text-muted)">در حال بارگذاری...</div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-16 text-(--color-text-muted)">پیامی وجود ندارد</div>
                ) : (
                  filteredMessages.map((msg) => {
                    const isCurrentUser = msg.senderId === selectedConversation.user1.id;
                    const msgDropdownId = `msg_${msg.id}`;
                    return (
                      <div key={msg.id} className={`flex gap-3 items-start w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser && (
                          <div className="w-9 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-(--color-bg-surface) flex items-center justify-center font-bold text-sm text-(--color-text-primary)">
                              {msg.senderAvatar || msg.senderName.charAt(0)}
                            </div>
                          </div>
                        )}
                        <div className={`flex flex-col max-w-[60%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                          <div className="text-[10px] text-(--color-text-muted) mb-0.5 pr-2">{msg.senderName}</div>
                          <div className="relative">
                            <div className={`p-2.5 px-3.5 rounded-2xl ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                              {isBulkDeleteMode && (
                                <input
                                  type="checkbox"
                                  checked={selectedMessages.includes(msg.id)}
                                  onChange={() => setSelectedMessages(prev => prev.includes(msg.id) ? prev.filter(id => id !== msg.id) : [...prev, msg.id])}
                                  className="absolute -top-2.5 -left-5 cursor-pointer"
                                />
                              )}
                              <div className="text-[10px] font-bold mb-1 opacity-80 flex items-center gap-1.5 flex-wrap">
                                {msg.isReported && <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full">⚠️ گزارش شده</span>}
                                {msg.isPinned && <span>📌</span>}
                              </div>
                              {renderMessageContent(msg)}
                              <div className="text-[9px] mt-1.5 flex justify-end gap-2 items-center opacity-60">
                                {msg.timestamp}
                                <div ref={(el) => { messageButtonRefs.current[msg.id] = el; }}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleOpenMenu(openDropdownId === msgDropdownId ? null : msgDropdownId); }}
                                    className="bg-transparent border-none cursor-pointer p-0 flex items-center"
                                  >
                                    <MoreVerticalIcon />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <MessageDropdown
                              messageId={msg.id}
                              isOpen={openDropdownId === msgDropdownId}
                              onClose={() => setOpenDropdownId(null)}
                              onPin={() => handlePinMessage(msg.id)}
                              onReport={() => handleReportMessage(msg.id)}
                              onDelete={() => handleDeleteMessage(msg.id)}
                              anchorRefs={messageButtonRefs}
                            />
                          </div>
                        </div>
                        {isCurrentUser && (
                          <div className="w-9 shrink-0">
                            <div className="w-9 h-9 rounded-full bg-(--color-bg-surface) flex items-center justify-center font-bold text-sm text-(--color-text-primary)">
                              {msg.senderAvatar || msg.senderName.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Bulk Delete Bar */}
              {isBulkDeleteMode && selectedMessages.length > 0 && (
                <div className="p-3 px-5 bg-amber-500/10 border-t border-(--color-border-color) flex justify-between items-center">
                  <span>{toPersianNumber(selectedMessages.length)} پیام انتخاب شده</span>
                  <div className="flex gap-2">
                    <button onClick={handleBulkDeleteMessages} className="px-3.5 py-1.5 bg-red-500 border-none rounded-full text-white cursor-pointer text-[12px] hover:bg-red-600 transition-colors">
                      حذف گروهی
                    </button>
                    <button onClick={handleBulkWarningMessages} className="px-3.5 py-1.5 bg-amber-500 border-none rounded-full text-white cursor-pointer text-[12px] hover:bg-amber-600 transition-colors">
                      اخطار گروهی
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-(--color-text-muted)">
              برای مشاهده پیام‌ها، یک مکالمه را انتخاب کنید
            </div>
          )}
        </div>
      </div>

      {/* ==================== مودال‌ها ==================== */}

      {/* مودال مسدودیت گروهی */}
      <Modal isOpen={showBulkBlockModal} onClose={() => setShowBulkBlockModal(false)} size="md">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4">🚫 مسدودیت گروهی مکالمات</h3>
          <div className="bg-amber-500/15 p-3 rounded-lg mb-4 text-(--color-text-primary)">
            در حال مسدود کردن {toPersianNumber(selectAllMode ? conversations.length : conversations.filter((c) => c.selected).length)} مکالمه
          </div>
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-(--color-text-secondary) mb-1.5">مدت زمان:</label>
            <CustomSelect
              options={[
                { value: 'permanent', label: 'دائم' },
                { value: '1', label: '۱ روز' },
                { value: '3', label: '۳ روز' },
                { value: '7', label: '۱ هفته' },
                { value: '30', label: '۱ ماه' },
                { value: 'custom', label: 'بازه زمانی' },
              ]}
              value={bulkBlockDuration}
              onChange={(val) => { setBulkBlockDuration(val); if (val !== 'custom') setShowBulkDateRangePicker(false); }}
              placeholder="انتخاب مدت"
            />
          </div>
          {bulkBlockDuration === 'custom' && (
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-(--color-text-secondary) mb-1.5">بازه زمانی:</label>
              <button
                ref={bulkDateRangeBtnRef}
                onClick={() => setShowBulkDateRangePicker(!showBulkDateRangePicker)}
                className="w-full p-2.5 border border-(--color-border-color) rounded-lg text-[13px] bg-(--color-bg-primary) cursor-pointer text-right text-(--color-text-primary) flex items-center justify-between"
              >
                {bulkBlockDateRange ?
                  `${new Date(bulkBlockDateRange.start).toLocaleDateString('fa-IR')} - ${new Date(bulkBlockDateRange.end).toLocaleDateString('fa-IR')}` :
                  'انتخاب تاریخ'}
                <CalendarIcon />
              </button>
            </div>
          )}
          {bulkBlockDuration === 'custom' && showBulkDateRangePicker && (
            <div className="mt-2 p-2 bg-(--color-bg-surface) rounded-lg border border-(--color-border-color)">
              <DateRangePicker
                onSelect={(r: DateRangeValue) => { setBulkBlockDateRange(r); setShowBulkDateRangePicker(false); }}
                onClose={() => setShowBulkDateRangePicker(false)}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-(--color-text-secondary) mb-1.5">دلیل مسدودیت:</label>
            <textarea
              className="w-full p-2.5 border border-(--color-border-color) rounded-lg text-[13px] font-inherit resize-y bg-(--color-bg-primary) text-(--color-text-primary)"
              placeholder="دلیل..."
              value={bulkBlockReason}
              onChange={(e) => setBulkBlockReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowBulkBlockModal(false)} className="px-5 py-2 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-[13px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
              لغو
            </button>
            <button onClick={confirmBulkBlock} className="px-5 py-2 bg-red-500 border-none rounded-xl text-white cursor-pointer text-[13px] hover:bg-red-600 transition-colors">
              تایید مسدودیت گروهی
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال ارسال اخطار */}
      <Modal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} size="md">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4">⚠️ ارسال اخطار</h3>
          <div className="bg-amber-500/15 p-3 rounded-lg mb-4 text-(--color-text-primary)">
            ارسال به {selectedConversation?.user1.name} و {selectedConversation?.user2.name}
          </div>
          <textarea
            className="w-full p-2.5 border border-(--color-border-color) rounded-lg text-[13px] font-inherit resize-y bg-(--color-bg-primary) text-(--color-text-primary)"
            placeholder="متن اخطار..."
            value={warningMessage}
            onChange={(e) => setWarningMessage(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowWarningModal(false)} className="px-5 py-2 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-[13px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
              لغو
            </button>
            <button onClick={handleSendWarning} className="px-5 py-2 bg-amber-500 border-none rounded-xl text-white cursor-pointer text-[13px] hover:bg-amber-600 transition-colors">
              ارسال اخطار
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال مسدودیت تکی */}
      <Modal isOpen={showBlockModal} onClose={() => { setShowBlockModal(false); setIsEditingBlock(false); setBlockDuration('permanent'); setBlockDateRange(null); setBlockReason(''); setShowDateRangePicker(false); }} size="md">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4">{isEditingBlock ? '✏️ ویرایش مسدودیت' : '🚫 مسدود کردن مکالمه'}</h3>
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-(--color-text-secondary) mb-1.5">مدت زمان مسدودیت:</label>
            <CustomSelect
              options={[
                { value: 'permanent', label: 'دائم' },
                { value: '1', label: '۱ روز' },
                { value: '3', label: '۳ روز' },
                { value: '7', label: '۱ هفته' },
                { value: '30', label: '۱ ماه' },
                { value: 'custom', label: 'بازه زمانی (انتخاب دستی)' },
              ]}
              value={blockDuration}
              onChange={(val) => { setBlockDuration(val); if (val !== 'custom') { setShowDateRangePicker(false); setBlockDateRange(null); } }}
              placeholder="انتخاب مدت"
            />
          </div>
          {blockDuration === 'custom' && (
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-(--color-text-secondary) mb-1.5">بازه زمانی:</label>
              <button
                ref={dateRangeBtnRef}
                onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                className="w-full p-2.5 border border-(--color-border-color) rounded-lg text-[13px] bg-(--color-bg-primary) cursor-pointer text-right text-(--color-text-primary) flex items-center justify-between"
              >
                {blockDateRange ?
                  `${new Date(blockDateRange.start).toLocaleDateString('fa-IR')} - ${new Date(blockDateRange.end).toLocaleDateString('fa-IR')}` :
                  'انتخاب تاریخ شروع و پایان'}
                <CalendarIcon />
              </button>
            </div>
          )}
          {blockDuration === 'custom' && showDateRangePicker && (
            <div className="mt-2 p-2 bg-(--color-bg-surface) rounded-lg border border-(--color-border-color)">
              <DateRangePicker
                onSelect={(r: DateRangeValue) => { setBlockDateRange(r); setShowDateRangePicker(false); }}
                onClose={() => setShowDateRangePicker(false)}
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-[13px] font-medium text-(--color-text-secondary) mb-1.5">دلیل مسدودیت:</label>
            <textarea
              className="w-full p-2.5 border border-(--color-border-color) rounded-lg text-[13px] font-inherit resize-y bg-(--color-bg-primary) text-(--color-text-primary)"
              placeholder="دلیل مسدودیت را وارد کنید..."
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowBlockModal(false)} className="px-5 py-2 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-[13px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
              لغو
            </button>
            <button onClick={handleBlockConversation} className="px-5 py-2 bg-red-500 border-none rounded-xl text-white cursor-pointer text-[13px] hover:bg-red-600 transition-colors">
              {isEditingBlock ? 'ذخیره تغییرات' : 'تایید مسدودیت'}
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال تاریخچه اخطارها */}
      <Modal isOpen={showWarningHistoryModal} onClose={() => setShowWarningHistoryModal(false)} size="lg">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4">⚠️ تاریخچه اخطارها</h3>
          {conversationWarnings.length === 0 ? (
            <div className="text-center py-10 text-(--color-text-muted)">هیچ اخطاری ثبت نشده</div>
          ) : (
            <table className="w-full border-collapse mb-4">
              <thead>
                <tr className="border-b border-(--color-border-color)">
                  <th className="text-right p-2 text-[13px] font-semibold text-(--color-text-secondary)">ردیف</th>
                  <th className="text-right p-2 text-[13px] font-semibold text-(--color-text-secondary)">متن</th>
                  <th className="text-right p-2 text-[13px] font-semibold text-(--color-text-secondary)">تاریخ</th>
                  <th className="text-right p-2 text-[13px] font-semibold text-(--color-text-secondary)">ساعت</th>
                  <th className="text-right p-2 text-[13px] font-semibold text-(--color-text-secondary)">ارسال‌کننده</th>
                </tr>
              </thead>
              <tbody>
                {conversationWarnings.map((w, idx) => (
                  <tr key={w.id} className="border-b border-(--color-border-light)">
                    <td className="p-2 text-[13px] text-(--color-text-primary)">{toPersianNumber(idx + 1)}</td>
                    <td className="p-2 text-[13px] text-(--color-text-primary)">{w.message}</td>
                    <td className="p-2 text-[13px] text-(--color-text-primary)">{w.date}</td>
                    <td className="p-2 text-[13px] text-(--color-text-primary)">{w.time}</td>
                    <td className="p-2 text-[13px] text-(--color-text-primary)">{w.admin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="flex justify-end">
            <button onClick={() => setShowWarningHistoryModal(false)} className="px-5 py-2 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-[13px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
              بستن
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال ارسال اعلان سراسری */}
      <Modal isOpen={showBroadcastModal} onClose={() => setShowBroadcastModal(false)} size="md">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4">📢 ارسال اعلان سراسری</h3>
          <textarea
            className="w-full p-2.5 border border-(--color-border-color) rounded-lg text-[13px] font-inherit resize-y bg-(--color-bg-primary) text-(--color-text-primary)"
            placeholder="متن اعلان..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            rows={5}
          />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowBroadcastModal(false)} className="px-5 py-2 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-[13px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
              لغو
            </button>
            <button onClick={handleSendBroadcast} className="px-5 py-2 bg-purple-500 border-none rounded-xl text-white cursor-pointer text-[13px] hover:bg-purple-600 transition-colors">
              ارسال به همه
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال تایید عمومی */}
      <Modal isOpen={modalConfig.isOpen} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} size="sm">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4">{modalConfig.title}</h3>
          <p className="text-sm text-(--color-text-secondary) mb-5 leading-relaxed whitespace-pre-line">{modalConfig.message}</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalConfig({ ...modalConfig, isOpen: false })} className="px-5 py-2 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-[13px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">
              انصراف
            </button>
            <button onClick={() => { modalConfig.onConfirm?.(); setModalConfig({ ...modalConfig, isOpen: false }); }} className="px-5 py-2 bg-red-500 border-none rounded-xl text-white cursor-pointer text-[13px] hover:bg-red-600 transition-colors">
              تایید
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}