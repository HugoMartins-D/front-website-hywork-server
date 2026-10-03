// src/app/(main)/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PostCard from '@/components/PostCard';
import PostModal from '@/components/PostModal';
import { fetchAllPosts } from '@/services/postService';
import type { Post } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // بارگذاری پست‌ها
  useEffect(() => {
    let isMounted = true;
    const loadPosts = async () => {
      try {
        const allPosts = await fetchAllPosts();
        if (isMounted && Array.isArray(allPosts)) {
          setPosts(allPosts);
        } else if (isMounted) {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
        if (isMounted) setError('خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  const openModal = useCallback((post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPost(null);
  }, []);

  const handleAddToCart = useCallback((post: Post) => {
    alert(`${post.title} به سبد خرید اضافه شد!`);
  }, []);

  const handleSellerClick = useCallback(
    (sellerId: string | number) => {
      closeModal();
      const seller = posts.find((p) => p.userId === sellerId);
      if (seller && seller.authorUsername && seller.authorUsername !== 'unknown') {
        router.push(`/profile?user=${seller.authorUsername}`);
      } else {
        router.push(`/profile?user=${sellerId}`);
      }
    },
    [posts, router, closeModal]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-base text-text-secondary bg-bg-primary">
        در حال بارگذاری محصولات...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-base text-text-secondary bg-bg-primary">
        {error}
      </div>
    );
  }

  return (
    <AppShell>
      {/* محتوای اصلی: فید پست‌ها در ستون ۴۴۰ پیکسلی فیگما */}
      <div>
        <div className="flex flex-col items-center py-5 gap-[2px] w-full">
          {posts.length === 0 ? (
            <div className="text-center p-8 text-text-secondary">هیچ محصولی یافت نشد.</div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="w-full cursor-pointer"
                onClick={() => openModal(post)}
              >
                <PostCard
                  id={post.id}
                  title={post.title}
                  price={post.price}
                  stock={post.stock}
                  category={post.category}
                  rating={post.rating}
                  images={post.images || (post.image ? [post.image] : [])}
                  description={post.caption}
                  sellerName={post.authorName}
                  sellerUsername={post.authorUsername}
                  sellerAvatar={post.authorAvatar}
                  sellerId={post.userId}
                />
              </div>
            ))
          )}
        </div>
      </div>


      {/* مودال پست */}
      {isModalOpen && selectedPost && (
        <PostModal
          post={selectedPost}
          onAddToCart={handleAddToCart}
          onClose={closeModal}
          onSellerClick={() => handleSellerClick(selectedPost.userId)}
        />
      )}
    </AppShell>
  );
}