'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('super_admin_session');
    if (!session) {
      router.push('/super-admin/login');
      return;
    }

    const userData = JSON.parse(session);
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('super_admin_session');
    router.push('/super-admin/login');
  };

  const navigationItems = useMemo(() => [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: '📊' }, // Companies
    { name: 'Companies', href: '/super-admin/dashboard', icon: '🏢' }, // Explicit Companies link pointing to dashboard
    { name: 'Users', href: '/super-admin/users', icon: '👥' },
    { name: 'Support Queries', href: '/super-admin/queries', icon: '🎫' },
    { name: 'Payments', href: '/super-admin/payments', icon: '💰' },
    { name: 'WhatsApp', href: '/super-admin/whatsapp', icon: '📱' },
    { name: 'Seed Data', href: '/super-admin/seed-data', icon: '🌱' },
  ], []);

  const isCurrentRoute = (href: string) => {
    if (href === '/super-admin/dashboard' && pathname === '/super-admin/dashboard') return true;
    if (href !== '/super-admin/dashboard' && pathname?.startsWith(href)) return true;
    return false;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-indigo-900 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-indigo-800 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="font-bold text-xl tracking-wider">SUPER ADMIN</div>
          ) : (
            <div className="font-bold text-xl">SA</div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-indigo-300 hover:text-white"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const active = isCurrentRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${active
                    ? 'bg-indigo-700 text-white shadow-md'
                    : 'text-indigo-100 hover:bg-indigo-800 hover:text-white'
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-indigo-800 bg-indigo-950">
          {sidebarOpen ? (
            <div className="mb-3">
              <p className="font-medium text-sm truncate">{user.name}</p>
              <p className="text-xs text-indigo-300 truncate">{user.email}</p>
            </div>
          ) : (
            <div className="text-center mb-3 text-xl">👤</div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium flex items-center justify-center gap-2"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {navigationItems.find((item) => isCurrentRoute(item.href))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">Super Administrator</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
