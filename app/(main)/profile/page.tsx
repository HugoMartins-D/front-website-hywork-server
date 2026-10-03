'use client';

import { Suspense, useState, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import AppShell from '@/components/AppShell';
import ProfileHeader, { CategoryTabs } from '@/components/ProfileHeader';
import { Button } from '@/components/FormControls';
import PostCard from '@/components/PostCard';
import { UserContext } from '@/contexts/UserContext';
import { fetchUserByUsername, fetchPostsByUserId } from '@/services/postService';
import { toPersianNumber } from '@/utils/numberUtils';
import type { Post, User } from '@/types';

// ==================== آیکون‌ها ====================
const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

const BackIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

// ==================== Toast ====================
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-accent-color',
  };

  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-xl text-white font-medium shadow-lg animate-slideDown ${colors[type]}`}>
      {message}
    </div>
  );
};

// ==================== کاربر تست ====================
const MOCK_USER: User = {
  id: 1,
  username: 'mojtaba',
  name: 'مجتبی زرابی',
  email: 'mojtaba@example.com',
  avatar: '/images/avatars/default.png',
  bio: 'توسعه‌دهنده وب | عاشق تکنولوژی',
  location: 'تهران، ایران',
  followersCount: 120,
  followingCount: 85,
};

// ==================== کامپوننت اصلی ====================
// useSearchParams نیاز به Suspense دارد تا صفحه در build پیش‌رندر شود
export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get('user');
  const { user: currentUser, setUser } = useContext(UserContext);
  const requestedUsername = usernameParam?.trim().toLowerCase();
  const currentUsername = currentUser?.username?.trim().toLowerCase();
  const isViewingAnotherUser = Boolean(
    requestedUsername && requestedUsername !== currentUsername
  );
  const [loading, setLoading] = useState(true);
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('همه');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);


  useEffect(() => {
    if (!currentUser) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch {
          localStorage.setItem('user', JSON.stringify(MOCK_USER));
          setUser(MOCK_USER);
        }
      } else {
        localStorage.setItem('user', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
      }
    }
  }, [currentUser, setUser]);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        let userData: User | null = null;
        let targetUsername: string | null = null;

        if (usernameParam) {
          targetUsername = usernameParam;
        } else if (currentUser?.username) {
          targetUsername = currentUser.username;
        } else {
          targetUsername = MOCK_USER.username;
        }

        if (targetUsername) {
          userData = await fetchUserByUsername(targetUsername);
        }

        if (!userData && targetUsername === MOCK_USER.username) {
          userData = MOCK_USER;
        }

        if (userData) {
          setProfileUser(userData);
          const userPosts = await fetchPostsByUserId(userData.id);
          if (userPosts && userPosts.length > 0) {
            setPosts(userPosts);
          } else if (userData.username === 'mojtaba') {
            const mockPosts: Post[] = [
              {
                id: 1,
                userId: 1,
                title: 'پست نمونه ۱',
                caption: 'این یک پست نمونه برای نمایش در پروفایل است',
                price: 1250000,
                stock: 10,
                category: 'الکترونیک',
                rating: 4.8,
                image: '/images/posts/1.jpg',
                images: ['/images/posts/1.jpg'],
                likesCount: 25,
                commentsCount: 5,
                createdAt: new Date().toISOString(),
                authorName: userData.name || userData.username,
                authorUsername: userData.username,
                authorAvatar: userData.avatar || '/images/avatars/default.png',
              },
            ];
            setPosts(mockPosts);
          } else {
            setPosts([]);
          }
        } else {
          setProfileUser(null);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setProfileUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [currentUser, usernameParam]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/users/${profileUser?.id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('خطا در عملیات دنبال کردن');
      }

      setIsFollowing(!isFollowing);
      setProfileUser((prev) => ({
        ...prev!,
        followersCount: isFollowing ? (prev!.followersCount || 0) - 1 : (prev!.followersCount || 0) + 1,
      }));
      
      showToast(isFollowing ? 'دنبال کردن لغو شد' : 'با موفقیت دنبال شدید', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'خطا در عملیات', 'error');
    }
  };


  // ✅ اصلاح: تشخیص اینکه آیا کاربر صاحب پروفایل است
  // idهای users.json و کاربر لاگین‌شده از یک منبع نیستند و ممکن است تکراری باشند،
  // پس فقط username مقایسه می‌شود
  const isOwnProfile = () => {
    if (!currentUser?.username || !profileUser?.username) return false;
    return currentUser.username.toLowerCase() === profileUser.username.toLowerCase();
  };

  const goBack = () => {
    router.back();
  };

  // بارگذاری
  if (loading) {
    return (
      <AppShell suppressActiveProfile={isViewingAnotherUser}>
        <div className="min-h-[60vh] flex items-center justify-center text-text-secondary">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-placeholder border-t-accent-color rounded-full animate-spin mx-auto" />
            <p className="mt-4">در حال بارگذاری...</p>
          </div>
        </div>
      </AppShell>
    );
  }

  // اگر کاربر لاگین نیست
  if (!currentUser && !usernameParam) {
    return (
      <AppShell suppressActiveProfile={isViewingAnotherUser}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="m-0 text-xl font-medium mb-2">لطفاً وارد شوید</h2>
          <p className="m-0 text-sm text-text-secondary">برای مشاهده پروفایل خود باید وارد حساب کاربری شوید.</p>
          <Button size="md" className="mt-5" onClick={() => router.push('/login')}>ورود به حساب</Button>
        </div>
      </AppShell>
    );
  }

  // اگر پروفایل پیدا نشد
  if (!profileUser) {
    return (
      <AppShell suppressActiveProfile={isViewingAnotherUser}>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
          <h2 className="m-0 text-xl font-medium mb-2">پروفایل یافت نشد</h2>
          <p className="m-0 text-sm text-text-secondary">کاربر مورد نظر وجود ندارد.</p>
          <Button size="md" className="mt-5" onClick={() => router.push('/')}>بازگشت به صفحه اصلی</Button>
        </div>
      </AppShell>
    );
  }

  const isOwn = isOwnProfile();
  const categories = ['همه', ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const visiblePosts = activeCategory === 'همه' ? posts : posts.filter((p) => p.category === activeCategory);
  const avgRating = posts.length ? posts.reduce((sum, p) => sum + (p.rating || 0), 0) / posts.length : null;

  // فیگما (User Page / seller): سربرگ پروفایل، ردیف دسته‌ها و شبکه‌ی سه‌ستونه؛ حالت خالی با تصویر
  return (
    <AppShell suppressActiveProfile={isViewingAnotherUser}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ProfileHeader
        avatar={profileUser.avatar}
        name={profileUser.name || profileUser.username}
        subtitle={profileUser.location}
        bio={profileUser.bio || 'خوش آمدید به پروفایل من'}
        status={profileUser.status}
        rating={avgRating}
        avatarHref={isOwn ? '/status' : undefined}
        stats={[
          { label: 'پست', value: toPersianNumber(posts.length) },
          { label: 'دنبال‌کننده', value: toPersianNumber((profileUser.followersCount || 0).toLocaleString('en-US')) },
          { label: 'دنبال‌شونده', value: toPersianNumber((profileUser.followingCount || 0).toLocaleString('en-US')) },
        ]}
        topActions={
          isOwn ? (
            <>
              <Link href="/profile/edit" aria-label="ویرایش پروفایل" className="w-10 h-10 flex items-center justify-center text-text-primary">
                <EditIcon className="w-4.5 h-4.5" />
              </Link>
              <Link href="/settings" aria-label="تنظیمات" className="w-10 h-10 flex items-center justify-center text-text-primary">
                <SettingsIcon className="w-4.5 h-4.5" />
              </Link>
            </>
          ) : (
            <button type="button" onClick={goBack} aria-label="بازگشت" className="me-auto w-10 h-10 flex items-center justify-center text-text-primary">
              <BackIcon className="w-5 h-5" />
            </button>
          )
        }
        actions={
          !isOwn && (
            <button
              type="button"
              onClick={handleFollow}
              className={`h-8.75 px-5 rounded-[25px] text-sm ${
                isFollowing ? 'border border-border-strong text-text-primary' : 'bg-accent-color text-on-accent'
              }`}
            >
              {isFollowing ? 'دنبال می‌کنید' : 'دنبال کردن'}
            </button>
          )
        }
      />

      <CategoryTabs items={categories} value={activeCategory} onChange={setActiveCategory} />

      {visiblePosts.length > 0 ? (
        <div className="mt-5 grid grid-cols-3 gap-px">
          {visiblePosts.map((post) => (
            <Link key={post.id} href={`/post/${post.id}`} className="block min-w-0 text-text-primary hover:text-text-primary">
              <PostCard
                id={post.id}
                title={post.title}
                price={post.price}
                stock={post.stock}
                category={post.category}
                rating={post.rating}
                images={post.images || [post.image || '/images/posts/placeholder.svg']}
                compact
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center px-4 pt-8 pb-10">
          <Image src="/images/illustrations/empty-posts.png" alt="" width={298} height={293} />
          <p className="m-0 -mt-8 text-sm text-text-primary">هنوز پستی منتشر نشده است</p>
        </div>
      )}
    </AppShell>
  );
}
