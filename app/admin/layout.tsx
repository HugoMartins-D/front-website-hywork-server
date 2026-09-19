'use client';

import { ReactNode, useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const applyByViewport = () => {
      setIsSidebarOpen(window.innerWidth > 768);
    };
    applyByViewport();
    window.addEventListener('resize', applyByViewport);
    return () => window.removeEventListener('resize', applyByViewport);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      <div className="flex flex-1 relative">
        <AdminSidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <div 
          className={`flex-1 overflow-y-auto p-6 px-8 bg-bg-primary min-h-[calc(100vh-70px)] transition-all duration-300 ${
            isSidebarOpen ? 'mr-65' : 'mr-0'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}