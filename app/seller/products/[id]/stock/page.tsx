'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../../components/SellerLayout';

interface Product {
  id: string;
  name: string;
  uom: string;
  current_stock: number;
}

export default function StockAdjustmentPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    change_type: 'in',
    quantity: '',
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    const userData = JSON.parse(session);
    setUser(userData);
    loadProduct();
  }, [params.id, router]);

  const loadProduct = async () => {
    try {
      const response = await fetch(`/api/seller/products/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
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
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await fetch(`/api/seller/products/${params.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          company_id: user.company_id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to adjust stock');
      }

      setSuccess(
        `Stock ${formData.change_type === 'in' ? 'increased' : 'decreased'} successfully! ` +
        `Previous: ${data.previous_stock}, New: ${data.new_stock}`
      );

      // Reset form
      setFormData({
        change_type: 'in',
        quantity: '',
        reason: '',
      });

      // Reload product
      loadProduct();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Adjust Stock</h1>
            <p className="text-sm text-gray-600">{product.name}</p>
          </div>
          <Link
            href={`/seller/products/${product.id}`}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Back
          </Link>
        </div>

        {/* Content */}
        <div className="max-w-3xl">
          {/* Current Stock Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Stock Level</h2>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">{product.current_stock}</div>
              <div className="text-sm text-gray-600">{product.uom} available</div>
            </div>
          </div>

          {/* Stock Adjustment Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Adjustment</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Change Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adjustment Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, change_type: 'in' })}
                    className={`p-4 border-2 rounded-lg transition ${formData.change_type === 'in'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">📥</div>
                    <div className="font-semibold">Stock In</div>
                    <div className="text-sm text-gray-600">Add stock</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, change_type: 'out' })}
                    className={`p-4 border-2 rounded-lg transition ${formData.change_type === 'out'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-red-300'
                      }`}
                  >
                    <div className="text-3xl mb-2">📤</div>
                    <div className="font-semibold">Stock Out</div>
                    <div className="text-sm text-gray-600">Remove stock</div>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity ({product.uom}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  onWheel={(e) => e.currentTarget.blur()}

                  required
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
                {formData.change_type === 'out' && formData.quantity && (
                  <p className="mt-2 text-sm text-gray-600">
                    New stock will be: {Math.max(0, product.current_stock - parseInt(formData.quantity))} {product.uom}
                  </p>
                )}
                {formData.change_type === 'in' && formData.quantity && (
                  <p className="mt-2 text-sm text-gray-600">
                    New stock will be: {product.current_stock + parseInt(formData.quantity)} {product.uom}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  {formData.change_type === 'in' ? (
                    <>
                      <option value="Purchase">Purchase</option>
                      <option value="Return from customer">Return from customer</option>
                      <option value="Production">Production</option>
                      <option value="Stock correction">Stock correction</option>
                      <option value="Other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="Sale">Sale</option>
                      <option value="Damage">Damage</option>
                      <option value="Return to supplier">Return to supplier</option>
                      <option value="Stock correction">Stock correction</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 py-3 text-white rounded-lg transition disabled:opacity-50 ${formData.change_type === 'in'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                    }`}
                >
                  {submitting ? 'Processing...' : `${formData.change_type === 'in' ? 'Add' : 'Remove'} Stock`}
                </button>
                <Link
                  href={`/seller/products/${product.id}`}
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

