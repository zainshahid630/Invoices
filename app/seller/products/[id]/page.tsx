'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import SellerLayout from '../../components/SellerLayout';

interface Product {
  id: string;
  name: string;
  hs_code?: string;
  uom: string;
  unit_price: number;
  warranty_months?: number;
  description?: string;
  current_stock: number;
  created_at: string;
  updated_at: string;
}

interface StockHistory {
  id: string;
  change_type: 'in' | 'out';
  quantity: number;
  reason: string;
  previous_stock: number;
  new_stock: number;
  created_at: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('seller_session');
    if (!session) {
      router.push('/seller/login');
      return;
    }

    loadProduct();
    loadStockHistory();
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

  const loadStockHistory = async () => {
    try {
      const response = await fetch(`/api/seller/products/${params.id}/stock-history`);
      if (response.ok) {
        const data = await response.json();
        setStockHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error loading stock history:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <SellerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-600">Product Details</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/seller/products"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              ← Back
            </Link>
            <Link
              href={`/seller/products/${product.id}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </Link>
            <Link
              href={`/seller/products/${product.id}/stock`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Adjust Stock
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">HS Code</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.hs_code || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unit of Measurement</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.uom}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unit Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">Rs. {product.unit_price.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Warranty</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {product.warranty_months ? `${product.warranty_months} months` : 'No warranty'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.current_stock === 0
                          ? 'bg-red-100 text-red-800'
                          : product.current_stock < 10
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {product.current_stock} {product.uom}
                    </span>
                  </dd>
                </div>
              </dl>
              {product.description && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                </div>
              )}
            </div>

            {/* Stock History */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Stock Movement History</h2>
              {stockHistory.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No stock movements yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Previous</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">New</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                entry.change_type === 'in'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {entry.change_type === 'in' ? 'Stock In' : 'Stock Out'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {entry.change_type === 'in' ? '+' : '-'}{entry.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {entry.previous_stock}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {entry.new_stock}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{entry.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Status Card */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Status</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900 mb-2">{product.current_stock}</div>
                <div className="text-sm text-gray-600 mb-4">{product.uom} available</div>
                {product.current_stock === 0 && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">Out of Stock</p>
                  </div>
                )}
                {product.current_stock > 0 && product.current_stock < 10 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-700 font-medium">Low Stock Warning</p>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.created_at).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(product.updated_at).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}

