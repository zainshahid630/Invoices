'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../components/SellerLayout';
import { useToast } from '../../../components/ToastProvider';

const PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Gilgit-Baltistan',
  'Azad Kashmir',
  'Islamabad Capital Territory',
];

export default function NewCustomerPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    address: '',
    ntn_cnic: '',
    gst_number: '',
    province: '',
    registration_type: 'Unregistered',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);

    try {
      const response = await fetch('/api/seller/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: userData.company_id,
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success('Customer Created', 'Customer has been created successfully!');
        router.push('/seller/customers');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create customer';
        setError(errorMessage);
        toast.error('Creation Failed', errorMessage);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = 'Error creating customer';
      setError(errorMessage);
      toast.error('Network Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <SellerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
            <p className="text-sm text-gray-600">Create a new customer record</p>
          </div>
          <Link
            href="/seller/customers"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back to Customers
          </Link>
        </div>

        {/* Form */}
        <div className="max-w-3xl">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Customer Name - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>

            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter business name (optional)"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter complete address (optional)"
              />
            </div>

            {/* NTN Number/CNIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NTN Number / CNIC
              </label>
              <input
                type="text"
                name="ntn_cnic"
                value={formData.ntn_cnic}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter NTN or CNIC (must be unique)"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Must be unique - cannot duplicate existing customer&apos;s NTN/CNIC
              </p>
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter GST number (must be unique)"
              />
              <p className="text-xs text-gray-500 mt-1">
                ⚠️ Must be unique - cannot duplicate existing customer&apos;s GST Number
              </p>
            </div>

            {/* Registration Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Type <span className="text-red-500">*</span>
              </label>
              <select
                name="registration_type"
                value={formData.registration_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Registered">Registered</option>
                <option value="Unregistered">Unregistered</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select whether the buyer is registered with FBR or not
              </p>
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Province (optional)</option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Important Notes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Customer Name is required</li>
                <li>• NTN Number/CNIC must be unique (if provided)</li>
                <li>• GST Number must be unique (if provided)</li>
                <li>• All other fields are optional</li>
                <li>• Customer will be created as Active by default</li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Creating...' : 'Create Customer'}
              </button>
              <Link
                href="/seller/customers"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </SellerLayout>
  );
}

