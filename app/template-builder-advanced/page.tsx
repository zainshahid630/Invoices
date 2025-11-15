'use client';

import { useState, DragEvent } from 'react';

interface FieldConfig {
  [key: string]: boolean;
}

interface TemplateElement {
  id: string;
  type: 'header' | 'company-info' | 'buyer-info' | 'invoice-details' | 'items-table' | 'totals' | 'notes' | 'footer' | 'qr-code' | 'logo' | 'spacer' | 'row';
  label: string;
  icon: string;
  columns?: number;
  children?: TemplateElement[];
  width?: string;
  fields?: FieldConfig; // Which fields to show/hide
}

// Define available fields for each element type
const ELEMENT_FIELDS: Record<string, { key: string; label: string }[]> = {
  'company-info': [
    { key: 'name', label: 'Company Name' },
    { key: 'businessName', label: 'Business Name' },
    { key: 'address', label: 'Address' },
    { key: 'ntn', label: 'NTN Number' },
    { key: 'gst', label: 'GST Number' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ],
  'buyer-info': [
    { key: 'name', label: 'Buyer Name' },
    { key: 'businessName', label: 'Business Name' },
    { key: 'address', label: 'Address' },
    { key: 'ntn', label: 'NTN/CNIC' },
    { key: 'province', label: 'Province' },
  ],
  'invoice-details': [
    { key: 'invoiceNumber', label: 'Invoice Number' },
    { key: 'date', label: 'Invoice Date' },
    { key: 'poNumber', label: 'PO Number' },
    { key: 'type', label: 'Invoice Type' },
    { key: 'paymentStatus', label: 'Payment Status' },
  ],
  'items-table': [
    { key: 'itemName', label: 'Item Name' },
    { key: 'hsCode', label: 'HS Code' },
    { key: 'uom', label: 'UOM' },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'lineTotal', label: 'Line Total' },
  ],
  'totals': [
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'salesTax', label: 'Sales Tax' },
    { key: 'furtherTax', label: 'Further Tax' },
    { key: 'total', label: 'Total Amount' },
  ],
  'header': [
    { key: 'title', label: 'Invoice Title' },
    { key: 'invoiceNumber', label: 'Invoice Number' },
  ],
};

const AVAILABLE_ELEMENTS: TemplateElement[] = [
  { id: 'header', type: 'header', label: 'Header', icon: '📋' },
  { id: 'logo', type: 'logo', label: 'Company Logo', icon: '🏢' },
  { id: 'company-info', type: 'company-info', label: 'Company Info', icon: '🏪' },
  { id: 'buyer-info', type: 'buyer-info', label: 'Buyer Info', icon: '👤' },
  { id: 'invoice-details', type: 'invoice-details', label: 'Invoice Details', icon: '📄' },
  { id: 'items-table', type: 'items-table', label: 'Items Table', icon: '📊' },
  { id: 'totals', type: 'totals', label: 'Totals', icon: '💰' },
  { id: 'qr-code', type: 'qr-code', label: 'QR Code', icon: '📱' },
  { id: 'notes', type: 'notes', label: 'Notes', icon: '📝' },
  { id: 'footer', type: 'footer', label: 'Footer', icon: '⬇️' },
  { id: 'spacer', type: 'spacer', label: 'Spacer', icon: '⬜' },
];

const ROW_LAYOUTS = [
  { id: 'row-2', columns: 2, label: '2 Columns', icon: '⬜⬜' },
  { id: 'row-3', columns: 3, label: '3 Columns', icon: '⬜⬜⬜' },
  { id: 'row-4', columns: 4, label: '4 Columns', icon: '⬜⬜⬜⬜' },
];

// Default field configurations (all enabled)
const getDefaultFields = (type: string): FieldConfig => {
  const fields = ELEMENT_FIELDS[type] || [];
  const config: FieldConfig = {};
  fields.forEach(field => {
    config[field.key] = true;
  });
  return config;
};

export default function TemplateBuilderAdvanced() {
  const [templateElements, setTemplateElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [templateSettings, setTemplateSettings] = useState({
    name: 'My Custom Template',
    fontSize: 'medium',
    borderStyle: 'solid',
    colorScheme: 'blue',
    spacing: 'normal',
  });

  const addElement = (element: TemplateElement) => {
    const newElement = {
      ...element,
      id: `${element.type}-${Date.now()}`,
      fields: getDefaultFields(element.type),
    };
    setTemplateElements([...templateElements, newElement]);
  };

  const addRow = (columns: number) => {
    const newRow: TemplateElement = {
      id: `row-${Date.now()}`,
      type: 'row',
      label: `${columns} Column Row`,
      icon: '⬜'.repeat(columns),
      columns,
      children: [],
    };
    setTemplateElements([...templateElements, newRow]);
    setSelectedRow(newRow.id);
  };

  const addElementToRow = (rowId: string, element: TemplateElement) => {
    setTemplateElements(templateElements.map(el => {
      if (el.id === rowId && el.type === 'row') {
        const row = el as TemplateElement;
        if (!row.children) row.children = [];
        
        if (row.children.length >= (row.columns || 2)) {
          alert(`This row is full! It can only hold ${row.columns} elements.`);
          return el;
        }

        const width = row.columns === 2 ? 'half' : row.columns === 3 ? 'third' : 'quarter';
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          width,
          fields: getDefaultFields(element.type),
        };
        
        return {
          ...row,
          children: [...row.children, newElement],
        };
      }
      return el;
    }));
  };

  const removeElement = (id: string) => {
    setTemplateElements(templateElements.filter(el => el.id !== id));
    if (selectedElement?.id === id) setSelectedElement(null);
  };

  const removeElementFromRow = (rowId: string, elementId: string) => {
    setTemplateElements(templateElements.map(el => {
      if (el.id === rowId && el.type === 'row' && el.children) {
        return {
          ...el,
          children: el.children.filter(child => child.id !== elementId),
        };
      }
      return el;
    }));
    if (selectedElement?.id === elementId) setSelectedElement(null);
  };

  const updateElementFields = (elementId: string, fields: FieldConfig) => {
    setTemplateElements(templateElements.map(el => {
      if (el.id === elementId) {
        return { ...el, fields };
      }
      if (el.type === 'row' && el.children) {
        return {
          ...el,
          children: el.children.map(child => 
            child.id === elementId ? { ...child, fields } : child
          ),
        };
      }
      return el;
    }));
    
    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, fields });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newElements = [...templateElements];
    const [draggedElement] = newElements.splice(draggedIndex, 1);
    newElements.splice(dropIndex, 0, draggedElement);
    
    setTemplateElements(newElements);
    setDraggedIndex(null);
  };

  const findElement = (id: string): TemplateElement | null => {
    for (const el of templateElements) {
      if (el.id === id) return el;
      if (el.type === 'row' && el.children) {
        const found = el.children.find(child => child.id === id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">⚙️ Template Builder Advanced</h1>
            <p className="text-sm text-gray-600">Configure which fields to show/hide for each element</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
              💾 Save Draft
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              ✅ Save Template
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Elements Palette */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📦 Elements</h2>
          <div className="space-y-2">
            {AVAILABLE_ELEMENTS.map((element) => (
              <button
                key={element.id}
                onClick={() => selectedRow ? addElementToRow(selectedRow, element) : addElement(element)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-left"
              >
                <span className="text-2xl">{element.icon}</span>
                <span className="text-sm font-medium text-gray-700">{element.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3">📐 Row Layouts</h3>
            <div className="space-y-2">
              {ROW_LAYOUTS.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => addRow(layout.columns)}
                  className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-lg transition-colors text-left"
                >
                  <span className="text-lg">{layout.icon}</span>
                  <span className="text-sm font-medium text-purple-700">{layout.label}</span>
                </button>
              ))}
            </div>
            {selectedRow && (
              <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg">
                <p className="text-xs font-bold text-green-800 mb-1">✓ Row Selected</p>
                <p className="text-xs text-green-700">Click elements to add to row</p>
                <button
                  onClick={() => setSelectedRow(null)}
                  className="mt-2 w-full px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-semibold hover:bg-green-300"
                >
                  Deselect Row
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Middle - Canvas */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">📋 Template Canvas</h3>
                <span className="text-sm text-gray-600">Click element to configure fields</span>
              </div>

              <div className="space-y-3">
                {templateElements.map((element, index) => (
                  element.type === 'row' ? (
                    <RowCard
                      key={element.id}
                      row={element}
                      index={index}
                      isSelected={selectedRow === element.id}
                      onSelect={() => setSelectedRow(element.id)}
                      onRemove={() => removeElement(element.id)}
                      onSelectChild={(child: TemplateElement) => setSelectedElement(child)}
                      onRemoveChild={(childId: string) => removeElementFromRow(element.id, childId)}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e: DragEvent) => handleDragOver(e, index)}
                      onDrop={(e: DragEvent) => handleDrop(e, index)}
                    />
                  ) : (
                    <TemplateElementCard
                      key={element.id}
                      element={element}
                      index={index}
                      isSelected={selectedElement?.id === element.id}
                      onSelect={() => setSelectedElement(element)}
                      onRemove={() => removeElement(element.id)}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e: DragEvent) => handleDragOver(e, index)}
                      onDrop={(e: DragEvent) => handleDrop(e, index)}
                    />
                  )
                ))}
              </div>

              {templateElements.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-lg font-semibold">No elements yet</p>
                  <p className="text-sm">Add elements from the left sidebar</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Field Configuration */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          {selectedElement ? (
            <FieldConfigurator
              element={selectedElement}
              onUpdate={(fields: FieldConfig) => updateElementFields(selectedElement.id, fields)}
              onClose={() => setSelectedElement(null)}
            />
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-4xl mb-3">⚙️</div>
              <p className="text-lg font-semibold">No Element Selected</p>
              <p className="text-sm mt-2">Click an element on the canvas to configure which fields to show</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FieldConfigurator({ element, onUpdate, onClose }: any) {
  const fields = ELEMENT_FIELDS[element.type] || [];
  const currentFields = element.fields || {};

  const toggleField = (key: string) => {
    onUpdate({
      ...currentFields,
      [key]: !currentFields[key],
    });
  };

  const selectAll = () => {
    const allEnabled: FieldConfig = {};
    fields.forEach(field => {
      allEnabled[field.key] = true;
    });
    onUpdate(allEnabled);
  };

  const deselectAll = () => {
    const allDisabled: FieldConfig = {};
    fields.forEach(field => {
      allDisabled[field.key] = false;
    });
    onUpdate(allDisabled);
  };

  if (fields.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">⚙️ Configure</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">This element has no configurable fields</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">⚙️ Configure Fields</h2>
          <p className="text-xs text-gray-600">{element.label}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={selectAll}
          className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded text-xs font-semibold hover:bg-green-200"
        >
          ✓ Select All
        </button>
        <button
          onClick={deselectAll}
          className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded text-xs font-semibold hover:bg-red-200"
        >
          ✕ Deselect All
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field) => (
          <label
            key={field.key}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              currentFields[field.key]
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <input
              type="checkbox"
              checked={currentFields[field.key] || false}
              onChange={() => toggleField(field.key)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{field.label}</p>
              <p className="text-xs text-gray-500">{currentFields[field.key] ? 'Visible' : 'Hidden'}</p>
            </div>
            <span className="text-xl">
              {currentFields[field.key] ? '👁️' : '🚫'}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
        <p className="text-xs text-yellow-800">
          <strong>💡 Tip:</strong> Uncheck fields you don't want to show on the invoice. Changes apply immediately to the preview.
        </p>
      </div>
    </div>
  );
}

function RowCard({ row, index, isSelected, onSelect, onRemove, onSelectChild, onRemoveChild, onDragStart, onDragOver, onDrop }: any) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-move transition-all ${
        isSelected ? 'border-purple-500 bg-purple-50' : 'border-purple-200 bg-purple-50/50 hover:border-purple-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl cursor-grab active:cursor-grabbing">{row.icon}</span>
          <div>
            <p className="font-semibold text-gray-900">{row.label}</p>
            <p className="text-xs text-gray-500">Click elements to configure</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-semibold"
        >
          ✕
        </button>
      </div>

      <div className={`grid gap-2 ${row.columns === 2 ? 'grid-cols-2' : row.columns === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
        {row.children && row.children.length > 0 ? (
          row.children.map((child: TemplateElement) => (
            <div
              key={child.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectChild(child);
              }}
              className="bg-white border border-gray-300 rounded p-2 relative group cursor-pointer hover:border-blue-400"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{child.icon}</span>
                <span className="text-xs font-medium text-gray-700">{child.label}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveChild(child.id);
                }}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ✕
              </button>
            </div>
          ))
        ) : (
          Array.from({ length: row.columns }).map((_, i) => (
            <div key={i} className="bg-white border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-400 text-xs">
              Empty
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TemplateElementCard({ element, index, isSelected, onSelect, onRemove, onDragStart, onDragOver, onDrop }: any) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-move transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl cursor-grab active:cursor-grabbing">{element.icon}</span>
          <div>
            <p className="font-semibold text-gray-900">{element.label}</p>
            <p className="text-xs text-gray-500">Click to configure fields</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-semibold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
