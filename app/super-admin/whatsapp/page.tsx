'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '../components/SuperAdminLayout';

export default function WhatsAppSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [registeredNumber, setRegisteredNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState<string>('');

  useEffect(() => {
    checkStatus();
    // Poll for status updates every 3 seconds
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      
      setStatus(data.status);
      setRegisteredNumber(data.phoneNumber || null);
      setLoading(false);
    } catch (err) {
      console.error('Error checking WhatsApp status:', err);
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!phoneNumber) {
      setError('Please enter your WhatsApp number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to register WhatsApp number');
      }

      const data = await res.json();
      setStatus('connected');
      setRegisteredNumber(data.phoneNumber);
      setSuccess('WhatsApp number registered successfully!');
      setPhoneNumber('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestMessage = async () => {
    if (!testPhone) {
      setError('Please enter a test phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: testPhone,
          message: '🧪 Test Message from Invoice System\n\nThis is a test message to verify WhatsApp integration is working correctly!',
          invoiceUrl: 'https://example.com/invoice/123'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate WhatsApp link');
      }

      const data = await res.json();
      
      // Open WhatsApp link in new tab
      window.open(data.waLink, '_blank');
      
      setSuccess('WhatsApp opened! Check your WhatsApp to send the test message.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to remove this WhatsApp number?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/whatsapp/disconnect', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error('Failed to remove WhatsApp number');
      }

      setStatus('disconnected');
      setRegisteredNumber(null);
      setSuccess('WhatsApp number removed successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">WhatsApp Integration</h1>
            <p className="text-gray-600 mt-2">
              Connect your WhatsApp number to send invoices automatically
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Connection Status</h2>
                <div className="flex items-center mt-2">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium">
                    {status === 'connected' ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {status === 'connected' && (
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  Disconnect
                </button>
              )}

              {status === 'disconnected' && (
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Connecting...' : 'Connect WhatsApp'}
                </button>
              )}
            </div>

            {/* Connected Info */}
            {status === 'connected' && registeredNumber && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-4xl mr-4">✅</div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">WhatsApp Number Registered</h3>
                        <p className="text-green-700 mt-1">
                          Phone Number: <span className="font-mono font-bold">+{registeredNumber}</span>
                        </p>
                        <p className="text-sm text-green-600 mt-2">
                          You can now send invoices via WhatsApp using WA.me links!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">🧪 Test WhatsApp</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Test Phone Number (with country code)
                      </label>
                      <input
                        type="tel"
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        placeholder="e.g., 923001234567"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleTestMessage}
                      disabled={!testPhone || loading}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                    >
                      {loading ? 'Generating Link...' : '📱 Send Test Message'}
                    </button>
                    <p className="text-xs text-gray-600">
                      This will open WhatsApp with a pre-filled test message
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            {status === 'disconnected' && !loading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Register Your WhatsApp Number
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Enter your WhatsApp business number to enable invoice sending
                  </p>
                </div>
                
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Number (with country code)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g., 923001234567"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handleConnect}
                      disabled={loading || !phoneNumber}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      Register
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Example: 923001234567 (Pakistan), 14155551234 (USA)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">✨ Features</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Send invoices via WhatsApp</li>
                <li>✓ Share invoice links instantly</li>
                <li>✓ Custom message templates</li>
                <li>✓ Works with any WhatsApp number</li>
                <li>✓ Completely FREE - no API costs</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">⚠️ Important Notes</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Use your WhatsApp Business number</li>
                <li>• Include country code (e.g., 92 for Pakistan)</li>
                <li>• Number must be active on WhatsApp</li>
                <li>• Invoices will be sent via WA.me links</li>
                <li>• Completely FREE - no charges</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
