'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface FeatureToggle {
  id: string;
  company_id: string;
  feature_name: string;
  is_enabled: boolean;
}

const AVAILABLE_FEATURES = [
  { name: 'inventory_management', label: 'Inventory Management', description: 'Manage products and stock' },
  { name: 'customer_management', label: 'Customer Management', description: 'Manage customer database' },
  { name: 'invoice_creation', label: 'Invoice Creation', description: 'Create and manage invoices' },
  { name: 'fbr_integration', label: 'FBR Integration', description: 'Post invoices to FBR' },
  { name: 'payment_tracking', label: 'Payment Tracking', description: 'Track customer payments' },
  { name: 'reports_analytics', label: 'Reports & Analytics', description: 'View business reports' },
  { name: 'multi_user', label: 'Multi-User Access', description: 'Multiple users per company' },
];

export default function FeatureToggles() {
  const params = useParams();
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeatures = useCallback(async () => {
    try {
      const response = await fetch(`/api/super-admin/companies/${params.id}/features`);
      const data = await response.json();

      if (data.success) {
        setFeatures(data.features);
      }
    } catch (error) {
      console.error('Error loading features:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const toggleFeature = async (featureName: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/super-admin/companies/${params.id}/features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature_name: featureName,
          is_enabled: !currentStatus,
        }),
      });

      if (response.ok) {
        loadFeatures();
      }
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  const isFeatureEnabled = (featureName: string) => {
    const feature = features.find((f) => f.feature_name === featureName);
    return feature ? feature.is_enabled : false;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Feature Toggles</h1>
            <Link
              href={`/super-admin/companies/${params.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Company
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Enable or Disable Features</h2>

          <div className="space-y-4">
            {AVAILABLE_FEATURES.map((feature) => {
              const enabled = isFeatureEnabled(feature.name);

              return (
                <div
                  key={feature.name}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{feature.label}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>

                  <button
                    onClick={() => toggleFeature(feature.name, enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">ℹ️ Information</h4>
            <p className="text-sm text-blue-700">
              Feature toggles allow you to enable or disable specific functionality for each company.
              Disabled features will not be accessible to the company&apos;s users.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

