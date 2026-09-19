'use client';

import { useState, useEffect, useCallback } from 'react';
import DualRangeSlider from './DualRangeSlider';
import { toPersianNumber, toEnglishNumber } from '@/utils/numberUtils';

// ==================== تعریف نوع‌ها ====================
interface AdvancedFilterProps {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  onFilterChange?: (filters: FilterState) => void;
  isMobile?: boolean;
  initialFilters?: FilterState;
}

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  minRating: number;
  inStockOnly: boolean;
}

// ==================== کامپوننت چک‌باکس سفارشی ====================
const CustomCheckbox = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) => {
  return (
    <label
      className="flex items-center gap-2.5 cursor-pointer"
      onClick={onChange}
    >
      <div
        className={`w-[18px] h-[18px] border-[1.5px] rounded flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[var(--color-accent-color)] border-[var(--color-accent-color)]'
            : 'bg-[var(--color-bg-primary)] border-[var(--color-border-color)]'
        }`}
      >
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <span className="text-xs text-[var(--color-text-primary)]">{label}</span>
    </label>
  );
};

// ==================== کامپوننت اصلی ====================
export default function AdvancedFilter({
  categories = [],
  minPrice = 0,
  maxPrice = 10000000,
  onFilterChange,
  isMobile = false,
  initialFilters,
}: AdvancedFilterProps) {
  // ==================== State ====================
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || [minPrice, maxPrice]
  );
  const [selectedCats, setSelectedCats] = useState<string[]>(
    initialFilters?.categories || []
  );
  const [minRating, setMinRating] = useState<number>(
    initialFilters?.minRating || 0
  );
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    initialFilters?.inStockOnly || false
  );
  const [displayMin, setDisplayMin] = useState<string>(
    toPersianNumber(priceRange[0])
  );
  const [displayMax, setDisplayMax] = useState<string>(
    toPersianNumber(priceRange[1])
  );

  // ==================== تشخیص اندازه صفحه ====================
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isMediumMobile, setIsMediumMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsSmallMobile(width <= 480);
      setIsMediumMobile(width > 480 && width <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ==================== اعمال فیلترها ====================
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        priceRange,
        categories: selectedCats,
        minRating,
        inStockOnly,
      });
    }
  }, [priceRange, selectedCats, minRating, inStockOnly, onFilterChange]);

  // ==================== هندلرها ====================
  const handlePriceMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const eng = toEnglishNumber(raw);
    let val = parseInt(eng, 10);
    if (isNaN(val)) val = minPrice;
    val = Math.min(val, priceRange[1] - 1000);
    val = Math.max(val, minPrice);
    setPriceRange([val, priceRange[1]]);
    setDisplayMin(toPersianNumber(val));
  };

  const handlePriceMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const eng = toEnglishNumber(raw);
    let val = parseInt(eng, 10);
    if (isNaN(val)) val = maxPrice;
    val = Math.max(val, priceRange[0] + 1000);
    val = Math.min(val, maxPrice);
    setPriceRange([priceRange[0], val]);
    setDisplayMax(toPersianNumber(val));
  };

  const handleSliderChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    setDisplayMin(toPersianNumber(newRange[0]));
    setDisplayMax(toPersianNumber(newRange[1]));
  };

  const toggleCategory = (cat: string) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const resetFilters = () => {
    setPriceRange([minPrice, maxPrice]);
    setDisplayMin(toPersianNumber(minPrice));
    setDisplayMax(toPersianNumber(maxPrice));
    setSelectedCats([]);
    setMinRating(0);
    setInStockOnly(false);
  };

  const ratingOptions = [0, 1, 2, 3, 4, 5];

  // ==================== استایل‌های شرطی ====================
  const containerClasses = `
    bg-[var(--color-bg-secondary)] w-full font-sans
    ${isSmallMobile ? 'p-4' : isMediumMobile ? 'p-5' : 'p-6'}
    ${isMobile ? 'rounded-none' : 'rounded-2xl'}
  `;

  const sectionClasses = `
    ${isSmallMobile ? 'mb-5' : 'mb-6'}
  `;

  const priceInputsRowClasses = `
    flex gap-3 mb-5
    ${isSmallMobile ? 'flex-col gap-3 mb-4' : ''}
  `;

  const checkboxGroupClasses = `
    flex flex-col gap-3
    ${isSmallMobile ? 'grid grid-cols-2 gap-3' : ''}
  `;

  const ratingGroupClasses = `
    flex gap-2 flex-wrap
    ${isSmallMobile ? 'grid grid-cols-3 gap-2' : ''}
  `;

  const getRatingBtnClasses = (isActive: boolean) => {
    const base = `
      px-3.5 py-1.5 rounded-full text-xs cursor-pointer font-sans transition-colors
      ${isSmallMobile ? 'px-2 py-2 text-[11px] text-center' : ''}
    `;
    if (isActive) {
      return `${base} bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold border border-[var(--color-border-color)]`;
    }
    return `${base} bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border border-[var(--color-border-color)] hover:bg-[var(--color-border-color)]`;
  };

  const priceInputClasses = `
    flex-1 px-3 py-2 border border-[var(--color-border-color)] rounded-lg text-xs text-center
    bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] outline-none focus:ring-2 focus:ring-[var(--color-accent-color)]
    ${isSmallMobile ? 'py-2.5 text-sm' : ''}
  `;

  // ==================== رندر ====================
  return (
    <div className={containerClasses}>
      {/* هدر */}
      <div
        className={`flex justify-between items-center mb-5 pb-3 border-b border-[var(--color-border-color)] ${
          isSmallMobile ? 'hidden' : ''
        }`}
      >
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
          فیلترها
        </span>
        <button
          onClick={resetFilters}
          className="bg-none border-none text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-primary)] transition-colors"
        >
          ریست
        </button>
      </div>

      {/* بخش قیمت */}
      <div className={sectionClasses}>
        <div className="text-xs font-medium mb-3 text-[var(--color-text-primary)]">
          قیمت (تومان)
        </div>

        <div className={priceInputsRowClasses}>
          <div className="flex-1 flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-muted)] min-w-[28px]">
              از
            </label>
            <input
              type="text"
              value={displayMin}
              onChange={handlePriceMinChange}
              className={priceInputClasses}
            />
          </div>
          <div className="flex-1 flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-muted)] min-w-[28px]">
              تا
            </label>
            <input
              type="text"
              value={displayMax}
              onChange={handlePriceMaxChange}
              className={priceInputClasses}
            />
          </div>
        </div>

        <div className="mt-2">
          <div
            className={`flex justify-between text-[11px] text-[var(--color-text-muted)] mb-3 ${
              isSmallMobile ? 'text-[10px] mb-2.5' : ''
            }`}
          >
            <span>{toPersianNumber(minPrice)}</span>
            <span>{toPersianNumber(maxPrice)}</span>
          </div>

          <DualRangeSlider
            min={minPrice}
            max={maxPrice}
            value={priceRange}
            onChange={handleSliderChange}
            step={1000}
          />
        </div>
      </div>

      {/* بخش دسته‌بندی */}
      {categories.length > 0 && (
        <div className={sectionClasses}>
          <div className="text-xs font-medium mb-3 text-[var(--color-text-primary)]">
            دسته‌بندی
          </div>
          <div className={checkboxGroupClasses}>
            {categories.map((cat) => (
              <CustomCheckbox
                key={cat}
                checked={selectedCats.includes(cat)}
                onChange={() => toggleCategory(cat)}
                label={cat}
              />
            ))}
          </div>
        </div>
      )}

      {/* بخش امتیاز */}
      <div className={sectionClasses}>
        <div className="text-xs font-medium mb-3 text-[var(--color-text-primary)]">
          حداقل امتیاز
        </div>
        <div className={ratingGroupClasses}>
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => setMinRating(r)}
              className={getRatingBtnClasses(minRating === r)}
            >
              {r === 0 ? 'همه' : toPersianNumber(r)}
            </button>
          ))}
        </div>
      </div>

      {/* بخش موجودی */}
      <div className={sectionClasses}>
        <CustomCheckbox
          checked={inStockOnly}
          onChange={() => setInStockOnly(!inStockOnly)}
          label="فقط کالاهای موجود"
        />
      </div>
    </div>
  );
}