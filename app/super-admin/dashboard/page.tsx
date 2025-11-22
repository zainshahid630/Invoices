'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

interface Company {
  id: string;
  name: string;
  business_name: string;
  is_active: boolean;
  created_at: string;
  stats: {
    customers: number;
    users: number;
    totalInvoices: number;
    fbrPostedInvoices: number;
    totalRevenue: string;
  };
  subscription?: {
    status: string;
    end_date: string;
    payment_status: string;
  };
}

interface OverallStats {
  totalCompanies: number;
  activeCompanies: number;
  inactiveCompanies: number;
  totalCustomers: number;
  totalInvoices: number;
  totalFbrPosted: number;
  totalRevenue: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    totalCustomers: 0,
    totalInvoices: 0,
    totalFbrPosted: 0,
    totalRevenue: '0',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('super_admin_session');
    if (!session) {
      router.push('/super-admin/login');
      return;
    }
    setUser(JSON.parse(session));
    loadAnalytics();
  }, [router]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/super-admin/analytics');
      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.companies);
        setOverallStats(data.overallStats);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('super_admin_session');
    router.push('/super-admin/login');
  };

  const toggleCompanyStatus = async (companyId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/super-admin/companies/${companyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        loadAnalytics();
      }
    } catch (error) {
      console.error('Error toggling company status:', error);
    }
  };

  const handleImpersonate = async (companyId: string, companyName: string) => {
    if (!confirm(`Are you sure you want to login as ${companyName}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/super-admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      const data = await response.json();

      if (data.success) {
        // Store the impersonation session
        localStorage.setItem('session', JSON.stringify(data.session));
        // Store super admin session for easy return
        localStorage.setItem('super_admin_return', 'true');
        // Redirect to seller dashboard
        router.push('/seller/dashboard');
      } else {
        alert(data.error || 'Failed to impersonate company');
      }
    } catch (error) {
      console.error('Error impersonating company:', error);
      alert('Failed to impersonate company');
    }
  };

  // Filter companies based on search
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    items: filteredCompanies,
    initialItemsPerPage: 10,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
            <div className="text-sm font-medium opacity-90">Total Companies</div>
            <div className="text-3xl font-bold mt-2">{overallStats.totalCompanies}</div>
            <div className="text-xs mt-2 opacity-75">
              {overallStats.activeCompanies} active, {overallStats.inactiveCompanies} inactive
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
            <div className="text-sm font-medium opacity-90">Total Customers</div>
            <div className="text-3xl font-bold mt-2">{overallStats.totalCustomers}</div>
            <div className="text-xs mt-2 opacity-75">Across all companies</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
            <div className="text-sm font-medium opacity-90">Total Invoices</div>
            <div className="text-3xl font-bold mt-2">{overallStats.totalInvoices}</div>
            <div className="text-xs mt-2 opacity-75">
              {overallStats.totalFbrPosted} sent to FBR
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
            <div className="text-sm font-medium opacity-90">Total Revenue</div>
            <div className="text-3xl font-bold mt-2">Rs. {parseFloat(overallStats.totalRevenue).toLocaleString()}</div>
            <div className="text-xs mt-2 opacity-75">All companies combined</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Companies Management</h2>
            <p className="text-sm text-gray-600 mt-1">View detailed stats and manage company access</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/super-admin/whatsapp"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              📱 WhatsApp
            </Link>
            <Link
              href="/super-admin/seed-data"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              🌱 Seed Data
            </Link>
            <Link
              href="/super-admin/companies/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add New Company
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search companies by name or business name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Companies Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No companies found matching your search.' : 'No companies found. Create your first company!'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                      <div className="text-xs text-gray-500">{company.business_name}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Created: {new Date(company.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Customers:</span>
                          <span className="ml-1 font-semibold text-blue-600">{company.stats.customers}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Users:</span>
                          <span className="ml-1 font-semibold text-green-600">{company.stats.users}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Invoices:</span>
                          <span className="ml-1 font-semibold text-purple-600">{company.stats.totalInvoices}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">FBR Posted:</span>
                          <span className="ml-1 font-semibold text-orange-600">{company.stats.fbrPostedInvoices}</span>
                        </div>
                      </div>
                      <div className="text-xs mt-2">
                        <span className="text-gray-500">Revenue:</span>
                        <span className="ml-1 font-semibold text-green-700">
                          Rs. {parseFloat(company.stats.totalRevenue).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          company.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Link
                            href={`/super-admin/companies/${company.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/super-admin/companies/${company.id}/logs`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Logs
                          </Link>
                          <Link
                            href={`/super-admin/companies/${company.id}/users`}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Users
                          </Link>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleImpersonate(company.id, company.name)}
                            className="text-green-600 hover:text-green-900 font-semibold"
                            disabled={!company.is_active}
                          >
                            🔐 Login as Company
                          </button>
                          <button
                            onClick={() => toggleCompanyStatus(company.id, company.is_active)}
                            className={`${
                              company.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {company.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredCompanies.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCompanies.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      </main>
    </div>
  );
}

