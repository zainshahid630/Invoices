'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../components/SellerLayout';
import { useToast } from '../../../components/ToastProvider';
import { normalizeNTN } from '@/lib/ntn-utils';
import { FBR_PROVINCES, FBR_DOC_TYPES, FBR_TRANS_TYPES, FBR_UOMS, FBR_SCENARIOS } from '@/lib/fbr-reference-data';


// Interfaces for FBR Data
interface FBRProvince {
  stateProvinceCode: number;
  stateProvinceDesc: string;
}

interface FBRDocType {
  docTypeId: number;
  docDescription: string;
}

interface FBRTransType {
  transactioN_TYPE_ID: number;
  transactioN_DESC: string;
}

interface FBRUOM {
  uoM_ID: number;
  description: string;
}




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
  gst_number: string;
  address: string;
  province: string;
  registration_type: string;
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
  product_id: string | null;
  item_name: string;
  unit_price: string;
  quantity: string;
  searchTerm?: string;
  showDropdown?: boolean;
}

import { FormSkeleton } from '@/app/components/LoadingStates';

export default function NewInvoicePage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // NEW: Track initial data load
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [companyId, setCompanyId] = useState('');
  // FBR Reference Data State
  const [provinces, setProvinces] = useState<FBRProvince[]>([]);
  const [invoiceTypes, setInvoiceTypes] = useState<FBRDocType[]>([]);
  const [transactionTypes, setTransactionTypes] = useState<FBRTransType[]>([]);
  const [uoms, setUoms] = useState<FBRUOM[]>([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState('');

  const [formData, setFormData] = useState({
    invoice_number: '', // Will be auto-generated but editable
    po_number: '',
    dc_code: '',
    invoice_date: new Date().toISOString().split('T')[0],
    invoice_type: 'Sale Invoice',
    scenario: 'SN001',
    hs_code: '', // Invoice-level HS Code
    uom: 'Numbers, pieces, units', // Invoice-level UOM
    sale_type: 'Goods at standard rate (default)', // Invoice-level Sale Type
    sales_tax_rate: '18',
    further_tax_rate: '',
    payment_status: 'pending', // Default to pending (unpaid)
    notes: '',
  });

  const [buyerMode, setBuyerMode] = useState<'customer' | 'manual'>('customer');
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

  // Buyer Validation State
  const [isValidatingBuyer, setIsValidatingBuyer] = useState(false);
  const [buyerStatus, setBuyerStatus] = useState<'Active' | 'In-Active' | null>(null);

  const [defaultHsCode, setDefaultHsCode] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      product_id: null,
      item_name: '',
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
    loadInitialData(userData.company_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // OPTIMIZED: Load initial data without FBR API calls
  const loadInitialData = async (companyId: string) => {
    try {
      setInitialLoading(true);

      // 1. Load Local Data
      const localRes = await fetch(`/api/seller/invoices/init-data?company_id=${companyId}`);

      // 2. Use Local FBR Reference Data (instant load)
      setProvinces(FBR_PROVINCES as any);
      setInvoiceTypes(FBR_DOC_TYPES as any);
      setTransactionTypes(FBR_TRANS_TYPES as any);
      setUoms(FBR_UOMS as any);

      // Handle Local Data
      if (localRes.ok) {
        const data = await localRes.json();
        setCustomers(data.customers || []);
        setProducts(data.products || []);
        setDefaultHsCode(data.defaultHsCode || '');

        setFormData(prev => ({
          ...prev,
          invoice_number: data.nextInvoiceNumber,
          sales_tax_rate: data.defaultSalesTaxRate?.toString() || '18',
          further_tax_rate: data.defaultFurtherTaxRate?.toString() || '',
          scenario: data.defaultScenario || 'SN002',
          hs_code: data.defaultHsCode || '',
        }));
      }

      console.log('✅ All initial data loaded (using local FBR data)');
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Error loading initial data. Please check your connection.');
      toast.error('Network Error', 'Please check your internet connection.');
    } finally {
      setInitialLoading(false);
    }
  };

  // Refresh FBR Reference Data from API
  const refreshFBRReferenceData = async () => {
    try {
      toast.info('Refreshing...', 'Fetching latest FBR reference data...');

      const [provRes, docRes, transRes, uomRes] = await Promise.all([
        fetch(`/api/fbr/reference?type=provinces&company_id=${companyId}`),
        fetch(`/api/fbr/reference?type=doctypes&company_id=${companyId}`),
        fetch(`/api/fbr/reference?type=transtypes&company_id=${companyId}`),
        fetch(`/api/fbr/reference?type=uoms&company_id=${companyId}`)
      ]);

      if (provRes.ok) setProvinces(await provRes.json());
      if (docRes.ok) setInvoiceTypes(await docRes.json());
      if (transRes.ok) setTransactionTypes(await transRes.json());
      if (uomRes.ok) setUoms(await uomRes.json());

      toast.success('Refreshed', 'FBR reference data updated successfully!');
    } catch (error) {
      console.error('Error refreshing FBR data:', error);
      toast.error('Refresh Failed', 'Could not fetch latest FBR data. Using local data.');
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

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      // Normalize province to match FBR format (case-insensitive matching)
      let normalizedProvince = customer.province || '';
      if (normalizedProvince) {
        // Try to find matching FBR province (case-insensitive)
        const matchingProvince = provinces.find(
          p => p.stateProvinceDesc.toLowerCase() === normalizedProvince.toLowerCase()
        );
        if (matchingProvince) {
          normalizedProvince = matchingProvince.stateProvinceDesc;
        } else {
          // Fallback: convert to uppercase to match FBR format
          normalizedProvince = normalizedProvince.toUpperCase();
        }
      }

      setManualBuyer({
        buyer_name: customer.name,
        buyer_business_name: customer.business_name || '',
        buyer_ntn_cnic: customer.ntn_cnic || '',
        buyer_gst_number: (customer as any).gst_number || '',
        buyer_address: customer.address || '',
        buyer_province: normalizedProvince,
        buyer_registration_type: (customer as any).registration_type || 'Unregistered',
      });
      setCustomerSearchTerm('');

      // Validate selected customer
      if (customer.ntn_cnic) {
        validateBuyerNTN(customer.ntn_cnic);
      }
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
        product_id: product.id,
        item_name: product.name,
        unit_price: product.unit_price.toString(),
        quantity: newItems[index].quantity,
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

  // Auto-save item to products table when all required fields are filled
  const autoSaveToProducts = async (item: InvoiceItem) => {
    // Only auto-save if item has all required fields and is not already linked to a product
    if (!item.product_id && item.item_name && formData.hs_code && formData.uom && item.unit_price) {
      try {
        // Check if product already exists with same name
        const existingProduct = products.find(
          p => p.name.toLowerCase() === item.item_name.toLowerCase()
        );

        if (!existingProduct) {
          // Create new product
          const response = await fetch('/api/seller/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              company_id: companyId,
              name: item.item_name,
              hs_code: formData.hs_code,
              uom: formData.uom,
              unit_price: parseFloat(item.unit_price),
              current_stock: 0, // Default stock
              is_active: true,
            }),
          });

          if (response.ok) {
            const newProduct = await response.json();
            // Add to products list
            setProducts([...products, newProduct]);
            console.log('Auto-saved product:', newProduct.name);
          }
        }
      } catch (error) {
        console.error('Error auto-saving product:', error);
        // Don't show error to user, just log it
      }
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);

    // Auto-save to products when unit_price is filled (last required field)
    if (field === 'unit_price' && value) {
      autoSaveToProducts(newItems[index]);
    }
  };

  const addItem = () => {
    // Auto-fill item name and unit price from previous item
    const previousItem = items[items.length - 1];

    setItems([
      ...items,
      {
        product_id: null,
        item_name: previousItem?.item_name || '',
        unit_price: previousItem?.unit_price || '',
        quantity: '', // Always start with empty quantity
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

  // Validate Buyer NTN
  const validateBuyerNTN = async (ntn: string) => {
    if (!ntn) return;

    const normalized = normalizeNTN(ntn);
    if (!normalized.isValid) {
      toast.error('Invalid NTN/CNIC', normalized.error || 'Invalid format');
      return;
    }

    setIsValidatingBuyer(true);
    try {
      // 1. Check Registration Type
      const regRes = await fetch('/api/fbr/validate-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'reg_type', ntn: normalized.normalized, company_id: companyId }),
      });

      if (regRes.ok) {
        const regData = await regRes.json();
        if (regData.REGISTRATION_TYPE) {
          setManualBuyer(prev => ({
            ...prev,
            buyer_registration_type: regData.REGISTRATION_TYPE
          }));
          toast.success('FBR Verified', `Buyer is ${regData.REGISTRATION_TYPE}`);
        }
      }

      // 2. Check Active Status
      const statusRes = await fetch('/api/fbr/validate-buyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'status', ntn: normalized.normalized, company_id: companyId }),
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setBuyerStatus(statusData.status);
        if (statusData.status === 'In-Active') {
          toast.error('Warning', 'Buyer is In-Active in FBR records!');
        }
      }

    } catch (error) {
      console.error('Buyer validation failed:', error);
    } finally {
      setIsValidatingBuyer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (buyerMode === 'customer' && !selectedCustomerId) {
      setError('Please select a customer or switch to manual entry');
      setLoading(false);
      return;
    }

    if (buyerMode === 'manual' && !manualBuyer.buyer_name) {
      setError('Buyer name is required');
      setLoading(false);
      return;
    }

    const invalidItems = items.filter(
      (item) => !item.item_name || !item.unit_price || !item.quantity
    );
    if (invalidItems.length > 0) {
      setError('All items must have name, unit price, and quantity');
      setLoading(false);
      return;
    }

    try {
      // --- FBR Validation Start ---
      // 1. Fetch company details to get seller NTN
      const companyRes = await fetch(`/api/seller/settings?company_id=${companyId}`);
      if (!companyRes.ok) {
        throw new Error('Failed to fetch company details');
      }
      const companyData = await companyRes.json();
      const sellerNTN = companyData.company?.ntn_number;

      if (!sellerNTN) {
        throw new Error('Seller NTN not found. Please update your company settings.');
      }

      const normalizedSellerNTN = normalizeNTN(sellerNTN);
      if (!normalizedSellerNTN.isValid) {
        throw new Error(`Invalid Seller NTN: ${normalizedSellerNTN.error}`);
      }

      // 2. Normalize buyer NTN
      const buyerNTN = manualBuyer.buyer_ntn_cnic;
      const normalizedBuyerNTN = buyerNTN ? normalizeNTN(buyerNTN) : { normalized: '9999999', isValid: true };

      if (!normalizedBuyerNTN.isValid) {
        setError(normalizedBuyerNTN.error || 'Invalid Buyer NTN/CNIC');
        setLoading(false);
        return;
      }

      // 3. Build FBR payload
      const fbrPayload = {
        invoiceType: formData.invoice_type,
        invoiceDate: formData.invoice_date,
        sellerNTN: normalizedSellerNTN.normalized,
        sellerBusinessName: companyData.company?.business_name || companyData.company?.name || 'Unknown Seller',
        sellerProvince: companyData.company?.province || 'Punjab',
        sellerAddress: companyData.company?.address || 'Unknown Address',
        buyerNTNCNIC: normalizedBuyerNTN.normalized,
        buyerBusinessName: manualBuyer.buyer_business_name || 'Unregistered Buyer',
        buyerProvince: manualBuyer.buyer_province || 'Sindh',
        buyerAddress: manualBuyer.buyer_address || 'Karachi',
        invoiceRefNo: formData.invoice_number || `INV-${Date.now()}`,
        scenarioId: formData.scenario,
        buyerRegistrationType: manualBuyer.buyer_registration_type,
        items: items.map(item => ({
          hsCode: formData.hs_code,
          productDescription: item.item_name,
          rate: formData.sales_tax_rate + '%',
          uoM: formData.uom,
          quantity: parseFloat(item.quantity),
          totalValues: 0, // Calculated by FBR or backend?
          valueSalesExcludingST: parseFloat(item.unit_price) * parseFloat(item.quantity),
          fixedNotifiedValueOrRetailPrice: 0.0,
          salesTaxApplicable: (parseFloat(item.unit_price) * parseFloat(item.quantity) * parseFloat(formData.sales_tax_rate)) / 100,
          salesTaxWithheldAtSource: 0,
          extraTax: 0,
          furtherTax: 0,
          sroScheduleNo: "",
          fedPayable: 0,
          discount: 0,
          saleType: formData.sale_type,
          sroItemSerialNo: ""
        }))
      };

      // // 1. Validate with FBR
      // const validationRes = await fetch('/api/fbr/validate-invoice', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ invoiceData: fbrPayload, company_id: companyId }),
      // });

      // if (!validationRes.ok) {
      //   const errorData = await validationRes.json();
      //   throw new Error(errorData.error || 'FBR Validation Failed');
      // }

      // const validationData = await validationRes.json();

      // // Check for FBR Error Response
      // if (validationData.validationResponse && validationData.validationResponse.status === 'Invalid') {
      //   const fbrError = validationData.validationResponse.error || validationData.validationResponse.errorCode || 'Unknown FBR Error';
      //   throw new Error(`FBR Error: ${fbrError}`);
      // }

      // if (validationData.Response && validationData.Response !== '00') {
      //   throw new Error(`FBR Error: ${validationData.Response} - ${validationData.Errors || 'Unknown Error'}`);
      // }

      // toast.success('FBR Validated', 'Invoice data is valid according to FBR.');
      // // --- FBR Validation End ---

      // Apply invoice-level fields (hs_code, uom, sale_type) to all items
      const itemsWithInvoiceFields = items.map(item => ({
        ...item,
        hs_code: formData.hs_code,
        uom: formData.uom,
        sale_type: formData.sale_type,
      } as any));

      // Remove hs_code, uom, sale_type from formData as they're now in items
      const { hs_code, uom, sale_type, ...invoiceData } = formData;

      const response = await fetch('/api/seller/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          customer_id: buyerMode === 'customer' ? selectedCustomerId : null,
          ...invoiceData,
          ...manualBuyer,
          items: itemsWithInvoiceFields,
        }),
      });

      if (response.ok) {
        const invoice = await response.json();
        toast.success('Invoice Created', 'Invoice has been created successfully!');
        setCreatedInvoiceId(invoice.id);
        setShowSuccessModal(true);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create invoice';
        setError(errorMessage);
        toast.error('Creation Failed', errorMessage);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      const errorMessage = 'Error creating invoice';
      setError(errorMessage);
      toast.error('Network Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const salesTax = calculateTax(formData.sales_tax_rate);
  const furtherTax = calculateTax(formData.further_tax_rate);
  const total = calculateTotal();

  const handleCreateAnother = () => {
    setShowSuccessModal(false);
    setCreatedInvoiceId('');
    // Reset form
    setFormData({
      invoice_number: '',
      po_number: '',
      dc_code: '',
      invoice_date: new Date().toISOString().split('T')[0],
      invoice_type: 'Sale Invoice',
      scenario: 'SN001',
      hs_code: '',
      uom: 'Numbers, pieces, units',
      sale_type: 'Goods at standard rate (default)',
      sales_tax_rate: '18',
      further_tax_rate: '',
      payment_status: 'pending',
      notes: '',
    });
    setSelectedCustomerId('');
    setCustomerSearchTerm('');
    setManualBuyer({
      buyer_name: '',
      buyer_business_name: '',
      buyer_ntn_cnic: '',
      buyer_gst_number: '',
      buyer_address: '',
      buyer_province: '',
      buyer_registration_type: 'Unregistered',
    });
    setItems([
      {
        product_id: null,
        item_name: '',
        unit_price: '',
        quantity: '',
        searchTerm: '',
        showDropdown: false,
      },
    ]);
    setError('');
    // Reload initial data to get new invoice number
    loadInitialData(companyId);
  };

  const handleViewInvoice = () => {
    router.push(`/seller/invoices/${createdInvoiceId}`);
  };

  // Show loading skeleton while initial data loads
  if (initialLoading) {
    return (
      <>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
              <p className="text-sm text-gray-600">Loading form data...</p>
            </div>
          </div>
          <FormSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Invoice Created!</h3>
              <p className="text-gray-600 mb-6">
                Your invoice has been created successfully. What would you like to do next?
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleViewInvoice}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  View Invoice
                </button>
                <button
                  onClick={handleCreateAnother}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Create Another Invoice
                </button>
                <button
                  onClick={() => router.push('/seller/invoices')}
                  className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Go to Invoice List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
            <p className="text-sm text-gray-600">Generate a sales invoice</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshFBRReferenceData}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              title="Fetch latest FBR reference data (provinces, UOMs, transaction types)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh FBR Data
            </button>
            <Link
              href="/seller/invoices"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Invoices
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
                  placeholder="Auto-generated (editable)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ✨ Auto-generated but you can edit it
                </p>
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
                  DC Code
                </label>
                <input
                  type="text"
                  value={formData.dc_code}
                  onChange={(e) => setFormData({ ...formData, dc_code: e.target.value })}
                  placeholder="Delivery Challan Code (optional)"
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
                  {invoiceTypes.length > 0 ? (
                    invoiceTypes.map((type) => (
                      <option key={type.docTypeId} value={type.docDescription}>
                        {type.docDescription}
                      </option>
                    ))
                  ) : (
                    <option value="Sale Invoice">Sale Invoice</option>
                  )}
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
                  {FBR_SCENARIOS.map((scenario) => (
                    <option key={scenario.value} value={scenario.value}>
                      {scenario.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HS Code <span className="text-gray-500 text-xs">(Applies to all items)</span>
                </label>
                <input
                  type="text"
                  value={formData.hs_code}
                  onChange={(e) => setFormData({ ...formData, hs_code: e.target.value })}
                  placeholder="Enter HS Code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UOM <span className="text-gray-500 text-xs">(Applies to all items)</span>
                </label>
                <select
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {uoms.length > 0 ? (
                    uoms.map((u) => (
                      <option key={u.uoM_ID} value={u.description}>
                        {u.description}
                      </option>
                    ))
                  ) : (
                    <option value="Numbers, pieces, units">Numbers, pieces, units</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sale Type <span className="text-red-500">*</span> <span className="text-gray-500 text-xs">(Applies to all items)</span>
                </label>
                <select
                  value={formData.sale_type}
                  onChange={(e) => setFormData({ ...formData, sale_type: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {transactionTypes.length > 0 ? (
                    transactionTypes.map((t) => (
                      <option key={t.transactioN_TYPE_ID} value={t.transactioN_DESC}>
                        {t.transactioN_DESC}
                      </option>
                    ))
                  ) : (
                    <option value="Goods at standard rate (default)">Goods at standard rate (default)</option>
                  )}
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
                  onWheel={(e) => e.currentTarget.blur()}

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
                  onWheel={(e) => e.currentTarget.blur()}

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
                <p className="text-xs text-gray-500 mt-1">
                  Default: Pending (Unpaid)
                </p>
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
                  className={`px-4 py-2 rounded-lg text-sm ${buyerMode === 'customer'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                    }`}
                >
                  Select Customer
                </button>
                <button
                  type="button"
                  onClick={() => setBuyerMode('manual')}
                  className={`px-4 py-2 rounded-lg text-sm ${buyerMode === 'manual'
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
                {customerSearchTerm && filteredCustomers.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                    <p className="text-sm text-gray-600">
                      No customers found. Switching to manual entry...
                    </p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NTN/CNIC <span className="text-gray-500 text-xs">(Dashes allowed)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualBuyer.buyer_ntn_cnic}
                    onChange={(e) => setManualBuyer({ ...manualBuyer, buyer_ntn_cnic: e.target.value })}
                    onBlur={(e) => validateBuyerNTN(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${buyerStatus === 'In-Active' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {isValidatingBuyer && (
                    <div className="absolute right-3 top-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {buyerStatus === 'In-Active' && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Buyer is In-Active in FBR records</p>
                )}
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
                  placeholder="Enter GST number (optional)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Province</option>
                  {provinces.length > 0 ? (
                    provinces.map((p) => (
                      <option key={p.stateProvinceCode} value={p.stateProvinceDesc}>
                        {p.stateProvinceDesc}
                      </option>
                    ))
                  ) : (
                    PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={manualBuyer.buyer_address}
                  onChange={(e) =>
                    setManualBuyer({ ...manualBuyer, buyer_address: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      {item.searchTerm && getFilteredProducts(index).length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2">
                          <p className="text-xs text-gray-600">
                            No products found. Using manual entry...
                          </p>
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
                        Unit Price <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        onWheel={(e) => e.currentTarget.blur()}

                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        // onWheel={(e) => e.currentTarget.blur()}
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
                        onWheel={(e) => e.currentTarget.blur()}

                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        required
                        // onWheel={(e) => e.currentTarget.blur()}
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

            {/* Add Item Button at Bottom */}
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={addItem}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
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

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium text-lg"
            >
              {loading ? 'Creating Invoice...' : 'Create Invoice'}
            </button>
            <Link
              href="/seller/invoices"
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

