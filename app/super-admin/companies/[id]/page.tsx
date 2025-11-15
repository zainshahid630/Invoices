'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Company {
  id: string;
  name: string;
  business_name: string;
  address?: string;
  ntn_number?: string;
  gst_number?: string;
  fbr_token?: string;
  is_active: boolean;
  created_at: string;
}

export default function CompanyDetail() {
  const params = useParams();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    loadCompany();
  }, [params.id]);

  const loadCompany = async () => {
    try {
      const response = await fetch(`/api/super-admin/companies/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setCompany(data.company);
        setFormData(data.company);
      }
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/super-admin/companies/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        loadCompany();
      }
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!company) {
    return <div className="min-h-screen flex items-center justify-center">Company not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-sm text-gray-600">{company.business_name}</p>
            </div>
            <Link
              href="/super-admin/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/super-admin/companies/${company.id}/subscription`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="font-semibold">Manage Subscription</div>
            <div className="text-sm text-gray-600">Period, amount, payment</div>
          </Link>
          <Link
            href={`/super-admin/companies/${company.id}/features`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-2xl mb-2">⚙️</div>
            <div className="font-semibold">Feature Toggles</div>
            <div className="text-sm text-gray-600">Enable/disable features</div>
          </Link>
          <Link
            href={`/super-admin/companies/${company.id}/users`}
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-semibold">Manage Users</div>
            <div className="text-sm text-gray-600">Company users</div>
          </Link>
        </div>

        {/* Company Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Company Details</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    name="business_name"
                    type="text"
                    value={formData.business_name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NTN Number</label>
                  <input
                    name="ntn_number"
                    type="text"
                    value={formData.ntn_number || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input
                    name="gst_number"
                    type="text"
                    value={formData.gst_number || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FBR Token</label>
                <input
                  name="fbr_token"
                  type="text"
                  value={formData.fbr_token || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData(company);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Company Name</div>
                  <div className="mt-1 text-gray-900">{company.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Business Name</div>
                  <div className="mt-1 text-gray-900">{company.business_name}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Address</div>
                <div className="mt-1 text-gray-900">{company.address || 'Not provided'}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">NTN Number</div>
                  <div className="mt-1 text-gray-900">{company.ntn_number || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">GST Number</div>
                  <div className="mt-1 text-gray-900">{company.gst_number || 'Not provided'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Status</div>
                <div className="mt-1">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {company.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Created At</div>
                <div className="mt-1 text-gray-900">
                  {new Date(company.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

