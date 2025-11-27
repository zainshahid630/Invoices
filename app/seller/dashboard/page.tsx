'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import SubscriptionInfo from '@/app/components/SubscriptionInfo';
import DemoWelcomeModal from '@/components/DemoWelcomeModal';

interface Stats {
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  pendingInvoices: number;
}

interface Activity {
  id: string;
  type: 'invoice' | 'product' | 'customer' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  link?: string;
}

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    const userData = JSON.parse(session);
    setUser(userData);

    // Check if this is the demo account and if modal hasn't been shown in this session
    const DEMO_ACCOUNT_ID = '63e5c4ca-2b3b-45eb-9261-3789e5fb9c39';
    const hasSeenWelcome = sessionStorage.getItem('demo_welcome_shown');
    
    if (userData.company_id === DEMO_ACCOUNT_ID && !hasSeenWelcome) {
      setShowWelcomeModal(true);
      sessionStorage.setItem('demo_welcome_shown', 'true');
    }
  }, [router]);

  const companyId = user?.company_id;

  // Fetch stats with React Query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/stats?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json() as Promise<Stats>;
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch recent activity with React Query
  const { data: recentActivityData, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/recent-activity?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch recent activity');
      const data = await res.json();
      return Array.isArray(data.activities) ? data.activities : [];
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const recentActivity = recentActivityData || [];

  if (statsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Demo Welcome Modal */}
      <DemoWelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={() => setShowWelcomeModal(false)} 
      />

      {/* Welcome Message */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
        </div>
        {user.company_id === '63e5c4ca-2b3b-45eb-9261-3789e5fb9c39' && (
          <button
            onClick={() => setShowWelcomeModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
          >
            <span>🎯</span>
            <span>View Demo Guide</span>
          </button>
        )}
      </div>

      {/* Subscription Info - Non-blocking informational display */}
      <SubscriptionInfo />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-orange-600">{stats?.lowStockProducts || 0}</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Invoices</p>
              <p className="text-3xl font-bold text-blue-600">{stats?.pendingInvoices || 0}</p>
            </div>
            <div className="text-4xl">📄</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/seller/products"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📦</div>
            <div className="font-semibold text-gray-900">Manage Products</div>
            <div className="text-sm text-gray-600">View and manage inventory</div>
          </Link>

          <Link
            href="/seller/customers"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">👥</div>
            <div className="font-semibold text-gray-900">Manage Customers</div>
            <div className="text-sm text-gray-600">Customer database</div>
          </Link>

          <Link
            href="/seller/invoices"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">📄</div>
            <div className="font-semibold text-gray-900">Create Invoice</div>
            <div className="text-sm text-gray-600">Generate sales invoices</div>
          </Link>

          <Link
            href="/seller/settings"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-center"
          >
            <div className="text-4xl mb-2">⚙️</div>
            <div className="font-semibold text-gray-900">Settings</div>
            <div className="text-sm text-gray-600">Company settings</div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No recent activity to display</p>
            <p className="text-sm mt-2">Start by adding products or creating invoices</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity: Activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="text-3xl">{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  {activity.link ? (
                    <Link href={activity.link} className="hover:underline">
                      <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                    </Link>
                  ) : (
                    <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                  )}
                  <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                {activity.link && (
                  <Link
                    href={activity.link}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

