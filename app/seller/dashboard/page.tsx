'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import SubscriptionInfo from '@/app/components/SubscriptionInfo';

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

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    setUser(JSON.parse(session));
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

  // Fetch invoices with React Query
  const { data: invoicesData } = useQuery({
    queryKey: ['invoices', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/invoices?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      const data = await res.json();
      return Array.isArray(data.invoices) ? data.invoices : [];
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch products with React Query
  const { data: productsData } = useQuery({
    queryKey: ['products', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/products?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return Array.isArray(data.products) ? data.products : [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch customers with React Query
  const { data: customersData } = useQuery({
    queryKey: ['customers', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/customers?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      return Array.isArray(data.customers) ? data.customers : [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Build recent activity from fetched data
  const recentActivity = useMemo(() => {
    const activities: Activity[] = [];
    const invoices = invoicesData || [];
    const products = productsData || [];
    const customers = customersData || [];

    // Add recent invoices (last 5)
    invoices.slice(0, 5).forEach((invoice: any) => {
      if (invoice?.id && invoice?.created_at) {
        activities.push({
          id: invoice.id,
          type: 'invoice',
          title: `Invoice ${invoice.invoice_number || 'N/A'}`,
          description: `${invoice.buyer_name || 'Unknown'} - PKR ${parseFloat(invoice.total_amount || 0).toLocaleString()}`,
          timestamp: invoice.created_at,
          icon: '📄',
          link: `/seller/invoices/${invoice.id}`
        });
      }
    });

    // Add recent products (last 3)
    products.slice(0, 3).forEach((product: any) => {
      if (product?.id && product?.created_at) {
        activities.push({
          id: product.id,
          type: 'product',
          title: `Product: ${product.name || 'Unknown'}`,
          description: `Stock: ${product.current_stock || 0} ${product.uom || 'units'}`,
          timestamp: product.created_at,
          icon: '📦',
          link: `/seller/products`
        });
      }
    });

    // Add recent customers (last 2)
    customers.slice(0, 2).forEach((customer: any) => {
      if (customer?.id && customer?.created_at) {
        activities.push({
          id: customer.id,
          type: 'customer',
          title: `Customer: ${customer.name || 'Unknown'}`,
          description: customer.business_name || 'New customer added',
          timestamp: customer.created_at,
          icon: '👤',
          link: `/seller/customers/${customer.id}`
        });
      }
    });

    // Sort by timestamp and take top 10
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [invoicesData, productsData, customersData]);

  if (statsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
          <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening with your business today.</p>
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
              {recentActivity.map((activity) => (
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

