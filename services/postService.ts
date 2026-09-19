import postsData from '@/data/posts.json';
import usersData from '@/data/users.json';
import commentsData from '@/data/comments.json';
import { Post, User, Comment, ApiResponse } from '@/types';

// ==================== نوع‌های داده JSON ====================
interface JsonPost {
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
  likesCount?: number;
  commentsCount?: number;
  createdAt?: string;
  [key: string]: unknown;
}

interface JsonUser {
  id: number;
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  status?: string;
  bio?: string;
  createdAt?: string;
}

interface JsonComment {
  id: number;
  postId: number;
  userId: number;
  text: string;
  date: string;
  likes?: number;
}

// ==================== توابع کمکی ====================
const getImagePath = (imageName?: string | null): string => {
  if (!imageName) return '/images/posts/placeholder.jpg';
  if (imageName.startsWith('http')) return imageName;
  if (imageName.startsWith('/')) return imageName;
  if (imageName.startsWith('images/')) return `/${imageName}`;
  return `/images/posts/${imageName}`;
};

const generateMultipleImages = (postId: number): string[] => {
  const maxImages = 10;
  let startId = postId % maxImages;
  if (startId === 0) startId = maxImages;
  
  const images: string[] = [];
  for (let i = 0; i < 3; i++) {
    let imgId = startId + i;
    if (imgId > maxImages) imgId = imgId - maxImages;
    images.push(`/images/posts/${imgId}.jpg`);
  }
  return images;
};

const processPostImages = (post: JsonPost): string[] => {
  if (post.images && Array.isArray(post.images) && post.images.length > 0) {
    return post.images.map((img: string) => getImagePath(img));
  }
  if (post.image) {
    return generateMultipleImages(post.id);
  }
  return ['/images/posts/placeholder.jpg', '/images/posts/placeholder.jpg', '/images/posts/placeholder.jpg'];
};

const enrichUser = (user: JsonUser | null): User | null => {
  if (!user) return null;
  const validStatus = user.status as 'active' | 'busy' | 'ready' | 'inactive' | undefined;
  return {
    id: user.id,
    username: user.username || (user.name ? user.name.replace(/\s/g, '_').toLowerCase() : `user_${user.id}`),
    name: user.name || user.username || 'کاربر ناشناس',
    email: user.email,
    avatar: user.avatar || '/images/avatars/default.png',
    status: validStatus || 'inactive',
    bio: user.bio,
    createdAt: user.createdAt || new Date().toISOString(),
  };
};

const convertJsonUserToUser = (jsonUser: JsonUser): User => {
  const validStatus = jsonUser.status as 'active' | 'busy' | 'ready' | 'inactive' | undefined;
  return {
    id: jsonUser.id,
    username: jsonUser.username,
    name: jsonUser.name,
    email: jsonUser.email,
    avatar: jsonUser.avatar,
    status: validStatus || 'inactive',
    bio: jsonUser.bio,
    createdAt: jsonUser.createdAt,
  };
};

const enrichPost = (post: JsonPost, comments: Comment[] = []): Post => {
  const author = usersData.users.find((u: JsonUser) => u.id === post.userId);
  const enrichedAuthor = author ? enrichUser(author) : null;
  
  const postComments: Comment[] = comments.length > 0 
    ? comments 
    : commentsData.comments
        .filter((c: JsonComment) => c.postId === post.id)
        .map((c: JsonComment) => ({
          id: c.id,
          postId: c.postId,
          userId: c.userId,
          text: c.text,
          date: c.date,
          likes: c.likes || 0,
          user: enrichUser(usersData.users.find((u: JsonUser) => u.id === c.userId) || null) || undefined,
        }));
  
  const imagesArray = processPostImages(post);
  
  return {
    id: post.id,
    userId: post.userId,
    title: post.title,
    caption: post.caption,
    price: post.price,
    stock: post.stock,
    category: post.category,
    rating: post.rating,
    image: imagesArray[0],
    images: imagesArray,
    likesCount: post.likesCount || 0,
    commentsCount: postComments.length,
    createdAt: post.createdAt || new Date().toISOString(),
    author: enrichedAuthor,
    authorId: post.userId,
    authorUsername: enrichedAuthor?.username || 'unknown',
    authorName: enrichedAuthor?.name || 'کاربر ناشناس',
    authorAvatar: enrichedAuthor?.avatar || '/images/avatars/default.png',
    comments: postComments,
  };
};

// ==================== دریافت پست‌ها ====================
export const fetchAllPosts = (): Post[] => {
  return postsData.posts.map((post: JsonPost) => enrichPost(post));
};

export const fetchPosts = fetchAllPosts;

export const fetchPostById = (id: number | string): Post | null => {
  const post = postsData.posts.find((p: JsonPost) => p.id === Number(id));
  if (!post) return null;
  return enrichPost(post);
};

export const fetchPostsByUserId = (userId: number | string): Post[] => {
  const userIdNum = Number(userId);
  return postsData.posts
    .filter((p: JsonPost) => p.userId === userIdNum)
    .map((post: JsonPost) => enrichPost(post));
};

export const fetchUserPosts = fetchPostsByUserId;

// ==================== جستجوی هوشمند (فقط پیشنهادات) ====================
export const searchPosts = (searchTerm: string): string[] => {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return [];
  
  // استخراج کلمات کلیدی از پست‌ها
  const keywords = new Set<string>();
  
  postsData.posts.forEach((post: JsonPost) => {
    // اضافه کردن عنوان
    if (post.title) {
      const titleWords = post.title.split(' ');
      titleWords.forEach((word: string) => {
        if (word.length > 1 && word.toLowerCase().includes(term)) {
          keywords.add(post.title);
        }
      });
    }
    
    // اضافه کردن کپشن
    if (post.caption) {
      const captionWords = post.caption.split(' ');
      captionWords.forEach((word: string) => {
        if (word.length > 1 && word.toLowerCase().includes(term)) {
          keywords.add(post.caption || '');
        }
      });
    }
    
    // اضافه کردن دسته‌بندی
    if (post.category && post.category.toLowerCase().includes(term)) {
      keywords.add(post.category);
    }
  });
  
  // تبدیل به آرایه و مرتب‌سازی
  return Array.from(keywords).sort();
};

// ==================== دریافت کاربران ====================
export const fetchUserById = (userId: number | string): User | null => {
  if (!userId) return null;
  const userIdNum = Number(userId);
  const user = usersData.users.find((u: JsonUser) => u.id === userIdNum);
  return user ? convertJsonUserToUser(user) : null;
};

export const fetchUserByUsername = (identifier: string): User | null => {
  if (!identifier) return null;
  const identifierStr = String(identifier);
  let user = usersData.users.find((u: JsonUser) => 
    u.username && u.username.toLowerCase() === identifierStr.toLowerCase()
  );
  if (!user && !isNaN(Number(identifierStr))) {
    user = usersData.users.find((u: JsonUser) => u.id === Number(identifierStr));
  }
  return user ? convertJsonUserToUser(user) : null;
};

export const fetchAllUsers = (): User[] => {
  return usersData.users.map((u: JsonUser) => convertJsonUserToUser(u));
};

// ==================== دریافت کامنت‌ها ====================
export const getPostComments = (postId: number | string): Comment[] => {
  if (!postId) return [];
  const postIdNum = Number(postId);
  const comments: Comment[] = commentsData.comments
    .filter((c: JsonComment) => c.postId === postIdNum)
    .map((comment: JsonComment) => {
      const user = usersData.users.find((u: JsonUser) => u.id === comment.userId);
      return {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        text: comment.text,
        date: comment.date,
        likes: comment.likes || 0,
        user: user ? convertJsonUserToUser(user) : undefined,
      };
    });
  return comments;
};

// ==================== دسته‌بندی ====================
export const fetchCategories = (posts?: Post[]): string[] => {
  if (!posts) {
    const allPosts = fetchAllPosts();
    return [...new Set(allPosts.map((p) => p.category).filter(Boolean))];
  }
  return [...new Set(posts.map((p) => p.category).filter(Boolean))];
};

// ==================== آمارگیری ====================
export const getPostsStats = (posts: Post[]) => {
  if (!posts || !posts.length) {
    return { totalLikes: 0, totalComments: 0, avgLikes: 0, totalPosts: 0 };
  }
  const totalLikes = posts.reduce((sum, p) => sum + (p.likesCount || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
  return {
    totalLikes,
    totalComments,
    avgLikes: totalLikes / posts.length,
    totalPosts: posts.length,
  };
};

// ==================== توابع شبیه‌سازی شده CRUD ====================
let localPosts: JsonPost[] = [...postsData.posts];

const saveLocalPosts = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('local_posts', JSON.stringify(localPosts));
  }
};

const loadLocalPosts = (): void => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('local_posts');
    if (saved) {
      localPosts = JSON.parse(saved);
    } else {
      localPosts = [...postsData.posts];
    }
  }
};

if (typeof window !== 'undefined') {
  loadLocalPosts();
}

export const createPost = async (postData: Partial<Post>): Promise<ApiResponse<Post>> => {
  try {
    const newId = Math.max(...localPosts.map((p: JsonPost) => p.id), 0) + 1;
    const now = new Date().toISOString();
    const newPost: JsonPost = {
      id: newId,
      userId: postData.userId || 1,
      image: postData.image || null,
      title: postData.title || 'بدون عنوان',
      caption: postData.caption || '',
      price: postData.price || 0,
      stock: postData.stock ?? 0,
      category: postData.category || 'عمومی',
      rating: postData.rating || 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: now,
    };
    localPosts.unshift(newPost);
    saveLocalPosts();
    const enriched = enrichPost(newPost);
    return { success: true, data: enriched };
  } catch {
    return { success: false, error: 'خطا در ایجاد پست' };
  }
};

export const updatePost = async (id: number | string, postData: Partial<Post>): Promise<ApiResponse<Post>> => {
  try {
    const index = localPosts.findIndex((p: JsonPost) => p.id === Number(id));
    if (index === -1) {
      return { success: false, error: 'پست یافت نشد' };
    }
    localPosts[index] = { ...localPosts[index], ...postData };
    saveLocalPosts();
    const enriched = enrichPost(localPosts[index]);
    return { success: true, data: enriched };
  } catch {
    return { success: false, error: 'خطا در بروزرسانی پست' };
  }
};

export const deletePost = async (id: number | string): Promise<ApiResponse> => {
  try {
    const index = localPosts.findIndex((p: JsonPost) => p.id === Number(id));
    if (index === -1) {
      return { success: false, error: 'پست یافت نشد' };
    }
    localPosts.splice(index, 1);
    saveLocalPosts();
    return { success: true, message: 'پست با موفقیت حذف شد' };
  } catch {
    return { success: false, error: 'خطا در حذف پست' };
  }
};

export const likePost = async (id: number | string): Promise<ApiResponse<{ likesCount: number }>> => {
  try {
    const post = localPosts.find((p: JsonPost) => p.id === Number(id));
    if (!post) {
      return { success: false, error: 'پست یافت نشد' };
    }
    post.likesCount = (post.likesCount || 0) + 1;
    saveLocalPosts();
    return { success: true, data: { likesCount: post.likesCount } };
  } catch {
    return { success: false, error: 'خطا در لایک پست' };
  }
};

export const addComment = async (
  postId: number | string,
  commentText: string,
  userId: number = 1
): Promise<ApiResponse<Comment>> => {
  try {
    const user = usersData.users.find((u: JsonUser) => u.id === userId);
    const newComment: Comment = {
      id: Date.now(),
      postId: Number(postId),
      userId: userId,
      text: commentText,
      date: new Date().toISOString(),
      likes: 0,
      user: user ? convertJsonUserToUser(user) : undefined,
    };
    return { success: true, data: newComment };
  } catch {
    return { success: false, error: 'خطا در ارسال نظر' };
  }
};

// ==================== توابع کمکی اضافی ====================
export const getRelatedPosts = (postId: number | string, limit: number = 4): Post[] => {
  const post = fetchPostById(postId);
  if (!post) return [];
  const allPosts = fetchAllPosts();
  return allPosts
    .filter((p) => p.id !== Number(postId) && p.category === post.category)
    .slice(0, limit);
};

export const getPopularPosts = (limit: number = 5): Post[] => {
  const allPosts = fetchAllPosts();
  return [...allPosts]
    .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    .slice(0, limit);
};

export const getRecentPosts = (limit: number = 10): Post[] => {
  const allPosts = fetchAllPosts();
  return [...allPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};