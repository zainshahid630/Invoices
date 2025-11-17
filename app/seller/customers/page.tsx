'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../components/SellerLayout';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';
import Pagination from '../../components/Pagination';

interface Customer {
  id: string;
  company_id: string;
  name: string;
  business_name: string;
  address: string;
  ntn_cnic: string;
  gst_number: string;
  province: string;
  registration_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    loadCustomers(userData.company_id);
  }, [router, currentPage, itemsPerPage, searchTerm, filterActive]);

  const loadCustomers = async (companyId: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        company_id: companyId,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        status: filterActive,
      });

      const response = await fetch(`/api/seller/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        console.error('Failed to load customers');
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search - production level
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (customerId: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete Customer',
      cancelText: 'Keep Customer',
      type: 'danger'
    });
    if (!confirmed) return;

    const session = localStorage.getItem('seller_session');
    if (!session) return;

    const userData = JSON.parse(session);

    try {
      const response = await fetch(
        `/api/seller/customers/${customerId}?company_id=${userData.company_id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        toast.success('Customer Deleted', 'Customer has been deleted successfully!');
        loadCustomers(userData.company_id);
      } else {
        const error = await response.json();
        toast.error('Delete Failed', error.error || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Network Error', 'Error occurred while deleting customer');
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    const session = localStorage.getItem('seller_session');
    if (!session) return;

    const userData = JSON.parse(session);

    try {
      const response = await fetch(`/api/seller/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customer,
          company_id: userData.company_id,
          is_active: !customer.is_active,
        }),
      });

      if (response.ok) {
        toast.success('Status Updated', 'Customer status has been updated successfully.');
        loadCustomers(userData.company_id);
      } else {
        toast.error('Update Failed', 'Failed to update customer status.');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Network Error', 'Error occurred while updating customer.');
    }
  };

  const handleFilterChange = (filter: string) => {
    setFilterActive(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <SellerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="text-sm text-gray-600">Manage your customer database</p>
          </div>
          <Link
            href="/seller/customers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Customer
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Customers</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Active Customers</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Inactive Customers</div>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, business name, NTN, or GST..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('active')}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => handleFilterChange('inactive')}
                className={`px-4 py-2 rounded-lg ${
                  filterActive === 'inactive'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NTN/CNIC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GST Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Province
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
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm || filterActive !== 'all'
                      ? 'No customers found matching your criteria'
                      : 'No customers yet. Add your first customer!'}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.business_name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.ntn_cnic || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.gst_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.province || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(customer)}
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          customer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/seller/customers/${customer.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/seller/customers/${customer.id}/edit`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(newLimit) => {
              setItemsPerPage(newLimit);
              setCurrentPage(1);
            }}
          />
        )}
      </div>
      <ConfirmDialog />
    </SellerLayout>
  );
}

