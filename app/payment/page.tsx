'use client';

import { useState } from 'react';

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    billReference: '',
    description: '',
    customerEmail: '',
    customerMobile: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/jazzcash/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Open payment in new tab for better UX
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
          // Create form in new window and submit to JazzCash
          const form = newWindow.document.createElement('form');
          form.method = 'POST';
          form.action = data.paymentUrl;

          Object.entries(data.formData).forEach(([key, value]) => {
            const input = newWindow.document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });

          // Add loading message with JazzCash branding
          newWindow.document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="text-align: center; background: white; padding: 40px; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 64px; margin-bottom: 20px;">💳</div>
                <h2 style="color: #1f2937; margin-bottom: 10px; font-size: 24px;">Redirecting to JazzCash</h2>
                <p style="color: #6b7280; margin-bottom: 20px;">Please wait while we securely redirect you to the payment gateway...</p>
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #e5e7eb; border-top-color: #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              </div>
            </div>
            <style>
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            </style>
          `;

          newWindow.document.body.appendChild(form);
          form.submit();

          // Reset loading state
          setLoading(false);
        } else {
          alert('Please allow pop-ups to complete the payment');
          setLoading(false);
        }
      } else {
        alert('Failed to initiate payment: ' + data.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">JazzCash Payment</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount (PKR)
            </label>
            <input
              type="number"
              id="amount"
              required
              min="1"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>

          <div>
            <label htmlFor="billReference" className="block text-sm font-medium text-gray-700">
              Bill Reference
            </label>
            <input
              type="text"
              id="billReference"
              required
              value={formData.billReference}
              onChange={(e) => setFormData({ ...formData, billReference: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="INV-001"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Payment for invoice"
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
              Email (Optional)
            </label>
            <input
              type="email"
              id="customerEmail"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label htmlFor="customerMobile" className="block text-sm font-medium text-gray-700">
              Mobile (Optional)
            </label>
            <input
              type="tel"
              id="customerMobile"
              value={formData.customerMobile}
              onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="03001234567"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Pay with JazzCash'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>💡 Tip:</strong> Payment will open in a new tab. Please allow pop-ups if prompted.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Test Mode:</strong> Use test card 4111 1111 1111 1111 with any future expiry and CVV.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
