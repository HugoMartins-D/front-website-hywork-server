'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';

// ==================== آیکون‌ها ====================
const UsersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const LayersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const CoinNumberIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v12" />
    <path d="M8 10h4" />
    <path d="M8 14h4" />
  </svg>
);

const ChatConversationIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ==================== کامپوننت کارت آماری ====================
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  title: string;
  change?: string;
  changeColor?: 'green' | 'amber' | 'purple' | 'red';
  iconBgColor?: string;
  iconColor?: string;
}

const StatCard = ({ 
  icon, 
  value, 
  title, 
  change, 
  changeColor = 'green',
  iconBgColor = 'bg-blue-500/15',
  iconColor = 'text-blue-500'
}: StatCardProps) => {
  const getChangeColor = () => {
    switch (changeColor) {
      case 'green': return 'text-green-500';
      case 'amber': return 'text-amber-500';
      case 'purple': return 'text-purple-500';
      case 'red': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className="bg-(--color-bg-card) rounded-2xl p-5 flex items-center gap-4 shadow-sm border border-(--color-border-color) transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={`w-[50px] h-[50px] rounded-xl flex items-center justify-center ${iconBgColor} ${iconColor} flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-(--color-text-primary) truncate">{value}</div>
        <div className="text-[13px] text-(--color-text-secondary) mt-0.5">{title}</div>
        {change && <div className={`text-[11px] ${getChangeColor()} mt-1`}>{change}</div>}
      </div>
    </div>
  );
};

// ==================== کامپوننت اصلی ====================
export default function AdminDashboardPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly'>('monthly');

  // ==================== داده‌های آماری ====================
  const stats = useMemo(() => ({
    totalUsers: 1248,
    newUsers: 156,
    totalProducts: 342,
    pendingProducts: 23,
    totalOrders: 89,
    pendingOrders: 12,
    totalRevenue: 45200000,
    platformFee: 6780000,
    activeChats: 47,
    unreadMessages: 156,
  }), []);

  const monthlySalesData = useMemo(() => [
    { name: "Janeiro", فروش: 12500000, خرید: 8900000 },
    { name: "Fevereiro", فروش: 14200000, خرید: 10200000 },
    { name: "Março", فروش: 16800000, خرید: 12100000 },
    { name: "Abril", فروش: 15600000, خرید: 11500000 },
    { name: "Maio", فروش: 18900000, خرید: 13800000 },
    { name: "Junho", فروش: 21000000, خرید: 15600000 },
  ], []);

  const weeklySalesData = useMemo(() => [
    { name: "Sábado", فروش: 4200000, خرید: 2400000 },
    { name: "Domingo", فروش: 3800000, خرید: 2210000 },
    { name: "Segunda-feira", فروش: 5100000, خرید: 3010000 },
    { name: "Terça-feira", فروش: 4600000, خرید: 2890000 },
    { name: "Quarta-feira", فروش: 5800000, خرید: 3500000 },
    { name: "Quinta-feira", فروش: 6900000, خرید: 4100000 },
    { name: "Sexta-feira", فروش: 7200000, خرید: 4800000 },
  ], []);

  const categoryData = useMemo(() => [
    { name: "Eletrônicos", value: 35, color: '#3b82f6' },
    { name: "Moda e vestuário", value: 25, color: '#8b5cf6' },
    { name: "Livros", value: 15, color: '#10b981' },
    { name: "Casa e cozinha", value: 15, color: '#f59e0b' },
    { name: "Esportes", value: 10, color: '#ef4444' },
  ], []);

  const recentUsers = useMemo(() => [
    { id: 1, name: "Ali Mohammadi", email: 'ali@example.com', date: "04/05/2024", status: 'active' },
    { id: 2, name: "Zahra Karimi", email: 'zahra@example.com', date: "04/05/2024", status: 'active' },
    { id: 3, name: "Mohammad Rezaei", email: 'mohammad@example.com', date: "03/05/2024", status: 'pending' },
  ], []);

  const recentOrders = useMemo(() => [
    { id: 101, product: "Fone de ouvido sem fio", buyer: "Sara Hosseini", amount: 1250000, status: 'paid', date: "04/05/2024" },
    { id: 102, product: "Livro de React", buyer: "Reza Ahmadi", amount: 250000, status: 'pending', date: "04/05/2024" },
    { id: 103, product: "Relógio inteligente", buyer: "Zahra Karimi", amount: 3450000, status: 'paid', date: "03/05/2024" },
  ], []);

  const activeChatsList = useMemo(() => [
    { id: 1, userName: "Ali Mohammadi", lastMessage: "Olá, bom dia", time: "Há 2 minutos", unread: 3, isOnline: true },
    { id: 2, userName: "Zahra Karimi", lastMessage: "Obrigado pela orientação", time: "Há 15 minutos", unread: 0, isOnline: false },
    { id: 3, userName: "Mohammad Rezaei", lastMessage: "Quando posso retirar?", time: "Há 1 hora", unread: 5, isOnline: true },
    { id: 4, userName: "Sara Hosseini", lastMessage: "🎧 Ficou ótimo", time: "Há 3 horas", unread: 1, isOnline: false },
  ], []);

  const chartData = timeRange === 'weekly' ? weeklySalesData : monthlySalesData;

  // ==================== توابع کمکی ====================
  const formatNumber = useCallback((num: number | string) => {
    return String(num);
  }, []);

  const formatPrice = useCallback((price: number) => {
    return formatNumber(price.toLocaleString('pt-BR')) + " tomans";
  }, [formatNumber]);

  const getStatusColor = useCallback((status: string) => {
    return status === 'active' || status === 'paid' 
      ? 'bg-emerald-500/15 text-emerald-500' 
      : 'bg-amber-500/15 text-amber-500';
  }, []);

  const getStatusText = useCallback((status: string) => {
    if (status === 'active') return "Ativo";
    if (status === 'paid') return "Pago";
    if (status === 'pending') return "Pendente";
    return status;
  }, []);

  // ==================== رندر ====================
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-7 gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-(--color-text-primary) m-0">
            Painel administrativo
          </h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">
            Boas-vindas ao painel administrativo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 bg-(--color-bg-surface) border border-(--color-border-color) rounded-full text-xl cursor-pointer flex items-center justify-center transition-all duration-200 text-(--color-text-primary) hover:bg-(--color-border-color)"
            aria-label="Alternar tema"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* ===== کارت‌های آماری ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-5">
        <StatCard
          icon={<UsersIcon />}
          value={formatNumber(stats.totalUsers)}
          title="Total de usuários"
          change={`+${formatNumber(stats.newUsers)} Novo`}
          changeColor="green"
          iconBgColor="bg-blue-500/15"
          iconColor="text-blue-500"
        />
        <StatCard
          icon={<LayersIcon />}
          value={formatNumber(stats.totalProducts)}
          title="Produtos"
          change={`${formatNumber(stats.pendingProducts)} Pendente`}
          changeColor="amber"
          iconBgColor="bg-purple-500/15"
          iconColor="text-purple-500"
        />
        <StatCard
          icon={<ShoppingCartIcon />}
          value={formatNumber(stats.totalOrders)}
          title="Pedidos"
          change={`${formatNumber(stats.pendingOrders)} Pendente`}
          changeColor="amber"
          iconBgColor="bg-amber-500/15"
          iconColor="text-amber-500"
        />
        <StatCard
          icon={<CoinNumberIcon />}
          value={formatPrice(stats.totalRevenue)}
          title="Receita total"
          change={`Comissão: ${formatPrice(stats.platformFee)}`}
          changeColor="green"
          iconBgColor="bg-emerald-500/15"
          iconColor="text-emerald-500"
        />
      </div>

      {/* ===== کارت چت ===== */}
      <div className="mb-7">
        <div 
          className="bg-(--color-bg-card) rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm border border-(--color-border-color) cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          onClick={() => router.push('/admin/chats')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/chats')}
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-[50px] h-[50px] rounded-xl flex items-center justify-center bg-purple-500/15 text-purple-500 flex-shrink-0">
              <ChatConversationIcon />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold text-(--color-text-primary)">
                {formatNumber(stats.activeChats)}
              </div>
              <div className="text-[13px] text-(--color-text-secondary) mt-0.5">
                Conversas ativas hoje
              </div>
              {stats.unreadMessages > 0 && (
                <div className="text-[11px] text-purple-500 mt-1">
                  {formatNumber(stats.unreadMessages)} mensagens não lidas
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-purple-500 font-medium px-3 py-1.5 rounded-full bg-purple-500/15 whitespace-nowrap">
            Gerenciar conversas →
          </div>
        </div>
      </div>

      {/* ===== نمودار فروش ===== */}
      <div className="bg-(--color-bg-card) rounded-2xl p-4 sm:p-5 mb-7 shadow-sm border border-(--color-border-color)">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
          <h3 className="text-base font-semibold text-(--color-text-primary) m-0">
            Vendas e compras
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('weekly')}
              className={`px-4 py-1.5 border-none rounded-full text-[13px] cursor-pointer transition-colors ${
                timeRange === 'weekly' 
                  ? 'bg-(--color-text-primary) text-(--color-bg-primary)' 
                  : 'bg-(--color-bg-surface) text-(--color-text-secondary) hover:bg-(--color-border-color)'
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setTimeRange('monthly')}
              className={`px-4 py-1.5 border-none rounded-full text-[13px] cursor-pointer transition-colors ${
                timeRange === 'monthly' 
                  ? 'bg-(--color-text-primary) text-(--color-bg-primary)' 
                  : 'bg-(--color-bg-surface) text-(--color-text-secondary) hover:bg-(--color-border-color)'
              }`}
            >
              Mensal
            </button>
          </div>
        </div>
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-color)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-text-secondary)" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="var(--color-text-secondary)" 
                tickFormatter={(value) => formatNumber(value / 1000000) + 'M'}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-bg-secondary)', 
                  borderColor: 'var(--color-border-color)', 
                  color: 'var(--color-text-primary)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                }} 
                formatter={(value: number) => formatPrice(value)} 
              />
              <Legend 
                wrapperStyle={{ color: 'var(--color-text-primary)' }} 
                iconType="circle"
              />
              <Line 
                type="monotone" 
                dataKey="Venda"
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Compra"
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== بخش سه ستونه ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7 mb-7">
        {/* دسته‌بندی محصولات */}
        <div className="bg-(--color-bg-card) rounded-2xl p-5 shadow-sm border border-(--color-border-color)">
          <h3 className="text-base font-semibold text-(--color-text-primary) mb-4">
            Categorias de produtos
          </h3>
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={categoryData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-bg-secondary)', 
                    borderColor: 'var(--color-border-color)', 
                    color: 'var(--color-text-primary)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }} 
                  formatter={(value: number) => `${value}%`}
                />
                <Legend 
                  wrapperStyle={{ color: 'var(--color-text-primary)' }} 
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* کاربران جدید */}
        <div className="bg-(--color-bg-card) rounded-2xl p-5 shadow-sm border border-(--color-border-color)">
          <h3 className="text-base font-semibold text-(--color-text-primary) mb-4">
            Novos usuários
          </h3>
          <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar">
            {recentUsers.map(user => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 p-2.5 bg-(--color-bg-surface) rounded-xl transition-all duration-200 hover:bg-(--color-border-color)"
              >
                <div className="w-9 h-9 rounded-full bg-(--color-bg-secondary) flex items-center justify-center font-semibold text-[13px] text-(--color-text-primary) flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-(--color-text-primary) truncate">
                    {user.name}
                  </div>
                  <div className="text-[11px] text-(--color-text-muted) truncate">
                    {user.email}
                  </div>
                </div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(user.status)}`}>
                  {getStatusText(user.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* چت‌های فعال */}
        <div className="bg-(--color-bg-card) rounded-2xl p-5 shadow-sm border border-(--color-border-color)">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-semibold text-(--color-text-primary) m-0">
              Conversas ativas
            </h3>
            <button 
              onClick={() => router.push('/admin/chats')}
              className="px-3 py-1 bg-(--color-bg-surface) border-none rounded-full text-[11px] text-(--color-text-secondary) cursor-pointer transition-all duration-200 hover:bg-(--color-border-color)"
            >
              Ver todos
            </button>
          </div>
          <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar">
            {activeChatsList.map(chat => (
              <div 
                key={chat.id} 
                className="flex items-center gap-3 p-2.5 bg-(--color-bg-surface) rounded-xl cursor-pointer transition-all duration-200 hover:bg-(--color-border-color)"
                onClick={() => router.push('/admin/chats')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && router.push('/admin/chats')}
              >
                <div className="w-10 h-10 rounded-full bg-(--color-bg-secondary) flex items-center justify-center font-semibold text-(--color-text-primary) relative flex-shrink-0">
                  {chat.userName.charAt(0)}
                  {chat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-(--color-bg-card)" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-(--color-text-primary) truncate">
                    {chat.userName}
                  </div>
                  <div className="text-[11px] text-(--color-text-muted) truncate max-w-[120px]">
                    {chat.lastMessage}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="text-[9px] text-(--color-text-muted)">{chat.time}</div>
                  {chat.unread > 0 && (
                    <div className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {formatNumber(chat.unread)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== سفارشات اخیر ===== */}
      <div className="bg-(--color-bg-card) rounded-2xl p-5 shadow-sm border border-(--color-border-color)">
        <h3 className="text-base font-semibold text-(--color-text-primary) mb-4">
          Pedidos recentes
        </h3>
        <div className="flex flex-col gap-3">
          {recentOrders.map(order => (
            <div 
              key={order.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-(--color-bg-surface) rounded-xl gap-3 sm:gap-0"
            >
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <div className="text-sm font-medium text-(--color-text-primary) truncate">
                  {order.product}
                </div>
                <div className="text-[11px] text-(--color-text-muted) mt-0.5">
                  Comprador: {order.buyer}
                </div>
              </div>
              <div className="text-[13px] font-semibold text-orange-500 sm:ml-3 whitespace-nowrap">
                {formatPrice(order.amount)}
              </div>
              <div className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== استایل اسکرول بار سفارشی ===== */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--color-bg-surface);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border-color);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-secondary);
        }
      `}</style>
    </div>
  );
}