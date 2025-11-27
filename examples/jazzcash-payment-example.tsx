/**
 * JazzCash Payment Integration Example
 * 
 * This example demonstrates how to integrate JazzCash payment gateway
 * in a React/Next.js application.
 */

'use client';

import { useState } from 'react';

export default function JazzCashPaymentExample() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '1000',
    billReference: 'INV-' + Date.now(),
    description: 'Test Payment',
    customerEmail: 'customer@example.com',
    customerMobile: '03001234567',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Initiate payment
      const response = await fetch('/api/jazzcash/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          billReference: formData.billReference,
          description: formData.description,
          customerEmail: formData.customerEmail,
          customerMobile: formData.customerMobile,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Step 2: Open payment in new tab
        const newWindow = window.open('', '_blank');

        if (newWindow) {
          // Create form in new window and submit to JazzCash
          const form = newWindow.document.createElement('form');
          form.method = 'POST';
          form.action = data.paymentUrl;

          // Add all form fields
          Object.entries(data.formData).forEach(([key, value]) => {
            const input = newWindow.document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value as string;
            form.appendChild(input);
          });

          // Add loading message
          newWindow.document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 20px;">💳</div>
                <h2>Redirecting to JazzCash...</h2>
                <p style="color: #666;">Please wait...</p>
              </div>
            </div>
          `;

          // Submit form
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
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">JazzCash Payment Example</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Amount (PKR)
          </label>
          <input
            type="number"
            onWheel={(e) => e.currentTarget.blur()}

            required
            min="1"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="1000"
          />
        </div>

        {/* Bill Reference */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bill Reference
          </label>
          <input
            type="text"
            required
            value={formData.billReference}
            onChange={(e) => setFormData({ ...formData, billReference: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="INV-001"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description
          </label>
          <input
            type="text"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Payment for invoice"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="customer@example.com"
          />
        </div>

        {/* Mobile */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile (Optional)
          </label>
          <input
            type="tel"
            value={formData.customerMobile}
            onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="03001234567"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Pay with JazzCash'}
        </button>
      </form>

      {/* Info Boxes */}
      <div className="mt-6 space-y-3">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>💡 New Tab:</strong> Payment opens in a new tab. Please allow pop-ups if prompted.
          </p>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Test Mode:</strong> Use test card 4111 1111 1111 1111 with any future expiry and CVV.
          </p>
        </div>
      </div>

      {/* Code Example */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Code Example</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
          {`// Initiate payment
const response = await fetch('/api/jazzcash/initiate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1000,
    billReference: 'INV-001',
    description: 'Payment for goods',
    customerEmail: 'user@example.com',
    customerMobile: '03001234567'
  })
});

const data = await response.json();

// Open payment in new tab
const newWindow = window.open('', '_blank');

if (newWindow) {
  const form = newWindow.document.createElement('form');
  form.method = 'POST';
  form.action = data.paymentUrl;

  Object.entries(data.formData).forEach(([key, value]) => {
    const input = newWindow.document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  newWindow.document.body.appendChild(form);
  form.submit();
} else {
  alert('Please allow pop-ups');
}`}
        </pre>
      </div>
    </div>
  );
}
