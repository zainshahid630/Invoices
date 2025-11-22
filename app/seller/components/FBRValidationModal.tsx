'use client';

import { useState } from 'react';

interface FBRValidationModalProps {
  invoiceIds: string[];
  onClose: () => void;
  onComplete: () => void;
}

interface ValidationResult {
  invoice_id: string;
  invoice_number: string;
  success: boolean;
  fbr_invoice_number?: string;
  message?: string;
  error?: string;
}

export default function FBRValidationModal({ invoiceIds, onClose, onComplete }: FBRValidationModalProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleValidate = async () => {
    setIsValidating(true);
    setProgress(0);

    try {
      const session = localStorage.getItem('seller_session');
      if (!session) return;

      const userData = JSON.parse(session);
      const companyId = userData.company_id;

      const response = await fetch('/api/seller/invoices/bulk-validate-fbr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          invoice_ids: invoiceIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setProgress(100);
        setCompleted(true);
      } else {
        const error = await response.json();
        alert(`Validation failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error validating invoices:', error);
      alert('Failed to validate invoices with FBR');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    if (completed) {
      onComplete();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Validate {invoiceIds.length} Invoice{invoiceIds.length > 1 ? 's' : ''} with FBR
            </h2>
            <button
              onClick={handleClose}
              disabled={isValidating}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {!isValidating && !completed && (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg className="w-20 h-20 text-blue-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Validate</h3>
                <p className="text-gray-600">
                  This will send {invoiceIds.length} invoice{invoiceIds.length > 1 ? 's' : ''} to FBR for validation.
                </p>
              </div>
              <button
                onClick={handleValidate}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                Start Validation
              </button>
            </div>
          )}

          {isValidating && (
            <div className="text-center py-8">
              <div className="animate-spin h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Validating with FBR</h3>
              <p className="text-gray-600 mb-4">
                Please wait while we validate your invoices...
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {completed && results.length > 0 && (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-bold text-blue-900">Validation Complete</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{results.length}</div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.success).length}
                    </div>
                    <div className="text-sm text-gray-600">Success</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.filter(r => !r.success).length}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 mb-3">Validation Results:</h4>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {result.success ? (
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{result.invoice_number}</div>
                        {result.success ? (
                          <div className="text-sm text-gray-600">
                            <div>FBR Number: <span className="font-mono">{result.fbr_invoice_number}</span></div>
                            <div className="text-green-700">{result.message}</div>
                          </div>
                        ) : (
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

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={isValidating}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {completed ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
}
