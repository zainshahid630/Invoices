'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Subscription {
  id?: string;
  company_id: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'overdue';
  created_at?: string;
}

export default function SubscriptionManagement() {
  const params = useParams();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Subscription>>({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: 12000,
    status: 'active',
    payment_status: 'pending',
  });

  const loadSubscription = useCallback(async () => {
    try {
      const response = await fetch(`/api/super-admin/companies/${params.id}/subscription`);
      const data = await response.json();

      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        setFormData(data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = subscription
        ? `/api/super-admin/companies/${params.id}/subscription/${subscription.id}`
        : `/api/super-admin/companies/${params.id}/subscription`;

      const method = subscription ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, company_id: params.id }),
      });

      if (response.ok) {
        setEditing(false);
        loadSubscription();
      }
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <Link
              href={`/super-admin/companies/${params.id}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back to Company
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {subscription ? 'Current Subscription' : 'Create Subscription'}
            </h2>
            {subscription && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            )}
          </div>

          {!subscription || editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    name="start_date"
                    type="date"
                    required
                    value={formData.start_date || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    name="end_date"
                    type="date"
                    required
                    value={formData.end_date || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (PKR) *
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="12000.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status *
                  </label>
                  <select
                    name="payment_status"
                    required
                    value={formData.payment_status || 'pending'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {subscription && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData(subscription);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {subscription ? 'Update Subscription' : 'Create Subscription'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Start Date</div>
                  <div className="mt-1 text-gray-900">
                    {new Date(subscription.start_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">End Date</div>
                  <div className="mt-1 text-gray-900">
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-500">Amount</div>
                <div className="mt-1 text-gray-900 text-2xl font-bold">
                  PKR {subscription.amount.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <div className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'expired'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Payment Status</div>
                  <div className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscription.payment_status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : subscription.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {subscription.payment_status.charAt(0).toUpperCase() + subscription.payment_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {subscription.created_at && (
                <div>
                  <div className="text-sm font-medium text-gray-500">Created At</div>
                  <div className="mt-1 text-gray-900">
                    {new Date(subscription.created_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

