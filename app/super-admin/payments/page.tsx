'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '../components/SuperAdminLayout';
import Pagination from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

interface Payment {
  id: string;
  amount: string;
  payment_date: string;
  payment_method: string;
  payment_gateway: string;
  payment_status: string;
  gateway_transaction_id: string;
  gateway_response_code: string;
  gateway_response_message: string;
  reference_number: string;
  company: {
    name: string;
    business_name: string;
  };
  invoice?: {
    invoice_number: string;
    buyer_name: string;
  };
  customer?: {
    name: string;
  };
}

export default function SuperAdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGateway, setFilterGateway] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('super_admin_session');
    if (!session) {
      router.push('/super-admin/login');
      return;
    }
    loadPayments();
  }, [router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/payments');
      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
      } else {
        console.error('Error loading payments:', data.error);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesGateway =
      filterGateway === 'all' || payment.payment_gateway === filterGateway;
    const matchesStatus = filterStatus === 'all' || payment.payment_status === filterStatus;
    const matchesSearch =
      payment.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.gateway_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice?.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesGateway && matchesStatus && matchesSearch;
  });

  const stats = {
    total: payments.length,
    jazzcash: payments.filter((p) => p.payment_gateway === 'jazzcash').length,
    completed: payments.filter((p) => p.payment_status === 'completed').length,
    pending: payments.filter((p) => p.payment_status === 'pending').length,
    failed: payments.filter((p) => p.payment_status === 'failed').length,
    totalAmount: payments
      .filter((p) => p.payment_status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0),
  };

  const {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedItems,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    items: filteredPayments,
    initialItemsPerPage: 20,
  });

  return (
    <SuperAdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payment Gateway Transactions</h1>
          <p className="text-gray-600">Monitor all JazzCash and payment gateway transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600">Total Transactions</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-200">
            <div className="text-sm text-blue-600">JazzCash</div>
            <div className="text-2xl font-bold text-blue-900">{stats.jazzcash}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow border border-green-200">
            <div className="text-sm text-green-600">Completed</div>
            <div className="text-2xl font-bold text-green-900">{stats.completed}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow border border-yellow-200">
            <div className="text-sm text-yellow-600">Pending</div>
            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-200">
            <div className="text-sm text-purple-600">Total Amount</div>
            <div className="text-xl font-bold text-purple-900">
              PKR {stats.totalAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by company, transaction ID, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Gateways</option>
              <option value="jazzcash">JazzCash</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-lg text-gray-600">Loading payments...</div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-4">💳</div>
              <div className="text-lg text-gray-600 mb-2">No payments found</div>
              <p className="text-gray-500">No payment transactions match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Gateway
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transaction ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{payment.company?.name}</div>
                        <div className="text-xs text-gray-500">{payment.company?.business_name}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {payment.invoice ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {payment.invoice.invoice_number}
                            </div>
                            <div className="text-xs text-gray-500">{payment.invoice.buyer_name}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        PKR {parseFloat(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.payment_gateway === 'jazzcash'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.payment_gateway || 'manual'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : payment.payment_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.payment_status || 'completed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {payment.gateway_transaction_id ? (
                          <div className="font-mono text-xs text-gray-700">
                            {payment.gateway_transaction_id}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {payment.gateway_response_code ? (
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              Code: {payment.gateway_response_code}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {payment.gateway_response_message}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredPayments.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
}
