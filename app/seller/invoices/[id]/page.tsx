'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../components/SellerLayout';
import { useToast } from '../../../components/ToastProvider';
import { useConfirm } from '../../../hooks/useConfirm';

interface Settings {
  invoice_template: string;
}

interface InvoiceItem {
  id: string;
  item_name: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_type: string;
  scenario: string;
  buyer_name: string;
  buyer_business_name: string;
  buyer_ntn_cnic: string;
  buyer_address: string;
  buyer_province: string;
  subtotal: number;
  sales_tax_rate: number;
  sales_tax_amount: number;
  further_tax_rate: number;
  further_tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  fbr_invoice_number?: string;
  fbr_response?: any;
  fbr_posted_at?: string;
  po_number?: string;
  notes?: string;
  items: InvoiceItem[];
  customer: {
    id: string;
    name: string;
    business_name: string;
    phone?: string;
  } | null;
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState('');
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showFbrValidationModal, setShowFbrValidationModal] = useState(false);
  const [fbrValidationResult, setFbrValidationResult] = useState<any>(null);
  const [validatingFbr, setValidatingFbr] = useState(false);
  const [showFbrPostModal, setShowFbrPostModal] = useState(false);
  const [fbrPostResult, setFbrPostResult] = useState<any>(null);
  const [postingToFbr, setPostingToFbr] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [showMessagePreview, setShowMessagePreview] = useState(false);
  const [showPayloadPreviewModal, setShowPayloadPreviewModal] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<any>(null);
  const [validationStep, setValidationStep] = useState<'preview' | 'validating' | 'result'>('preview');
  const [loadingPayload, setLoadingPayload] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }
    // toast.success('Invoice Not Found', 'The requested invoice could not be found.');

    const userData = JSON.parse(session);
    setCompanyId(userData.company_id);
    loadInvoice(userData.company_id);
    loadSettings(userData.company_id);
  }, [router, params.id]);

  const loadInvoice = async (companyId: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/seller/invoices/${params.id}?company_id=${companyId}`
      );
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else {
        toast.error('Invoice Not Found', 'The requested invoice could not be found.');
        router.push('/seller/invoices');
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast.error('Loading Error', 'Failed to load invoice details.');
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedTemplate(data.settings?.invoice_template || 'modern');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Default to modern if settings can't be loaded
      setSelectedTemplate('modern');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    const confirmed = await confirm({
      title: 'Change Invoice Status',
      message: `Are you sure you want to change the invoice status to ${newStatus}?`,
      confirmText: 'Change Status',
      type: 'info'
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/seller/invoices/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status Updated', 'Invoice status has been updated successfully.');
        loadInvoice(companyId);
      } else {
        toast.error('Update Failed', 'Failed to update invoice status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Network Error', 'Error occurred while updating status.');
    }
  };

  const handlePaymentStatusChange = async (newPaymentStatus: string) => {
    const statusLabels: { [key: string]: string } = {
      pending: 'Pending (Unpaid)',
      partial: 'Partial Payment',
      paid: 'Paid',
      overdue: 'Overdue',
      cancelled: 'Cancelled',
    };

    const confirmed = await confirm({
      title: 'Change Payment Status',
      message: `Are you sure you want to change the payment status to ${statusLabels[newPaymentStatus]}?`,
      confirmText: 'Change Status',
      type: 'info'
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/seller/invoices/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, payment_status: newPaymentStatus }),
      });

      if (response.ok) {
        toast.success('Payment Status Updated', 'Payment status has been updated successfully.');
        loadInvoice(companyId);
      } else {
        toast.error('Update Failed', 'Failed to update payment status.');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Network Error', 'Error occurred while updating payment status.');
    }
  };

  const handlePartialPayment = () => {
    setPartialPaymentAmount('');
    setShowPartialPaymentModal(true);
  };

  const handlePartialPaymentSubmit = async () => {
    if (!partialPaymentAmount || parseFloat(partialPaymentAmount) <= 0) {
      toast.warning('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    const paidAmount = parseFloat(partialPaymentAmount);
    const totalAmount = invoice?.total_amount || 0;

    if (paidAmount > totalAmount) {
      toast.warning('Amount Too High', 'Payment amount cannot exceed total invoice amount.');
      return;
    }

    const remaining = totalAmount - paidAmount;
    const newPaymentStatus = remaining === 0 ? 'paid' : 'partial';

    try {
      const response = await fetch(`/api/seller/invoices/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          payment_status: newPaymentStatus,
          paid_amount: paidAmount
        }),
      });

      if (response.ok) {
        setShowPartialPaymentModal(false);
        if (remaining === 0) {
          toast.success('Payment Complete', 'Full payment received! Invoice marked as Paid.');
        } else {
          toast.success('Payment Recorded', `Partial payment recorded. Remaining: PKR ${remaining.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`);
        }
        loadInvoice(companyId);
      } else {
        toast.error('Payment Failed', 'Failed to update payment status.');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Network Error', 'Error occurred while updating payment status.');
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Invoice',
      message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
      confirmText: 'Delete Invoice',
      cancelText: 'Keep Invoice',
      type: 'danger'
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/seller/invoices/${params.id}?company_id=${companyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Invoice Deleted', 'Invoice has been deleted successfully.');
        router.push('/seller/invoices');
      } else {
        const errorData = await response.json();
        toast.error('Delete Failed', errorData.error || 'Failed to delete invoice.');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Network Error', 'Error occurred while deleting invoice.');
    }
  };

  const handleValidateWithFBR = async () => {
    setValidatingFbr(true);
    setFbrValidationResult(null);
    setShowFbrValidationModal(true);

    try {
      const response = await fetch(
        `/api/seller/invoices/${params.id}/validate-fbr?company_id=${companyId}`,
        {
          method: 'POST',
        }
      );

      const data = await response.json();
      setFbrValidationResult(data);

      if (!response.ok) {
        console.error('FBR validation error:', data);
      }
    } catch (error) {
      console.error('Error validating with FBR:', error);
      setFbrValidationResult({
        success: false,
        error: 'Network error occurred while validating with FBR',
      });
    } finally {
      setValidatingFbr(false);
    }
  };

  const handlePostToFBR = async () => {
    // Step 1: Show payload preview modal
    setValidationStep('preview');
    setShowPayloadPreviewModal(true);
    setFbrValidationResult(null);
    setPreviewPayload(null);
    setLoadingPayload(true);

    // Fetch the payload that will be sent
    try {
      const response = await fetch(
        `/api/seller/invoices/${params.id}/validate-fbr?company_id=${companyId}&preview=true`,
        { method: 'POST' }
      );
      const data = await response.json();
      setPreviewPayload(data.payload || data);
    } catch (error) {
      console.error('Error fetching payload:', error);
      toast.error('Error', 'Failed to generate payload preview');
      setShowPayloadPreviewModal(false);
    } finally {
      setLoadingPayload(false);
    }
  };

  const handleConfirmAndValidate = async () => {
    // Step 2: Run validation
    setValidationStep('validating');
    setFbrValidationResult(null);

    try {
      const response = await fetch(
        `/api/seller/invoices/${params.id}/validate-fbr?company_id=${companyId}`,
        { method: 'POST' }
      );

      const data = await response.json();
      setFbrValidationResult(data);
      setValidationStep('result');

      // Check if validation passed or has warnings
      const hasInvalidStatus = data.fbrResponse?.validationResponse?.status === 'Invalid';

      if (!hasInvalidStatus && data.success) {
        // Validation passed, proceed automatically after 2 seconds
        toast.success('Validation Passed', 'Invoice is valid. Proceeding to post...');
        setTimeout(() => {
          proceedWithPosting();
        }, 2000);
      }
      // If has warnings or errors, user must confirm manually
    } catch (error) {
      console.error('Error validating with FBR:', error);
      setFbrValidationResult({
        success: false,
        error: 'Network error occurred while validating with FBR',
      });
      setValidationStep('result');
    }
  };

  const proceedWithPosting = async () => {
    setShowPayloadPreviewModal(false);
    setPostingToFbr(true);
    setFbrPostResult(null);
    setShowFbrPostModal(true);

    try {
      const response = await fetch(
        `/api/seller/invoices/${params.id}/post-fbr?company_id=${companyId}`,
        { method: 'POST' }
      );

      const data = await response.json();
      setFbrPostResult(data);

      if (response.ok && data.success) {
        setTimeout(() => {
          loadInvoice(companyId);
        }, 2000);
      } else {
        console.error('FBR posting error:', data);
      }
    } catch (error) {
      console.error('Error posting to FBR:', error);
      setFbrPostResult({
        success: false,
        error: 'Network error occurred while posting to FBR',
      });
    } finally {
      setPostingToFbr(false);
    }
  };

  const handleSendWhatsApp = async (phoneNumber?: string) => {
    setSendingWhatsApp(true);
    try {
      const response = await fetch('/api/seller/whatsapp/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          invoice_id: params.id,
          customer_phone: phoneNumber || whatsappPhone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show message preview instead of opening WhatsApp immediately
        setWhatsappMessage(data.preview);
        setWhatsappLink(data.waLink);
        setShowWhatsAppModal(false);
        setShowMessagePreview(true);
        toast.success('Message Ready', 'Your WhatsApp message is ready to send!');
      } else {
        toast.error('WhatsApp Error', data.error || 'Failed to generate WhatsApp message.');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      toast.error('Network Error', 'Failed to send WhatsApp message.');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsappMessage);
    toast.success('Copied!', 'Message copied to clipboard');
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappLink, '_blank');
    toast.success('WhatsApp Opened', 'Message is pre-filled. Just click send!');
  };

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

  if (loading) {
    return (
      <>
        <div className="p-6">
          <div className="text-center py-12">Loading invoice...</div>
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <div className="p-6">
          <div className="text-center py-12">Invoice not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <p className="text-sm text-gray-600">Invoice Details</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/seller/invoices"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Invoices
            </Link>

            {/* Edit Button - Show for draft and verified invoices */}
            {(invoice.status === 'draft' || invoice.status === 'verified') && (
              <Link
                href={`/seller/invoices/${params.id}/edit`}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold flex items-center gap-2"
              >
                ✏️ Edit Invoice
              </Link>
            )}

            {/* Print Button */}
            <Link
              href={`/print/${params.id}/print?template=${selectedTemplate}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center gap-2"
            >
              🖨️ Print Invoice
            </Link>

            {/* WhatsApp Button */}
            <button
              onClick={() => {
                // Check if customer has phone number
                if (invoice.customer?.phone) {
                  handleSendWhatsApp(invoice.customer.phone);
                } else {
                  setShowWhatsAppModal(true);
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold flex items-center gap-2"
            >
              💬 Send via WhatsApp
            </button>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-4 mb-6">
          <div>
            <span className="text-sm text-gray-600">Status: </span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                invoice.status
              )}`}
            >
              {invoice.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-600">Payment: </span>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusBadge(
                invoice.payment_status
              )}`}
            >
              {invoice.payment_status.toUpperCase()}
            </span>
          </div>
          {invoice.status !== 'draft' && invoice.status !== 'verified' && (
            <div className="text-sm text-gray-500 italic">
              ℹ️ Only draft and verified invoices can be edited
            </div>
          )}
        </div>

        {/* Invoice Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Information</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-semibold text-gray-900 font-mono">{invoice.invoice_number}</span>
              </div>
              {invoice.fbr_invoice_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">FBR Invoice Number:</span>
                  <span className="font-semibold text-blue-700 font-mono">{invoice.fbr_invoice_number}</span>
                </div>
              )}
              {invoice.po_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">PO Number:</span>
                  <span className="font-semibold text-gray-900">{invoice.po_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Type:</span>
                <span className="font-semibold text-gray-900">{invoice.invoice_type}</span>
              </div>
              {invoice.scenario && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Scenario:</span>
                  <span className="font-semibold text-gray-900">{invoice.scenario}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(invoice.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block text-sm">Name:</span>
                <span className="font-semibold text-gray-900">{invoice.buyer_name}</span>
              </div>
              {invoice.buyer_business_name && (
                <div>
                  <span className="text-gray-600 block text-sm">Business Name:</span>
                  <span className="font-semibold text-gray-900">
                    {invoice.buyer_business_name}
                  </span>
                </div>
              )}
              {invoice.buyer_ntn_cnic && (
                <div>
                  <span className="text-gray-600 block text-sm">NTN/CNIC:</span>
                  <span className="font-semibold text-gray-900">{invoice.buyer_ntn_cnic}</span>
                </div>
              )}
              {invoice.buyer_province && (
                <div>
                  <span className="text-gray-600 block text-sm">Province:</span>
                  <span className="font-semibold text-gray-900">{invoice.buyer_province}</span>
                </div>
              )}
              {invoice.buyer_address && (
                <div>
                  <span className="text-gray-600 block text-sm">Address:</span>
                  <span className="font-semibold text-gray-900">{invoice.buyer_address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {invoice.notes && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Notes</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          </div>
        )}

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Item Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    HS Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    UOM
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.hs_code || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.uom}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      Rs. {parseFloat(item.unit_price.toString()).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {parseFloat(item.quantity.toString())}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      Rs. {parseFloat(item.line_total.toString()).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Totals</h2>
          <div className="space-y-3 max-w-md ml-auto">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-semibold">
                Rs. {parseFloat(invoice.subtotal.toString()).toLocaleString()}
              </span>
            </div>
            {invoice.sales_tax_rate > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Sales Tax ({invoice.sales_tax_rate}%):</span>
                <span className="font-semibold">
                  Rs. {parseFloat(invoice.sales_tax_amount.toString()).toLocaleString()}
                </span>
              </div>
            )}
            {invoice.further_tax_rate > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Further Tax ({invoice.further_tax_rate}%):</span>
                <span className="font-semibold">
                  Rs. {parseFloat(invoice.further_tax_amount.toString()).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
              <span>Grand Total:</span>
              <span>Rs. {parseFloat(invoice.total_amount.toString()).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Actions</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {invoice.status === 'draft' && (
              <>
                <button
                  onClick={handlePostToFBR}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center gap-2"
                >
                  📤 Post to FBR
                </button>
                <button
                  onClick={handleValidateWithFBR}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2"
                >
                  ✓ Validate with FBR
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Invoice
                </button>
              </>
            )}
            {invoice.status === 'fbr_posted' && (
              <>
                <button
                  onClick={() => handleStatusChange('verified')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Mark as Verified
                </button>
                <button
                  onClick={handleValidateWithFBR}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2"
                >
                  ✓ Validate with FBR
                </button>
              </>
            )}
            {invoice.status === 'verified' && (
              <>
                <button
                  onClick={() => handleStatusChange('paid')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Complete Invoice (Mark as Paid)
                </button>
                <button
                  onClick={() => handleStatusChange('draft')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold flex items-center gap-2"
                >
                  ↩️ Mark as Unverified (Draft)
                </button>
                <button
                  onClick={handleValidateWithFBR}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2"
                >
                  ✓ Validate with FBR
                </button>
              </>
            )}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Payment Status Actions</h2>
          <div className="flex flex-wrap gap-3 mb-6">
            {invoice.payment_status !== 'paid' && (
              <button
                onClick={() => handlePaymentStatusChange('paid')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                💰 Mark as Paid
              </button>
            )}
            {invoice.payment_status !== 'paid' && (
              <button
                onClick={handlePartialPayment}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                💵 Record Payment
              </button>
            )}
            {invoice.payment_status !== 'overdue' && invoice.payment_status !== 'paid' && (
              <button
                onClick={() => handlePaymentStatusChange('overdue')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Mark as Overdue
              </button>
            )}
            {invoice.payment_status !== 'pending' && invoice.payment_status !== 'paid' && (
              <button
                onClick={() => handlePaymentStatusChange('pending')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Reset to Pending
              </button>
            )}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Other Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/seller/customers/${invoice.customer?.id}`}
              className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${!invoice.customer ? 'opacity-50 pointer-events-none' : ''
                }`}
            >
              View Customer
            </Link>
          </div>
        </div>

        {/* Partial Payment Modal */}
        {showPartialPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💵 Record Payment</h2>

              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Total Invoice Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      PKR {invoice.total_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount Received
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={invoice.total_amount}
                  value={partialPaymentAmount}
                  onChange={(e) => setPartialPaymentAmount(e.target.value)}
                  placeholder="Enter amount received"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  autoFocus
                />

                {partialPaymentAmount && parseFloat(partialPaymentAmount) > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Amount Paid:</span>
                      <span className="text-lg font-semibold text-green-700">
                        PKR {parseFloat(partialPaymentAmount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className={`text-lg font-semibold ${(invoice.total_amount - parseFloat(partialPaymentAmount)) === 0
                        ? 'text-green-700'
                        : 'text-orange-700'
                        }`}>
                        PKR {(invoice.total_amount - parseFloat(partialPaymentAmount)).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {(invoice.total_amount - parseFloat(partialPaymentAmount)) === 0 && (
                      <div className="mt-2 text-center">
                        <span className="inline-block px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                          ✓ Full Payment - Will be marked as PAID
                        </span>
                      </div>
                    )}
                    {(invoice.total_amount - parseFloat(partialPaymentAmount)) > 0 && (
                      <div className="mt-2 text-center">
                        <span className="inline-block px-3 py-1 bg-yellow-600 text-white rounded-full text-sm font-semibold">
                          ⚠ Partial Payment - Will be marked as PARTIAL
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPartialPaymentModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePartialPaymentSubmit}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FBR Validation Modal */}
        {showFbrValidationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">FBR Validation Result</h2>
                  <button
                    onClick={() => setShowFbrValidationModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {validatingFbr && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Validating invoice with FBR...</p>
                  </div>
                )}

                {!validatingFbr && fbrValidationResult && (
                  <div className="space-y-4">
                    {/* Success/Error Badge */}
                    <div className={`p-4 rounded-lg ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : fbrValidationResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                          ? 'text-yellow-600'
                          : fbrValidationResult.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid' ? '⚠' : fbrValidationResult.success ? '✓' : '✗'}
                        </span>
                        <div>
                          <h3 className={`text-lg font-semibold ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                            ? 'text-yellow-900'
                            : fbrValidationResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                              ? 'FBR Validation Warning'
                              : fbrValidationResult.success
                                ? 'Validation Successful'
                                : 'Validation Failed'}
                          </h3>
                          <p className={`text-sm ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                            ? 'text-yellow-700'
                            : fbrValidationResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                              ? `FBR returned a warning: ${fbrValidationResult.fbrResponse.validationResponse.error || 'Please review the details below'}`
                              : fbrValidationResult.message || fbrValidationResult.error}
                          </p>
                          {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid' && (
                            <p className="text-xs text-yellow-600 mt-2">
                              ℹ️ You can still proceed with posting this invoice, but please review the warning above.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* FBR Response */}
                    {fbrValidationResult.fbrResponse && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">FBR Response:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                          {JSON.stringify(fbrValidationResult.fbrResponse, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Error Details */}
                    {fbrValidationResult.details && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Error Details:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-red-300 overflow-x-auto">
                          {JSON.stringify(fbrValidationResult.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Payload Sent */}
                    {fbrValidationResult.payload && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Payload Sent to FBR:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-blue-300 overflow-x-auto">
                          {JSON.stringify(fbrValidationResult.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowFbrValidationModal(false)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payload Preview & Validation Modal */}
        {showPayloadPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {validationStep === 'preview' && '📋 Review Payload Before Posting'}
                    {validationStep === 'validating' && '⏳ Validating with FBR...'}
                    {validationStep === 'result' && '📊 Validation Result'}
                  </h2>
                  <button
                    onClick={() => setShowPayloadPreviewModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {validationStep === 'preview' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>ℹ️ Review the payload</strong> that will be sent to FBR. Click &quot;Validate & Continue&quot; to run FBR validation before posting.
                      </p>
                    </div>

                    {loadingPayload ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600">Loading payload preview...</p>
                      </div>
                    ) : previewPayload ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Payload to be sent:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto max-h-96">
                          {JSON.stringify(previewPayload, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                )}

                {validationStep === 'validating' && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Validating invoice with FBR...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                )}

                {validationStep === 'result' && fbrValidationResult && (
                  <div className="space-y-4">
                    {/* Validation Result Badge */}
                    <div className={`p-4 rounded-lg ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : fbrValidationResult.success
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                          ? 'text-yellow-600'
                          : fbrValidationResult.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid' ? '⚠' : fbrValidationResult.success ? '✓' : '✗'}
                        </span>
                        <div>
                          <h3 className={`text-lg font-semibold ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                            ? 'text-yellow-900'
                            : fbrValidationResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                              ? 'FBR Validation Warning'
                              : fbrValidationResult.success
                                ? 'Validation Successful'
                                : 'Validation Failed'}
                          </h3>
                          <p className={`text-sm ${fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                            ? 'text-yellow-700'
                            : fbrValidationResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                              ? `FBR returned a warning: ${fbrValidationResult.fbrResponse.validationResponse.error || 'Please review the details below'}`
                              : fbrValidationResult.message || fbrValidationResult.error}
                          </p>
                          {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid' && (
                            <p className="text-xs text-yellow-600 mt-2">
                              {/* ⚠️ You can still proceed with posting, but please review the warning above. */}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* FBR Response */}
                    {fbrValidationResult.fbrResponse && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">FBR Response:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto max-h-60">
                          {JSON.stringify(fbrValidationResult.fbrResponse, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPayloadPreviewModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                  {validationStep === 'preview' && (
                    <button
                      onClick={handleConfirmAndValidate}
                      disabled={loadingPayload || !previewPayload}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      ✓ Validate & Continue
                    </button>
                  )}
                  {validationStep === 'result' && (
                    <button
                      onClick={proceedWithPosting}
                      disabled={fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {fbrValidationResult.fbrResponse?.validationResponse?.status === 'Invalid'
                        ? '⚠ Proceed Despite Warning'
                        : '📤 Post to FBR'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FBR Post Modal */}
        {showFbrPostModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">📤 Post to FBR Result</h2>
                  <button
                    onClick={() => setShowFbrPostModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {postingToFbr && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Posting invoice to FBR...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few seconds</p>
                  </div>
                )}

                {!postingToFbr && fbrPostResult && (
                  <div className="space-y-4">
                    {/* Success/Error Badge */}
                    <div className={`p-4 rounded-lg ${fbrPostResult.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                      }`}>
                      <div className="flex items-center gap-3">
                        <span className={`text-3xl ${fbrPostResult.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {fbrPostResult.success ? '✓' : '✗'}
                        </span>
                        <div>
                          <h3 className={`text-lg font-semibold ${fbrPostResult.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                            {fbrPostResult.success
                              ? 'Posted to FBR Successfully!'
                              : 'FBR Posting Failed'}
                          </h3>
                          <p className={`text-sm ${fbrPostResult.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {fbrPostResult.message || fbrPostResult.error}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* FBR Invoice Number */}
                    {fbrPostResult.fbrInvoiceNumber && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">FBR Generated Invoice Number:</h4>
                        <p className="text-lg font-mono font-bold text-blue-700">
                          {fbrPostResult.fbrInvoiceNumber}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          This number has been saved to your invoice record
                        </p>
                      </div>
                    )}

                    {/* FBR Response */}
                    {fbrPostResult.fbrResponse && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">FBR Response:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-gray-300 overflow-x-auto max-h-60">
                          {JSON.stringify(fbrPostResult.fbrResponse, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Error Details */}
                    {fbrPostResult.details && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2">Error Details:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-red-300 overflow-x-auto max-h-60">
                          {JSON.stringify(fbrPostResult.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Payload Sent */}
                    {fbrPostResult.payload && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-2">Payload Sent to FBR:</h4>
                        <pre className="text-xs bg-white p-3 rounded border border-blue-300 overflow-x-auto max-h-60">
                          {JSON.stringify(fbrPostResult.payload, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Success Message */}
                    {fbrPostResult.success && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                          ✓ Invoice status has been updated to <strong>FBR Posted</strong>
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          The page will reload automatically to show updated information
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowFbrPostModal(false);
                    if (fbrPostResult?.success) {
                      loadInvoice(companyId);
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Message Preview Modal */}
      {showMessagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">💬 WhatsApp Message Ready</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Review your message and send it via WhatsApp
                  </p>
                </div>
                <button
                  onClick={() => setShowMessagePreview(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Message Preview */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Message Preview</h4>
                  <button
                    onClick={handleCopyMessage}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    📋 Copy Message
                  </button>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-2xl p-6 shadow-sm">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {whatsappMessage}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Ready to send</span>
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">📄 Invoice Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700">Invoice:</span>
                    <span className="ml-2 font-semibold text-blue-900">{invoice?.invoice_number}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Customer:</span>
                    <span className="ml-2 font-semibold text-blue-900">{invoice?.buyer_name}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Amount:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      Rs. {invoice?.total_amount.toLocaleString('en-PK')}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-700">Date:</span>
                    <span className="ml-2 font-semibold text-blue-900">
                      {invoice && new Date(invoice.invoice_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Options */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-yellow-900 mb-3">📱 How to Send</h4>
                <div className="space-y-2 text-sm text-yellow-800">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">1.</span>
                    <span>Click &quot;Open WhatsApp&quot; below - it will open with the message pre-filled</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">2.</span>
                    <span>Review the message in WhatsApp</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">3.</span>
                    <span>Click the send button in WhatsApp to deliver</span>
                  </div>
                  <div className="flex items-start gap-2 mt-3 pt-3 border-t border-yellow-300">
                    <span className="text-blue-600">💡</span>
                    <span className="text-xs">Or copy the message and paste it manually in any chat app</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={() => setShowMessagePreview(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyMessage}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                📋 Copy Message
              </button>
              <button
                onClick={handleOpenWhatsApp}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                💬 Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Phone Number Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">💬 Send Invoice via WhatsApp</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter the customer&apos;s WhatsApp number to send the invoice
              </p>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={whatsappPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9+]/g, '');
                    setWhatsappPhone(value);
                  }}
                  placeholder="923001234567 or +923001234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter number in international format (e.g., 923001234567 for Pakistan)
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Invoice Details</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Invoice:</strong> {invoice?.invoice_number}</p>
                  <p><strong>Customer:</strong> {invoice?.buyer_name}</p>
                  <p><strong>Amount:</strong> Rs. {invoice?.total_amount.toLocaleString('en-PK')}</p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-800">
                  💡 <strong>Tip:</strong> Save customer phone numbers in the Customers section to skip this step next time!
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappPhone('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                disabled={sendingWhatsApp}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSendWhatsApp()}
                disabled={!whatsappPhone || sendingWhatsApp}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
              >
                {sendingWhatsApp ? 'Opening...' : '💬 Send via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog />
    </>
  );
}


