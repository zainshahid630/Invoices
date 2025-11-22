'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../components/ToastProvider';
import { useConfirm } from '../../hooks/useConfirm';
import Pagination from '../../components/Pagination';
import { useDebounce } from '../../../hooks/useDebounce';

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
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const companyId = user?.company_id;

  // Fetch settings
  const { data: settingsData } = useQuery({
    queryKey: ['settings', companyId],
    queryFn: async () => {
      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  // Apply default items per page from settings
  useEffect(() => {
    if (settingsData?.settings?.default_items_per_page) {
      setItemsPerPage(settingsData.settings.default_items_per_page);
    }
  }, [settingsData]);

  // Fetch customers with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['customers', companyId, currentPage, itemsPerPage, debouncedSearchTerm, filterActive],
    queryFn: async () => {
      const params = new URLSearchParams({
        company_id: companyId!,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        status: filterActive,
      });

      const response = await fetch(`/api/seller/customers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      return response.json();
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const customers = data?.customers || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
  const stats = data?.stats || { total: 0, active: 0, inactive: 0 };

  // Reset to first page when search term changes
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, searchTerm]);

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      const response = await fetch(
        `/api/seller/customers/${customerId}?company_id=${companyId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete customer');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Customer Deleted', 'Customer has been deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: Error) => {
      toast.error('Delete Failed', error.message);
    },
  });

  // Update customer mutation
  const updateMutation = useMutation({
    mutationFn: async ({ customerId, data }: { customerId: string; data: any }) => {
      const response = await fetch(`/api/seller/customers/${customerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update customer');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Status Updated', 'Customer status has been updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => {
      toast.error('Update Failed', 'Failed to update customer status.');
    },
  });

  const handleDelete = async (customerId: string) => {
    const confirmed = await confirm({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete Customer',
      cancelText: 'Keep Customer',
      type: 'danger'
    });
    if (!confirmed) return;
    deleteMutation.mutate(customerId);
  };

  const handleToggleActive = async (customer: Customer) => {
    updateMutation.mutate({
      customerId: customer.id,
      data: {
        ...customer,
        company_id: companyId,
        is_active: !customer.is_active,
      },
    });
  };

  const handleFilterChange = (filter: string) => {
    setFilterActive(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast.warning('No Data', 'Please paste your JSON data');
      return;
    }

    const session = localStorage.getItem('seller_session');
    if (!session) return;

    const userData = JSON.parse(session);

    try {
      setImporting(true);
      setImportResult(null);

      // Parse JSON data
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (parseError) {
        toast.error('Invalid JSON', 'Please check your JSON format');
        return;
      }

      // Extract customers array from the JSON structure
      let customersArray = [];

      // Handle different JSON formats
      if (Array.isArray(parsedData)) {
        // If it's already an array, check if it contains table data
        const tableData = parsedData.find(item => item.type === 'table' && item.name === 'customers');
        if (tableData && tableData.data) {
          customersArray = tableData.data;
        } else {
          customersArray = parsedData;
        }
      } else if (parsedData.customers) {
        customersArray = parsedData.customers;
      } else if (parsedData.data) {
        customersArray = parsedData.data;
      } else {
        customersArray = [parsedData];
      }

      if (customersArray.length === 0) {
        toast.warning('No Customers', 'No customer data found in JSON');
        return;
      }

      // Send to API
      const response = await fetch('/api/seller/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: userData.company_id,
          customers: customersArray,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult(result);
        toast.success('Import Complete', result.message);
        queryClient.invalidateQueries({ queryKey: ['customers'] });
      } else {
        toast.error('Import Failed', result.error || 'Failed to import customers');
        setImportResult(result);
      }
    } catch (error) {
      console.error('Error importing customers:', error);
      toast.error('Import Error', 'An error occurred during import');
    } finally {
      setImporting(false);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportData('');
    setImportResult(null);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600">Manage your customer database</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📥 Import Customers
          </button>
          <Link
            href="/seller/customers/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Add Customer
          </Link>
        </div>
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
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by name, business name, NTN, or GST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-4 py-2 rounded-lg ${filterActive === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('active')}
              className={`px-4 py-2 rounded-lg ${filterActive === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => handleFilterChange('inactive')}
              className={`px-4 py-2 rounded-lg ${filterActive === 'inactive'
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
                customers.map((customer: Customer) => (
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
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.is_active
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">📥 Import Customers</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Paste your JSON data to import customers in bulk
                  </p>
                </div>
                <button
                  onClick={handleCloseImportModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 JSON Format</h4>
                <p className="text-xs text-blue-800 mb-2">
                  Paste your JSON data in one of these formats:
                </p>
                <div className="bg-white rounded p-2 text-xs font-mono text-gray-700 overflow-x-auto">
                  <pre>{`[
  {
    "name": "Customer Name",
    "business_name": "Business Name",
    "ntn_number": "1234567-8",
    "gst_number": "01-23-4567-890-12",
    "address": "Address",
    "phone_number": "03001234567"
  }
]`}</pre>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  💡 <strong>Tip:</strong> The system will automatically detect PHPMyAdmin export format or simple arrays
                </p>
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`mb-4 p-4 rounded-lg border ${importResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                  }`}>
                  <h4 className={`text-sm font-semibold mb-2 ${importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                    {importResult.success ? '✓ Import Complete' : '✗ Import Failed'}
                  </h4>
                  <div className="text-sm space-y-1">
                    <p className={importResult.success ? 'text-green-800' : 'text-red-800'}>
                      {importResult.message}
                    </p>
                    {importResult.results && (
                      <div className="mt-2 space-y-1">
                        <p className="text-gray-700">
                          <strong>Total:</strong> {importResult.results.total} |
                          <strong className="text-green-700"> Imported:</strong> {importResult.results.imported} |
                          <strong className="text-blue-700"> Updated:</strong> {importResult.results.updated || 0} |
                          <strong className="text-orange-700"> Skipped:</strong> {importResult.results.skipped}
                        </p>
                        {importResult.results.errors && importResult.results.errors.length > 0 && (
                          <div className="mt-2">
                            <p className="font-semibold text-gray-900 mb-1">Skipped Customers:</p>
                            <div className="bg-white rounded p-2 max-h-40 overflow-y-auto">
                              {importResult.results.errors.map((err: any, idx: number) => (
                                <div key={idx} className="text-xs text-gray-700 py-1 border-b border-gray-200 last:border-0">
                                  <strong>Row {err.row}:</strong> {err.name} - {err.reason}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* JSON Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JSON Data <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder='Paste your JSON data here...'
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                  disabled={importing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the entire JSON export from your previous system
                </p>
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  ℹ️ <strong>Smart Import:</strong> If a customer with matching NTN/GST/Name exists, their data will be updated with the new information
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={handleCloseImportModal}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                disabled={importing}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importData.trim() || importing}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Importing...
                  </>
                ) : (
                  <>📥 Import Customers</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
}

