// app/layout.tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext'; // ✅ فقط ایمپورت
import { ToastProvider } from '@/components/NotificationToast';
import "leaflet/dist/leaflet.css";
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MyApp',
    template: '%s | MyApp',
  },
  description: "Plataforma de compra e venda de produtos",
  keywords: ["Loja", "Compra", "Venda", "Produtos", "Online"],
  authors: [{ name: 'MyApp Team' }],
  creator: 'MyApp',
  publisher: 'MyApp',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'MyApp',
    description: "Plataforma de compra e venda de produtos",
    url: 'https://myapp.com',
    siteName: 'MyApp',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <UserProvider>  {/* ✅ اینجا UserProvider را قرار دهید */}
            <ToastProvider>
              {children}
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}