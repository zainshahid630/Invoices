'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const txn = searchParams.get('txn');
  const amount = searchParams.get('amount');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
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
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
        
        {txn && (
          <div className="bg-gray-50 rounded-md p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-1">Transaction Reference:</p>
            <p className="font-mono text-sm font-semibold text-gray-900">{txn}</p>
            
            {amount && (
              <>
                <p className="text-sm text-gray-600 mt-3 mb-1">Amount:</p>
                <p className="font-semibold text-gray-900">
                  PKR {(parseInt(amount) / 100).toFixed(2)}
                </p>
              </>
            )}
          </div>
        )}
        
        <Link
          href="/seller"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
