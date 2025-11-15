'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SuperAdminLayout from '../components/SuperAdminLayout';

export default function SeedDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSeedCompanies = async () => {
    if (!confirm('Are you sure you want to add 20 test companies? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch('/api/admin/seed-companies', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        alert('✅ Test companies added successfully!');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error seeding companies:', error);
      alert('❌ Error seeding companies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Seed Test Data</h1>
          <p className="text-gray-600 mt-2">Add test data to the database for development and testing</p>
        </div>

        {/* Seed Companies Card */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <div className="flex items-start space-x-4">
            <div className="text-5xl">🏢</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Seed Test Companies</h2>
              <p className="text-gray-600 mb-4">
                This will add 20 random test companies with the following data:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mb-6">
                <li>Company details (name, NTN, STRN, address, etc.)</li>
                <li>Active subscription (Professional plan, 1 year)</li>
                <li>Default settings (invoice prefix, tax rates, etc.)</li>
                <li>Enabled features (inventory, customers, invoices, FBR, payments, reports)</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-2">
                  <div className="text-yellow-600 text-xl">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Warning</p>
                    <p className="text-sm text-yellow-700">
                      This action will create 20 new companies in the database. Make sure you&apos;re running this on a development/test environment.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSeedCompanies}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-medium text-white ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Adding Companies...</span>
                  </span>
                ) : (
                  '🚀 Add 20 Test Companies'
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">✅ Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-700">{result.results.companies_created}</div>
                  <div className="text-sm text-green-600">Companies Created</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-700">{result.results.subscriptions_created}</div>
                  <div className="text-sm text-blue-600">Subscriptions Created</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-700">{result.results.settings_created}</div>
                  <div className="text-sm text-purple-600">Settings Created</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-indigo-700">{result.results.features_created}</div>
                  <div className="text-sm text-indigo-600">Features Enabled</div>
                </div>
              </div>

              {result.results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                  <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                    {result.results.errors.map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={() => router.push('/super-admin/dashboard')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Company List Preview */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6 max-w-2xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Companies to be Added</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {[
              'Tech Solutions Ltd - Karachi, Sindh',
              'Global Traders - Lahore, Punjab',
              'Prime Industries - Faisalabad, Punjab',
              'Metro Enterprises - Islamabad',
              'Sunrise Trading Co - Rawalpindi, Punjab',
              'Elite Textiles - Multan, Punjab',
              'Ocean Logistics - Karachi, Sindh',
              'Smart Electronics - Lahore, Punjab',
              'Green Agro Farms - Sahiwal, Punjab',
              'Royal Builders - Peshawar, KPK',
              'Diamond Jewelers - Karachi, Sindh',
              'Fast Food Chain - Lahore, Punjab',
              'Medical Supplies Co - Islamabad',
              'Auto Parts Hub - Gujranwala, Punjab',
              'Fashion Boutique - Karachi, Sindh',
              'Power Energy Ltd - Quetta, Balochistan',
              'Book Publishers - Lahore, Punjab',
              'Furniture Mart - Sialkot, Punjab',
              'Chemical Industries - Karachi, Sindh',
              'Sports Goods Export - Sialkot, Punjab',
            ].map((company, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                <span className="text-gray-400">{index + 1}.</span>
                <span>{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}

