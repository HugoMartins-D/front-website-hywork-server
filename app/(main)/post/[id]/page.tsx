'use client';

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { Button, SpecList } from '@/components/FormControls';
import PostSlider from '@/components/PostSlider';
import DropdownMenu from '@/components/DropdownMenu';
import { toPersianNumber, formatPrice, formatRating } from '@/utils/numberUtils';
import { fetchPostById } from '@/services/postService';
import { UserContext } from '@/contexts/UserContext';
import commentsData from '@/data/comments.json';
import usersData from '@/data/users.json';
import type { Post as SharedPost } from '@/types';

// ==================== ICONS ====================
const HeartIcon = ({ filled = false, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const CommentIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ShareIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);

const SaveIcon = ({ filled = false, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const StarIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MoreVerticalIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const NavigationIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 22l10-6 10 6L12 2z" />
  </svg>
);

// ==================== TYPES ====================
interface Comment {
  id: number;
  postId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  text: string;
  likes: number;
  createdAt: string;
}

type Post = SharedPost & { shareCount?: number };

// ==================== HOOKS ====================
const useMobileDetect = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};

// ==================== COMMENT MODAL ====================
const CommentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  postId: number | null;
  comments: Comment[];
  onSendComment: (comment: Comment) => void;
  commentText: string;
  setCommentText: (text: string) => void;
  isMobile: boolean;
}> = ({ isOpen, onClose, postId, comments, onSendComment, commentText, setCommentText, isMobile }) => {
  const { user: currentUser } = useContext(UserContext);
  const [localComments, setLocalComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (comments && comments.length > 0) setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (commentText.trim() && currentUser) {
      const newComment: Comment = {
        id: Date.now(),
        postId: postId || 0,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username || '',
        userAvatar: currentUser.avatar || '/default-avatar.png',
        text: commentText,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      onSendComment(newComment);
      setCommentText('');
    }
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'لحظاتی پیش';
    if (diffMins < 60) return `${toPersianNumber(diffMins)} دقیقه پیش`;
    if (diffHours < 24) return `${toPersianNumber(diffHours)} ساعت پیش`;
    if (diffDays < 7) return `${toPersianNumber(diffDays)} روز پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center animate-fade-in z-[2000] md:z-[1000]"
      onClick={onClose}
    >
      <div
        className="bg-bg-secondary w-full max-w-[550px] max-h-[85vh] rounded-t-2xl flex flex-col overflow-hidden animate-slide-up shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
        style={{ paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-5 py-4 border-b border-border-color bg-bg-secondary">
          <h3 className="text-base font-semibold text-text-primary m-0">
            نظرات ({toPersianNumber(localComments.length)})
          </h3>
          <button
            onClick={onClose}
            className="bg-none border-none text-2xl cursor-pointer text-text-secondary p-1 px-2 rounded-full transition-all hover:bg-bg-surface"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {localComments.length === 0 ? (
            <div className="text-center py-10 text-text-muted">
              <p>هنوز کامنتی ثبت نشده است</p>
              <p className="text-xs mt-2 text-text-secondary">اولین نفری باشید که نظر می‌دهید!</p>
            </div>
          ) : (
            localComments.map((comment) => (
              <div key={comment.id} className="flex gap-3 pb-3 border-b border-border-color">
                <img
                  src={comment.userAvatar || '/default-avatar.png'}
                  alt={comment.userName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 flex-wrap gap-1">
                    <span className="text-sm font-semibold text-text-primary">{comment.userName}</span>
                    <span className="text-[10px] text-text-muted">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary m-1 break-words">{comment.text}</p>
                  {comment.likes > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 text-[11px] text-text-muted">
                      <HeartIcon size={12} filled={false} />
                      <span>{toPersianNumber(comment.likes)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {currentUser ? (
          <div className="flex gap-3 px-5 py-4 border-t border-border-color bg-bg-secondary">
            <input
              type="text"
              placeholder="نظر خود را بنویسید..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-3 border border-border-color rounded-3xl outline-none text-sm bg-bg-primary text-text-primary rtl"
              autoFocus
            />
            <button
              onClick={handleSend}
              disabled={!commentText.trim()}
              className={`px-5 py-2.5 rounded-3xl flex items-center gap-1.5 transition-all ${
                commentText.trim()
                  ? 'bg-accent-color text-on-accent cursor-pointer hover:bg-accent-hover'
                  : 'bg-bg-surface text-text-muted border border-border-color cursor-not-allowed'
              }`}
            >
              <NavigationIcon size={18} />
            </button>
          </div>
        ) : (
          <div className="p-5 text-center border-t border-border-color">
            <p className="text-text-secondary">برای نوشتن نظر لطفاً وارد حساب کاربری خود شوید</p>
            <button
              className="mt-3 px-5 py-2 bg-accent-color text-on-accent border-none rounded-2xl cursor-pointer"
              onClick={() => window.location.href = '/login'}
            >
              ورود به حساب
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id ? parseInt(params.id as string) : null;
  const { user: currentUser } = useContext(UserContext);
  const isMobile = useMobileDetect();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');

  // ==================== LOAD COMMENTS ====================
  useEffect(() => {
    if (commentsData && commentsData.comments) {
      // کامنت‌های JSON فیلد date دارند و اطلاعات کاربر را ندارند
      const postComments: Comment[] = commentsData.comments
        .filter((comment) => comment.postId === postId)
        .map((comment) => {
          const author = usersData.users.find((u) => u.id === comment.userId);
          return {
            ...comment,
            userName: author?.name || author?.username || '',
            userAvatar: author?.avatar || '',
            createdAt: comment.date,
          };
        });
      setComments(postComments);
    }
  }, [postId]);

  // ==================== LOAD POST ====================
  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      if (postId) {
        const fetched = await fetchPostById(postId);
        if (fetched) {
          setPost(fetched);
        } else {
          // ✅ اگر پست در API نبود، از localStorage چک کن
          try {
            const savedPosts = localStorage.getItem('userPosts');
            if (savedPosts) {
              const posts = JSON.parse(savedPosts);
              const found = posts.find((p: any) => p.id === postId);
              if (found) {
                setPost(found);
              }
            }
          } catch (error) {
            console.error('Error loading post from localStorage:', error);
          }
        }
      }
      setLoading(false);
    };
    loadPost();
  }, [postId]);

  // ==================== HANDLERS ====================
  const handleSendComment = useCallback((newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  }, []);

  const handleSendCommentInline = useCallback(() => {
    if (newCommentText.trim() && currentUser) {
      const newComment: Comment = {
        id: Date.now(),
        postId: postId || 0,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.username || '',
        userAvatar: currentUser.avatar || '/default-avatar.png',
        text: newCommentText,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [newComment, ...prev]);
      setNewCommentText('');
    }
  }, [newCommentText, currentUser, postId]);

  const handleViewProfile = useCallback(() => {
    if (post?.authorUsername) router.push(`/${post.authorUsername}`);
    else if (post?.userId) router.push(`/profile?user=${post.authorUsername}`);
  }, [post, router]);

  const handleReport = useCallback(() => {}, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDeletePost = useCallback(() => {
    if (!post) return;
    
    if (window.confirm('آیا از حذف این پست مطمئن هستید؟')) {
      try {
        // حذف از localStorage
        const savedPosts = localStorage.getItem('userPosts');
        if (savedPosts) {
          const posts = JSON.parse(savedPosts);
          const updatedPosts = posts.filter((p: any) => p.id !== post.id);
          localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
        }
        
        // حذف از posts.json (اگر در دیتا باشد)
        // اینجا می‌توانید API call برای حذف از سرور انجام دهید
        
        alert('پست با موفقیت حذف شد');
        router.push('/profile');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('خطا در حذف پست');
      }
    }
  }, [post, router]);

  const dropdownItems = [
    { label: 'مشاهده پروفایل', icon: '👤', onClick: handleViewProfile },
    { label: 'گزارش', icon: '🚫', onClick: handleReport },
  ];

  // ✅ اگر کاربر صاحب پست است، گزینه حذف رو هم اضافه کن
  if (currentUser && post && currentUser.id === post.userId) {
    dropdownItems.push({ label: 'حذف پست', icon: '🗑️', onClick: handleDeletePost });
  }

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'لحظاتی پیش';
    if (diffMins < 60) return `${toPersianNumber(diffMins)} دقیقه پیش`;
    if (diffHours < 24) return `${toPersianNumber(diffHours)} ساعت پیش`;
    if (diffDays < 7) return `${toPersianNumber(diffDays)} روز پیش`;
    return date.toLocaleDateString('fa-IR');
  };

  // ==================== LOADING ====================
  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-12 text-text-muted">
          <div className="w-10 h-10 border-3 border-placeholder border-t-accent-color rounded-full animate-spin mx-auto" />
          <p className="mt-4">در حال بارگذاری...</p>
        </div>
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <PageHeader title="پست" onBack={handleBack} />
        <div className="text-center py-12 px-4">
          <h2 className="text-lg font-medium text-text-primary">پستی یافت نشد</h2>
          <Button size="md" className="mt-5" onClick={() => router.push('/')}>
            بازگشت به صفحه اصلی
          </Button>
        </div>
      </AppShell>
    );
  }

  const likesCount = (post.likesCount || 0) + (liked ? 1 : 0);
  const postImages = post.images?.length ? post.images : (post.image ? [post.image] : []);

  // مشخصات پست به شکل فهرست «Feature» فیگما
  const features = [
    { label: 'دسته‌بندی', value: post.category || 'عمومی' },
    post.brand && { label: 'برند', value: post.brand },
    post.model && { label: 'مدل', value: post.model },
    post.color && { label: 'رنگ', value: post.color },
    post.weight && { label: 'وزن', value: post.weight },
    {
      label: 'موجودی',
      value: (post.stock || 0) > 0 ? `${toPersianNumber(post.stock)} عدد` : <span className="text-danger">ناموجود</span>,
    },
    { label: 'تاریخ انتشار', value: new Date(post.createdAt).toLocaleDateString('fa-IR') },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  const counter = 'flex items-center gap-1 text-[8px] text-text-primary';

  // ==================== RENDER ====================
  // فیگما (single page service / edit post): هدر «پست»، فروشنده بالا، تصویر تمام‌عرض،
  // شمارنده‌ها، عنوان ۱۸/۶۰۰، توضیح ۱۲/۴۰۰، فهرست مشخصات، قیمت ۴۰ پیکسلی با کپسول واحد
  return (
    <AppShell>
      <PageHeader title="پست" onBack={handleBack} />

      <div className="flex items-center gap-2 px-4 pb-14">
        <button type="button" onClick={handleViewProfile} className="flex items-center gap-2.5 text-right">
          <span className="relative w-8.75 h-8.75 rounded-full overflow-hidden bg-placeholder ring-[1.5px] ring-[#00ca18] shrink-0">
            {post.authorAvatar && <Image src={post.authorAvatar} alt="" fill sizes="35px" className="object-cover" />}
          </span>
          <span>
            <span className="block text-sm font-semibold text-text-primary leading-4.25">{post.authorUsername || 'نویسنده'}</span>
            <span className="block text-xs text-[#bebebe] leading-3.75">{post.authorName || ''}</span>
          </span>
        </button>
        <span className="ms-auto text-lg font-medium text-[#404040]">{formatCommentDate(post.createdAt)}</span>
        <DropdownMenu items={dropdownItems} triggerIcon={<MoreVerticalIcon size={20} />} iconSize={20} />
      </div>

      <div className="relative w-full aspect-[440/434] bg-placeholder">
        <PostSlider images={postImages} postTitle={post.caption || post.title} />
      </div>

      <div className="flex items-center justify-between px-4 mt-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setLiked(!liked)} className={counter} aria-pressed={liked} aria-label="پسندیدن">
            <HeartIcon filled={liked} size={20} />
            <span>{toPersianNumber(likesCount)}</span>
          </button>
          <button type="button" className={counter} aria-label="اشتراک‌گذاری">
            <ShareIcon size={20} />
            <span>{toPersianNumber(post.shareCount || 0)}</span>
          </button>
          <button type="button" onClick={() => setIsCommentModalOpen(true)} className={counter} aria-label="نظرات">
            <CommentIcon size={20} />
            <span>{toPersianNumber(comments.length)}</span>
          </button>
          <button type="button" onClick={() => setSaved(!saved)} className={counter} aria-pressed={saved} aria-label="ذخیره">
            <SaveIcon filled={saved} size={20} />
          </button>
        </div>
        <span className={counter}>
          <StarIcon size={18} />
          <span>{formatRating(post.rating || 0)}</span>
        </span>
      </div>

      <h1 className="m-0 mt-6 px-4 text-lg font-semibold leading-5.5 text-text-primary">{post.title || post.caption}</h1>
      <hr className="my-4 border-0 border-t border-[#b8b8b8]" />
      <p className="m-0 px-4 text-xs leading-relaxed text-text-primary whitespace-pre-line">
        {post.caption || 'توضیحاتی برای این پست موجود نیست.'}
      </p>
      <hr className="mt-3 mb-10 border-0 border-t border-[#b8b8b8]" />

      <SpecList title="مشخصات" items={features} className="px-4" />

      <div className="px-4 mt-16 mb-10 flex flex-col items-end">
        <span className="text-[40px] leading-12 text-text-primary">{formatPrice(post.price)}</span>
        <Link
          href={`/post/${post.id}/reserve`}
          className="mt-1 px-2.5 h-5 rounded-full bg-accent-color text-on-accent text-xs leading-5 hover:text-on-accent"
        >
          تومان · ثبت سفارش
        </Link>
      </div>

      {/* نظرات */}
      <section className="px-4 pb-8">
        <h2 className="m-0 mb-4 text-lg font-medium text-text-primary">نظرات ({toPersianNumber(comments.length)})</h2>
        {currentUser && (
          <div className="flex items-center gap-2 h-12 px-4 mb-5 rounded-[10px] border border-border-strong">
            <input
              type="text"
              placeholder="نوشتن..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendCommentInline()}
              className="flex-1 min-w-0 h-full border-none outline-none bg-transparent text-sm text-text-primary placeholder:text-[#4e4444]"
            />
            <button
              type="button"
              onClick={handleSendCommentInline}
              disabled={!newCommentText.trim()}
              aria-label="ارسال نظر"
              className="text-text-primary disabled:text-text-muted"
            >
              <NavigationIcon size={19} />
            </button>
          </div>
        )}
        {comments.length === 0 ? (
          <p className="text-sm text-text-secondary">هنوز نظری ثبت نشده است. اولین نفر باشید!</p>
        ) : (
          <ul className="list-none m-0 p-0 flex flex-col gap-4">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-3 pb-4 border-b-[0.5px] border-border-color">
                <span className="relative w-8 h-8 rounded-full overflow-hidden bg-placeholder shrink-0">
                  {comment.userAvatar && <Image src={comment.userAvatar} alt="" fill sizes="32px" className="object-cover" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-sm font-semibold text-text-primary">{comment.userName}</span>
                    <span className="text-[10px] text-text-secondary">{formatCommentDate(comment.createdAt)}</span>
                  </div>
                  <p className="m-0 mt-1 text-sm leading-relaxed text-text-primary break-words">{comment.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Comment Modal */}
      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={postId}
        comments={comments}
        onSendComment={handleSendComment}
        commentText={commentText}
        setCommentText={setCommentText}
        isMobile={isMobile}
      />

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease;
        }
      `}</style>
    </AppShell>
  );
}