// data/team.ts
// داده‌ی نمونه‌ی صفحه‌های تیم (People، Add member، member notification) تا آماده شدن API تیم

export interface TeamPerson {
  id: number;
  name: string;
  role: string;
  price: number;
  unit: string;
}

export const TEAM_PEOPLE: TeamPerson[] = [
  { id: 1, name: 'پیمان حسینی', role: 'نجار', price: 1000000, unit: 'روزانه' },
  { id: 2, name: 'سارا محمدی', role: 'معمار', price: 550000, unit: 'ساعتی' },
  { id: 3, name: 'علی رضایی', role: 'نقاش', price: 856000, unit: 'پروژه' },
  { id: 4, name: 'امیر کاظمی', role: 'لوله‌کش', price: 1000000, unit: 'روزانه' },
  { id: 5, name: 'نسرین کریمی', role: 'طراح داخلی', price: 550000, unit: 'ساعتی' },
  { id: 6, name: 'الهام احمدی', role: 'برق‌کار', price: 856000, unit: 'پروژه' },
];

export const TEAM_ROLES = ['سرپرست تیم', 'دستیار', 'ناظر', 'مشاور', 'هماهنگ‌کننده', 'تکنسین', 'متخصص', 'متخصص ارشد', 'متخصص تازه‌کار'];
