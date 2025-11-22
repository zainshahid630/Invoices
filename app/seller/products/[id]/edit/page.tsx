'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../../components/SellerLayout';

interface Product {
  id: string;
  name: string;
  hs_code?: string;
  uom: string;
  unit_price: number;
  warranty_months?: number;
  description?: string;
  current_stock: number;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    hs_code: '',
    uom: 'PCS',
    unit_price: '',
    warranty_months: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    loadProduct();
  }, [params.id, router]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/seller/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        const product = data.product;
        setFormData({
          name: product.name,
          hs_code: product.hs_code || '',
          uom: product.uom,
          unit_price: product.unit_price.toString(),
          warranty_months: product.warranty_months?.toString() || '',
          description: product.description || '',
        });
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch(`/api/seller/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update product');
      }

      router.push(`/seller/products/${params.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-600">Update product information</p>
          </div>
          <Link
            href={`/seller/products/${params.id}`}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back
          </Link>
        </div>

        {/* Form */}
        <div className="max-w-3xl">
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* HS Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HS Code
              </label>
              <input
                type="text"
                name="hs_code"
                value={formData.hs_code}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* UOM and Unit Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit of Measurement (UOM) <span className="text-red-500">*</span>
                </label>
                <select
                  name="uom"
                  required
                  value={formData.uom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="LTR">LTR (Liters)</option>
                  <option value="MTR">MTR (Meters)</option>
                  <option value="BOX">BOX (Boxes)</option>
                  <option value="SET">SET (Sets)</option>
                  <option value="UNIT">UNIT (Units)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="unit_price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Warranty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty (Months)
              </label>
              <input
                type="number"
                name="warranty_months"
                min="0"
                value={formData.warranty_months}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Note about stock */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> To adjust stock levels, use the &quot;Adjust Stock&quot; button on the product detail page.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
              >
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
              <Link
                href={`/seller/products/${params.id}`}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
        </div>
      </div>
    </>
  );
}

