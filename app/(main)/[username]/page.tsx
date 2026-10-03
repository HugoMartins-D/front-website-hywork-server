// src/app/profile/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/components/NotificationToast';
import { fetchUserByUsername } from '@/services/postService';
import AppShell from '@/components/AppShell';
import ProfileHeader from '@/components/ProfileHeader';
import { Button, Chip, SpecList } from '@/components/FormControls';
import { toPersianNumber } from '@/utils/numberUtils';

// ============================================
// ثابت‌های برنامه
// ============================================

/** آدرس پایه API */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/** مسیرهای API */
const API_ENDPOINTS = {
  GET_PROFILE: '/users/profile',
} as const;

/** وضعیت‌های بارگذاری */
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/** زمان تاخیر برای هدایت (میلی‌ثانیه) */
const REDIRECT_DELAY = 2000;

// ============================================
// تعریف نوع‌های داده
// ============================================

/** نوع داده پروفایل کاربر */
interface UserProfile {
  id: number | string;
  username: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  joinedAt?: string;
  website?: string;
  email?: string;
  skills?: string[];
  experiences?: Experience[];
  education?: Education[];
  socialLinks?: SocialLinks;
}

/** نوع داده تجربه کاری */
interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

/** نوع داده تحصیلات */
interface Education {
  id: string;
  degree: string;
  field: string;
  institution: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
}

/** نوع داده لینک‌های اجتماعی */
interface SocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  instagram?: string;
  telegram?: string;
}

/** پاسخ API برای دریافت پروفایل */
interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
}

// ============================================
// توابع کمکی
// ============================================

/**
 * دریافت پروفایل کاربر از سرور
 * 
 * @param username - نام کاربری
 * @param signal - AbortSignal برای لغو درخواست
 * @returns پروفایل کاربر
 * @throws {Error} اگر دریافت پروفایل با خطا مواجه شود
 */
async function fetchUserProfile(username: string, signal?: AbortSignal): Promise<UserProfile> {
  const url = `${API_BASE_URL}${API_ENDPOINTS.GET_PROFILE}/${username}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      signal: signal || controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    let result: ProfileResponse;
    
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = { success: false };
    }

    if (response.ok && result.success && result.data) {
      return result.data;
    }
  } catch (fetchErr) {
    console.warn('⚠️ بک‌اند در دسترس نیست، استفاده از داده‌های محلی:', fetchErr);
  }

  // در صورت در دسترس نبودن بک‌اند، از داده‌های محلی استفاده می‌شود
  const localUser = fetchUserByUsername(username);
  if (localUser) {
    return {
      id: localUser.id,
      username: localUser.username,
      phone: localUser.email || '',
      fullName: localUser.name,
      avatar: localUser.avatar,
      bio: localUser.bio,
      isVerified: true,
      followersCount: 120,
      followingCount: 85,
      postsCount: 2,
      joinedAt: localUser.createdAt,
    };
  }

  throw new Error('پروفایل کاربر یافت نشد');
}

/**
 * ایجاد نام کامل از نام و نام خانوادگی
 */
function getFullName(firstName?: string, lastName?: string): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return '';
}

/**
 * فرمت تاریخ به صورت فارسی
 */
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

// ============================================
// کامپوننت‌های زیرمجموعه
// ============================================

/**
 * کامپوننت نمایش وضعیت بارگذاری
 */
function LoadingProfile() {
  return (
    <AppShell suppressActiveProfile>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-placeholder border-t-accent-color rounded-full animate-spin" />
        <p className="mt-4 text-text-secondary">در حال بارگذاری پروفایل...</p>
      </div>
    </AppShell>
  );
}

/**
 * کامپوننت نمایش خطا
 */
function ErrorProfile({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <AppShell suppressActiveProfile>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Image src="/images/illustrations/empty-posts.png" alt="" width={200} height={197} />
        <h2 className="m-0 mt-2 text-lg font-medium text-text-primary">خطا در بارگذاری پروفایل</h2>
        <p className="m-0 mt-1 mb-6 text-sm text-text-secondary">{message}</p>
        <Button size="md" onClick={onRetry}>تلاش مجدد</Button>
      </div>
    </AppShell>
  );
}

/**
 * کامپوننت نمایش پروفایل - سربرگ فیگما و بخش‌های اطلاعات با فهرست کلید/مقدار و چیپ‌ها
 */
function ProfileDisplay({ profile }: { profile: UserProfile }) {
  const fullName = getFullName(profile.firstName, profile.lastName);
  const joinedDate = formatDate(profile.joinedAt);
  const fa = (n?: number) => toPersianNumber((n || 0).toLocaleString('en-US'));

  const info = [
    profile.city && { label: 'شهر', value: profile.city },
    profile.website && {
      label: 'وب‌سایت',
      value: (
        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-text-primary underline" dir="ltr">
          {profile.website}
        </a>
      ),
    },
    profile.email && { label: 'ایمیل', value: <span dir="ltr">{profile.email}</span> },
    joinedDate && { label: 'تاریخ عضویت', value: joinedDate },
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

  const socials = profile.socialLinks
    ? (Object.entries(profile.socialLinks) as [string, string | undefined][]).filter(([, url]) => url)
    : [];

  return (
    <>
      <ProfileHeader
        avatar={profile.avatar}
        name={fullName || profile.username}
        subtitle={`\u2066@${profile.username}\u2069`}
        bio={profile.bio}
        stats={[
          { label: 'پست', value: fa(profile.postsCount) },
          { label: 'دنبال‌کننده', value: fa(profile.followersCount) },
          { label: 'دنبال‌شونده', value: fa(profile.followingCount) },
        ]}
        actions={
          profile.isVerified && (
            <span className="inline-flex items-center gap-1 h-6 px-3 rounded-full bg-success/15 text-success text-xs">تأیید شده</span>
          )
        }
      />

      <div className="px-4 pb-10">
        {info.length > 0 && <SpecList title="اطلاعات" items={info} className="mt-10" />}

        {profile.skills && profile.skills.length > 0 && (
          <section className="mt-10">
            <h2 className="m-0 mb-4 text-lg font-medium text-right">مهارت‌ها</h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Chip key={index} active={index === 0}>{skill}</Chip>
              ))}
            </div>
          </section>
        )}

        {profile.experiences && profile.experiences.length > 0 && (
          <section className="mt-10">
            <h2 className="m-0 mb-4 text-lg font-medium text-right">تجربیات کاری</h2>
            <ul className="list-none m-0 p-0">
              {profile.experiences.map((exp) => (
                <li key={exp.id} className="py-3 border-b-[0.5px] border-border-color last:border-0">
                  <h3 className="m-0 text-base font-semibold text-text-primary">{exp.title}</h3>
                  <p className="m-0 text-sm text-text-primary">{exp.company}</p>
                  <p className="m-0 text-xs text-text-secondary">
                    {formatDate(exp.startDate)} - {exp.current ? 'اکنون' : formatDate(exp.endDate)}
                  </p>
                  {exp.description && <p className="m-0 mt-2 text-xs text-text-primary">{exp.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {profile.education && profile.education.length > 0 && (
          <section className="mt-10">
            <h2 className="m-0 mb-4 text-lg font-medium text-right">تحصیلات</h2>
            <ul className="list-none m-0 p-0">
              {profile.education.map((edu) => (
                <li key={edu.id} className="py-3 border-b-[0.5px] border-border-color last:border-0">
                  <h3 className="m-0 text-base font-semibold text-text-primary">{edu.degree}</h3>
                  <p className="m-0 text-sm text-text-primary">{edu.field} · {edu.institution}</p>
                  <p className="m-0 text-xs text-text-secondary">
                    {formatDate(edu.startDate)} - {edu.current ? 'اکنون' : formatDate(edu.endDate)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {socials.length > 0 && (
          <section className="mt-10">
            <h2 className="m-0 mb-4 text-lg font-medium text-right">شبکه‌های اجتماعی</h2>
            <div className="flex flex-wrap gap-2">
              {socials.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 px-3.5 rounded-full border border-border-strong text-sm text-text-primary leading-8 capitalize hover:text-text-primary"
                >
                  {name}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

// ============================================
// کامپوننت اصلی
// ============================================

/**
 * صفحه پروفایل کاربر
 * 
 * روند کار:
 * 1. دریافت نام کاربری از پارامترهای URL
 * 2. دریافت اطلاعات پروفایل از سرور
 * 3. نمایش پروفایل با تمام جزئیات
 * 4. مدیریت حالت‌های بارگذاری و خطا
 * 5. امکان تلاش مجدد در صورت خطا
 * 
 * نکته: این صفحه از UserContext استفاده نمی‌کند چون پروفایل
 * عمومی است و نیاز به اطلاعات کاربر لاگین شده ندارد
 */
export default function ProfilePage() {
  // ============================================
  // هوک‌های ری‌اکت
  // ============================================
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const { error: showError } = useToast();

  // ============================================
  // وضعیت‌های کامپوننت
  // ============================================
  const rawParam = params?.username;
  const usernameParam = Array.isArray(rawParam) ? rawParam[0] : rawParam;
  const username = (usernameParam ? decodeURIComponent(String(usernameParam)) : null) || searchParams.get('user') || searchParams.get('username');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingState, setLoadingState] = useState<string>(LOADING_STATES.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ============================================
  // رفرنس‌ها (Refs)
  // ============================================
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ============================================
  // توابع
  // ============================================

  /**
   * بارگذاری پروفایل از سرور - فقط داده را برمی‌گرداند
   */
  const loadProfile = useCallback(async (targetUsername: string): Promise<UserProfile> => {
    console.log('🔄 شروع بارگذاری پروفایل:', {
      username: targetUsername,
      timestamp: new Date().toISOString(),
    });

    // ایجاد AbortController جدید
    abortControllerRef.current = new AbortController();
    
    try {
      const profileData = await fetchUserProfile(targetUsername, abortControllerRef.current.signal);
      
      console.log('✅ پروفایل بارگذاری شد:', {
        username: targetUsername,
        hasData: !!profileData,
        timestamp: new Date().toISOString(),
      });

      return profileData;
    } finally {
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * تلاش مجدد برای بارگذاری
   */
  const handleRetry = useCallback(() => {
    if (username) {
      console.log('🔄 تلاش مجدد برای بارگذاری پروفایل:', username);
      
      // لغو درخواست قبلی اگر وجود دارد
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // بازنشانی وضعیت‌ها
      setProfile(null);
      setLoadingState(LOADING_STATES.IDLE);
      setErrorMessage('');
    }
  }, [username]);

  // ============================================
  // افکت‌ها
  // ============================================

  /**
   * پاک‌سازی تایمرها و درخواست‌ها هنگام unmount
   */
  useEffect(() => {
    return () => {
      // پاک‌سازی تایمر
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        console.log('🧹 تایمر هدایت پاک‌سازی شد');
      }
      
      // لغو درخواست در حال اجرا
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log('🧹 درخواست API لغو شد');
      }
    };
  }, []);

  /**
   * بارگذاری پروفایل هنگام تغییر نام کاربری
   * با استفاده از الگوی استاندارد React برای fetch
   */
  useEffect(() => {
    // لاگ: تغییر پارامترها
    console.log('🔍 بررسی پارامترهای URL:', {
      username,
      allParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString(),
    });

    // اگر نام کاربری وجود نداشته باشد
    if (!username) {
      console.warn('⚠️ نام کاربری در URL یافت نشد');
      
      // نمایش پیام خطا با Toast
      showError('نام کاربری مشخص نشده است');
      
      // پاک‌سازی تایمر قبلی
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      
      // هدایت به صفحه اصلی بعد از تاخیر
      redirectTimeoutRef.current = setTimeout(() => {
        router.replace('/');
        console.log('🚀 هدایت به صفحه اصلی به دلیل عدم وجود نام کاربری');
      }, REDIRECT_DELAY);
      
      return;
    }

    // متغیر برای جلوگیری از به‌روزرسانی پس از unmount
    let isMounted = true;

    // تابع async برای بارگذاری داده
    const fetchData = async () => {
      try {
        // تغییر وضعیت به بارگذاری
        if (isMounted) {
          setLoadingState(LOADING_STATES.LOADING);
          setErrorMessage('');
        }

        // دریافت داده
        const profileData = await loadProfile(username);

        // به‌روزرسانی فقط اگر کامپوننت هنوز mounted است
        if (isMounted) {
          setProfile(profileData);
          setLoadingState(LOADING_STATES.SUCCESS);
        }

      } catch (error) {
        // مدیریت خطا - فقط اگر خطا از Abort نباشد
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('⏹️ درخواست لغو شد:', username);
          return;
        }

        console.error('❌ خطا در بارگذاری پروفایل:', error);
        
        const message = error instanceof Error ? error.message : 'خطا در بارگذاری پروفایل';
        
        if (isMounted) {
          setErrorMessage(message);
          setLoadingState(LOADING_STATES.ERROR);
          showError(message);
        }
      }
    };

    // اجرای تابع
    fetchData();

    // تابع پاک‌سازی
    return () => {
      isMounted = false;
      
      // لغو درخواست در حال اجرا
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        console.log('🧹 درخواست API هنگام unmount لغو شد');
      }
    };
  }, [username, loadProfile,searchParams, router, showError]);

  // ============================================
  // رندر کردن
  // ============================================

  // لاگ: وضعیت رندر
  console.log('🖥️ رندر صفحه پروفایل:', {
    username,
    loadingState,
    hasProfile: !!profile,
    timestamp: new Date().toISOString(),
  });

  // اگر در حال بارگذاری است
  if (loadingState === LOADING_STATES.IDLE || loadingState === LOADING_STATES.LOADING) {
    return <LoadingProfile />;
  }

  // اگر خطا رخ داده است
  if (loadingState === LOADING_STATES.ERROR) {
    return <ErrorProfile message={errorMessage} onRetry={handleRetry} />;
  }

  // اگر پروفایل وجود ندارد
  if (!profile) {
    return <ErrorProfile message="پروفایل یافت نشد" onRetry={handleRetry} />;
  }

  // نمایش پروفایل
  return (
    <AppShell suppressActiveProfile>
      <ProfileDisplay profile={profile} />
    </AppShell>
  );
}

// ============================================
// تنظیمات خروجی
// ============================================

/** جلوگیری از کش استاتیک Next.js */
export const dynamic = 'force-dynamic';