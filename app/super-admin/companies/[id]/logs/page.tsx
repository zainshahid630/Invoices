'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Activity {
  type: string;
  id: string;
  description: string;
  amount?: number;
  status?: string;
  user?: string;
  timestamp: string;
}

interface CompanyLogs {
  activities: Activity[];
  invoices: any[];
  customers: any[];
  payments: any[];
  users: any[];
}

export default function CompanyLogsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;

  const [logs, setLogs] = useState<CompanyLogs | null>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'invoices' | 'customers' | 'payments' | 'users'>('all');

  const loadCompanyData = useCallback(async () => {
    try {
      const response = await fetch(`/api/super-admin/companies/${companyId}`);
      const data = await response.json();
      if (data.success) {
        setCompany(data.company);
      }
    } catch (error) {
      console.error('Error loading company:', error);
    }
  }, [companyId]);

  const loadLogs = useCallback(async () => {
    try {
      const response = await fetch(`/api/super-admin/company-logs/${companyId}`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    const session = localStorage.getItem('super_admin_session');
    if (!session) {
      router.push('/super-admin/login');
      return;
    }
    loadCompanyData();
    loadLogs();
  }, [router, loadCompanyData, loadLogs]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return '📄';
      case 'customer':
        return '👤';
      case 'payment':
        return '💰';
      default:
        return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fbr_posted':
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'paid':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/super-admin/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Company Logs: {company?.name}
              </h1>
              <p className="text-sm text-gray-600">{company?.business_name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-2xl font-bold text-purple-600">{logs?.invoices.length || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Customers</div>
            <div className="text-2xl font-bold text-blue-600">{logs?.customers.length || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Payments</div>
            <div className="text-2xl font-bold text-green-600">{logs?.payments.length || 0}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Active Users</div>
            <div className="text-2xl font-bold text-orange-600">
              {logs?.users.filter(u => u.is_active).length || 0}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'all', label: 'All Activities', count: logs?.activities.length },
                { key: 'invoices', label: 'Invoices', count: logs?.invoices.length },
                { key: 'customers', label: 'Customers', count: logs?.customers.length },
                { key: 'payments', label: 'Payments', count: logs?.payments.length },
                { key: 'users', label: 'Users', count: logs?.users.length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* All Activities */}
            {activeTab === 'all' && (
              <div className="space-y-4">
                {logs?.activities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{activity.description}</span>
                        {activity.status && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        )}
                      </div>
                      {activity.amount && (
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          Rs. {parseFloat(activity.amount as any).toLocaleString()}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.user && <span>By {activity.user} • </span>}
                        {new Date(activity.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs?.invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-4 py-3 text-sm font-medium">{invoice.invoice_number}</td>
                        <td className="px-4 py-3 text-sm">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          Rs. {parseFloat(invoice.total_amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(invoice.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === 'customers' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs?.customers.map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                        <td className="px-4 py-3 text-sm">{customer.business_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(customer.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs?.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          Rs. {parseFloat(payment.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{payment.payment_method || '-'}</td>
                        <td className="px-4 py-3 text-sm">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(payment.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {logs?.users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
