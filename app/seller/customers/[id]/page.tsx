'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../components/SellerLayout';

interface Customer {
  id: string;
  company_id: string;
  name: string;
  business_name: string;
  address: string;
  ntn_cnic: string;
  gst_number: string;
  province: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  payment_status: string;
  created_at: string;
}

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  invoice: {
    invoice_number: string;
    total_amount: number;
    payment_status: string;
  };
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'invoices' | 'payments'>('details');

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    loadCustomer(userData.company_id);
    loadInvoices(userData.company_id);
    loadPayments(userData.company_id);
  }, [params.id, router]);

  const loadCustomer = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/customers/${params.id}?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else {
        alert('Customer not found');
        router.push('/seller/customers');
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/customers/${params.id}/invoices?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const loadPayments = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/customers/${params.id}/payments?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!customer) {
    return null;
  }

  // Calculate analytics
  const totalInvoices = invoices.length;
  const totalInvoiceAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0);
  const pendingInvoices = invoices.filter(inv => inv.payment_status === 'pending' || inv.payment_status === 'partial').length;
  const totalPayments = payments.reduce((sum, pay) => sum + parseFloat(pay.amount.toString()), 0);
  const pendingAmount = totalInvoiceAmount - totalPayments;

  return (
    <SellerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-600">{customer.business_name || 'Customer Details'}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/seller/customers"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back
            </Link>
            <Link
              href={`/seller/customers/${customer.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit Customer
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Invoices</div>
            <div className="text-2xl font-bold text-gray-900">{totalInvoices}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-blue-600">Rs. {totalInvoiceAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Paid Amount</div>
            <div className="text-2xl font-bold text-green-600">Rs. {totalPayments.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Pending Amount</div>
            <div className="text-2xl font-bold text-red-600">Rs. {pendingAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customer Details
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Invoices ({totalInvoices})
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-6 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'payments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payments ({payments.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer Name</label>
                    <div className="text-lg font-semibold text-gray-900">{customer.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                    <div className="text-lg font-semibold text-gray-900">{customer.business_name || '-'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">NTN Number / CNIC</label>
                    <div className="text-lg font-semibold text-gray-900">{customer.ntn_cnic || '-'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">GST Number</label>
                    <div className="text-lg font-semibold text-gray-900">{customer.gst_number || '-'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Province</label>
                    <div className="text-lg font-semibold text-gray-900">{customer.province || '-'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                          customer.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <div className="text-lg font-semibold text-gray-900">{customer.address || '-'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date Added</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(customer.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                {invoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No invoices found for this customer</p>
                    <p className="text-sm mt-2">Create an invoice to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{invoice.invoice_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(invoice.due_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">Rs. {parseFloat(invoice.total_amount.toString()).toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                invoice.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                                invoice.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {invoice.payment_status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No payments found for this customer</p>
                    <p className="text-sm mt-2">Payments will appear here once recorded</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{new Date(payment.payment_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium">{payment.invoice.invoice_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                              Rs. {parseFloat(payment.amount.toString()).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">{payment.payment_method}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{payment.reference_number || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

