'use client';

import { useState, useEffect } from 'react';
import { FBR_UOMS } from '@/lib/fbr-reference-data';

interface CommercialInvoiceItem {
  id?: string;
  description: string;
  hs_code: string;
  uom: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  original_item_id?: string;
}

interface CommercialInvoiceFormData {
  buyer_name: string;
  buyer_business_name: string;
  buyer_address: string;
  buyer_country: string;
  buyer_tax_id: string;
  items: CommercialInvoiceItem[];
  notes: string;
}

interface CommercialInvoiceFormProps {
  initialData: CommercialInvoiceFormData;
  onSubmit: (data: CommercialInvoiceFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export default function CommercialInvoiceForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Commercial Invoice',
  isSubmitting = false
}: CommercialInvoiceFormProps) {
  const [formData, setFormData] = useState<CommercialInvoiceFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals whenever items change
  useEffect(() => {
    const updatedItems = formData.items.map(item => ({
      ...item,
      line_total: parseFloat(item.quantity.toString()) * parseFloat(item.unit_price.toString())
    }));
    
    if (JSON.stringify(updatedItems) !== JSON.stringify(formData.items)) {
      setFormData(prev => ({ ...prev, items: updatedItems }));
    }
  }, [formData.items]);

  const subtotal = formData.items.reduce((sum, item) => sum + item.line_total, 0);

  const handleBuyerChange = (field: keyof CommercialInvoiceFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof CommercialInvoiceItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: updatedItems }));
    
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: '',
          hs_code: '',
          uom: 'Pcs',
          quantity: 1,
          unit_price: 0,
          line_total: 0
        }
      ]
    }));
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      return; // Don't allow removing the last item
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Buyer name validation removed - will use invoice data

    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description is required';
      }
      // HS Code and UOM validation removed - they're global fields now
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unit_price < 0) {
        newErrors[`item_${index}_unit_price`] = 'Unit price cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold"
                  title="Remove item"
                >
                  ✕
                </button>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors[`item_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Item description"
                  />
                  {errors[`item_${index}_description`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_description`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors[`item_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors[`item_${index}_quantity`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_quantity`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors[`item_${index}_unit_price`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors[`item_${index}_unit_price`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_unit_price`]}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Line Total
                  </label>
                  <input
                    type="text"
                    value={`Rs. ${item.line_total.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>Rs. {subtotal.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Notes</h2>
        <textarea
          value={formData.notes}
          onChange={(e) => handleBuyerChange('notes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          rows={4}
          placeholder="Add any additional notes for this commercial invoice..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold disabled:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:bg-purple-400 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
}
