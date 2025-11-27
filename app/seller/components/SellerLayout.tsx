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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed on mobile
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      // On desktop, open sidebar by default; on mobile, keep it closed
      if (!mobile) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    {
      name: 'Support',
      href: '/seller/queries',
      icon: '🎫',
    },
  ], [hasSubscriptionAccess]);

  // Helper function to check if a route is current
  const isCurrentRoute = useCallback((href: string) => {
    if (href === '/seller/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  }, [pathname]);

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? 'fixed h-full z-50' : 'sticky top-0 h-screen'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          ${isMobile ? 'w-64' : (sidebarOpen ? 'w-64' : 'w-20')}
          bg-gray-900 text-white transition-all duration-300 flex flex-col
        `}
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
              {isMobile ? '✕' : (sidebarOpen ? '◀' : '▶')}
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
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${isCurrent
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
      <div className="flex-1 flex flex-col overflow-hidden min-w-0" >
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          {/* Super Admin Impersonation Banner */}
          {isImpersonating && (
            <div className="bg-yellow-500 text-black px-4 md:px-6 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <span className="font-semibold">Super Admin Mode</span>
                <span className="text-sm hidden md:inline">- You are viewing as {user?.company?.name}</span>
              </div>
              <button
                onClick={handleReturnToSuperAdmin}
                className="px-4 py-1 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-medium"
              >
                ← Return to Super Admin
              </button>
            </div>
          )}

          <div className="px-4 md:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Hamburger Menu - Mobile Only */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="md:hidden text-gray-600 hover:text-gray-900 p-2 -ml-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                    {navigationItems.find(item => isCurrentRoute(item.href))?.name || 'Seller Portal'}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {user?.company?.name} - {user?.company?.business_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                {/* Subscription Badge */}
                <SubscriptionHeaderBadge />

                <div className="text-right hidden md:block">
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

