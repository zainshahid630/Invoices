'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

interface Payment {
  id: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  payment_type: string;
  reference_number: string;
  notes: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: string;
    buyer_name: string;
  };
  customer?: {
    id: string;
    name: string;
    business_name: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: string;
  buyer_name: string;
}

interface Customer {
  id: string;
  name: string;
  business_name: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    invoice_id: '',
    customer_id: '',
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    payment_type: 'received',
    reference_number: '',
    notes: '',
  });

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    setUser(JSON.parse(session));
  }, [router]);

  const companyId = user?.company_id;

  // Fetch payments with React Query
  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ['payments', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/payments?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      return res.json();
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
      return data.invoices || data || [];
    },
    enabled: !!companyId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch customers with React Query
  const { data: customersData } = useQuery({
    queryKey: ['customers', companyId],
    queryFn: async () => {
      const res = await fetch(`/api/seller/customers?company_id=${companyId}`);
      if (!res.ok) throw new Error('Failed to fetch customers');
      const data = await res.json();
      return data.customers || data || [];
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });

  const invoices = invoicesData || [];
  const customers = customersData || [];

  // Create payment mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/seller/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create payment');
      }
      return res.json();
    },
    onSuccess: () => {
      alert('Payment recorded successfully!');
      setShowAddModal(false);
      setFormData({
        invoice_id: '',
        customer_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        payment_type: 'received',
        reference_number: '',
        notes: '',
      });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Refresh invoices too
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Delete payment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/seller/payments/${id}?company_id=${companyId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete payment');
      }
      return res.json();
    },
    onSuccess: () => {
      alert('Payment deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] }); // Refresh invoices too
    },
    onError: (error: Error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      company_id: companyId,
      created_by: user.id,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      deleteMutation.mutate(id);
    }
  };

  // Memoize filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesSearch =
        payment.invoice?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        payment.payment_type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [payments, searchTerm, filterType]);

  // Memoize totals
  const { totalReceived, totalPaid, netCashFlow } = useMemo(() => {
    const received = payments
      .filter((p) => p.payment_type === 'received')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const paid = payments
      .filter((p) => p.payment_type === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return {
      totalReceived: received,
      totalPaid: paid,
      netCashFlow: received - paid,
    };
  }, [payments]);

  // Pagination
  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    items: filteredPayments,
    initialItemsPerPage: 10,
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600">Track and manage all payments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Total Received</div>
          <div className="text-2xl font-bold text-green-900">PKR {totalReceived.toFixed(2)}</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Total Paid</div>
          <div className="text-2xl font-bold text-red-900">PKR {totalPaid.toFixed(2)}</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Net Cash Flow</div>
          <div className="text-2xl font-bold text-blue-900">PKR {(totalReceived - totalPaid).toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search by invoice, customer, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="received">Received Only</option>
              <option value="paid">Paid Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                      <p className="text-gray-500 text-sm">Loading payments...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">💰</div>
                    <div className="text-lg text-gray-600 mb-2">No payments found</div>
                    <p className="text-gray-500">
                      {searchTerm || filterType !== 'all' 
                        ? 'No payments match your search criteria' 
                        : 'Record your first payment to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {payment.invoice?.invoice_number || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {payment.customer?.name || payment.invoice?.buyer_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      <span className={payment.payment_type === 'received' ? 'text-green-700' : 'text-red-700'}>
                        {payment.payment_type === 'received' ? '+' : '-'} PKR {parseFloat(payment.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.payment_type === 'received'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {payment.payment_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">
                      {payment.payment_method || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {payment.reference_number || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => handleDelete(payment.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
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

        {/* Pagination */}
        {filteredPayments.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredPayments.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </div>

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Record Payment</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type *
                    </label>
                    <select
                      value={formData.payment_type}
                      onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="received">Payment Received (from customer)</option>
                      <option value="paid">Payment Made (to supplier)</option>
                    </select>
                  </div>

                  {/* Invoice Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link to Invoice (Optional)
                    </label>
                    <select
                      value={formData.invoice_id}
                      onChange={(e) => {
                        const selectedInvoice = invoices.find((inv: Invoice) => inv.id === e.target.value);
                        setFormData({
                          ...formData,
                          invoice_id: e.target.value,
                          amount: selectedInvoice ? selectedInvoice.total_amount : formData.amount,
                        });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Invoice --</option>
                      {invoices.map((invoice: Invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.buyer_name} - PKR {parseFloat(invoice.total_amount).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecting an invoice will auto-fill the amount and update invoice payment status
                    </p>
                  </div>

                  {/* Customer Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer (Optional)
                    </label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map((customer: Customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.business_name ? `(${customer.business_name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (PKR) *
                    </label>
                    <input
                      type="number"
                      onWheel={(e) => e.currentTarget.blur()}

                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  {/* Payment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date *
                    </label>
                    <input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="debit_card">Debit Card</option>
                      <option value="online">Online Payment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Reference Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Transaction ID, Cheque Number, etc."
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Additional notes about this payment..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Record Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

