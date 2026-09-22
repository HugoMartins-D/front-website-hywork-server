// app/admin/users-management/page.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import Modal from '@/components/Modal';
import ProductCard from '@/components/PostCard';
import PersianCalendar from '@/components/PersianCalendar';
import { useToast } from '@/components/NotificationToast';

// ==================== آیکون‌های SVG ====================
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const ArrowDownUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 3v18" />
    <path d="M3 7l4-4 4 4" />
    <path d="M17 21V3" />
    <path d="M13 17l4 4 4-4" />
  </svg>
);

const ArrowDownSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14" />
    <path d="M18 13l-6 6-6-6" />
  </svg>
);

const ArrowUpSmIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 19V5" />
    <path d="M6 11l6-6 6 6" />
  </svg>
);

const CaretDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const UsersGroupIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const ShowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EditPencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const LockOpenIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

const TrashFullIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
);

const CalendarDaysIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
  </svg>
);

// ==================== کامپوننت سلکت سفارشی ====================
interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
}

const CustomSelect = ({ options, value, onChange, placeholder }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (val: any) => {
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
    <div ref={selectRef} className="relative min-w-[140px]">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-3.5 py-2.5 border rounded-xl text-[13px] font-inherit bg-(--color-bg-primary) cursor-pointer transition-all duration-200 text-(--color-text-primary) ${
          isOpen 
            ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' 
            : 'border-(--color-border-color)'
        }`}
      >
        <span className="text-[13px]">{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`inline-flex transition-transform duration-200 mr-2 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <CaretDownIcon />
        </span>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 left-0 bg-(--color-bg-card) border border-(--color-border-color) rounded-xl shadow-lg z-50 overflow-hidden mt-2"
        >
          {options.map(opt => (
            <div
              key={String(opt.value)}
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

// ==================== مودال تایید حذف ====================
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
  isBulk?: boolean;
  count?: number;
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, userName, isBulk = false, count = 0 }: ConfirmDeleteModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className="text-5xl mb-4">🗑️</div>
        <h3 className="text-lg font-bold text-(--color-text-primary) mb-3">
          {isBulk ? `Excluir ${count} Usuário` : "Excluir usuário"}
        </h3>
        <p className="text-sm text-(--color-text-secondary) mb-6 leading-relaxed">
          {isBulk 
            ? `Deseja excluir ${count} usuários selecionados? Esta ação não pode ser desfeita.`
            : `Deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`
          }
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 bg-(--color-bg-surface) border-none rounded-lg cursor-pointer text-sm font-medium text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 bg-red-500 border-none rounded-lg cursor-pointer text-sm font-medium text-white hover:bg-red-600 transition-colors">Excluir</button>
        </div>
      </div>
    </Modal>
  );
};

// ==================== مودال تایید مسدودسازی/فعال‌سازی گروهی ====================
interface ConfirmBulkStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string | null;
  count: number;
}

const ConfirmBulkStatusModal = ({ isOpen, onClose, onConfirm, action, count }: ConfirmBulkStatusModalProps) => {
  const isBanAction = action === 'ban';
  const actionText = isBanAction ? "Bloquear" : "Ativar";
  const actionIcon = isBanAction ? '🔒' : '🔓';
  const actionColor = isBanAction ? '#ef4444' : '#10b981';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className="text-5xl mb-4">{actionIcon}</div>
        <h3 className="text-lg font-bold text-(--color-text-primary) mb-3">{actionText} Usuários</h3>
        <p className="text-sm text-(--color-text-secondary) mb-6 leading-relaxed">
          Deseja {actionText} {count} usuários selecionados?
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 bg-(--color-bg-surface) border-none rounded-lg cursor-pointer text-sm font-medium text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: actionColor }}>{actionText}</button>
        </div>
      </div>
    </Modal>
  );
};

// ==================== کامپوننت منوی سه نقطه ====================
interface MoreMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onBan: () => void;
  userStatus: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MoreMenu = ({ onEdit, onDelete, onView, onBan, userStatus, isOpen, onToggle, onClose }: MoreMenuProps) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [menuHeight, setMenuHeight] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const estimatedMenuHeight = menuHeight > 0 ? menuHeight : 200;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      let top;
      if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
        top = buttonRect.top - estimatedMenuHeight - 8;
      } else {
        top = buttonRect.bottom + 8;
      }
      top = Math.max(8, Math.min(top, viewportHeight - estimatedMenuHeight - 8));
      let left = buttonRect.right - 160;
      left = Math.max(8, Math.min(left, viewportWidth - 168));
      setMenuPosition({ top, left });
    }
  }, [isOpen, menuHeight]);

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
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
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
  }, [isOpen, onClose]);

  const toggleMenu = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  const handleAction = useCallback((action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    onClose();
  }, [onClose]);

  return (
    <div className="static inline-block">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer inline-flex items-center justify-center transition-all duration-200 text-(--color-text-muted) hover:bg-(--color-bg-surface)"
      >
        <MoreVerticalIcon />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998] bg-transparent" onClick={onClose} />
          <div
            ref={menuRef}
            className="fixed bg-(--color-bg-card) rounded-xl shadow-lg min-w-[180px] z-[9999] overflow-hidden border border-(--color-border-color)"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button onClick={(e) => handleAction(onView, e)} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
              <ShowIcon /> <span>Ver detalhes</span>
            </button>
            <button onClick={(e) => handleAction(onEdit, e)} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
              <EditPencilIcon /> <span>Editar</span>
            </button>
            {userStatus === 'banned' ? (
              <button onClick={(e) => handleAction(onBan, e)} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-emerald-500 hover:bg-emerald-500/10">
                <LockOpenIcon /> <span>Ativar</span>
              </button>
            ) : (
              <button onClick={(e) => handleAction(onBan, e)} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-red-500 hover:bg-red-500/10">
                <LockIcon /> <span>Bloquear</span>
              </button>
            )}
            <div className="h-px bg-(--color-border-color) my-1" />
            <button onClick={(e) => handleAction(onDelete, e)} className="flex items-center gap-3 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-red-500 hover:bg-red-500/10">
              <TrashFullIcon /> <span>Excluir</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ==================== مودال ویرایش کاربر ====================
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (user: any) => void;
}

const EditUserModal = ({ isOpen, onClose, user, onUpdate }: EditUserModalProps) => {
  const { success, warning, error } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    bio: user?.bio || '',
    role: user?.role || 'buyer',
    status: user?.status || 'active',
    birthDate: user?.birthDate || '',
    gender: user?.gender || '',
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedBirthDate, setSelectedBirthDate] = useState(formData.birthDate ? new Date(formData.birthDate) : null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleGenderChange = (value: string) => {
    setFormData(prev => ({ ...prev, gender: value }));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedBirthDate(date);
    setFormData(prev => ({ ...prev, birthDate: date.toISOString().split('T')[0] }));
    setIsCalendarOpen(false);
    success("Data de nascimento salva", 2000);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      warning("Informe o nome", 3000);
      return;
    }
    if (!formData.lastName.trim()) {
      warning("Informe o sobrenome", 3000);
      return;
    }
    if (!formData.username.trim()) {
      warning("Informe o nome de usuário", 3000);
      return;
    }
    if (!formData.email.trim()) {
      warning("Informe o e-mail", 3000);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      error("Informe um e-mail válido", 3000);
      return;
    }
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^09[0-9]{9}$/;
      if (!phoneRegex.test(formData.phone)) {
        error("O telefone deve começar com 09 e ter 11 dígitos", 3000);
        return;
      }
    }
    const fullName = `${formData.name} ${formData.lastName}`.trim();
    onUpdate({
      ...user,
      name: fullName,
      username: formData.username,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      bio: formData.bio,
      role: formData.role,
      status: formData.status,
      birthDate: formData.birthDate,
      gender: formData.gender,
    });
    success("Dados do usuário atualizados", 3000);
    onClose();
  };

  const genderOptions = [
    { value: '', label: "Selecione" },
    { value: 'male', label: "Masculino" },
    { value: 'female', label: "Feminino" },
    { value: 'other', label: "Outro" },
  ];

  const roleOptions = [
    { value: 'buyer', label: "Comprador" },
    { value: 'seller', label: "Vendedor" },
    { value: 'both', label: "Comprador e vendedor" },
  ];

  const statusOptions = [
    { value: 'active', label: "Ativo" },
    { value: 'pending', label: "Pendente" },
    { value: 'banned', label: "Bloqueado" },
  ];

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <div className="p-6 bg-(--color-bg-card) rounded-2xl max-w-[600px]">
          <h2 className="text-xl font-bold text-center text-(--color-text-primary) mb-5">Editar usuário</h2>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Nome</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" required />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Sobrenome</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" required />
              </div>
            </div>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Nome de usuário</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" required />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" required />
              </div>
            </div>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Telefone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" placeholder="09123456789" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Cidade</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" />
              </div>
            </div>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Data de nascimento</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatDate(selectedBirthDate)}
                    placeholder="Selecionar data"
                    readOnly
                    className="w-full p-2.5 pr-10 border border-(--color-border-color) rounded-xl text-sm outline-none cursor-pointer bg-(--color-bg-primary) text-(--color-text-primary)"
                    onClick={() => setIsCalendarOpen(true)}
                  />
                  <button
                    type="button"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer inline-flex items-center justify-center p-0"
                    onClick={() => setIsCalendarOpen(true)}
                  >
                    <CalendarDaysIcon />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Gênero</label>
                <CustomSelect options={genderOptions} value={formData.gender} onChange={handleGenderChange} placeholder="Selecione" />
              </div>
            </div>
            <div className="flex gap-4 mb-4 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Tipo de usuário</label>
                <CustomSelect options={roleOptions} value={formData.role} onChange={handleRoleChange} placeholder="Selecionar tipo" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Status</label>
                <CustomSelect options={statusOptions} value={formData.status} onChange={handleStatusChange} placeholder="Selecionar status" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-[13px] text-(--color-text-secondary)">Biografia</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm resize-y font-inherit bg-(--color-bg-primary) text-(--color-text-primary)" rows={3} placeholder="Biografia do usuário..." />
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2.5 bg-(--color-bg-surface) border-none rounded-lg cursor-pointer text-sm font-medium text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">Cancelar</button>
              <button type="submit" className="px-5 py-2.5 bg-[#1e293b] dark:bg-(--color-text-primary) text-white dark:text-(--color-bg-primary) border-none rounded-lg cursor-pointer text-sm font-medium hover:bg-[#334155] dark:hover:opacity-90 transition-colors">Salvar alterações</button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Calendar Modal */}
      <Modal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} size="sm" noPadding>
        <PersianCalendar 
          onSelect={handleDateSelect} 
          onClose={() => setIsCalendarOpen(false)} 
          initialDate={selectedBirthDate || new Date()} 
        />
      </Modal>
    </>
  );
};

// ==================== کامپوننت آیکون مرتب‌سازی ====================
interface SortIconProps {
  field: string;
  sortField: string;
  sortDirection: string;
}

const SortIcon = ({ field, sortField, sortDirection }: SortIconProps) => {
  if (sortField !== field) {
    return <span className="inline-block mr-1"><ArrowDownUpIcon /></span>;
  }
  if (sortDirection === 'asc') {
    return <span className="inline-block mr-1 text-(--color-text-primary)"><ArrowUpSmIcon /></span>;
  } else {
    return <span className="inline-block mr-1 text-(--color-text-primary)"><ArrowDownSmIcon /></span>;
  }
};

// ==================== کامپوننت اصلی ====================
export default function UsersManagementPage() {
  const { success, info } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | number>('all');
  const [statusFilter, setStatusFilter] = useState<string | number>('all');
  const [sortField, setSortField] = useState('joinDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | string>(10);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkStatusConfirm, setShowBulkStatusConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkCount, setBulkCount] = useState(0);

  const [users, setUsers] = useState([
    { 
      id: 1, name: "Ali Mohammadi", username: 'alimohammadi', email: 'ali@example.com', phone: '09123456789', role: 'both', status: 'active',
      joinDate: "03/04/2024", lastLogin: "09/05/2024 14:30", postsCount: 4, ordersCount: 8, totalSpent: 12500000,
      avatar: null, city: "Teerã", verified: true, bio: "Desenvolvedor sênior de React", birthDate: "1991-03-21", gender: 'male',
      posts: [
        { id: 1, title: "Fone de ouvido sem fio profissional X200", price: 1250000, image: '/images/posts/1.jpg', category: "Eletrônicos", rating: 4.5, stock: 15 },
        { id: 2, title: "Bolsa de couro legítimo", price: 890000, image: '/images/posts/2.png', category: "Moda e vestuário", rating: 4.2, stock: 8 },
      ] 
    },
    { 
      id: 2, name: "Zahra Karimi", username: 'zahrakarimi', email: 'zahra@example.com', phone: '09123456788', role: 'seller', status: 'active',
      joinDate: "08/04/2024", lastLogin: "08/05/2024 10:15", postsCount: 3, ordersCount: 0, totalSpent: 0,
      avatar: null, city: "Isfahan", verified: true, bio: "Vendedor de produtos digitais", birthDate: "1993-05-05", gender: 'female',
      posts: [
        { id: 5, title: "Notebook gamer Asus", price: 25000000, image: '/images/posts/5.jpg', category: "Eletrônicos", rating: 4.7, stock: 3 },
      ] 
    },
    { 
      id: 3, name: "Mohammad Rezaei", username: 'mohammadrezaei', email: 'mohammad@example.com', phone: '09123456787', role: 'buyer', status: 'active',
      joinDate: "20/04/2024", lastLogin: "07/05/2024 16:45", postsCount: 0, ordersCount: 15, totalSpent: 8700000,
      avatar: null, city: "Mashhad", verified: false, bio: "Comprador frequente", birthDate: '', gender: '',
      posts: [] 
    },
    { 
      id: 4, name: "Sara Hosseini", username: 'sarahosseini', email: 'sara@example.com', phone: '09123456786', role: 'both', status: 'pending',
      joinDate: "29/04/2024", lastLogin: '-', postsCount: 2, ordersCount: 2, totalSpent: 2300000,
      avatar: null, city: "Shiraz", verified: false, bio: "Designer gráfico", birthDate: "1996-08-10", gender: 'female',
      posts: [
        { id: 8, title: "Quadro decorativo", price: 450000, image: '/images/posts/8.jpg', category: "Casa e cozinha", rating: 4.1, stock: 10 },
      ] 
    },
    { 
      id: 5, name: "Reza Ahmadi", username: 'rezaahmadi', email: 'reza@example.com', phone: '09123456785', role: 'buyer', status: 'banned',
      joinDate: "24/04/2024", lastLogin: "24/04/2024 09:00", postsCount: 0, ordersCount: 5, totalSpent: 4200000,
      avatar: null, city: "Tabriz", verified: false, bio: '', birthDate: '', gender: '',
      posts: [] 
    },
  ]);

  const formatNumber = (num: number | string) => {
    if (num === undefined || num === null) return "0";
    return String(num);
  };

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return "0 tomans";
    return formatNumber(price.toLocaleString('pt-BR')) + " tomans";
  };

  const getRoleBadge = (role: string) => {
    const badgeStyles: Record<string, any> = {
      both: { backgroundColor: 'rgba(139,92,246,0.15)', color: '#8b5cf6', text: "Comprador e vendedor", icon: '🔄' },
      seller: { backgroundColor: 'rgba(59,130,246,0.15)', color: '#3b82f6', text: "Vendedor", icon: '📦' },
      buyer: { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', text: "Comprador", icon: '🛒' },
    };
    return badgeStyles[role] || badgeStyles.both;
  };

  const getStatusBadge = (status: string) => {
    const badgeStyles: Record<string, any> = {
      active: { backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', text: "Ativo", icon: '🟢' },
      pending: { backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b', text: "Pendente", icon: '🟡' },
      banned: { backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', text: "Bloqueado", icon: '🔴' },
    };
    return badgeStyles[status] || badgeStyles.active;
  };

  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name.includes(searchTerm) || user.email.includes(searchTerm) || user.phone.includes(searchTerm) || user.city.includes(searchTerm);
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
    filtered.sort((a, b) => {
      let aVal = a[sortField as keyof typeof a];
      let bVal = b[sortField as keyof typeof b];
      if (['totalSpent', 'postsCount', 'ordersCount'].includes(sortField)) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      else return aVal < bVal ? 1 : -1;
    });
    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredUsers.length / Number(itemsPerPage));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * Number(itemsPerPage), currentPage * Number(itemsPerPage));

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
    info(`Ordenar por ${field}`, 1000);
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0) {
      setSelectedUsers([]);
      setShowBulkActions(false);
      info("Todos os usuários foram desmarcados", 1500);
    } else {
      setSelectedUsers(paginatedUsers.map(u => u.id));
      setShowBulkActions(true);
      success(`${formatNumber(paginatedUsers.length)} usuários selecionados`, 2000);
    }
  };

  const handleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
      if (selectedUsers.length === 1) setShowBulkActions(false);
      info("usuários desmarcados", 1500);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      setShowBulkActions(true);
      success("usuários selecionados", 1500);
    }
  };

  const handleBulkDeleteClick = () => {
    setBulkAction('delete');
    setBulkCount(selectedUsers.length);
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkBanClick = () => {
    setBulkAction('ban');
    setBulkCount(selectedUsers.length);
    setShowBulkStatusConfirm(true);
  };

  const handleBulkActivateClick = () => {
    setBulkAction('activate');
    setBulkCount(selectedUsers.length);
    setShowBulkStatusConfirm(true);
  };

  const confirmBulkDelete = () => {
    setUsers(users.filter(u => !selectedUsers.includes(u.id)));
    success(`${formatNumber(selectedUsers.length)} Usuário excluído`, 3000);
    setSelectedUsers([]);
    setShowBulkActions(false);
    setShowBulkDeleteConfirm(false);
    setBulkAction(null);
  };

  const confirmBulkStatus = () => {
    if (bulkAction === 'ban') {
      setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'banned' } : u));
      success(`${formatNumber(selectedUsers.length)} Usuário bloqueado`, 3000);
    } else if (bulkAction === 'activate') {
      setUsers(users.map(u => selectedUsers.includes(u.id) ? { ...u, status: 'active' } : u));
      success(`${formatNumber(selectedUsers.length)} Usuário ativado`, 3000);
    }
    setSelectedUsers([]);
    setShowBulkActions(false);
    setShowBulkStatusConfirm(false);
    setBulkAction(null);
  };

  const handleBanUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    const newStatus = user?.status === 'banned' ? 'active' : 'banned';
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    setOpenMenuId(null);
    if (newStatus === 'banned') {
      success(`Usuário ${user?.name} bloqueado`, 3000);
    } else {
      success(`Usuário ${user?.name} ativado`, 3000);
    }
  };

  const handleViewUser = (user: any) => {
    setSelectedUserDetail(user);
    setIsModalOpen(true);
    setOpenMenuId(null);
    info(`Ver detalhes do usuário ${user.name}`, 2000);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUserClick = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      success(`Usuário ${userToDelete.name} excluído com sucesso`, 3000);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleToggleMenu = (menuId: number) => {
    setOpenMenuId(openMenuId === menuId ? null : menuId);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-(--color-text-primary) m-0">Gerenciar usuários</h1>
          <p className="text-[13px] text-(--color-text-secondary) mt-0.5">Gerenciamento de usuários</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <UsersGroupIcon /> <strong>{formatNumber(users.length)}</strong> <small className="text-(--color-text-muted)">Total de usuários</small>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <span>🟢</span> <strong>{formatNumber(users.filter(u => u.status === 'active').length)}</strong> <small className="text-(--color-text-muted)">Ativo</small>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <span>🔴</span> <strong>{formatNumber(users.filter(u => u.status === 'banned').length)}</strong> <small className="text-(--color-text-muted)">Bloqueado</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex items-center bg-(--color-bg-card) border border-(--color-border-color) rounded-full px-3.5 py-1.5 flex-1 max-w-[280px] gap-2">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="flex-1 border-none outline-none text-[13px] font-inherit bg-transparent text-(--color-text-primary)"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <CustomSelect
            options={[
              { value: 'all', label: "Todos os tipos" },
              { value: 'both', label: "Comprador e vendedor" },
              { value: 'seller', label: "Vendedor" },
              { value: 'buyer', label: "Comprador" },
            ]}
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
            placeholder="Tipo"
          />
          <CustomSelect
            options={[
              { value: 'all', label: "Todos os status" },
              { value: 'active', label: "Ativo" },
              { value: 'pending', label: "Pendente" },
              { value: 'banned', label: "Bloqueado" },
            ]}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
            placeholder="Status"
          />
          <CustomSelect
            options={[10, 25, 50].map(n => ({ value: n, label: `${formatNumber(n)}` }))}
            value={itemsPerPage}
            onChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            placeholder="Quantidade"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="flex justify-between items-center bg-(--color-bg-surface) p-2.5 px-3.5 rounded-xl mb-4 text-[13px] text-(--color-text-primary)">
          <span>{formatNumber(selectedUsers.length)} usuários selecionados</span>
          <div className="flex gap-2">
            <button onClick={handleBulkActivateClick} className="px-2.5 py-1 rounded-md text-[11px] font-medium border-none cursor-pointer text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">🔓 Ativar</button>
            <button onClick={handleBulkBanClick} className="px-2.5 py-1 rounded-md text-[11px] font-medium border-none cursor-pointer text-white bg-red-500 hover:bg-red-600 transition-colors">🔒 Bloquear</button>
            <button onClick={handleBulkDeleteClick} className="px-2.5 py-1 rounded-md text-[11px] font-medium border-none cursor-pointer text-white bg-gray-500 hover:bg-gray-600 transition-colors">🗑️ Excluir</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-(--color-border-color) overflow-x-auto overflow-y-visible">
        <table className="w-full border-collapse min-w-[1000px] overflow-visible">
          <thead>
            <tr>
              <th className="w-[35px] text-center p-3 border-b border-(--color-border-color)">
                <input type="checkbox" checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0} onChange={handleSelectAll} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('name')}>
                Usuário <SortIcon field="name" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('email')}>
                Contato <SortIcon field="email" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('role')}>
                Tipo <SortIcon field="role" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('status')}>
                Status <SortIcon field="status" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('joinDate')}>
                Cadastro <SortIcon field="joinDate" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('postsCount')}>
                Publicações <SortIcon field="postsCount" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('ordersCount')}>
                Pedidos <SortIcon field="ordersCount" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => {
              const roleBadge = getRoleBadge(user.role);
              const statusBadge = getStatusBadge(user.status);
              return (
                <tr key={user.id}>
                  <td className="text-center p-3 border-b border-(--color-border-light)">
                    <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleSelectUser(user.id)} />
                  </td>
                  <td className="p-3 border-b border-(--color-border-light)">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-(--color-bg-surface) flex items-center justify-center font-semibold text-[13px] text-(--color-text-primary)">{user.name.charAt(0)}</div>
                      <div>
                        <div className="font-medium mb-0.5 text-[13px] text-(--color-text-primary)">{user.name}</div>
                        <div className="text-[10px] text-(--color-text-muted)">{user.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 border-b border-(--color-border-light)">
                    <div className="text-[12px] text-(--color-text-primary)">{user.email}</div>
                    <div className="text-[10px] text-(--color-text-muted)">{user.phone}</div>
                  </td>
                  <td className="p-3 border-b border-(--color-border-light)">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: roleBadge.backgroundColor, color: roleBadge.color }}>
                      <span>{roleBadge.icon}</span> {roleBadge.text}
                    </span>
                  </td>
                  <td className="p-3 border-b border-(--color-border-light)">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: statusBadge.backgroundColor, color: statusBadge.color }}>
                      <span>{statusBadge.icon}</span> {statusBadge.text}
                    </span>
                  </td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{user.joinDate}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{formatNumber(user.postsCount)}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{formatNumber(user.ordersCount)}</td>
                  <td className="p-3 border-b border-(--color-border-light)">
                    <MoreMenu
                      onView={() => handleViewUser(user)}
                      onEdit={() => handleEditUser(user)}
                      onDelete={() => handleDeleteUserClick(user)}
                      onBan={() => handleBanUser(user.id)}
                      userStatus={user.status}
                      isOpen={openMenuId === user.id}
                      onToggle={() => handleToggleMenu(user.id)}
                      onClose={handleCloseMenu}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-5 flex-wrap">
          <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2.5 py-1.5 rounded-md border border-(--color-border-color) bg-(--color-bg-card) cursor-pointer text-[12px] text-(--color-text-primary) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--color-border-color) transition-colors">«</button>
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="px-2.5 py-1.5 rounded-md border border-(--color-border-color) bg-(--color-bg-card) cursor-pointer text-[12px] text-(--color-text-primary) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--color-border-color) transition-colors">‹</button>
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            let pageNum = totalPages <= 5 ? i + 1 : (currentPage <= 3 ? i + 1 : (currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i));
            return (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-2.5 py-1.5 rounded-md border border-(--color-border-color) bg-(--color-bg-card) cursor-pointer text-[12px] text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors ${currentPage === pageNum ? 'bg-(--color-text-primary) text-(--color-bg-primary) border-(--color-text-primary)' : ''}`}>
                {formatNumber(pageNum)}
              </button>
            );
          })}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-2.5 py-1.5 rounded-md border border-(--color-border-color) bg-(--color-bg-card) cursor-pointer text-[12px] text-(--color-text-primary) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--color-border-color) transition-colors">›</button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-2.5 py-1.5 rounded-md border border-(--color-border-color) bg-(--color-bg-card) cursor-pointer text-[12px] text-(--color-text-primary) disabled:opacity-50 disabled:cursor-not-allowed hover:bg-(--color-border-color) transition-colors">»</button>
        </div>
      )}

      {/* Modal: User Details */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl" noPadding>
        {selectedUserDetail && (
          <div className="flex flex-col h-[85vh] bg-(--color-bg-card)">
            <div className="flex-shrink-0 p-6 pb-0">
              <div className="flex items-center gap-5 mb-6 pb-5 border-b border-(--color-border-color)">
                <div className="w-[70px] h-[70px] rounded-full bg-(--color-bg-surface) flex items-center justify-center text-[28px] font-semibold text-(--color-text-primary)">
                  {selectedUserDetail.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-(--color-text-primary)">{selectedUserDetail.name}</h2>
                  <p className="text-[13px] text-(--color-text-secondary)">{selectedUserDetail.email}</p>
                  <p className="text-[13px] text-(--color-text-primary)">{selectedUserDetail.bio || "Nenhuma biografia cadastrada"}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="flex items-center gap-2.5 p-3 bg-(--color-bg-surface) rounded-xl text-[12px] text-(--color-text-primary)">
                  <span>📞</span>
                  <div><strong className="block text-[11px] text-(--color-text-muted)">Telefone</strong><p className="text-[13px]">{selectedUserDetail.phone}</p></div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-(--color-bg-surface) rounded-xl text-[12px] text-(--color-text-primary)">
                  <span>📍</span>
                  <div><strong className="block text-[11px] text-(--color-text-muted)">Cidade</strong><p className="text-[13px]">{selectedUserDetail.city}</p></div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-(--color-bg-surface) rounded-xl text-[12px] text-(--color-text-primary)">
                  <span>📅</span>
                  <div><strong className="block text-[11px] text-(--color-text-muted)">Data de cadastro</strong><p className="text-[13px]">{selectedUserDetail.joinDate}</p></div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-(--color-bg-surface) rounded-xl text-[12px] text-(--color-text-primary)">
                  <span>🕐</span>
                  <div><strong className="block text-[11px] text-(--color-text-muted)">Último acesso</strong><p className="text-[13px]">{selectedUserDetail.lastLogin}</p></div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-(--color-bg-surface) rounded-xl text-[12px] text-(--color-text-primary)">
                  <span>📦</span>
                  <div><strong className="block text-[11px] text-(--color-text-muted)">Publicações</strong><p className="text-[13px]">{formatNumber(selectedUserDetail.postsCount)} unidades</p></div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-(--color-bg-surface) rounded-xl text-[12px] text-(--color-text-primary)">
                  <span>💰</span>
                  <div><strong className="block text-[11px] text-(--color-text-muted)">Total de compras</strong><p className="text-[13px]">{formatPrice(selectedUserDetail.totalSpent)}</p></div>
                </div>
              </div>
            </div>
            {selectedUserDetail.posts?.length > 0 && (
              <div className="flex-1 overflow-y-auto p-6 pt-0">
                <h3 className="text-lg font-semibold text-(--color-text-primary) mb-4 pt-2">Publicações do usuário ({formatNumber(selectedUserDetail.posts.length)})</h3>
                <div className="grid grid-cols-3 gap-1 bg-(--color-bg-surface)">
                  {selectedUserDetail.posts.map((post: any) => (
                    <ProductCard
                      key={post.id}
                      image={post.image}
                      title={post.title}
                      category={post.category}
                      stock={post.stock}
                      price={post.price}
                      rating={post.rating}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={editingUser}
        onUpdate={handleUpdateUser}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
        onConfirm={confirmDeleteUser}
        userName={userToDelete?.name}
      />

      {/* Confirm Bulk Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => { setShowBulkDeleteConfirm(false); setBulkAction(null); }}
        onConfirm={confirmBulkDelete}
        isBulk={true}
        count={bulkCount}
      />

      {/* Confirm Bulk Status Modal */}
      <ConfirmBulkStatusModal
        isOpen={showBulkStatusConfirm}
        onClose={() => { setShowBulkStatusConfirm(false); setBulkAction(null); }}
        onConfirm={confirmBulkStatus}
        action={bulkAction}
        count={bulkCount}
      />
    </div>
  );
}