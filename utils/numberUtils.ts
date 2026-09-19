// تبدیل اعداد به فارسی
export const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

// فرمت قیمت با جداکننده هزارگان
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price);
};

// فرمت امتیاز
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

// تبدیل اعداد فارسی به انگلیسی
export const toEnglishNumber = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str.replace(/[۰-۹]/g, (digit) => englishDigits[persianDigits.indexOf(digit)]);
};