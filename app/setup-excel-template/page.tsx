'use client';

import { useState } from 'react';

export default function SetupExcelTemplate() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const addExcelTemplate = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/super-admin/templates/add-excel', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage('✅ Excel Template added successfully! You can now go to Settings → Templates to use it.');
      } else {
        if (data.error === 'duplicate_key') {
          setSuccess(true);
          setMessage('✅ Excel Template already exists in your database! Go to Settings → Templates to use it.');
        } else {
          setSuccess(false);
          setMessage(`❌ Error: ${data.message}`);
        }
      }
    } catch (error: any) {
      setSuccess(false);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Setup Excel Template
          </h1>
          <p className="text-gray-600">
            Click the button below to add the Excel template to your database
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            What is Excel Template?
          </h2>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>✓ <strong>Excel-style grid layout</strong> - Professional spreadsheet format</li>
            <li>✓ <strong>B&W print optimized</strong> - Saves on color ink costs</li>
            <li>✓ <strong>Clean table design</strong> - Easy to read and understand</li>
            <li>✓ <strong>FBR compliant</strong> - Includes logo & QR code</li>
            <li>✓ <strong>100% FREE</strong> - No payment required</li>
          </ul>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={addExcelTemplate}
            disabled={loading || success}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
              success
                ? 'bg-green-500 text-white cursor-default'
                : loading
                ? 'bg-gray-400 text-white cursor-wait'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Adding Template...
              </>
            ) : success ? (
              <>
                <span className="mr-2">✅</span>
                Template Added!
              </>
            ) : (
              <>
                <span className="mr-2">➕</span>
                Add Excel Template to Database
              </>
            )}
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg text-center font-semibold ${
              success
                ? 'bg-green-100 text-green-800 border-2 border-green-300'
                : 'bg-red-100 text-red-800 border-2 border-red-300'
            }`}
          >
            {message}
          </div>
        )}

        {success && (
          <div className="mt-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
              <li>Go to <strong>Settings → Templates</strong> tab</li>
              <li>Find the <strong>Excel Template</strong> card</li>
              <li>Click <strong>"Use This Template"</strong> button</li>
              <li>Test it by printing any invoice!</li>
            </ol>
            <div className="mt-4 text-center">
              <a
                href="/seller/settings"
                className="inline-block px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-semibold"
              >
                Go to Settings →
              </a>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            This will add the Excel template to your <code className="bg-gray-100 px-2 py-1 rounded">invoice_templates</code> table.
          </p>
          <p className="mt-2">
            Safe to run multiple times - it will detect if already exists.
          </p>
        </div>
      </div>
    </div>
  );
}
