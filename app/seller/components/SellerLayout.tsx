'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import SubscriptionHeaderBadge from '@/app/components/SubscriptionHeaderBadge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
  company: {
    id: string;
    name: string;
    business_name: string;
    ntn_number?: string;
  };
}

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('session') || localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setUser(userData);
    
    // Check if this is an impersonation session
    setIsImpersonating(userData.impersonated === true || localStorage.getItem('super_admin_return') === 'true');
  }, []); // Remove router dependency - it's stable

  const handleLogout = useCallback(() => {
    localStorage.removeItem('seller_session');
    localStorage.removeItem('session');
    router.push('/');
  }, [router]);

  const handleReturnToSuperAdmin = useCallback(() => {
    // Clear seller session
    localStorage.removeItem('session');
    localStorage.removeItem('seller_session');
    localStorage.removeItem('super_admin_return');
    // Redirect to super admin dashboard
    router.push('/super-admin/dashboard');
  }, [router]);

  // Memoize hasSubscriptionAccess to prevent recalculation
  const hasSubscriptionAccess = useMemo(() => {
    return user?.company?.ntn_number === '090078601';
  }, [user?.company?.ntn_number]);

  // Memoize navigation array without pathname dependency to prevent sidebar refresh
  const navigationItems = useMemo(() => [
    {
      name: 'Dashboard',
      href: '/seller/dashboard',
      icon: '📊',
    },
    {
      name: 'Products',
      href: '/seller/products',
      icon: '📦',
    },
    {
      name: 'Customers',
      href: '/seller/customers',
      icon: '👥',
    },
    {
      name: 'Invoices',
      href: '/seller/invoices',
      icon: '📄',
    },
    {
      name: 'Payments',
      href: '/seller/payments',
      icon: '💰',
    },
    {
      name: 'Reports',
      href: '/seller/reports',
      icon: '📈',
    },
    // Only show Subscription for testing NTN
    ...(hasSubscriptionAccess ? [{
      name: 'Subscription',
      href: '/seller/subscription',
      icon: '💳',
    }] : []),
    {
      name: 'Settings',
      href: '/seller/settings',
      icon: '⚙️',
    },
    {
      name: 'FBR Sandbox',
      href: '/seller/fbr-sandbox',
      icon: '🧪',
    },
  ], [hasSubscriptionAccess]);

  // Helper function to check if a route is current
  const isCurrentRoute = useCallback((href: string) => {
    if (href === '/seller/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  }, [pathname]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Company */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div>
                <h1 className="text-lg font-bold truncate">{user?.company?.name}</h1>
                <p className="text-xs text-gray-400 truncate">{user?.company?.business_name}</p>
              </div>
            ) : (
              <div className="text-2xl">🏢</div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white"
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isCurrent = isCurrentRoute(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen ? (
            <div className="mb-3">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">{user?.role}</p>
            </div>
          ) : (
            <div className="text-2xl mb-3 text-center">👤</div>
          )}
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
          >
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden" >
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          {/* Super Admin Impersonation Banner */}
          {isImpersonating && (
            <div className="bg-yellow-500 text-black px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <span className="font-semibold">Super Admin Mode</span>
                <span className="text-sm">- You are viewing as {user?.company?.name}</span>
              </div>
              <button
                onClick={handleReturnToSuperAdmin}
                className="px-4 py-1 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
              >
                ← Return to Super Admin
              </button>
            </div>
          )}
          
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {navigationItems.find(item => isCurrentRoute(item.href))?.name || 'Seller Portal'}
                </h2>
                <p className="text-sm text-gray-600">
                  {user?.company?.name} - {user?.company?.business_name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Subscription Badge */}
                <SubscriptionHeaderBadge />
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

