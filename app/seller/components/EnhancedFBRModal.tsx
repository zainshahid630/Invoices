'use client';

import { useState, useEffect } from 'react';

interface EnhancedFBRModalProps {
  invoiceIds: string[];
  mode: 'validate' | 'post';
  onClose: () => void;
  onComplete: () => void;
}

interface InvoiceDetail {
  id: string;
  invoice_number: string;
  invoice_date: string;
  buyer_name: string;
  total_amount: number;
  subtotal: number;
  sales_tax_amount: number;
  sales_tax_rate: number;
  further_tax_amount: number;
  further_tax_rate: number;
  status: string;
  fbr_invoice_number?: string;
}

interface FBRPayload {
  invoiceType: string;
  invoiceDate: string;
  sellerNTNCNIC: string;
  sellerBusinessName: string;
  buyerNTNCNIC: string;
  buyerBusinessName: string;
  invoiceRefNo: string;
  scenarioId: string;
  items: any[];
}

interface ProcessResult {
  invoice_id: string;
  invoice_number: string;
  success: boolean;
  fbr_invoice_number?: string;
  message?: string;
  error?: string;
  skipped?: boolean;
  skipReason?: string;
}

export default function EnhancedFBRModal({ invoiceIds, mode, onClose, onComplete }: EnhancedFBRModalProps) {
  const [step, setStep] = useState<'loading' | 'review' | 'confirm' | 'processing' | 'complete'>('loading');
  const [invoices, setInvoices] = useState<InvoiceDetail[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPayload, setCurrentPayload] = useState<FBRPayload | null>(null);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [showPayloadDetails, setShowPayloadDetails] = useState(true); // Auto-open payload
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      setCompanyId(userData.company_id);

      // Load invoice details
      const invoicePromises = invoiceIds.map(id =>
        fetch(`/api/seller/invoices/${id}?company_id=${userData.company_id}`)
          .then(res => res.json())
      );

      const invoiceData = await Promise.all(invoicePromises);
      
      // Filter out already posted invoices if in post mode
      const validInvoices = invoiceData.filter(inv => {
        if (mode === 'post' && inv.fbr_invoice_number) {
          results.push({
            invoice_id: inv.id,
            invoice_number: inv.invoice_number,
            success: false,
            skipped: true,
            skipReason: `Already posted to FBR (FBR #: ${inv.fbr_invoice_number})`
          });
          return false;
        }
        return true;
      });

      setInvoices(validInvoices);
      setResults(results);

      if (validInvoices.length === 0) {
        setStep('complete');
      } else {
        setStep('review');
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      alert('Failed to load invoice details');
    }
  };

  const loadPayloadForInvoice = async (invoice: InvoiceDetail) => {
    try {
      // Build FBR payload preview
      const response = await fetch(`/api/seller/invoices/${invoice.id}/fbr-payload?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentPayload(data.payload);
      }
    } catch (error) {
      console.error('Error loading payload:', error);
    }
  };

  const handleStartReview = () => {
    if (invoices.length > 0) {
      loadPayloadForInvoice(invoices[0]);
      setStep('confirm');
    }
  };

  const handleConfirmCurrent = async () => {
    setStep('processing');
    
    const currentInvoice = invoices[currentIndex];
    
    try {
      const endpoint = mode === 'validate' 
        ? `/api/seller/invoices/${currentInvoice.id}/validate-fbr`
        : `/api/seller/invoices/${currentInvoice.id}/post-fbr`;

      const response = await fetch(`${endpoint}?company_id=${companyId}`, {
        method: 'POST',
      });

      const data = await response.json();

      const result: ProcessResult = {
        invoice_id: currentInvoice.id,
        invoice_number: currentInvoice.invoice_number,
        success: data.success || response.ok,
        fbr_invoice_number: data.fbrInvoiceNumber,
        message: data.message,
        error: data.error,
      };

      setResults(prev => [...prev, result]);

      // Move to next invoice or complete
      if (currentIndex < invoices.length - 1) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        await loadPayloadForInvoice(invoices[nextIndex]);
        setStep('confirm');
      } else {
        setStep('complete');
      }
    } catch (error: any) {
      const result: ProcessResult = {
        invoice_id: currentInvoice.id,
        invoice_number: currentInvoice.invoice_number,
        success: false,
        error: error.message || 'Network error occurred',
      };

      setResults(prev => [...prev, result]);
      
      // Ask user if they want to continue
      setStep('confirm');
    }
  };

  const handleSkipCurrent = async () => {
    const currentInvoice = invoices[currentIndex];
    
    const result: ProcessResult = {
      invoice_id: currentInvoice.id,
      invoice_number: currentInvoice.invoice_number,
      success: false,
      skipped: true,
      skipReason: 'Skipped by user',
    };

    setResults(prev => [...prev, result]);

    // Move to next invoice or complete
    if (currentIndex < invoices.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      await loadPayloadForInvoice(invoices[nextIndex]);
      setStep('confirm');
    } else {
      setStep('complete');
    }
  };

  const handleStopProcessing = () => {
    // Mark remaining invoices as skipped
    const remainingInvoices = invoices.slice(currentIndex);
    const skippedResults = remainingInvoices.map(inv => ({
      invoice_id: inv.id,
      invoice_number: inv.invoice_number,
      success: false,
      skipped: true,
      skipReason: 'Processing stopped by user',
    }));

    setResults(prev => [...prev, ...skippedResults]);
    setStep('complete');
  };

  const handleClose = () => {
    if (step === 'complete') {
      onComplete();
    }
    onClose();
  };

  const currentInvoice = invoices[currentIndex];
  const totalInvoices = invoiceIds.length;
  const processedCount = results.length;
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success && !r.skipped).length;
  const skippedCount = results.filter(r => r.skipped).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'validate' ? '✓ Validate' : '📤 Post'} {totalInvoices} Invoice{totalInvoices > 1 ? 's' : ''} with FBR
              </h2>
              {step === 'confirm' && (
                <p className="text-sm text-gray-600 mt-1">
                  Invoice {currentIndex + 1} of {invoices.length}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={step === 'processing'}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Loading */}
          {step === 'loading' && (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invoice details...</p>
            </div>
          )}

          {/* Review */}
          {step === 'review' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">📋 Ready to Process</h3>
                <p className="text-sm text-blue-800">
                  {invoices.length} invoice{invoices.length > 1 ? 's' : ''} will be {mode === 'validate' ? 'validated' : 'posted'} to FBR.
                  {skippedCount > 0 && ` ${skippedCount} invoice${skippedCount > 1 ? 's' : ''} skipped (already posted).`}
                </p>
              </div>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {invoices.map((inv, idx) => (
                  <div key={inv.id} className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="font-bold text-base text-gray-900 mb-1">{inv.invoice_number}</div>
                        <div className="text-sm text-gray-600">{inv.buyer_name}</div>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        <div>{inv.invoice_date}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
                        Subtotal: Rs. {inv.subtotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        {inv.sales_tax_amount > 0 && ` + Tax: Rs. ${inv.sales_tax_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`}
                      </div>
                      <div className="font-bold text-base text-green-700">
                        Rs. {inv.total_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStartReview}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Start Processing
              </button>
            </div>
          )}

          {/* Confirm Current Invoice */}
          {step === 'confirm' && currentInvoice && (
            <div>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{processedCount} / {invoices.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
                    style={{ width: `${(processedCount / invoices.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Invoice Details */}
              <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg text-blue-900 mb-4">📋 Current Invoice Details</h3>
                
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-blue-200">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Invoice Number:</span>
                    <div className="font-bold text-base text-gray-900">{currentInvoice.invoice_number}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Date:</span>
                    <div className="font-bold text-base text-gray-900">{currentInvoice.invoice_date}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 block mb-1">Buyer:</span>
                    <div className="font-bold text-base text-gray-900">{currentInvoice.buyer_name}</div>
                  </div>
                </div>

                {/* Amount Breakdown */}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">💰 Amount Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subtotal (Without Tax):</span>
                      <span className="font-semibold text-base text-gray-900">
                        Rs. {currentInvoice.subtotal.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {currentInvoice.sales_tax_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Sales Tax ({currentInvoice.sales_tax_rate}%):
                        </span>
                        <span className="font-semibold text-base text-blue-700">
                          + Rs. {currentInvoice.sales_tax_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    
                    {currentInvoice.further_tax_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Further Tax ({currentInvoice.further_tax_rate}%):
                        </span>
                        <span className="font-semibold text-base text-blue-700">
                          + Rs. {currentInvoice.further_tax_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                      <span className="font-bold text-base text-gray-900">Total Amount (With Tax):</span>
                      <span className="font-bold text-lg text-green-700">
                        Rs. {currentInvoice.total_amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FBR Payload Preview */}
              {currentPayload && (
                <div className="mb-6">
                  <button
                    onClick={() => setShowPayloadDetails(!showPayloadDetails)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  >
                    <span className="font-bold text-lg text-blue-900">📄 FBR Payload Details</span>
                    <svg
                      className={`w-6 h-6 text-blue-700 transition-transform ${showPayloadDetails ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showPayloadDetails && (
                    <div className="mt-3 p-5 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-green-400">JSON Payload</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
                            alert('Payload copied to clipboard!');
                          }}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre className="text-sm text-green-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {JSON.stringify(currentPayload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Last Result (if error) */}
              {results.length > 0 && !results[results.length - 1].success && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">⚠️ Previous Invoice Failed</h4>
                  <p className="text-sm text-red-700">{results[results.length - 1].error}</p>
                  <p className="text-xs text-red-600 mt-2">You can skip this invoice and continue, or stop processing.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleSkipCurrent}
                  className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-semibold"
                >
                  ⏭️ Skip
                </button>
                <button
                  onClick={handleStopProcessing}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
                >
                  ⏹️ Stop
                </button>
                <button
                  onClick={handleConfirmCurrent}
                  className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  ✓ Confirm
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {mode === 'validate' ? 'Validating' : 'Posting'} with FBR
              </h3>
              <p className="text-gray-600">
                Processing {currentInvoice?.invoice_number}...
              </p>
            </div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-bold text-blue-900">Processing Complete</h3>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalInvoices}</div>
                    <div className="text-xs text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{successCount}</div>
                    <div className="text-xs text-gray-600">Success</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{failedCount}</div>
                    <div className="text-xs text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{skippedCount}</div>
                    <div className="text-xs text-gray-600">Skipped</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h4 className="font-semibold text-gray-900 mb-3">Results:</h4>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : result.skipped
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : result.skipped ? (
                        <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{result.invoice_number}</div>
                        {result.success && (
                          <div className="text-sm text-gray-600">
                            {result.fbr_invoice_number && (
                              <div>FBR Number: <span className="font-mono">{result.fbr_invoice_number}</span></div>
                            )}
                            <div className="text-green-700">{result.message}</div>
                          </div>
                        )}
                        {result.skipped && (
                          <div className="text-sm text-yellow-700">{result.skipReason}</div>
                        )}
                        {!result.success && !result.skipped && (
                          <div className="text-sm text-red-700">{result.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={step === 'processing'}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {step === 'complete' ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
