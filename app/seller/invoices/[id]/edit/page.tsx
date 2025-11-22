'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../../components/SellerLayout';
import { useToast } from '../../../../components/ToastProvider';

const INVOICE_TYPES = [
  { value: 'Sale Invoice', label: 'Sale Invoice' },
  { value: 'Debit Note', label: 'Debit Note' },
  { value: 'Credit Note', label: 'Credit Note' }
];

const SCENARIOS = [
  { value: 'SN002', label: 'SN002 – Goods at Standard Rate to Unregistered Buyers' },
  { value: 'SN001', label: 'SN001 – Goods at Standard Rate to Registered Buyers' },
  { value: 'SN005', label: 'SN005 – Reduced Rate Sale' },
  { value: 'SN006', label: 'SN006 – Exempt Goods Sale' },
  { value: 'SN007', label: 'SN007 – Zero Rated Sale' },
  { value: 'SN016', label: 'SN016 – Processing / Conversion of Goods' },
  { value: 'SN017', label: 'SN017 – Sale of Goods where FED is Charged in ST Mode' },
  { value: 'SN018', label: 'SN018 – Sale of Services where FED is Charged in ST Mode' },
  { value: 'SN019', label: 'SN019 – Sale of Services' },
  { value: 'SN024', label: 'SN024 – Goods Sold that are Listed in SRO 297(1)/2023' }
];
const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
];

interface Customer {
  id: string;
  name: string;
  business_name: string;
  ntn_cnic: string;
  address: string;
  province: string;
  is_active: boolean;
}

interface Product {
  id: string;
  name: string;
  hs_code: string;
  uom: string;
  unit_price: number;
  current_stock: number;
}

interface InvoiceItem {
  id?: string;
  product_id: string | null;
  item_name: string;
  hs_code: string;
  uom: string;
  unit_price: string;
  quantity: string;
  searchTerm?: string;
  showDropdown?: boolean;
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
  buyer_registration_type: string;
  subtotal: number;
  sales_tax_rate: number;
  sales_tax_amount: number;
  further_tax_rate: number;
  further_tax_amount: number;
  total_amount: number;
  status: string;
  payment_status: string;
  po_number?: string;
  notes?: string;
  items: InvoiceItem[];
  customer: {
    id: string;
    name: string;
    business_name: string;
  } | null;
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    invoice_number: '',
    po_number: '',
    invoice_date: '',
    invoice_type: 'Sales Tax Invoice',
    scenario: '',
    sales_tax_rate: '18',
    further_tax_rate: '',
    payment_status: 'pending',
    notes: '',
  });

  const [buyerMode, setBuyerMode] = useState<'customer' | 'manual'>('manual');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [manualBuyer, setManualBuyer] = useState({
    buyer_name: '',
    buyer_business_name: '',
    buyer_ntn_cnic: '',
    buyer_gst_number: '',
    buyer_address: '',
    buyer_province: '',
    buyer_registration_type: 'Unregistered',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      product_id: null,
      item_name: '',
      hs_code: '',
      uom: 'Numbers, pieces, units',
      unit_price: '',
      quantity: '',
      searchTerm: '',
      showDropdown: false,
    },
  ]);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setCompanyId(userData.company_id);
    loadInvoice(userData.company_id);
    loadInitialData(userData.company_id);
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
        
        // Check if invoice can be edited
        if (data.status !== 'draft' && data.status !== 'verified') {
          setError('Only draft and verified invoices can be edited');
          return;
        }

        // Populate form data
        setFormData({
          invoice_number: data.invoice_number,
          po_number: data.po_number || '',
          invoice_date: data.invoice_date,
          invoice_type: data.invoice_type,
          scenario: data.scenario || '',
          sales_tax_rate: data.sales_tax_rate?.toString() || '18',
          further_tax_rate: data.further_tax_rate?.toString() || '',
          payment_status: data.payment_status,
          notes: data.notes || '',
        });

        // Set buyer information
        setManualBuyer({
          buyer_name: data.buyer_name,
          buyer_business_name: data.buyer_business_name || '',
          buyer_ntn_cnic: data.buyer_ntn_cnic || '',
          buyer_gst_number: data.buyer_gst_number || '',
          buyer_address: data.buyer_address || '',
          buyer_province: data.buyer_province || '',
          buyer_registration_type: data.buyer_registration_type || 'Unregistered',
        });

        // Set customer mode and selection
        if (data.customer) {
          setBuyerMode('customer');
          setSelectedCustomerId(data.customer.id);
        } else {
          setBuyerMode('manual');
        }

        // Set items
        const invoiceItems = data.items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          item_name: item.item_name,
          hs_code: item.hs_code || '',
          uom: item.uom,
          unit_price: item.unit_price.toString(),
          quantity: item.quantity.toString(),
          searchTerm: '',
          showDropdown: false,
        }));
        setItems(invoiceItems);
      } else {
        setError('Invoice not found');
        setTimeout(() => router.push('/seller/invoices'), 2000);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      setError('Error loading invoice');
    } finally {
      setLoading(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      const newItems = items.map((item) => ({ ...item, showDropdown: false }));
      setItems(newItems);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [items]);

  // Load customers and products using optimized init-data endpoint
  const loadInitialData = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/invoices/init-data?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
        setProducts(data.products || []);
        console.log('✅ Loaded customers and products from init-data endpoint');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadCustomers = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/customers?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.filter((c: Customer) => c.is_active));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async (companyId: string) => {
    try {
      const response = await fetch(`/api/seller/products?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setManualBuyer({
        buyer_name: customer.name,
        buyer_business_name: customer.business_name || '',
        buyer_ntn_cnic: customer.ntn_cnic || '',
        buyer_gst_number: (customer as any).gst_number || '',
        buyer_address: customer.address || '',
        buyer_province: customer.province || '',
        buyer_registration_type: (customer as any).registration_type || 'Unregistered',
      });
      setCustomerSearchTerm('');
    }
  };

  const handleCustomerSearch = (searchTerm: string) => {
    setCustomerSearchTerm(searchTerm);
    // Don't automatically switch to manual mode
    // Let user explicitly choose manual entry if needed
  };

  const filteredCustomers = customers.filter((c) =>
    !customerSearchTerm ||
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.business_name?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.ntn_cnic?.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        product_id: product.id,
        item_name: product.name,
        hs_code: product.hs_code || '',
        uom: product.uom,
        unit_price: product.unit_price.toString(),
        searchTerm: '',
        showDropdown: false,
      };
      setItems(newItems);
    }
  };

  const handleProductSearch = (index: number, searchTerm: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      searchTerm,
      showDropdown: true,
    };
    setItems(newItems);

    // If no products match, automatically switch to manual entry
    const matchingProducts = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hs_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (searchTerm && matchingProducts.length === 0) {
      newItems[index] = {
        ...newItems[index],
        product_id: null,
        item_name: searchTerm,
        showDropdown: false,
      };
      setItems(newItems);
    }
  };

  const getFilteredProducts = (index: number) => {
    const searchTerm = items[index]?.searchTerm || '';
    if (!searchTerm) return products;

    return products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.hs_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    // Get HS code from previous item for convenience
    const previousItem = items[items.length - 1];
    const hsCodeToUse = previousItem?.hs_code || '';
    
    setItems([
      ...items,
      {
        product_id: null,
        item_name: '',
        hs_code: hsCodeToUse, // Auto-fill from previous item
        uom: 'Numbers, pieces, units',
        unit_price: '',
        quantity: '',
        searchTerm: '',
        showDropdown: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const lineTotal = parseFloat(item.unit_price || '0') * parseFloat(item.quantity || '0');
      return sum + lineTotal;
    }, 0);
  };

  const calculateTax = (rate: string) => {
    const subtotal = calculateSubtotal();
    return (subtotal * parseFloat(rate || '0')) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const salesTax = calculateTax(formData.sales_tax_rate);
    const furtherTax = calculateTax(formData.further_tax_rate);
    return subtotal + salesTax + furtherTax;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validation
    if (buyerMode === 'customer' && !selectedCustomerId) {
      setError('Please select a customer or switch to manual entry');
      setSaving(false);
      return;
    }

    if (buyerMode === 'manual' && !manualBuyer.buyer_name) {
      setError('Buyer name is required');
      setSaving(false);
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.item_name || !item.unit_price || !item.quantity
    );
    if (invalidItems.length > 0) {
      setError('All items must have name, unit price, and quantity');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/seller/invoices/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: buyerMode === 'customer' ? selectedCustomerId : null,
          ...formData,
          ...manualBuyer,
          items,
        }),
      });

      if (response.ok) {
        toast.success('Invoice Updated', 'Invoice has been updated successfully!');
        router.push(`/seller/invoices/${params.id}`);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to update invoice';
        setError(errorMessage);
        toast.error('Update Failed', errorMessage);
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      const errorMessage = 'Error updating invoice';
      setError(errorMessage);
      toast.error('Network Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const subtotal = calculateSubtotal();
  const salesTax = calculateTax(formData.sales_tax_rate);
  const furtherTax = calculateTax(formData.further_tax_rate);
  const total = calculateTotal();

  if (loading) {
    return (
      <>
        <div className="p-6">
          <div className="text-center py-12">Loading invoice...</div>
        </div>
      </>
    );
  }

  if (error && !invoice) {
    return (
      <>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link
            href="/seller/invoices"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Invoices
          </Link>
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
            <h1 className="text-2xl font-bold text-gray-900">Edit Invoice</h1>
            <p className="text-sm text-gray-600">
              Editing: {formData.invoice_number} ({invoice?.status === 'verified' ? 'Verified' : 'Draft'})
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/seller/invoices/${params.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Cancel
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Number
                </label>
                <input
                  type="text"
                  value={formData.po_number}
                  onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                  placeholder="Purchase Order Number (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.invoice_type}
                  onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {INVOICE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scenario ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.scenario}
                  onChange={(e) => setFormData({ ...formData, scenario: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Scenario --</option>
                  {SCENARIOS.map((scenario) => (
                    <option key={scenario.value} value={scenario.value}>
                      {scenario.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Tax & Totals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sales Tax Rate (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.sales_tax_rate}
                  onChange={(e) => setFormData({ ...formData, sales_tax_rate: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Further Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.further_tax_rate}
                  onChange={(e) => setFormData({ ...formData, further_tax_rate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending (Unpaid)</option>
                  <option value="partial">Partial Payment</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Buyer Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Buyer Details</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setBuyerMode('customer')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    buyerMode === 'customer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Select Customer
                </button>
                <button
                  type="button"
                  onClick={() => setBuyerMode('manual')}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    buyerMode === 'manual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {buyerMode === 'customer' ? (
              <div className="mb-4 relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search & Select Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => handleCustomerSearch(e.target.value)}
                  placeholder="Type to search customers..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {customerSearchTerm && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          handleCustomerSelect(customer.id);
                          setCustomerSearchTerm('');
                        }}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                      >
                        <div className="font-medium text-gray-900">{customer.name}</div>
                        {customer.business_name && (
                          <div className="text-sm text-gray-600">{customer.business_name}</div>
                        )}
                        {customer.ntn_cnic && (
                          <div className="text-xs text-gray-500">NTN/CNIC: {customer.ntn_cnic}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {selectedCustomerId && !customerSearchTerm && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-blue-900">
                          {customers.find((c) => c.id === selectedCustomerId)?.name}
                        </div>
                        <div className="text-sm text-blue-700">
                          {customers.find((c) => c.id === selectedCustomerId)?.business_name}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId('');
                          setManualBuyer({
                            buyer_name: '',
                            buyer_business_name: '',
                            buyer_ntn_cnic: '',
                            buyer_gst_number: '',
                            buyer_address: '',
                            buyer_province: '',
                            buyer_registration_type: 'Unregistered',
                          });
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buyer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manualBuyer.buyer_name}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_name: e.target.value })
                  }
                  required
                  disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={manualBuyer.buyer_business_name}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_business_name: e.target.value })
                  }
                  disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NTN/CNIC
                </label>
                <input
                  type="text"
                  value={manualBuyer.buyer_ntn_cnic}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_ntn_cnic: e.target.value })
                  }
                  disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={manualBuyer.buyer_gst_number}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_gst_number: e.target.value })
                  }
                  disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  placeholder="Enter GST number (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={manualBuyer.buyer_registration_type}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_registration_type: e.target.value })
                  }
                  required
                  disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  FBR registration status
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                <select
                  value={manualBuyer.buyer_province}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_province: e.target.value })
                  }
                  // disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Province</option>
                  {PROVINCES?.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={manualBuyer.buyer_address}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_address: e.target.value })
                  }
                  disabled={buyerMode === 'customer' && !!selectedCustomerId}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-gray-900">Item {index + 1}</h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2 relative">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Search Product (optional)
                      </label>
                      <input
                        type="text"
                        value={item.searchTerm || ''}
                        onChange={(e) => handleProductSearch(index, e.target.value)}
                        onFocus={() => {
                          const newItems = [...items];
                          newItems[index].showDropdown = true;
                          setItems(newItems);
                        }}
                        placeholder="Type to search products..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      {item.showDropdown && item.searchTerm && getFilteredProducts(index).length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredProducts(index).map((product) => (
                            <div
                              key={product.id}
                              onClick={() => {
                                handleProductSelect(index, product.id);
                              }}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                            >
                              <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                              <div className="text-xs text-gray-600">
                                HS: {product.hs_code || 'N/A'} | Stock: {product.current_stock} | Rs. {product.unit_price}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {item.product_id && !item.searchTerm && (
                        <div className="mt-1 text-xs text-green-600">
                          ✓ {products.find((p) => p.id === item.product_id)?.name}
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Item Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={item.item_name}
                        onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        HS Code
                      </label>
                      <input
                        type="text"
                        value={item.hs_code}
                        onChange={(e) => handleItemChange(index, 'hs_code', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">UOM</label>
                      <select
                        value={item.uom}
                        onChange={(e) => handleItemChange(index, 'uom', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Numbers, pieces, units">Numbers, pieces, units</option>
                        <option value="Pcs">Pcs</option>
                        <option value="KG">KG</option>
                        <option value="Kilogram">Kilogram</option>
                        <option value="Gram">Gram</option>
                        <option value="MT">MT</option>
                        <option value="Liter">Liter</option>
                        <option value="Gallon">Gallon</option>
                        <option value="Meter">Meter</option>
                        <option value="Foot">Foot</option>
                        <option value="Square Metre">Square Metre</option>
                        <option value="Square Foot">Square Foot</option>
                        <option value="SqY">SqY</option>
                        <option value="Cubic Metre">Cubic Metre</option>
                        <option value="Dozen">Dozen</option>
                        <option value="Pair">Pair</option>
                        <option value="SET">SET</option>
                        <option value="Bag">Bag</option>
                        <option value="Packs">Packs</option>
                        <option value="Pound">Pound</option>
                        <option value="Carat">Carat</option>
                        <option value="40KG">40KG</option>
                        <option value="KWH">KWH</option>
                        <option value="1000 kWh">1000 kWh</option>
                        <option value="MMBTU">MMBTU</option>
                        <option value="Mega Watt">Mega Watt</option>
                        <option value="Thousand Unit">Thousand Unit</option>
                        <option value="Bill of lading">Bill of lading</option>
                        <option value="Timber Logs">Timber Logs</option>
                        <option value="Barrels">Barrels</option>
                        <option value="NO">NO</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Unit Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-6">
                      <div className="text-right">
                        <span className="text-sm text-gray-600">Line Total: </span>
                        <span className="text-lg font-semibold text-gray-900">
                          Rs.{' '}
                          {(
                            parseFloat(item.unit_price || '0') * parseFloat(item.quantity || '0')
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax & Totals */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Sales Tax ({formData.sales_tax_rate}%):</span>
                <span className="font-semibold">Rs. {salesTax.toLocaleString()}</span>
              </div>
              {formData.further_tax_rate && (
                <div className="flex justify-between text-gray-700">
                  <span>Further Tax ({formData.further_tax_rate}%):</span>
                  <span className="font-semibold">Rs. {furtherTax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Grand Total:</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Add any additional notes or comments about this invoice..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium text-lg"
            >
              {saving ? 'Updating Invoice...' : 'Update Invoice'}
            </button>
            <Link
              href={`/seller/invoices/${params.id}`}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-lg text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}