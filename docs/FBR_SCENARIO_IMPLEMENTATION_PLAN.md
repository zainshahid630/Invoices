# FBR Scenario-Based Dynamic Form Implementation Plan

## 📋 Overview

This document outlines the changes required to implement dynamic form fields based on FBR scenarios in the Create/Edit Invoice pages. The implementation will show/hide fields based on the selected scenario without disrupting existing functionality.

## 🎯 Objectives

1. **Dynamic Field Visibility** - Show only relevant fields for each FBR scenario
2. **Scenario-Specific Validation** - Validate required fields per scenario
3. **Better UX** - Reduce form complexity by hiding unnecessary fields
4. **FBR Compliance** - Ensure all 28 FBR scenarios are properly supported
5. **Backward Compatibility** - Don't break existing invoices

## 📁 Files Already Created

### ✅ Configuration File
- **File**: `lib/fbr-scenario-config.ts`
- **Status**: Complete
- **Contains**:
  - Configuration for all 28 FBR scenarios
  - Field visibility rules (required/optional/hidden)
  - Helper functions for field checks
  - Scenario-specific sale types

## 🔧 Changes Required

### 1. Update Invoice Form Pages

#### A. New Invoice Page (`app/seller/invoices/new/page.tsx`)

**Changes Needed:**

1. **Import Configuration**
```typescript
import { 
  shouldShowField, 
  isFieldRequired, 
  getDefaultSaleType,
  getAllowedSaleTypes,
  getScenarioDescription 
} from '@/lib/fbr-scenario-config';
```

2. **Add State for Scenario**
```typescript
const [selectedScenario, setSelectedScenario] = useState('SN001');
```

3. **Update Scenario Selection Handler**
```typescript
const handleScenarioChange = (scenario: string) => {
  setSelectedScenario(scenario);
  
  // Auto-set sale type based on scenario
  const defaultSaleType = getDefaultSaleType(scenario);
  setFormData({ ...formData, scenario, sale_type: defaultSaleType });
  
  // Show scenario description
  toast.info('Scenario Selected', getScenarioDescription(scenario));
};
```

4. **Add Advanced Fields Section** (Collapsible)
```typescript
const [showAdvancedFields, setShowAdvancedFields] = useState(false);
```

5. **Conditional Field Rendering**

Add these new fields in an "Advanced Fields" section:

```typescript
{/* Advanced Fields - Show based on scenario */}
{showAdvancedFields && (
  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
    <h3 className="text-lg font-semibold mb-4">Advanced Fields (Scenario-Specific)</h3>
    
    {/* SRO Schedule Number */}
    {shouldShowField(selectedScenario, 'sroScheduleNo') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SRO Schedule No {isFieldRequired(selectedScenario, 'sroScheduleNo') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={formData.sroScheduleNo || ''}
          onChange={(e) => setFormData({ ...formData, sroScheduleNo: e.target.value })}
          required={isFieldRequired(selectedScenario, 'sroScheduleNo')}
          placeholder="e.g., EIGHTH SCHEDULE Table 1"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
    
    {/* SRO Item Serial No */}
    {shouldShowField(selectedScenario, 'sroItemSerialNo') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          SRO Item Serial No {isFieldRequired(selectedScenario, 'sroItemSerialNo') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="text"
          value={formData.sroItemSerialNo || ''}
          onChange={(e) => setFormData({ ...formData, sroItemSerialNo: e.target.value })}
          required={isFieldRequired(selectedScenario, 'sroItemSerialNo')}
          placeholder="e.g., 82"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
    
    {/* Fixed/Notified Value or Retail Price */}
    {shouldShowField(selectedScenario, 'fixedNotifiedValueOrRetailPrice') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fixed/Notified Value or Retail Price {isFieldRequired(selectedScenario, 'fixedNotifiedValueOrRetailPrice') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.fixedNotifiedValueOrRetailPrice || ''}
          onChange={(e) => setFormData({ ...formData, fixedNotifiedValueOrRetailPrice: e.target.value })}
          required={isFieldRequired(selectedScenario, 'fixedNotifiedValueOrRetailPrice')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
    
    {/* Sales Tax Withheld at Source */}
    {shouldShowField(selectedScenario, 'salesTaxWithheldAtSource') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sales Tax Withheld at Source {isFieldRequired(selectedScenario, 'salesTaxWithheldAtSource') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.salesTaxWithheldAtSource || ''}
          onChange={(e) => setFormData({ ...formData, salesTaxWithheldAtSource: e.target.value })}
          required={isFieldRequired(selectedScenario, 'salesTaxWithheldAtSource')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
    
    {/* FED Payable */}
    {shouldShowField(selectedScenario, 'fedPayable') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          FED Payable {isFieldRequired(selectedScenario, 'fedPayable') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.fedPayable || ''}
          onChange={(e) => setFormData({ ...formData, fedPayable: e.target.value })}
          required={isFieldRequired(selectedScenario, 'fedPayable')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
    
    {/* Discount */}
    {shouldShowField(selectedScenario, 'discount') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Discount {isFieldRequired(selectedScenario, 'discount') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.discount || ''}
          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
          required={isFieldRequired(selectedScenario, 'discount')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
    
    {/* Extra Tax */}
    {shouldShowField(selectedScenario, 'extraTax') && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Extra Tax {isFieldRequired(selectedScenario, 'extraTax') && <span className="text-red-500">*</span>}
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.extraTax || ''}
          onChange={(e) => setFormData({ ...formData, extraTax: e.target.value })}
          required={isFieldRequired(selectedScenario, 'extraTax')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    )}
  </div>
)}

{/* Toggle Button for Advanced Fields */}
<button
  type="button"
  onClick={() => setShowAdvancedFields(!showAdvancedFields)}
  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
>
  {showAdvancedFields ? '▼ Hide' : '▶ Show'} Advanced Fields (Scenario-Specific)
</button>
```

6. **Update Sale Type Dropdown**
```typescript
{/* Sale Type - Filter based on scenario */}
<select
  value={formData.sale_type}
  onChange={(e) => setFormData({ ...formData, sale_type: e.target.value })}
  required
  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
>
  {(() => {
    const allowedTypes = getAllowedSaleTypes(selectedScenario);
    const typesToShow = allowedTypes || transactionTypes.map(t => t.transactioN_DESC);
    
    return typesToShow.map((type, index) => (
      <option key={index} value={type}>{type}</option>
    ));
  })()}
</select>
```

7. **Add Scenario Info Banner**
```typescript
{/* Scenario Information */}
{selectedScenario && (
  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-blue-700">
          <strong>{selectedScenario}:</strong> {getScenarioDescription(selectedScenario)}
        </p>
      </div>
    </div>
  </div>
)}
```

#### B. Edit Invoice Page (`app/seller/invoices/[id]/edit/page.tsx`)

**Same changes as New Invoice Page**, plus:

1. **Load Scenario from Existing Invoice**
```typescript
useEffect(() => {
  if (invoice) {
    setSelectedScenario(invoice.scenario || 'SN001');
  }
}, [invoice]);
```

### 2. Update Database Schema (Optional)

**Add new columns to `invoice_items` table** (if storing per-item):

```sql
-- Add advanced FBR fields to invoice_items
ALTER TABLE invoice_items 
ADD COLUMN IF NOT EXISTS sro_schedule_no VARCHAR(255),
ADD COLUMN IF NOT EXISTS sro_item_serial_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS fixed_notified_value_or_retail_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_tax_withheld_at_source DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fed_payable DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_tax DECIMAL(10, 2) DEFAULT 0;
```

**Or add to `invoices` table** (if storing at invoice level):

```sql
-- Add advanced FBR fields to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS sro_schedule_no VARCHAR(255),
ADD COLUMN IF NOT EXISTS sro_item_serial_no VARCHAR(100),
ADD COLUMN IF NOT EXISTS fixed_notified_value_or_retail_price DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_tax_withheld_at_source DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fed_payable DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS extra_tax DECIMAL(10, 2) DEFAULT 0;
```

### 3. Update API Routes

#### A. Create Invoice API (`app/api/seller/invoices/route.ts`)

**Add validation for scenario-specific fields:**

```typescript
import { isFieldRequired } from '@/lib/fbr-scenario-config';

// In POST handler, add validation
const scenario = body.scenario || 'SN001';

// Validate required fields based on scenario
if (isFieldRequired(scenario, 'sroScheduleNo') && !body.sroScheduleNo) {
  return NextResponse.json(
    { error: `SRO Schedule No is required for scenario ${scenario}` },
    { status: 400 }
  );
}

if (isFieldRequired(scenario, 'sroItemSerialNo') && !body.sroItemSerialNo) {
  return NextResponse.json(
    { error: `SRO Item Serial No is required for scenario ${scenario}` },
    { status: 400 }
  );
}

// ... add more validations
```

#### B. Update Invoice API (`app/api/seller/invoices/[id]/route.ts`)

**Same validation as Create API**

### 4. Update FBR Payload Generation

**File**: `app/api/seller/invoices/[id]/fbr-payload/route.ts`

**Include advanced fields in FBR payload:**

```typescript
const items = invoice.items.map((item: any) => ({
  hsCode: item.hs_code || '',
  productDescription: item.item_name,
  rate: `${invoice.sales_tax_rate}%`,
  uoM: item.uom || 'Numbers, pieces, units',
  quantity: parseFloat(item.quantity),
  valueSalesExcludingST: parseFloat(item.unit_price) * parseFloat(item.quantity),
  salesTaxApplicable: (parseFloat(item.unit_price) * parseFloat(item.quantity) * invoice.sales_tax_rate) / 100,
  saleType: item.sale_type || 'Goods at standard rate (default)',
  
  // Add advanced fields
  sroScheduleNo: invoice.sro_schedule_no || '',
  sroItemSerialNo: invoice.sro_item_serial_no || '',
  fixedNotifiedValueOrRetailPrice: parseFloat(invoice.fixed_notified_value_or_retail_price || '0'),
  salesTaxWithheldAtSource: parseFloat(invoice.sales_tax_withheld_at_source || '0'),
  fedPayable: parseFloat(invoice.fed_payable || '0'),
  discount: parseFloat(invoice.discount || '0'),
  extraTax: parseFloat(invoice.extra_tax || '0'),
  furtherTax: parseFloat(invoice.further_tax_amount || '0'),
  totalValues: 0,
}));
```

### 5. Update TypeScript Interfaces

**File**: `types/invoice.ts` (create if doesn't exist)

```typescript
export interface InvoiceFormData {
  // Existing fields
  invoice_number: string;
  invoice_date: string;
  scenario: string;
  // ... other existing fields
  
  // New advanced fields
  sroScheduleNo?: string;
  sroItemSerialNo?: string;
  fixedNotifiedValueOrRetailPrice?: number;
  salesTaxWithheldAtSource?: number;
  fedPayable?: number;
  discount?: number;
  extraTax?: number;
}
```

## 📊 Implementation Phases

### Phase 1: Foundation (Week 1)
- ✅ Create scenario configuration file (DONE)
- ⏳ Add database columns
- ⏳ Update TypeScript interfaces

### Phase 2: UI Updates (Week 2)
- ⏳ Update New Invoice page with conditional fields
- ⏳ Update Edit Invoice page with conditional fields
- ⏳ Add scenario info banner
- ⏳ Add advanced fields toggle

### Phase 3: Backend Updates (Week 3)
- ⏳ Update API validation
- ⏳ Update FBR payload generation
- ⏳ Add scenario-specific error messages

### Phase 4: Testing (Week 4)
- ⏳ Test all 28 scenarios
- ⏳ Test field visibility
- ⏳ Test validation
- ⏳ Test FBR submission
- ⏳ Test backward compatibility

### Phase 5: Documentation & Training (Week 5)
- ⏳ Update user documentation
- ⏳ Create scenario guide
- ⏳ Train users on new fields

## 🎨 UI/UX Improvements

### Scenario Selection Enhancement

```typescript
{/* Enhanced Scenario Dropdown with Search */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Scenario ID <span className="text-red-500">*</span>
  </label>
  <select
    value={formData.scenario}
    onChange={(e) => handleScenarioChange(e.target.value)}
    required
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  >
    <option value="">-- Select Scenario --</option>
    {Object.entries(FBR_SCENARIO_CONFIGS).map(([id, config]) => (
      <option key={id} value={id}>
        {id} - {config.description}
      </option>
    ))}
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Select the FBR scenario that matches your transaction type
  </p>
</div>
```

### Field Grouping

Group related fields together:
- **Basic Information** (always visible)
- **Tax Information** (always visible)
- **Advanced FBR Fields** (collapsible, scenario-based)

### Tooltips

Add helpful tooltips for complex fields:
```typescript
<div className="flex items-center gap-2">
  <label>SRO Schedule No</label>
  <span className="text-gray-400 cursor-help" title="Enter the SRO Schedule reference as per FBR requirements">
    ⓘ
  </span>
</div>
```

## ⚠️ Important Considerations

### 1. Backward Compatibility
- Existing invoices without advanced fields should still work
- Default values for new fields should be 0 or empty string
- Old invoices should display correctly

### 2. Data Migration
- No migration needed for existing invoices
- New fields are optional by default
- Only required when creating new invoices with specific scenarios

### 3. Performance
- Configuration is loaded once (no API calls)
- Field visibility is calculated client-side
- No performance impact on existing functionality

### 4. User Training
- Create a scenario selection guide
- Add in-app help text
- Provide examples for each scenario

## 📝 Testing Checklist

- [ ] All 28 scenarios load correctly
- [ ] Fields show/hide based on scenario
- [ ] Required field validation works
- [ ] Sale type filters correctly
- [ ] Advanced fields save to database
- [ ] FBR payload includes all fields
- [ ] Existing invoices still work
- [ ] Edit invoice preserves scenario
- [ ] Print templates work with new fields
- [ ] API validation catches missing required fields

## 🚀 Deployment Steps

1. **Database Migration**
   ```bash
   # Run migration SQL
   psql -h <host> -U postgres -d postgres -f database/migrations/add-fbr-advanced-fields.sql
   ```

2. **Deploy Code**
   ```bash
   npm run build
   npm run start
   ```

3. **Verify**
   - Test scenario selection
   - Create test invoice for each scenario type
   - Verify FBR submission

## 📚 Additional Resources

- **FBR Test Scenarios**: `app/seller/fbr-sandbox/testScenarios.ts`
- **Scenario Config**: `lib/fbr-scenario-config.ts`
- **FBR Reference Data**: `lib/fbr-reference-data.ts`

## 💡 Future Enhancements

1. **Scenario Templates** - Pre-fill common scenarios
2. **Bulk Import** - Import invoices with scenario data
3. **Scenario Analytics** - Track which scenarios are used most
4. **Smart Defaults** - Learn from user patterns
5. **Scenario Validation** - Real-time FBR validation per scenario

---

**Status**: Ready for Implementation  
**Priority**: Medium  
**Estimated Effort**: 4-5 weeks  
**Dependencies**: None  
**Risk Level**: Low (backward compatible)
