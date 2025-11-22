'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../../components/Pagination';
import { TableSkeleton, StatsSkeleton } from '@/app/components/LoadingStates';
import { useDebounce } from '../../../hooks/useDebounce';
import BulkPrintModal from '../components/BulkPrintModal';
import FBRValidationModal from '../components/FBRValidationModal';
import EnhancedFBRModal from '../components/EnhancedFBRModal';
import LedgerModal from '../components/LedgerModal';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_type: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
    business_name: string;
  } | null;
  buyer_name: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface Stats {
  total: number;
  draft: number;
  posted: number;
  verified: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
  const [showFBRValidationModal, setShowFBRValidationModal] = useState(false);
  const [showEnhancedFBRModal, setShowEnhancedFBRModal] = useState(false);
  const [fbrModalMode, setFbrModalMode] = useState<'validate' | 'post'>('validate');
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [buyerFilter, setBuyerFilter] = useState('');
  const [invoiceNumberFrom, setInvoiceNumberFrom] = useState('');
  const [invoiceNumberTo, setInvoiceNumberTo] = useState('');

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedBuyerFilter = useDebounce(buyerFilter, 500);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const companyId = user?.company_id;

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

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

  // Fetch invoices with React Query
  const { data, isLoading } = useQuery({
    queryKey: ['invoices', companyId, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, dateFrom, dateTo, debouncedBuyerFilter, invoiceNumberFrom, invoiceNumberTo],
    queryFn: async () => {
      const params = new URLSearchParams({
        company_id: companyId!,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        status: statusFilter,
      });

      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (debouncedBuyerFilter) params.append('buyer', debouncedBuyerFilter);
      if (invoiceNumberFrom) params.append('invoice_number_from', invoiceNumberFrom);
      if (invoiceNumberTo) params.append('invoice_number_to', invoiceNumberTo);

      const res = await fetch(`/api/seller/invoices?${params}`);
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const invoices = data?.invoices || [];
  const pagination = data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 };
  const stats = data?.stats || { total: 0, draft: 0, posted: 0, verified: 0, totalAmount: 0, pendingAmount: 0 };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      fbr_posted: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      paid: 'bg-purple-100 text-purple-800',
      deleted: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleStatusFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedInvoices(invoices.map((inv: Invoice) => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map((inv: Invoice) => inv.id));
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId);
      } else {
        return [...prev, invoiceId];
      }
    });
  };

  const handleBulkPrint = (type: 'ledger' | 'detailed') => {
    const ids = selectedInvoices.join(',');

    if (type === 'ledger') {
      setShowBulkPrintModal(false);
      setShowLedgerModal(true);
    } else {
      window.open(`/seller/invoices/bulk-print/detailed?ids=${ids}`, '_blank');
      setShowBulkPrintModal(false);
      setSelectedInvoices([]);
    }
  };

  const getTodaysInvoiceIds = () => {
    const today = new Date().toISOString().split('T')[0];
    return invoices
      .filter((inv: Invoice) => inv.created_at.startsWith(today))
      .map((inv: Invoice) => inv.id);
  };

  const handlePrintTodaysInvoices = () => {
    const todaysIds = getTodaysInvoiceIds();
    if (todaysIds.length === 0) {
      alert('No invoices found for today');
      return;
    }
    setSelectedInvoices(todaysIds);
    setShowBulkPrintModal(true);
  };

  const handleValidateTodaysInvoices = () => {
    const todaysIds = getTodaysInvoiceIds();
    if (todaysIds.length === 0) {
      alert('No invoices found for today');
      return;
    }
    setSelectedInvoices(todaysIds);
    setShowFBRValidationModal(true);
  };

  const handleFBRValidationComplete = () => {
    // React Query will automatically refetch when modal closes
    setSelectedInvoices([]);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setBuyerFilter('');
    setInvoiceNumberFrom('');
    setInvoiceNumberTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return searchTerm || statusFilter !== 'all' || dateFrom || dateTo || buyerFilter || invoiceNumberFrom || invoiceNumberTo;
  };

  const handlePrintFilteredInvoices = async () => {
    if (invoices.length === 0) {
      alert('No invoices found with current filters');
      return;
    }

    // If there are more invoices than shown on current page, fetch all filtered invoices
    if (pagination.total > invoices.length) {
      const confirmAll = confirm(
        `You have ${pagination.total} invoices matching your filters, but only ${invoices.length} are shown on this page.\n\n` +
        `Do you want to print ALL ${pagination.total} filtered invoices?\n\n` +
        `Click OK to print all, or Cancel to print only the ${invoices.length} shown on this page.`
      );

      if (confirmAll) {
        // Fetch all filtered invoice IDs
        await fetchAllFilteredInvoiceIds('print');
        return;
      }
    }

    // Print only current page invoices
    setSelectedInvoices(invoices.map((inv: Invoice) => inv.id));
    setShowBulkPrintModal(true);
  };

  const handleValidateFilteredInvoices = async () => {
    if (invoices.length === 0) {
      alert('No invoices found with current filters');
      return;
    }

    // If there are more invoices than shown on current page, fetch all filtered invoices
    if (pagination.total > invoices.length) {
      const confirmAll = confirm(
        `You have ${pagination.total} invoices matching your filters, but only ${invoices.length} are shown on this page.\n\n` +
        `Do you want to validate ALL ${pagination.total} filtered invoices with FBR?\n\n` +
        `Click OK to validate all, or Cancel to validate only the ${invoices.length} shown on this page.`
      );

      if (confirmAll) {
        // Fetch all filtered invoice IDs
        await fetchAllFilteredInvoiceIds('validate');
        return;
      }
    }

    // Validate only current page invoices
    setSelectedInvoices(invoices.map((inv: Invoice) => inv.id));
    setShowFBRValidationModal(true);
  };

  const fetchAllFilteredInvoiceIds = async (action: 'print' | 'validate') => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      // Fetch all invoices with current filters (no pagination limit)
      const params = new URLSearchParams({
        company_id: companyId,
        page: '1',
        limit: '10000', // Large number to get all
        search: debouncedSearchTerm,
        status: statusFilter,
      });

      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (debouncedBuyerFilter) params.append('buyer', debouncedBuyerFilter);
      if (invoiceNumberFrom) params.append('invoice_number_from', invoiceNumberFrom);
      if (invoiceNumberTo) params.append('invoice_number_to', invoiceNumberTo);

      const response = await fetch(`/api/seller/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        const allIds = data.invoices.map((inv: Invoice) => inv.id);

        setSelectedInvoices(allIds);

        if (action === 'print') {
          setShowBulkPrintModal(true);
        } else {
          setShowFBRValidationModal(true);
        }
      }
    } catch (error) {
      console.error('Error fetching filtered invoices:', error);
      alert('Failed to fetch all filtered invoices');
    }
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-sm text-gray-600">Loading your invoices...</p>
          </div>
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <TableSkeleton rows={10} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-600">
            {selectedInvoices.length > 0
              ? `${selectedInvoices.length} invoice${selectedInvoices.length > 1 ? 's' : ''} selected`
              : 'Manage your sales invoices'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {selectedInvoices.length > 0 && (
            <>
              {(() => {
                const draftInvoices = invoices.filter((inv: Invoice) =>
                  selectedInvoices.includes(inv.id) && inv.status === 'draft'
                ).map((inv: Invoice) => inv.id);
                const draftCount = draftInvoices.length;
                const nonDraftCount = selectedInvoices.length - draftCount;

                return (
                  <>
                    <button
                      onClick={() => setSelectedInvoices([])}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear Selection
                    </button>
                    <button
                      onClick={() => setShowBulkPrintModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Selected ({selectedInvoices.length})
                    </button>
                    <button
                      onClick={() => {
                        const draftInvoices = invoices.filter((inv: Invoice) =>
                          selectedInvoices.includes(inv.id) && inv.status === 'draft'
                        ).map((inv: Invoice) => inv.id);

                        if (draftInvoices.length === 0) {
                          alert('No draft invoices selected. Only draft invoices can be validated with FBR.');
                          return;
                        }

                        setSelectedInvoices(draftInvoices);
                        setFbrModalMode('validate');
                        setShowEnhancedFBRModal(true);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Validate with FBR ({draftCount})
                      {nonDraftCount > 0 && (
                        <span className="text-xs opacity-75">({nonDraftCount} non-draft)</span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        const draftInvoices = invoices.filter((inv: Invoice) =>
                          selectedInvoices.includes(inv.id) && inv.status === 'draft'
                        ).map((inv: Invoice) => inv.id);

                        if (draftInvoices.length === 0) {
                          alert('No draft invoices selected. Only draft invoices can be posted to FBR.');
                          return;
                        }

                        setSelectedInvoices(draftInvoices);
                        setFbrModalMode('post');
                        setShowEnhancedFBRModal(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                      Post to FBR ({draftCount})
                      {nonDraftCount > 0 && (
                        <span className="text-xs opacity-75">({nonDraftCount} non-draft)</span>
                      )}
                    </button>
                  </>
                );
              })()}
            </>
          )}
          <button
            onClick={handlePrintTodaysInvoices}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Today&apos;s Invoices
          </button>
          <button
            onClick={handleValidateTodaysInvoices}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Validate Today&apos;s with FBR
          </button>
          <Link
            href="/seller/invoices/deleted"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            🗑️ Deleted
          </Link>
          <Link
            href="/seller/invoices/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Create Invoice
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Draft</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-green-600">
            Rs. {stats.totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending Amount</div>
          <div className="text-2xl font-bold text-orange-600">
            Rs. {stats.pendingAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Selection Info Banner */}
      {selectedInvoices.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-900 font-medium">
              {selectedInvoices.length} invoice{selectedInvoices.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="text-sm text-blue-700">
            Click &quot;Print Selected&quot; to choose print format
          </div>
        </div>
      )}

      {/* Filtered Invoices Info Banner */}
      {hasActiveFilters() && !selectedInvoices.length && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="text-green-900 font-medium">
              Showing {pagination.total} filtered invoice{pagination.total !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="text-sm text-green-700">
            Use &quot;Print Filtered&quot; or &quot;Validate Filtered&quot; buttons above to process all filtered invoices
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Filters</h3>
          <div className="flex gap-2">
            {hasActiveFilters() && (
              <>
                <button
                  onClick={handlePrintFilteredInvoices}
                  className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Filtered ({pagination.total})
                </button>
                <button
                  onClick={handleValidateFilteredInvoices}
                  className="text-sm px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validate Filtered ({pagination.total})
                </button>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by invoice number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {searchTerm !== debouncedSearchTerm && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="fbr_posted">FBR Posted</option>
              <option value="verified">Verified</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Buyer Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by buyer name..."
                value={buyerFilter}
                onChange={(e) => setBuyerFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {buyerFilter !== debouncedBuyerFilter && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice # From</label>
            <input
              type="text"
              placeholder="e.g., INV001"
              value={invoiceNumberFrom}
              onChange={(e) => {
                setInvoiceNumberFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice # To</label>
            <input
              type="text"
              placeholder="e.g., INV100"
              value={invoiceNumberTo}
              onChange={(e) => {
                setInvoiceNumberTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div
                    className="flex items-center justify-center cursor-pointer p-2 -m-2 hover:bg-blue-100 rounded"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleSelectAll();
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={invoices.length > 0 && selectedInvoices.length === invoices.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer pointer-events-none"
                    />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No invoices found matching your filters'
                      : 'No invoices yet. Create your first invoice!'}
                  </td>
                </tr>
              ) : (
                invoices.map((invoice: Invoice) => (
                  <tr
                    key={invoice.id}
                    className={`hover:bg-gray-50 ${selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <div
                        className="flex items-center justify-center cursor-pointer p-2 -m-2 hover:bg-blue-100 rounded"
                        onClick={() => handleSelectInvoice(invoice.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer pointer-events-none"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/seller/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {invoice.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.customer?.name || invoice.buyer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.invoice_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rs. {parseFloat(invoice.total_amount.toString()).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          invoice.status
                        )}`}
                      >
                        {invoice.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadge(
                          invoice.payment_status
                        )}`}
                      >
                        {invoice.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <Link
                          href={`/seller/invoices/${invoice.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                        {invoice.status === 'draft' && (
                          <Link
                            href={`/seller/invoices/${invoice.id}/edit`}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
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

      {/* Bulk Print Modal */}
      {showBulkPrintModal && (
        <BulkPrintModal
          selectedInvoices={selectedInvoices}
          onClose={() => setShowBulkPrintModal(false)}
          onPrint={handleBulkPrint}
        />
      )}

      {/* FBR Validation Modal (Old - kept for compatibility) */}
      {showFBRValidationModal && (
        <FBRValidationModal
          invoiceIds={selectedInvoices}
          onClose={() => setShowFBRValidationModal(false)}
          onComplete={handleFBRValidationComplete}
        />
      )}

      {/* Enhanced FBR Modal (New - with confirmation) */}
      {showEnhancedFBRModal && (
        <EnhancedFBRModal
          invoiceIds={selectedInvoices}
          mode={fbrModalMode}
          onClose={() => setShowEnhancedFBRModal(false)}
          onComplete={handleFBRValidationComplete}
        />
      )}

      {/* Ledger Modal */}
      {showLedgerModal && (
        <LedgerModal
          invoiceIds={selectedInvoices}
          onClose={() => {
            setShowLedgerModal(false);
            setSelectedInvoices([]);
          }}
        />
      )}
    </div>
  );
}

