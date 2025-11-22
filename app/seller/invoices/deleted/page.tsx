'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  buyer_name: string;
  buyer_business_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  deleted_at: string;
  customer?: {
    id: string;
    name: string;
    business_name: string;
  };
}

export default function DeletedInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDeletedInvoices();
  }, []);

  const loadDeletedInvoices = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        router.push('/seller/login');
        return;
      }

      const userData = JSON.parse(session);
      const response = await fetch(
        `/api/seller/invoices/deleted?company_id=${userData.company_id}`
      );

      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading deleted invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to restore invoice ${invoiceNumber}?`)) {
      return;
    }

    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const response = await fetch('/api/seller/invoices/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: userData.company_id,
          invoice_id: invoiceId,
        }),
      });

      if (response.ok) {
        alert('Invoice restored successfully!');
        loadDeletedInvoices(); // Reload the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error restoring invoice:', error);
      alert('Failed to restore invoice');
    }
  };

  const handlePermanentDelete = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`⚠️ PERMANENT DELETE WARNING ⚠️\n\nAre you sure you want to PERMANENTLY delete invoice ${invoiceNumber}?\n\nThis action:\n• Cannot be undone\n• Will free up the invoice number for reuse\n• Will permanently remove all invoice data\n\nType "DELETE" to confirm.`)) {
      return;
    }

    const confirmText = prompt(`Type "DELETE" to permanently delete invoice ${invoiceNumber}:`);
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled. You must type "DELETE" exactly to confirm.');
      return;
    }

    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const response = await fetch('/api/seller/invoices/permanent-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: userData.company_id,
          invoice_id: invoiceId,
        }),
      });

      if (response.ok) {
        alert(`Invoice ${invoiceNumber} has been permanently deleted. The invoice number is now available for reuse.`);
        loadDeletedInvoices(); // Reload the list
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error permanently deleting invoice:', error);
      alert('Failed to permanently delete invoice');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(searchLower) ||
      invoice.buyer_name?.toLowerCase().includes(searchLower) ||
      invoice.buyer_business_name?.toLowerCase().includes(searchLower) ||
      invoice.customer?.name?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl">Loading deleted invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🗑️ Deleted Invoices</h1>
              <p className="text-gray-600 mt-2">
                View and restore deleted invoices. Deleted invoices are excluded from all calculations.
              </p>
            </div>
            <Link
              href="/seller/invoices"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              ← Back to Invoices
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search by invoice number, customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No matching deleted invoices' : 'No deleted invoices'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Deleted invoices will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deleted On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {invoice.customer?.name || invoice.buyer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {invoice.customer?.business_name || invoice.buyer_business_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.invoice_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        PKR {invoice.total_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-red-600">
                        {new Date(invoice.deleted_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.deleted_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {invoice.status}
                      </span>
                      <br />
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mt-1">
                        {invoice.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRestore(invoice.id, invoice.invoice_number)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                          ♻️ Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(invoice.id, invoice.invoice_number)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                          title="Permanently delete this invoice and free up the invoice number"
                        >
                          🗑️ Delete Forever
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {filteredInvoices.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Total Deleted Invoices: {filteredInvoices.length}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  These invoices are excluded from all reports, calculations, and statistics.
                  You can restore them at any time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

