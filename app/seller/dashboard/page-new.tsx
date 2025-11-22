'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../components/SellerLayout';
import { useDashboardStats, useRecentActivity } from '@/lib/hooks/useDashboard';

export default function SellerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string>('');

  // Initialize user from session
  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    try {
      const userData = JSON.parse(session);
      setUser(userData);
      setCompanyId(userData.company_id);
    } catch (error) {
      console.error('Error parsing session:', error);
      router.push('/seller/login');
    }
  }, [router]);

  // Use React Query hooks for data fetching
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats(companyId);
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(companyId);

  // Show loading state
  if (!user || statsLoading) {
    return (
      <>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show error state
  if (statsError) {
    return (
      <>
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load dashboard data. Please try again.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products Card */}
          <Link
            href="/seller/products"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <span className="text-sm text-gray-500">View All</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</h3>
            <p className="text-gray-600 text-sm mt-1">Total Products</p>
            {stats && stats.lowStockProducts > 0 && (
              <p className="text-orange-600 text-xs mt-2">
                ⚠️ {stats.lowStockProducts} low stock items
              </p>
            )}
          </Link>

          {/* Customers Card */}
          <Link
            href="/seller/customers"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <span className="text-sm text-gray-500">View All</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</h3>
            <p className="text-gray-600 text-sm mt-1">Total Customers</p>
          </Link>

          {/* Invoices Card */}
          <Link
            href="/seller/invoices"
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
              <span className="text-sm text-gray-500">View All</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats?.pendingInvoices || 0}</h3>
            <p className="text-gray-600 text-sm mt-1">Pending Invoices</p>
          </Link>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/seller/invoices/new"
                className="block w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                + New Invoice
              </Link>
              <Link
                href="/seller/products/new"
                className="block w-full px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                + New Product
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          {activityLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">
                      {activity.type === 'invoice' ? '📄' : activity.type === 'product' ? '📦' : '👤'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </>
  );
}
