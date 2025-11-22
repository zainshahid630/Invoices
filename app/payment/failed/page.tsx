'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Unknown error';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">Unfortunately, your payment could not be processed.</p>
        
        <div className="bg-red-50 rounded-md p-4 mb-6 text-left">
          <p className="text-sm text-red-600 mb-1">Reason:</p>
          <p className="text-sm font-medium text-red-900">{reason}</p>
        </div>
        
        <div className="flex gap-3">
          <Link
            href="/payment"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </Link>
          <Link
            href="/seller"
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <FailedContent />
    </Suspense>
  );
}
