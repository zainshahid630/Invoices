'use client';

/**
 * Example: Invoice List Page with React Query
 * 
 * This example shows how to refactor an invoice list page
 * to use React Query hooks and debounced search.
 * 
 * BEFORE: Manual state management, multiple API calls
 * AFTER: Automatic caching, debounced search, cleaner code
 */

import { useState } from 'react';
import { useInvoices } from '@/hooks/useInvoices';
import { useDebounce } from '@/hooks/useDebounce';

export default function InvoiceListPage() {
  // Get company ID from session
  const session = JSON.parse(localStorage.getItem('seller_session') || '{}');
  const companyId = session.company_id;

  // Local state for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Use React Query hook - automatic caching and refetching
  const { data, isLoading, error, refetch } = useInvoices(companyId, {
    page,
    search: debouncedSearch,
    status: statusFilter,
    limit: 10,
  });

  // Extract data from response
  const invoices = data?.invoices || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Invoices</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Draft</p>
            <p className="text-2xl font-bold">{stats.draft}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Posted</p>
            <p className="text-2xl font-bold">{stats.posted}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <p className="text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold">PKR {stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="fbr_posted">Posted</option>
            <option value="verified">Verified</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invoices...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
          <p className="text-red-600">Error: {error.message}</p>
        </div>
      )}

      {/* Invoice Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{invoice.invoice_number}</td>
                    <td className="px-6 py-4">{invoice.buyer_name}</td>
                    <td className="px-6 py-4">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      PKR {parseFloat(invoice.total_amount.toString()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${invoice.status === 'draft' ? 'bg-gray-200' :
                          invoice.status === 'fbr_posted' ? 'bg-green-200' :
                            'bg-blue-200'
                        }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="mt-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} invoices
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
