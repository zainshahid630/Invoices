'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SellerLayout from '../components/SellerLayout';
import { FBR_TEST_SCENARIOS, FBRTestScenario } from './testScenarios';
import { normalizeNTN } from '@/lib/ntn-utils';

export default function FBRSandboxPage() {
  const router = useRouter();
  const [token, setToken] = useState('07de2afc-caed-3215-900b-b01720619ca4');
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [batchTesting, setBatchTesting] = useState(false);
  const [batchResults, setBatchResults] = useState<any[]>([]);

  const [payload, setPayload] = useState({
    invoiceType: "Sale Invoice",
    invoiceDate: "2025-05-10",
    sellerBusinessName: "Company 8",
    sellerProvince: "Sindh",
    sellerNTNCNIC: "8885801",
    sellerAddress: "Karachi",
    buyerNTNCNIC: "2046004",
    buyerBusinessName: "FERTILIZER MANUFAC IRS NEW",
    buyerProvince: "Sindh",
    buyerAddress: "Karachi",
    invoiceRefNo: "",
    scenarioId: "SN001",
    buyerRegistrationType: "Registered",
    items: [
      {
        hsCode: "0101.2100",
        productDescription: "test",
        rate: "18%",
        uoM: "Numbers, pieces, units",
        quantity: 400,
        totalValues: 0,
        valueSalesExcludingST: 1000,
        fixedNotifiedValueOrRetailPrice: 0.0,
        salesTaxApplicable: 180,
        salesTaxWithheldAtSource: 0,
        extraTax: "",
        furtherTax: 0,
        sroScheduleNo: "",
        fedPayable: 0,
        discount: 0,
        saleType: "Goods at standard rate (default)",
        sroItemSerialNo: ""
      }
    ]
  });

  useEffect(() => {
    loadCompanySettings();
  }, []);

  const loadCompanySettings = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        router.push('/seller/login');
        return;
      }

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      const response = await fetch(`/api/seller/settings?company_id=${companyId}`);
      const data = await response.json();

      if (response.ok && data.company) {
        // Update token if available
        if (data.company.fbr_token) {
          setToken(data.company.fbr_token);
        }

        // Update payload with company details
        setPayload(prev => {
          // Normalize NTN before setting
          let normalizedNTN = prev.sellerNTNCNIC;
          if (data.company.ntn_number) {
            const ntnResult = normalizeNTN(data.company.ntn_number);
            if (ntnResult.isValid) {
              normalizedNTN = ntnResult.normalized;
            } else {
              console.warn('Invalid company NTN:', ntnResult.error);
              // Use original value if normalization fails
              normalizedNTN = data.company.ntn_number;
            }
          }

          return {
            ...prev,
            sellerBusinessName: data.company.business_name || data.company.name || prev.sellerBusinessName,
            sellerProvince: data.company.province || prev.sellerProvince,
            sellerNTNCNIC: normalizedNTN,
            sellerAddress: data.company.address || prev.sellerAddress,
          };
        });
      }
    } catch (error) {
      console.error('Error loading company settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Normalize only seller NTN (buyer NTN is used as-is for testing)
      const sellerNTN = normalizeNTN(payload.sellerNTNCNIC);
      if (!sellerNTN.isValid) {
        setError(`Invalid Seller NTN: ${sellerNTN.error}`);
        setLoading(false);
        return;
      }

      // Create payload with normalized seller NTN only
      const normalizedPayload = {
        ...payload,
        sellerNTNCNIC: sellerNTN.normalized,
        // buyerNTNCNIC is used as-is from payload
      };

      const res = await fetch('https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(normalizedPayload)
      });

      const data = await res.json();
      setResponse({ 
        status: res.status, 
        data,
        normalizedNTNs: {
          seller: `${payload.sellerNTNCNIC} → ${sellerNTN.normalized}`,
          buyer: `${payload.buyerNTNCNIC} (unchanged)`
        }
      });

      if (!res.ok) {
        setError(`Validation failed with status ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate');
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Normalize only seller NTN (buyer NTN is used as-is for testing)
      const sellerNTN = normalizeNTN(payload.sellerNTNCNIC);
      if (!sellerNTN.isValid) {
        setError(`Invalid Seller NTN: ${sellerNTN.error}`);
        setLoading(false);
        return;
      }

      // Create payload with normalized seller NTN only
      const normalizedPayload = {
        ...payload,
        sellerNTNCNIC: sellerNTN.normalized,
        // buyerNTNCNIC is used as-is from payload
      };

      const res = await fetch('https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(normalizedPayload)
      });

      const data = await res.json();
      setResponse({ 
        status: res.status, 
        data,
        normalizedNTNs: {
          seller: `${payload.sellerNTNCNIC} → ${sellerNTN.normalized}`,
          buyer: `${payload.buyerNTNCNIC} (unchanged)`
        }
      });

      if (!res.ok) {
        setError(`Post failed with status ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTest = async () => {
    setBatchTesting(true);
    setBatchResults([]);
    setError(null);
    setResponse(null);

    const results: any[] = [];

    for (const scenario of FBR_TEST_SCENARIOS) {
      const testPayload = {
        ...scenario.payload,
        // Only override seller data if not explicitly set in scenario
        sellerBusinessName: scenario.payload.sellerBusinessName || payload.sellerBusinessName,
        sellerProvince: scenario.payload.sellerProvince || payload.sellerProvince,
        sellerNTNCNIC: scenario.payload.sellerNTNCNIC || payload.sellerNTNCNIC,
        sellerAddress: scenario.payload.sellerAddress || payload.sellerAddress,
      };

      try {
        // Normalize only seller NTN (buyer NTN is used as-is for testing)
        const sellerNTN = normalizeNTN(testPayload.sellerNTNCNIC);

        if (!sellerNTN.isValid) {
          results.push({
            scenario: scenario.name,
            scenarioId: scenario.id,
            status: 'INVALID_NTN',
            success: false,
            error: `Invalid Seller NTN: ${sellerNTN.error}`
          });
          continue;
        }

        // Create payload with normalized seller NTN only
        const normalizedPayload = {
          ...testPayload,
          sellerNTNCNIC: sellerNTN.normalized,
          // buyerNTNCNIC is used as-is from testPayload
        };

        const res = await fetch('https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(normalizedPayload)
        });

        const data = await res.json();
        
        results.push({
          scenario: scenario.name,
          scenarioId: scenario.id,
          status: res.status,
          success: res.ok,
          response: data
        });
      } catch (err: any) {
        results.push({
          scenario: scenario.name,
          scenarioId: scenario.id,
          status: 'ERROR',
          success: false,
          error: err.message
        });
      }

      // Update results in real-time
      setBatchResults([...results]);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setBatchTesting(false);
  };

  const handleCreateInvoice = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const session = localStorage.getItem('seller_session');
      if (!session) {
        setError('Session not found. Please login again.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      // First, check if customer exists or create one
      const customerData = {
        name: payload.buyerBusinessName,
        business_name: payload.buyerBusinessName,
        ntn_cnic: payload.buyerNTNCNIC,
        address: payload.buyerAddress,
        province: payload.buyerProvince,
        registration_type: payload.buyerRegistrationType,
        company_id: companyId
      };

      // Create customer
      const customerRes = await fetch('/api/seller/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      let customerId;
      if (customerRes.ok) {
        const customerResult = await customerRes.json();
        customerId = customerResult.customer.id;
      } else {
        setError('Failed to create customer');
        setLoading(false);
        return;
      }

      // Parse rate to get numeric value
      const rateMatch = payload.items[0].rate.match(/(\d+)/);
      const salesTaxRate = rateMatch ? parseFloat(rateMatch[1]) : 18;

      // Create invoice
      const invoiceData = {
        company_id: companyId,
        customer_id: customerId,
        invoice_date: payload.invoiceDate,
        due_date: payload.invoiceDate,
        invoice_type: payload.invoiceType,
        scenario: payload.scenarioId,
        sales_tax_rate: salesTaxRate,
        further_tax_rate: 0,
        buyer_name: payload.buyerBusinessName,
        buyer_business_name: payload.buyerBusinessName,
        buyer_ntn_cnic: payload.buyerNTNCNIC,
        buyer_address: payload.buyerAddress,
        buyer_province: payload.buyerProvince,
        buyer_registration_type: payload.buyerRegistrationType,
        items: payload.items.map(item => ({
          item_name: item.productDescription,
          hs_code: item.hsCode,
          uom: item.uoM,
          quantity: item.quantity,
          unit_price: item.valueSalesExcludingST / item.quantity,
          line_total: item.valueSalesExcludingST
        }))
      };

      const invoiceRes = await fetch('/api/seller/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (invoiceRes.ok) {
        const invoiceResult = await invoiceRes.json();
        setResponse({ 
          status: 200, 
          data: { 
            success: true, 
            message: 'Invoice created successfully!',
            invoice_id: invoiceResult.invoice.id,
            invoice_number: invoiceResult.invoice.invoice_number
          } 
        });
        
        // Redirect to invoice after 2 seconds
        setTimeout(() => {
          router.push(`/seller/invoices/${invoiceResult.invoice.id}`);
        }, 2000);
      } else {
        const errorData = await invoiceRes.json();
        setError(`Failed to create invoice: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSettings) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4">🧪</div>
            <div className="text-lg text-gray-600">Loading sandbox...</div>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <>
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">FBR Sandbox Testing</h1>
        <p className="text-gray-600">Test FBR API validation and posting with sandbox data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Configuration */}
        <div className="space-y-6">
          {/* Token Input */}
          <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🔑 Sandbox Security Token</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FBR Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter FBR sandbox token"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {token === '07de2afc-caed-3215-900b-b01720619ca4' 
                    ? 'Using default sandbox token' 
                    : 'Using token from company settings'}
                </p>
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  ℹ️ Seller details are automatically loaded from your company settings
                </p>
              </div>
            </div>

            {/* Test Scenario Selector */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🧪 Test Scenarios</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Load Pre-defined Scenario
                </label>
                <select
                  onChange={(e) => {
                    const scenario = FBR_TEST_SCENARIOS.find((s: FBRTestScenario) => s.id === e.target.value);
                    if (scenario) {
                      setPayload({
                        ...scenario.payload,
                        // Only override seller data if not explicitly set in scenario
                        sellerBusinessName: scenario.payload.sellerBusinessName || payload.sellerBusinessName,
                        sellerProvince: scenario.payload.sellerProvince || payload.sellerProvince,
                        sellerNTNCNIC: scenario.payload.sellerNTNCNIC || payload.sellerNTNCNIC,
                        sellerAddress: scenario.payload.sellerAddress || payload.sellerAddress,
                      });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Select a test scenario --</option>
                  {[...FBR_TEST_SCENARIOS]
                    .sort((a, b) => {
                      const numA = parseInt(a.id.replace('SN', ''));
                      const numB = parseInt(b.id.replace('SN', ''));
                      return numA - numB;
                    })
                    .map((scenario: FBRTestScenario) => (
                      <option key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {FBR_TEST_SCENARIOS.length} pre-defined scenarios available
                </p>
              </div>
            </div>

            {/* Payload Editor */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Invoice Payload</h2>
              <textarea
                value={JSON.stringify(payload, null, 2)}
                onChange={(e) => {
                  try {
                    setPayload(JSON.parse(e.target.value));
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                rows={15}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={handleValidate}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? '⏳ Processing...' : '✓ Validate Invoice'}
                </button>
                <button
                  onClick={handlePost}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {loading ? '⏳ Processing...' : '📤 Post Invoice'}
                </button>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <button
                    onClick={handleBatchTest}
                    disabled={loading || batchTesting}
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 font-semibold mb-3"
                  >
                    {batchTesting ? '⏳ Testing All Scenarios...' : '🔄 Test All Scenarios'}
                  </button>
                  <button
                    onClick={handleCreateInvoice}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 font-semibold"
                  >
                    {loading ? '⏳ Creating...' : '📄 Create Invoice in System'}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Creates an invoice with this data for production testing
                  </p>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-600 space-y-1">
                <p>• <strong>Validate:</strong> https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata_sb</p>
                <p>• <strong>Post:</strong> https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata_sb</p>
              </div>
            </div>
          </div>

          {/* Right Panel - Response */}
          <div className="space-y-6">
            {/* Response Display */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 API Response</h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm font-semibold text-red-900">❌ Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              )}

              {response && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    response.status === 200 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className="text-sm font-semibold">
                      Status: <span className={response.status === 200 ? 'text-green-700' : 'text-red-700'}>
                        {response.status}
                      </span>
                    </p>
                  </div>

                  {response.normalizedNTNs && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">🔢 NTN Normalization</h3>
                      <div className="text-xs text-blue-800 space-y-1">
                        <p><strong>Seller:</strong> {response.normalizedNTNs.seller}</p>
                        <p><strong>Buyer:</strong> {response.normalizedNTNs.buyer}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Response Data:</h3>
                    <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs overflow-auto max-h-[600px]">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {!response && !error && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-2">📡</div>
                  <p>No response yet. Click a button to test the API.</p>
                </div>
              )}
            </div>

            {/* Batch Test Results */}
            {batchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Batch Test Results ({batchResults.filter(r => r.success).length}/{batchResults.length} Passed)
                </h2>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {batchResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        result.success
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold">
                            {result.success ? '✅' : '❌'} {result.scenario}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Status: {result.status} | ID: {result.scenarioId}
                          </p>
                        </div>
                        <button
                          onClick={() => setResponse({ status: result.status, data: result.response || result.error })}
                          className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">ℹ️ Testing Information</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• This is a sandbox environment for testing</li>
                <li>• Use the provided sandbox token or your own</li>
                <li>• Modify the JSON payload to test different scenarios</li>
                <li>• Validate before posting to check for errors</li>
                <li>• NTN must be 7 digits or CNIC must be 13 digits</li>
                <li>• Batch testing validates all {FBR_TEST_SCENARIOS.length} scenarios automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
