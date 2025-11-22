'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

// Simple Pagination Component
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        Previous
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
              ...
            </span>
          );
        }
        return (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
        }`}
      >
        Next
      </button>
    </div>
  );
}

interface ReportData {
  summary?: any;
  invoices?: any[];
  customers?: any[];
  products?: any[];
  payments?: any[];
}

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeReport, setActiveReport] = useState('sales_summary');
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const [customRange, setCustomRange] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const companyId = user?.company_id;

  // Fetch report data with React Query
  const { data: reportData = {}, isLoading: loading } = useQuery<ReportData>({
    queryKey: ['reports', companyId, activeReport, dateRange.start_date, dateRange.end_date],
    queryFn: async () => {
      const response = await fetch(
        `/api/seller/reports?company_id=${companyId}&report_type=${activeReport}&start_date=${dateRange.start_date}&end_date=${dateRange.end_date}`
      );
      if (!response.ok) throw new Error('Failed to fetch report');
      return response.json();
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000, // 2 minutes - reports don't change frequently
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  const setQuickRange = (range: string) => {
    const today = new Date();
    let start_date = '';
    let end_date = today.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        start_date = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        start_date = yesterday.toISOString().split('T')[0];
        end_date = start_date;
        break;
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        start_date = weekStart.toISOString().split('T')[0];
        break;
      case 'last_week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        start_date = lastWeekStart.toISOString().split('T')[0];
        end_date = lastWeekEnd.toISOString().split('T')[0];
        break;
      case 'this_month':
        start_date = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'last_month':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        start_date = lastMonth.toISOString().split('T')[0];
        end_date = lastMonthEnd.toISOString().split('T')[0];
        break;
      case 'this_quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        start_date = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        break;
      case 'this_year':
        start_date = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      case 'last_year':
        start_date = new Date(today.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
        end_date = new Date(today.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
        break;
      case 'all_time':
        start_date = '1900-01-01';
        end_date = '2100-12-31';
        break;
    }

    setDateRange({ start_date, end_date });
    setCustomRange(false);
  };

  const handleExport = () => {
    alert('Export functionality will be implemented soon!');
  };

  const handlePrint = () => {
    window.print();
  };

  const reports = [
    { id: 'sales_summary', name: 'Sales Summary', icon: '📊' },
    { id: 'customer_report', name: 'Customer Report', icon: '👥' },
    { id: 'product_report', name: 'Product Report', icon: '📦' },
    { id: 'payment_report', name: 'Payment Report', icon: '💰' },
    { id: 'tax_report', name: 'Tax Report', icon: '🧾' },
  ];

  const quickRanges = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'this_week', label: 'This Week' },
    { id: 'last_week', label: 'Last Week' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'all_time', label: 'All Time' },
  ];

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">View detailed business reports and insights</p>
        </div>

        {/* Report Type Selection */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${
                    activeReport === report.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{report.icon}</span>
                  {report.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Date Range Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📅 Date Range</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                🖨️ Print
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                📥 Export
              </button>
            </div>
          </div>

          {/* Quick Range Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setQuickRange(range.id)}
                className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
              >
                {range.label}
              </button>
            ))}
            <button
              onClick={() => setCustomRange(!customRange)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                customRange
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Range Inputs */}
          {customRange && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start_date}
                  onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end_date}
                  onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Current Range Display */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Showing data from:</strong> {new Date(dateRange.start_date).toLocaleDateString()} 
              {' '}<strong>to</strong>{' '}
              {new Date(dateRange.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-lg text-gray-600">Loading report...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {/* Report content will be rendered based on activeReport */}
            {activeReport === 'sales_summary' && <SalesSummaryReport data={reportData} />}
            {activeReport === 'customer_report' && <CustomerReport data={reportData} />}
            {activeReport === 'product_report' && <ProductReport data={reportData} />}
            {activeReport === 'payment_report' && <PaymentReport data={reportData} />}
            {activeReport === 'tax_report' && <TaxReport data={reportData} />}
          </div>
        )}
      </div>
  );
}

// Sales Summary Report Component
function SalesSummaryReport({ data }: { data: ReportData }) {
  const summary = data.summary || {};
  const invoices = data.invoices || [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = invoices.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">📊 Sales Summary</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Invoices</div>
          <div className="text-2xl font-bold text-blue-900">{summary.total_invoices || 0}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-green-900">PKR {summary.total_revenue || '0.00'}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Total Tax</div>
          <div className="text-2xl font-bold text-purple-900">PKR {summary.total_tax || '0.00'}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium">Subtotal</div>
          <div className="text-2xl font-bold text-orange-900">PKR {summary.total_subtotal || '0.00'}</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">By Invoice Status</h3>
          <div className="space-y-2">
            {Object.entries(summary.by_status || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">By Payment Status</h3>
          <div className="space-y-2">
            {Object.entries(summary.by_payment_status || {}).map(([status, count]: [string, any]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-700 capitalize">{status}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{invoice.buyer_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">PKR {parseFloat(invoice.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                        invoice.status === 'fbr_posted' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        invoice.payment_status === 'overdue' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.payment_status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No invoices found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {invoices.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <div className="text-sm text-gray-600 text-center mt-2">
              Showing {startIndex + 1} to {Math.min(endIndex, invoices.length)} of {invoices.length} invoices
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Customer Report Component
function CustomerReport({ data }: { data: ReportData }) {
  const customers = data.customers || [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">👥 Customer Report</h2>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Invoices</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Invoices</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer: any) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.business_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{customer.total_invoices}</td>
                    <td className="px-4 py-3 text-sm text-green-700">{customer.paid_invoices}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">PKR {customer.total_amount}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-700">PKR {customer.pending_amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No customers found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {customers.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <div className="text-sm text-gray-600 text-center mt-2">
              Showing {startIndex + 1} to {Math.min(endIndex, customers.length)} of {customers.length} customers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Report Component
function ProductReport({ data }: { data: ReportData }) {
  const products = data.products || [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">📦 Product Report</h2>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HS Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sold</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.hs_code || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">PKR {parseFloat(product.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{product.current_stock}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-700">{product.total_sold}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">PKR {product.total_revenue}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No products found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {products.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <div className="text-sm text-gray-600 text-center mt-2">
              Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of {products.length} products
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Payment Report Component
function PaymentReport({ data }: { data: ReportData }) {
  const summary = data.summary || {};
  const payments = data.payments || [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">💰 Payment Report</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Total Payments</div>
          <div className="text-2xl font-bold text-green-900">{summary.total_payments || 0}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Amount</div>
          <div className="text-2xl font-bold text-blue-900">PKR {summary.total_amount || '0.00'}</div>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      {summary.by_method && Object.keys(summary.by_method).length > 0 && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">By Payment Method</h3>
          <div className="space-y-2">
            {Object.entries(summary.by_method).map(([method, amount]: [string, any]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="text-gray-700">{method}</span>
                <span className="font-semibold text-gray-900">PKR {parseFloat(amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPayments.length > 0 ? (
                paginatedPayments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.invoice?.invoice_number || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.customer?.name || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">PKR {parseFloat(payment.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.payment_method || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{payment.reference_number || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No payments found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {payments.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <div className="text-sm text-gray-600 text-center mt-2">
              Showing {startIndex + 1} to {Math.min(endIndex, payments.length)} of {payments.length} payments
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tax Report Component
function TaxReport({ data }: { data: ReportData }) {
  const summary = data.summary || {};
  const invoices = data.invoices || [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Calculate pagination
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = invoices.slice(startIndex, endIndex);

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">🧾 Tax Report</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Total Subtotal</div>
          <div className="text-2xl font-bold text-blue-900">PKR {summary.total_subtotal || '0.00'}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Sales Tax</div>
          <div className="text-2xl font-bold text-green-900">PKR {summary.total_sales_tax || '0.00'}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Further Tax</div>
          <div className="text-2xl font-bold text-purple-900">PKR {summary.total_further_tax || '0.00'}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-sm text-orange-600 font-medium">Total Tax</div>
          <div className="text-2xl font-bold text-orange-900">PKR {summary.total_tax || '0.00'}</div>
        </div>
      </div>

      {/* Tax Details */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Tax Breakdown by Invoice</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Tax</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Further Tax</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Tax</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grand Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice: any) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">PKR {parseFloat(invoice.subtotal).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-green-700">PKR {parseFloat(invoice.sales_tax_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-purple-700">PKR {parseFloat(invoice.further_tax_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-700">
                      PKR {(parseFloat(invoice.sales_tax_amount || 0) + parseFloat(invoice.further_tax_amount || 0)).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">PKR {parseFloat(invoice.total_amount).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No invoices found for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {invoices.length > itemsPerPage && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <div className="text-sm text-gray-600 text-center mt-2">
              Showing {startIndex + 1} to {Math.min(endIndex, invoices.length)} of {invoices.length} invoices
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

