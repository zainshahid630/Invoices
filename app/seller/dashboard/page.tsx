'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../components/SellerLayout';
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
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalCustomers: 0,
    pendingInvoices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setUser(userData);
    loadStats(userData.company_id);
    loadRecentActivity(userData.company_id);
  }, [router]);

  const loadStats = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/stats?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentActivity = async (companyId: string) => {
    try {
      // Fetch recent invoices
      const invoicesResponse = await fetch(`/api/seller/invoices?company_id=${companyId}`);
      let invoices = [];
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        invoices = Array.isArray(invoicesData) ? invoicesData : [];
        console.log('📄 Invoices loaded:', invoices.length, invoicesData);
      } else {
        console.error('❌ Invoices API error:', invoicesResponse.status, await invoicesResponse.text());
      }

      // Fetch recent products
      const productsResponse = await fetch(`/api/seller/products?company_id=${companyId}`);
      let products = [];
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        products = Array.isArray(productsData) ? productsData : [];
        console.log('📦 Products loaded:', products.length, productsData);
      } else {
        console.error('❌ Products API error:', productsResponse.status, await productsResponse.text());
      }

      // Fetch recent customers
      const customersResponse = await fetch(`/api/seller/customers?company_id=${companyId}`);
      let customers = [];
      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        customers = Array.isArray(customersData) ? customersData : [];
        console.log('👤 Customers loaded:', customers.length, customersData);
      } else {
        console.error('❌ Customers API error:', customersResponse.status, await customersResponse.text());
      }

      // Build activity list
      const activities: Activity[] = [];

      console.log('🔍 Building activities from:', {
        invoicesCount: invoices.length,
        productsCount: products.length,
        customersCount: customers.length
      });

      // Add recent invoices (last 5)
      if (invoices && invoices.length > 0) {
        invoices.slice(0, 5).forEach((invoice: any) => {
          if (invoice && invoice.id && invoice.created_at) {
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
      }

      // Add recent products (last 3)
      if (products && products.length > 0) {
        products.slice(0, 3).forEach((product: any) => {
          if (product && product.id && product.created_at) {
            activities.push({
              id: product.id,
              type: 'product',
              title: `Product: ${product.name || 'Unknown'}`,
              description: `Stock: ${product.stock_quantity || 0} ${product.uom || 'units'}`,
              timestamp: product.created_at,
              icon: '📦',
              link: `/seller/products`
            });
          }
        });
      }

      // Add recent customers (last 2)
      if (customers && customers.length > 0) {
        customers.slice(0, 2).forEach((customer: any) => {
          if (customer && customer.id && customer.created_at) {
            activities.push({
              id: customer.id,
              type: 'customer',
              title: `Customer: ${customer.name || 'Unknown'}`,
              description: customer.business_name || customer.email || 'New customer added',
              timestamp: customer.created_at,
              icon: '👤',
              link: `/seller/customers/${customer.id}`
            });
          }
        });
      }

      // Sort by timestamp (most recent first)
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Take only the 10 most recent
      const finalActivities = activities.slice(0, 10);
      console.log('✅ Total activities:', finalActivities.length);
      console.log('Activities:', finalActivities);

      setRecentActivity(finalActivities);
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SellerLayout>
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
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-3xl font-bold text-orange-600">{stats.lowStockProducts}</p>
              </div>
              <div className="text-4xl">⚠️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-3xl font-bold text-blue-600">{stats.pendingInvoices}</p>
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
    </SellerLayout>
  );
}

