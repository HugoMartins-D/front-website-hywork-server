'use client';

import { useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import PostCard from '@/components/PostCard';
import PostModal from '@/components/PostModal';
import { RadioDot } from '@/components/FormControls';
import { SearchIcon, LocationIcon, CloseIcon } from '@/components/icons';
import { fetchAllPosts } from '@/services/postService';
import type { Post } from '@/types';

// شهرهای فهرست «انتخاب شهر» در فیگما (search page)
const CITIES = [
  'تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'اهواز', 'قم', 'کرمانشاه', 'رشت',
  'ارومیه', 'بندرعباس', 'اراک', 'یزد', 'زاهدان', 'همدان', 'کرمان', 'ساری', 'قزوین', 'سنندج',
];

// سه حرف اول نام شهر زیر آیکون موقعیت (مثل «Teh» در فیگما)
const shortCity = (city: string) => city.slice(0, 3);

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const [city, setCity] = useState(CITIES[0]);
  const [pickingCity, setPickingCity] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const posts = useMemo(() => fetchAllPosts(), []);

  const term = searchTerm.trim().toLocaleLowerCase('fa');

  const filteredPosts = useMemo(() => {
    if (!term) return posts;
    return posts.filter((post) =>
      [
        post.title,
        post.caption,
        post.description,
        post.category,
        post.brand,
        post.model,
        post.authorName,
        post.authorUsername,
      ].some((value) => value?.toLocaleLowerCase('fa').includes(term))
    );
  }, [posts, term]);

  // پیشنهادها: عنوان و دسته‌ی پست‌های منطبق، بدون تکرار
  const suggestions = useMemo(() => {
    if (!term) return [];
    const set = new Set<string>();
    for (const p of filteredPosts) {
      if (p.category?.toLocaleLowerCase('fa').includes(term)) set.add(p.category);
      if (p.title.toLocaleLowerCase('fa').includes(term)) set.add(p.title);
      if (set.size >= 8) break;
    }
    return [...set];
  }, [filteredPosts, term]);

  const showSuggestions = focused && suggestions.length > 0;

  return (
    <AppShell>
      <header className="flex items-start gap-2.5 px-4 pt-4.5">
        <button
          type="button"
          onClick={() => setPickingCity((v) => !v)}
          aria-label={`انتخاب شهر (${city})`}
          aria-expanded={pickingCity}
          className="w-8 h-12.5 flex flex-col items-center justify-center gap-1 text-text-primary"
        >
          <LocationIcon className="w-4 h-5" />
          <span className="text-[10px] leading-3">{shortCity(city)}</span>
        </button>
        <div className="relative flex-1">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="جستجو"
            aria-label="جستجوی محصولات"
            className="w-full h-12.5 rounded-[10px] border border-border-strong bg-bg-primary ps-4 pe-12 text-xl text-text-primary outline-none placeholder:text-text-muted focus:border-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="پاک کردن جستجو"
              className="absolute end-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-text-primary"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          ) : (
            <SearchIcon className="pointer-events-none absolute end-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1e1e1e]" />
          )}
        </div>
      </header>

      {pickingCity ? (
        <ul className="list-none m-0 mt-11 px-4" role="radiogroup" aria-label="انتخاب شهر">
          {CITIES.map((c) => (
            <li key={c}>
              <button
                type="button"
                role="radio"
                aria-checked={c === city}
                onClick={() => {
                  setCity(c);
                  setPickingCity(false);
                }}
                className="w-full h-9.75 flex items-center gap-5 text-base text-text-primary"
              >
                <RadioDot checked={c === city} />
                <span>{c}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : showSuggestions ? (
        <ul className="list-none m-0 mt-6 px-3">
          {suggestions.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onMouseDown={() => setSearchTerm(s)}
                className={`w-full h-8 my-0.5 px-4 rounded-[10px] text-right text-base truncate ${
                  i === 0 ? 'bg-accent-color text-on-accent' : 'text-text-primary'
                }`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      ) : filteredPosts.length > 0 ? (
        <div className="mt-13.5 grid grid-cols-3 gap-px bg-bg-primary">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              role="button"
              tabIndex={0}
              aria-label={`مشاهده ${post.title}`}
              onClick={() => setSelectedPost(post)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPost(post);
                }
              }}
              className="min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-color"
            >
              <PostCard
                compact
                id={post.id}
                title={post.title}
                price={post.price}
                images={post.images || (post.image ? [post.image] : [])}
                rating={post.rating}
                category={post.category}
                stock={post.stock}
              />
            </article>
          ))}
        </div>
      ) : (
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
          <SearchIcon className="mb-4 h-10 w-10 text-text-muted" />
          <h2 className="m-0 mb-2 text-lg font-medium">محصولی پیدا نشد</h2>
          <p className="m-0 text-sm text-text-secondary">عبارت جستجو را تغییر دهید.</p>
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onAddToCart={(post) => window.alert(`${post.title} به سبد خرید اضافه شد`)}
        />
      )}
    </AppShell>
  );
}
