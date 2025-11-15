'use client';

import { useState, DragEvent } from 'react';

interface TemplateElement {
  id: string;
  type: 'header' | 'company-info' | 'buyer-info' | 'invoice-details' | 'items-table' | 'totals' | 'notes' | 'footer' | 'qr-code' | 'logo' | 'spacer';
  label: string;
  icon: string;
  settings?: any;
}

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

export default function TemplateBuilder() {
  const [templateElements, setTemplateElements] = useState<TemplateElement[]>([
    { ...AVAILABLE_ELEMENTS[0], id: 'header-1' },
    { ...AVAILABLE_ELEMENTS[2], id: 'company-1' },
    { ...AVAILABLE_ELEMENTS[3], id: 'buyer-1' },
    { ...AVAILABLE_ELEMENTS[5], id: 'items-1' },
    { ...AVAILABLE_ELEMENTS[6], id: 'totals-1' },
  ]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
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
    };
    setTemplateElements([...templateElements, newElement]);
  };

  const removeElement = (id: string) => {
    setTemplateElements(templateElements.filter(el => el.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">📐 Invoice Template Builder</h1>
            <p className="text-sm text-gray-600">Drag and drop elements to create your custom invoice template</p>
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
                onClick={() => addElement(element)}
                className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-colors text-left"
              >
                <span className="text-2xl">{element.icon}</span>
                <span className="text-sm font-medium text-gray-700">{element.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3">⚙️ Template Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Template Name</label>
                <input
                  type="text"
                  value={templateSettings.name}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Font Size</label>
                <select
                  value={templateSettings.fontSize}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, fontSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Border Style</label>
                <select
                  value={templateSettings.borderStyle}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, borderStyle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="none">None</option>
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="double">Double</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Color Scheme</label>
                <select
                  value={templateSettings.colorScheme}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, colorScheme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="blue">Blue</option>
                  <option value="gray">Gray (B&W)</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Spacing</label>
                <select
                  value={templateSettings.spacing}
                  onChange={(e) => setTemplateSettings({ ...templateSettings, spacing: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="compact">Compact</option>
                  <option value="normal">Normal</option>
                  <option value="relaxed">Relaxed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Middle - Canvas */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">📋 Template Canvas</h3>
                <span className="text-sm text-gray-600">Drag elements to reorder</span>
              </div>

              <div className="space-y-3">
                {templateElements.map((element, index) => (
                  <TemplateElementCard
                    key={element.id}
                    element={element}
                    index={index}
                    isSelected={selectedElement === element.id}
                    onSelect={() => setSelectedElement(element.id)}
                    onRemove={() => removeElement(element.id)}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e: DragEvent) => handleDragOver(e, index)}
                    onDrop={(e: DragEvent) => handleDrop(e, index)}
                  />
                ))}
              </div>

              {templateElements.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-3">📦</div>
                  <p className="text-lg font-semibold">No elements yet</p>
                  <p className="text-sm">Drag elements from the left sidebar to start building</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Live Preview */}
        <div className="w-96 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">👁️ Live Preview</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="bg-white rounded shadow-sm p-4 text-xs" style={{ fontSize: templateSettings.fontSize === 'small' ? '10px' : templateSettings.fontSize === 'large' ? '14px' : '12px' }}>
              {templateElements.map((element) => (
                <PreviewElement key={element.id} element={element} settings={templateSettings} />
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>💡 Tip:</strong> This is how your invoice will look when printed. Adjust settings in the left sidebar.
            </p>
          </div>
        </div>
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
            <p className="text-xs text-gray-500">Click to edit • Drag to reorder</p>
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

function PreviewElement({ element, settings }: any) {
  const getColorClass = () => {
    switch (settings.colorScheme) {
      case 'blue': return 'bg-blue-600 text-white';
      case 'gray': return 'bg-gray-800 text-white';
      case 'green': return 'bg-green-600 text-white';
      case 'purple': return 'bg-purple-600 text-white';
      default: return 'bg-blue-600 text-white';
    }
  };

  const spacing = settings.spacing === 'compact' ? 'py-1' : settings.spacing === 'relaxed' ? 'py-3' : 'py-2';

  switch (element.type) {
    case 'header':
      return (
        <div className={`${getColorClass()} p-3 rounded mb-2`}>
          <div className="font-bold">INVOICE</div>
          <div className="text-xs opacity-75">INV-2025-00001</div>
        </div>
      );
    
    case 'logo':
      return (
        <div className="text-center mb-2">
          <div className="w-16 h-16 bg-gray-200 rounded mx-auto flex items-center justify-center">
            🏢
          </div>
        </div>
      );
    
    case 'company-info':
      return (
        <div className={`border border-gray-300 p-2 rounded mb-2 ${spacing}`}>
          <div className="font-bold text-xs">Your Company Name</div>
          <div className="text-xs text-gray-600">123 Business St, City</div>
          <div className="text-xs text-gray-600">NTN: 1234567</div>
        </div>
      );
    
    case 'buyer-info':
      return (
        <div className={`border border-gray-300 p-2 rounded mb-2 ${spacing}`}>
          <div className="font-bold text-xs">Customer Name</div>
          <div className="text-xs text-gray-600">456 Client Ave, City</div>
          <div className="text-xs text-gray-600">NTN: 7654321</div>
        </div>
      );
    
    case 'invoice-details':
      return (
        <div className={`bg-gray-100 p-2 rounded mb-2 ${spacing}`}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><strong>Date:</strong> 11/11/2025</div>
            <div><strong>Type:</strong> Standard</div>
          </div>
        </div>
      );
    
    case 'items-table':
      return (
        <table className="w-full border border-gray-300 mb-2 text-xs">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 p-1 text-left">Item</th>
              <th className="border border-gray-300 p-1 text-right">Qty</th>
              <th className="border border-gray-300 p-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-1">Product A</td>
              <td className="border border-gray-300 p-1 text-right">5</td>
              <td className="border border-gray-300 p-1 text-right">500</td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-1">Product B</td>
              <td className="border border-gray-300 p-1 text-right">3</td>
              <td className="border border-gray-300 p-1 text-right">300</td>
            </tr>
          </tbody>
        </table>
      );
    
    case 'totals':
      return (
        <div className={`border-t-2 border-gray-300 pt-2 mb-2 ${spacing}`}>
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal:</span>
            <span className="font-bold">PKR 800</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>Tax (18%):</span>
            <span className="font-bold">PKR 144</span>
          </div>
          <div className="flex justify-between text-xs font-bold border-t border-gray-300 pt-1">
            <span>Total:</span>
            <span>PKR 944</span>
          </div>
        </div>
      );
    
    case 'qr-code':
      return (
        <div className="text-center mb-2">
          <div className="w-12 h-12 bg-gray-200 border border-gray-400 mx-auto"></div>
          <div className="text-xs text-gray-600 mt-1">QR Code</div>
        </div>
      );
    
    case 'notes':
      return (
        <div className={`bg-gray-50 border border-gray-300 p-2 rounded mb-2 ${spacing}`}>
          <div className="text-xs font-bold mb-1">Notes:</div>
          <div className="text-xs text-gray-600">Payment terms and conditions...</div>
        </div>
      );
    
    case 'footer':
      return (
        <div className={`${getColorClass()} p-2 rounded text-center mb-2`}>
          <div className="text-xs">Thank you for your business!</div>
        </div>
      );
    
    case 'spacer':
      return <div className="h-4 mb-2"></div>;
    
    default:
      return null;
  }
}
