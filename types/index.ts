export interface Post {
  id: number;
  userId: number;
  title: string;
  caption?: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  image?: string | null;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
  // داده‌های غنی‌شده
  author?: User | null;
  authorId?: number;
  authorUsername?: string;
  authorName?: string;
  authorAvatar?: string;
  comments?: Comment[];
  description?: string;
  brand?: string;
  model?: string;
  color?: string;
  weight?: string;
  cartCount?: number;
  sharesCount?: number;
}

export interface User {
  id: number;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  status?: 'active' | 'busy' | 'ready' | 'inactive';
  bio?: string;
  createdAt?: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  text: string;
  date: string;
  likes: number;
  user?: User;
}

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  minRating: number;
  inStockOnly: boolean;
}

export interface PostCardProps {
  id: number;
  title: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  images: string[];
  description?: string;
  sellerName?: string;
  sellerUsername?: string;
  sellerAvatar?: string;
  sellerId: number;
}

export interface PostModalProps {
  post: Post;
  onAddToCart?: (post: Post) => void;
  onClose: () => void;
  onSellerClick?: () => void;
}

export interface AdvancedFilterProps {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  onFilterChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface DropdownItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}