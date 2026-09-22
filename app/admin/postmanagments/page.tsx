// app/admin/posts/page.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect, useContext } from 'react';
import Modal from '@/components/Modal';
import { formatNumber, formatPrice } from '@/utils/numberUtils';
import DateRangePicker from '@/components/DateRangePicker';
import { useToast } from '@/components/NotificationToast';

// ==================== تایپ‌ها ====================
interface Author {
  id: number;
  name: string;
  phone: string;
  email: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  price: number;
  discountPrice: number | null;
  author: Author;
  category: string;
  status: 'published' | 'pending' | 'suspended';
  createdAt: string;
  image: string;
  images: string[];
  description: string;
  stock: number;
  views: number;
  sales: number;
  rating: number;
  reports: any[];
  comments: any[];
  postType: string;
  location: string;
  unit: string;
  altText: string;
  dateRange: any;
  discountDateRange: any;
  suspendRange: any;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface StatusOption {
  value: 'published' | 'pending' | 'suspended';
  label: string;
  color: string;
  icon: string;
}

interface SelectOption {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
}

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

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const MoreVerticalIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const EditPencilIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const StopSignIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

const CircleCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
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

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const CloseSmIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6 6 18" />
    <path d="M6 6l12 12" />
  </svg>
);

// ==================== کامپوننت سلکت سفارشی ====================
const CustomSelect = ({ options, value, onChange, placeholder }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (val: string | number) => {
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

  useEffect(() => {
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
    <div ref={selectRef} className="relative min-w-35">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-4 py-2 border rounded-xl text-[13px] font-inherit bg-(--color-bg-card) cursor-pointer transition-all duration-200 text-(--color-text-primary) ${
          isOpen 
            ? 'border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.2)]' 
            : 'border-(--color-border-color)'
        }`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span className={`inline-flex transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <CaretDownIcon />
        </span>
      </div>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 left-0 bg-(--color-bg-card) border border-(--color-border-color) rounded-xl shadow-lg z-50 overflow-auto mt-2 max-h-75 thin-scrollbar"
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

// ==================== کامپوننت منوی سه نقطه ====================
interface MoreMenuProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  onApprove: (postId: number) => void;
  onReject: (postId: number) => void;
  onSuspend: (post: Post) => void;
  onEditSuspend: (post: Post) => void;
  onRemoveSuspend: (postId: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MoreMenu = ({ 
  post, onEdit, onDelete, onApprove, onReject, onSuspend, onEditSuspend, onRemoveSuspend,
  isOpen, onToggle, onClose 
}: MoreMenuProps) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 180;
      const viewportWidth = window.innerWidth;
      let left = rect.left - menuWidth + 40;
      if (left < 10) left = 10;
      if (left + menuWidth > viewportWidth - 10) left = viewportWidth - menuWidth - 10;
      setMenuPosition({
        top: rect.bottom + 5,
        left: left,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onClose]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleAction = (action: () => void, e: React.MouseEvent) => {
    e.stopPropagation();
    action();
    onClose();
  };

  const isSuspended = post.status === 'suspended';

  return (
    <div className="relative inline-block">
      <button ref={buttonRef} onClick={toggleMenu} className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer inline-flex items-center justify-center transition-all duration-200 text-(--color-text-muted) hover:bg-(--color-bg-surface)">
        <MoreVerticalIcon />
      </button>
      {isOpen && (
        <div ref={menuRef} className="fixed bg-(--color-bg-card) rounded-xl shadow-lg min-w-40 z-1000 overflow-hidden border border-(--color-border-color)" style={{ top: menuPosition.top, left: menuPosition.left }}>
          <button onClick={(e) => handleAction(() => onEdit(post), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
            <EditPencilIcon /> <span>Editar publicação</span>
          </button>
          {post.status === 'pending' && (
            <>
              <button onClick={(e) => handleAction(() => onApprove(post.id), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-emerald-500 hover:bg-emerald-500/10">
                <CheckIcon /> <span>Aprovar publicação</span>
              </button>
              <button onClick={(e) => handleAction(() => onReject(post.id), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-red-500 hover:bg-red-500/10">
                <CloseSmIcon /> <span>Rejeitar publicação</span>
              </button>
            </>
          )}
          {!isSuspended && post.status !== 'suspended' && (
            <button onClick={(e) => handleAction(() => onSuspend(post), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-(--color-text-primary) hover:bg-(--color-bg-surface)">
              <StopSignIcon /> <span>Suspender temporariamente</span>
            </button>
          )}
          {isSuspended && (
            <>
              <button onClick={(e) => handleAction(() => onEditSuspend(post), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-amber-500 hover:bg-amber-500/10">
                <EditPencilIcon /> <span>Editar suspensão</span>
              </button>
              <button onClick={(e) => handleAction(() => onRemoveSuspend(post.id), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-emerald-500 hover:bg-emerald-500/10">
                <CircleCheckIcon /> <span>Remover suspensão</span>
              </button>
            </>
          )}
          <div className="h-px bg-(--color-border-color) my-1" />
          <button onClick={(e) => handleAction(() => onDelete(post.id), e)} className="flex items-center gap-2.5 w-full px-4 py-2.5 border-none bg-transparent cursor-pointer text-[13px] text-start transition-colors duration-200 text-red-500 hover:bg-red-500/10">
            <TrashFullIcon /> <span>Excluir publicação</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== SortIcon ====================
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

// ==================== مودال تایید حذف ====================
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle: string;
}

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, postTitle }: ConfirmDeleteModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm">
    <div className="p-6 text-center">
      <div className="text-5xl mb-4">🗑️</div>
      <h3 className="text-lg font-bold text-(--color-text-primary) mb-3">Excluir publicação</h3>
      <p className="text-sm text-(--color-text-secondary) mb-6 leading-relaxed">
        Deseja excluir a publicação &quot;{postTitle}&quot;? Esta ação não pode ser desfeita.
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onClose} className="px-5 py-2.5 bg-(--color-bg-surface) border-none rounded-lg cursor-pointer text-sm font-medium text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">Cancelar</button>
        <button onClick={onConfirm} className="px-5 py-2.5 bg-red-500 border-none rounded-lg cursor-pointer text-sm font-medium text-white hover:bg-red-600 transition-colors">Excluir</button>
      </div>
    </div>
  </Modal>
);

// ==================== مودال تایید عملیات گروهی ====================
interface ConfirmBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string | null;
  count: number;
}

const ConfirmBulkModal = ({ isOpen, onClose, onConfirm, action, count }: ConfirmBulkModalProps) => {
  const actionText = action === 'delete' ? "Excluir" : action === 'approve' ? "Confirmar" : "Rejeitar";
  const actionIcon = action === 'delete' ? '🗑️' : action === 'approve' ? '✓' : '✗';
  const actionColor = action === 'delete' ? '#ef4444' : action === 'approve' ? '#10b981' : '#f59e0b';
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6 text-center">
        <div className="text-5xl mb-4">{actionIcon}</div>
        <h3 className="text-lg font-bold text-(--color-text-primary) mb-3">{actionText} Publicações</h3>
        <p className="text-sm text-(--color-text-secondary) mb-6 leading-relaxed">
          Deseja {actionText} {formatNumber(count)} publicações selecionadas?
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-5 py-2.5 bg-(--color-bg-surface) border-none rounded-lg cursor-pointer text-sm font-medium text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="px-5 py-2.5 border-none rounded-lg cursor-pointer text-sm font-medium text-white hover:opacity-90 transition-opacity" style={{ backgroundColor: actionColor }}>{actionText}</button>
        </div>
      </div>
    </Modal>
  );
};

// ==================== کامپوننت مودال ویرایش پست ====================
interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onUpdate: (post: Post) => void;
  categories: string[];
}

const EditPostModal = ({ isOpen, onClose, post, onUpdate, categories }: EditPostModalProps) => {
  const { success, warning } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<string | number>('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  const categoryOptions: SelectOption[] = [
    { value: '', label: "Selecione" },
    ...categories.map(cat => ({ value: cat, label: cat }))
  ];

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setDescription(post.description || '');
      setPrice(post.price?.toString() || '');
      setCategory(post.category || '');
      setStock(post.stock?.toString() || '');
    }
  }, [post]);

  const validateForm = (): boolean => {
    if (!title.trim()) {
      warning("Informe um título");
      return false;
    }
    if (!category) {
      warning("Selecione uma categoria");
      return false;
    }
    if (!price || Number(price) <= 0) {
      warning("Informe um preço válido");
      return false;
    }
    if (!stock || Number(stock) <= 0) {
      warning("Informe um estoque válido");
      return false;
    }
    if (!description.trim()) {
      warning("Informe a descrição");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setTimeout(() => {
      onUpdate({
        ...post!,
        title,
        description,
        price: Number(price),
        category: category as string,
        stock: Number(stock),
      });
      setLoading(false);
      success("Publicação atualizada");
      onClose();
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6 bg-(--color-bg-card) rounded-2xl">
        <h2 className="text-xl font-bold text-(--color-text-primary) mb-5">Editar publicação</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-[13px] text-(--color-text-secondary)">Título</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-[13px] text-(--color-text-secondary)">Categoria</label>
            <CustomSelect 
              options={categoryOptions} 
              value={category} 
              onChange={setCategory} 
              placeholder="Selecione"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-[13px] text-(--color-text-secondary)">Preço (tomans)</label>
            <input 
              type="number" 
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
              className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-[13px] text-(--color-text-secondary)">Estoque</label>
            <input 
              type="number" 
              value={stock} 
              onChange={(e) => setStock(e.target.value)} 
              className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm outline-none bg-(--color-bg-primary) text-(--color-text-primary)" 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2 font-medium text-[13px] text-(--color-text-secondary)">Descrição</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="w-full p-2.5 border border-(--color-border-color) rounded-xl text-sm resize-y font-inherit bg-(--color-bg-primary) text-(--color-text-primary)" 
              rows={4} 
              required 
            />
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 bg-(--color-bg-surface) border-none rounded-xl cursor-pointer text-sm font-medium text-(--color-text-primary) hover:bg-(--color-border-color) transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-5 py-2.5 bg-(--color-text-primary) text-(--color-bg-primary) border-none rounded-xl cursor-pointer text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

// ==================== کامپوننت اصلی ====================
export default function PostsManagementPage() {
  const { success, warning, info } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | number>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | number>('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | string>(10);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [suspendPostData, setSuspendPostData] = useState<Post | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkAction, setBulkAction] = useState<string | null>(null);

  // داده‌های نمونه
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1, title: "Fone de ouvido sem fio profissional X200", price: 1250000, discountPrice: null,
      author: { id: 1, name: "Ali Mohammadi", phone: '09123456789', email: 'ali@example.com', avatar: '/images/avatar/me.png' },
      category: "Eletrônicos", status: 'published', createdAt: "04/05/2024",
      image: '/images/posts/1.jpg', images: ['/images/posts/1.jpg', '/images/posts/2.jpg'],
      description: "Fone sem fio com excelente qualidade de som e design moderno.",
      stock: 15, views: 230, sales: 12, rating: 4.5,
      reports: [], comments: [],
      postType: 'product',
      location: "Teerã, rua Valiasr",
      unit: "unidades",
      altText: "Fone de ouvido sem fio profissional",
      dateRange: null,
      discountDateRange: null,
      suspendRange: null,
    },
    {
      id: 2, title: "Bolsa de couro legítimo", price: 890000, discountPrice: 690000,
      author: { id: 2, name: "Zahra Karimi", phone: '09123456788', email: 'zahra@example.com', avatar: '/images/avatar/me.png' },
      category: "Moda e vestuário", status: 'pending', createdAt: "29/04/2024",
      image: '/images/posts/2.png', images: ['/images/posts/2.png'],
      description: "Bolsa de couro de alta qualidade e design elegante.",
      stock: 8, views: 450, sales: 23, rating: 4.8,
      reports: [], comments: [],
      postType: 'product',
      location: "Isfahan, praça Naqsh-e Jahan",
      unit: "unidades",
      altText: "Bolsa de couro legítimo",
      dateRange: null,
      discountDateRange: null,
      suspendRange: null,
    },
  ]);

  const categories = ["Eletrônicos", "Moda e vestuário", "Livros", "Casa e cozinha", "Esportes", "Serviços"];
  const statusOptions: StatusOption[] = [
    { value: 'published', label: "Publicado", color: '#10b981', icon: '🟢' },
    { value: 'pending', label: "Aguardando aprovação", color: '#f59e0b', icon: '🟡' },
    { value: 'suspended', label: "Suspenso", color: '#ef4444', icon: '🔴' },
  ];

  const filteredPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      const matchesSearch = post.title.includes(searchTerm) || post.author.name.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof typeof a];
      let bVal: any = b[sortField as keyof typeof b];
      if (['price', 'views', 'sales', 'stock'].includes(sortField)) {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        if (sortDirection === 'asc') return aVal.localeCompare(bVal);
        return bVal.localeCompare(aVal);
      }
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    return filtered;
  }, [posts, searchTerm, statusFilter, categoryFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredPosts.length / Number(itemsPerPage));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * Number(itemsPerPage), currentPage * Number(itemsPerPage));

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
    info(`Ordenar por ${field}`, 1000);
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === paginatedPosts.length && paginatedPosts.length > 0) {
      setSelectedPosts([]);
      info("Todas as publicações foram desmarcadas", 1500);
    } else {
      setSelectedPosts(paginatedPosts.map(p => p.id));
      success(`${formatNumber(paginatedPosts.length)} publicações selecionadas`, 2000);
    }
  };

  const handleSelectPost = (postId: number) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
      info("publicações desmarcadas", 1500);
    } else {
      setSelectedPosts([...selectedPosts, postId]);
      success("publicações selecionadas", 1500);
    }
  };

  const handleApprove = (postId: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: 'published' } : p));
    setSelectedPosts(selectedPosts.filter(id => id !== postId));
    success("Publicação aprovada e publicada", 3000);
  };

  const handleReject = (postId: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: 'pending' } : p));
    setSelectedPosts(selectedPosts.filter(id => id !== postId));
    warning("Publicação rejeitada", 2000);
  };

  const handleDeleteClick = (postId: number) => {
    const post = posts.find(p => p.id === postId);
    setPostToDelete(post || null);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const confirmDeletePost = () => {
    if (postToDelete) {
      setPosts(posts.filter(p => p.id !== postToDelete.id));
      setSelectedPosts(selectedPosts.filter(id => id !== postToDelete.id));
      success(`Publicação "${postToDelete.title}" excluída com sucesso`, 3000);
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  const handleBulkActionClick = (action: string) => {
    setBulkAction(action);
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = () => {
    if (bulkAction === 'delete') {
      setPosts(posts.filter(p => !selectedPosts.includes(p.id)));
      success(`${formatNumber(selectedPosts.length)} Publicação excluída`, 3000);
    } else if (bulkAction === 'approve') {
      setPosts(posts.map(p => selectedPosts.includes(p.id) ? { ...p, status: 'published' } : p));
      success(`${formatNumber(selectedPosts.length)} publicações aprovadas e publicadas`, 3000);
    } else if (bulkAction === 'reject') {
      setPosts(posts.map(p => selectedPosts.includes(p.id) ? { ...p, status: 'pending' } : p));
      warning(`${formatNumber(selectedPosts.length)} Publicação rejeitada`, 2000);
    }
    setSelectedPosts([]);
    setShowBulkConfirm(false);
    setBulkAction(null);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    setIsEditModalOpen(false);
  };

  const handleSuspend = (post: Post) => {
    setEditingPost(post);
    setSuspendPostData(null);
    setShowDatePicker(true);
  };

  const handleEditSuspend = (post: Post) => {
    setEditingPost(post);
    setSuspendPostData(post);
    setShowDatePicker(true);
  };

  const handleRemoveSuspend = (postId: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, status: 'published', suspendRange: null } : p));
    success("Suspensão removida", 3000);
  };

  const handleSuspendRange = (range: any) => {
    setShowDatePicker(false);
    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { 
        ...p, 
        status: 'suspended',
        suspendRange: range
      } : p));
      const startDate = new Date(range.start).toLocaleDateString('pt-BR');
      const endDate = new Date(range.end).toLocaleDateString('pt-BR');
      success(`Publicação suspensa de ${startDate} até ${endDate} com sucesso`, 3000);
    }
    setSuspendPostData(null);
  };

  const handleToggleMenu = (menuId: number) => {
    setOpenMenuId(openMenuId === menuId ? null : menuId);
  };

  const handleCloseMenu = () => {
    setOpenMenuId(null);
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { backgroundColor: string; color: string; text: string; icon: string }> = {
      published: { backgroundColor: '#10b98115', color: '#10b981', text: "Publicado", icon: '🟢' },
      pending: { backgroundColor: '#f59e0b15', color: '#f59e0b', text: "Aguardando aprovação", icon: '🟡' },
      suspended: { backgroundColor: '#ef444415', color: '#ef4444', text: "Suspenso", icon: '🔴' },
    };
    return map[status] || map.pending;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-(--color-text-primary) m-0">Gerenciar publicações</h1>
          <p className="text-[13px] text-(--color-text-secondary) mt-0.5">Gerencie, aprove e modere as publicações</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <ImageIcon /> <strong>{formatNumber(posts.length)}</strong> <small className="text-(--color-text-muted)">Total de publicações</small>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <span>🟢</span> <strong>{formatNumber(posts.filter(p => p.status === 'published').length)}</strong> <small className="text-(--color-text-muted)">Publicado</small>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <span>🟡</span> <strong>{formatNumber(posts.filter(p => p.status === 'pending').length)}</strong> <small className="text-(--color-text-muted)">Pendente</small>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-(--color-bg-card) rounded-full border border-(--color-border-color) text-[12px] text-(--color-text-primary)">
            <span>🔴</span> <strong>{formatNumber(posts.filter(p => p.status === 'suspended').length)}</strong> <small className="text-(--color-text-muted)">Suspenso</small>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex items-center bg-(--color-bg-card) border border-(--color-border-color) rounded-full px-3.5 py-1.5 flex-1 max-w-87.5 gap-2">
          <SearchIcon />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border-none outline-none text-[13px] font-inherit bg-transparent text-(--color-text-primary)"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <CustomSelect
            options={[{ value: 'all', label: "Todas as categorias" }, ...categories.map(cat => ({ value: cat, label: cat }))]}
            value={categoryFilter}
            onChange={(val) => { setCategoryFilter(val); setCurrentPage(1); }}
            placeholder="Categoria"
          />
          <CustomSelect
            options={[{ value: 'all', label: "Todos os status" }, ...statusOptions.map(opt => ({ value: opt.value, label: opt.label }))]}
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
      {selectedPosts.length > 0 && (
        <div className="flex justify-between items-center bg-(--color-bg-surface) p-2.5 px-3.5 rounded-xl mb-4 text-(--color-text-primary)">
          <span>{formatNumber(selectedPosts.length)} publicações selecionadas</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkActionClick('approve')} className="px-2.5 py-1 rounded-md text-[11px] font-medium border-none cursor-pointer text-white bg-emerald-500 hover:bg-emerald-600 transition-colors">✓ Aprovar selecionadas</button>
            <button onClick={() => handleBulkActionClick('reject')} className="px-2.5 py-1 rounded-md text-[11px] font-medium border-none cursor-pointer text-white bg-amber-500 hover:bg-amber-600 transition-colors">✗ Rejeitar selecionadas</button>
            <button onClick={() => handleBulkActionClick('delete')} className="px-2.5 py-1 rounded-md text-[11px] font-medium border-none cursor-pointer text-white bg-red-500 hover:bg-red-600 transition-colors">🗑️ Excluir selecionadas</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-(--color-bg-card) rounded-2xl border border-(--color-border-color) overflow-x-auto overflow-y-visible">
        <table className="w-full border-collapse min-w-275 overflow-visible">
          <thead>
            <tr>
              <th className="w-8.75 text-center p-3 border-b border-(--color-border-color)">
                <input type="checkbox" checked={selectedPosts.length === paginatedPosts.length && paginatedPosts.length > 0} onChange={handleSelectAll} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium">Imagem</th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('title')}>
                Título da publicação <SortIcon field="title" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium">Autor</th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('price')}>
                Preço <SortIcon field="price" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium">Categoria</th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium">Status</th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('createdAt')}>
                Data do pedido <SortIcon field="createdAt" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium cursor-pointer" onClick={() => handleSort('stock')}>
                Estoque <SortIcon field="stock" sortField={sortField} sortDirection={sortDirection} />
              </th>
              <th className="text-start p-3 border-b border-(--color-border-color) text-(--color-text-secondary) text-[12px] font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPosts.map(post => {
              const statusBadge = getStatusBadge(post.status);
              return (
                <tr key={post.id}>
                  <td className="text-center p-3 border-b border-(--color-border-light)">
                    <input type="checkbox" checked={selectedPosts.includes(post.id)} onChange={() => handleSelectPost(post.id)} />
                  </td>
                  <td className="p-3 border-b border-(--color-border-light)">
                    <img src={post.image} alt={post.title} className="w-12.5 h-12.5 object-cover rounded-lg" />
                  </td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light) max-w-50 whitespace-nowrap overflow-hidden text-ellipsis">{post.title}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{post.author.name}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">
                    {post.discountPrice ? (
                      <>
                        <span className="line-through text-(--color-text-muted) text-[11px] ml-1.5">{formatPrice(post.price)}</span> {formatPrice(post.discountPrice)}
                      </>
                    ) : (
                      formatPrice(post.price)
                    )}
                  </td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{post.category}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: statusBadge.backgroundColor, color: statusBadge.color }}>
                      <span className="ml-1">{statusBadge.icon}</span> {statusBadge.text}
                    </span>
                  </td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{post.createdAt}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">{formatNumber(post.stock)}</td>
                  <td className="p-3 text-[12px] text-(--color-text-primary) border-b border-(--color-border-light)">
                    <MoreMenu
                      post={post}
                      onEdit={handleEditPost}
                      onDelete={handleDeleteClick}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onSuspend={handleSuspend}
                      onEditSuspend={handleEditSuspend}
                      onRemoveSuspend={handleRemoveSuspend}
                      isOpen={openMenuId === post.id}
                      onToggle={() => handleToggleMenu(post.id)}
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

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={editingPost}
        onUpdate={handleUpdatePost}
        categories={categories}
      />

      {/* Date Picker Modal for Suspension */}
      <Modal isOpen={showDatePicker} onClose={() => { setShowDatePicker(false); setSuspendPostData(null); }} size="sm" noPadding>
        <DateRangePicker 
          onSelect={handleSuspendRange} 
          onClose={() => { setShowDatePicker(false); setSuspendPostData(null); }}
          initialStartDate={suspendPostData?.suspendRange?.start ? new Date(suspendPostData.suspendRange.start) : null}
          initialEndDate={suspendPostData?.suspendRange?.end ? new Date(suspendPostData.suspendRange.end) : null}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setPostToDelete(null); }}
        onConfirm={confirmDeletePost}
        postTitle={postToDelete?.title || ''}
      />

      {/* Confirm Bulk Action Modal */}
      <ConfirmBulkModal
        isOpen={showBulkConfirm}
        onClose={() => { setShowBulkConfirm(false); setBulkAction(null); }}
        onConfirm={confirmBulkAction}
        action={bulkAction}
        count={selectedPosts.length}
      />
    </div>
  );
}