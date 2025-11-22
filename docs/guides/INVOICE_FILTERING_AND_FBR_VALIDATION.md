# Invoice Filtering and FBR Validation Features

## Overview
Enhanced the `/seller/invoices` page with comprehensive filtering options, bulk printing, and FBR validation capabilities.

## New Features

### 1. Advanced Filtering Options

#### Available Filters:
- **Search**: Search by invoice number or customer name
- **Status**: Filter by invoice status (Draft, FBR Posted, Verified, Paid)
- **Buyer Name**: Filter by buyer/customer name
- **Date Range**: Filter invoices between specific dates (Date From / Date To)
- **Invoice Number Range**: Filter by invoice number range (Invoice # From / Invoice # To)

#### Filter Actions:
- **Clear All Filters**: Reset all filters to default
- **Print Filtered**: Print all invoices matching current filters
- **Validate Filtered**: Validate all filtered invoices with FBR

### 2. Bulk Operations

#### Print Options:
1. **Print Selected**: Print manually selected invoices
2. **Print Today's Invoices**: Print all invoices created today
3. **Print Filtered Invoices**: Print all invoices matching current filters

#### FBR Validation Options:
1. **Validate Selected**: Validate manually selected invoices with FBR
2. **Validate Today's Invoices**: Validate all today's invoices with FBR
3. **Validate Filtered Invoices**: Validate all filtered invoices with FBR

### 3. Smart Pagination Handling

When printing or validating filtered invoices:
- If filtered results exceed current page, system prompts user
- Option to process ALL filtered invoices or just current page
- Automatic fetching of all filtered invoice IDs when needed

### 4. Visual Feedback

#### Info Banners:
- **Selection Banner**: Shows when invoices are manually selected
- **Filtered Banner**: Shows when filters are active, displays total filtered count

#### Filter Section:
- Shows active filter count
- Quick access to Print/Validate filtered invoices
- Clear all filters button

## Usage Examples

### Example 1: Print All Invoices for a Specific Customer
1. Enter customer name in "Buyer Name" filter
2. Click "Print Filtered" button in filter section
3. Choose print format (Ledger or Detailed)

### Example 2: Validate All Draft Invoices from Last Month
1. Set "Status" to "Draft"
2. Set "Date From" to first day of last month
3. Set "Date To" to last day of last month
4. Click "Validate Filtered" button
5. Review validation results

### Example 3: Print Invoice Range
1. Enter starting invoice number in "Invoice # From" (e.g., INV001)
2. Enter ending invoice number in "Invoice # To" (e.g., INV100)
3. Click "Print Filtered" button
4. Select print format

### Example 4: Today's Operations
1. Click "Print Today's Invoices" - prints all invoices created today
2. Click "Validate Today's with FBR" - validates all today's invoices

## API Endpoints

### GET /api/seller/invoices
Enhanced with new query parameters:
- `date_from`: Filter invoices from this date
- `date_to`: Filter invoices until this date
- `buyer`: Filter by buyer name (partial match)
- `invoice_number_from`: Filter from this invoice number
- `invoice_number_to`: Filter to this invoice number

### POST /api/seller/invoices/bulk-validate-fbr
Validates multiple invoices with FBR:
- **Request**: `{ company_id, invoice_ids[] }`
- **Response**: Validation results for each invoice

## Database Schema

### New Fields in `invoices` table:
- `fbr_invoice_number`: FBR-assigned invoice number
- `verified_at`: Timestamp of FBR verification
- `fbr_response`: Full JSON response from FBR API

Run migration: `database/ADD_FBR_FIELDS.sql`

## Components

### New Components:
1. **FBRValidationModal** (`app/seller/components/FBRValidationModal.tsx`)
   - Handles bulk FBR validation
   - Shows progress and results
   - Displays success/failure for each invoice

### Enhanced Components:
1. **InvoicesPage** (`app/seller/invoices/page.tsx`)
   - Advanced filtering UI
   - Bulk operation buttons
   - Smart pagination handling

## FBR Integration

### Current Implementation:
The FBR validation is currently a **mock implementation** for demonstration purposes.

### To Integrate Real FBR API:
1. Open `app/api/seller/invoices/bulk-validate-fbr/route.ts`
2. Replace the `validateWithFBR()` function with actual FBR API calls
3. Update the function to:
   - Send invoice data to FBR API
   - Handle FBR response
   - Parse FBR invoice number
   - Handle errors appropriately

Example structure:
```typescript
async function validateWithFBR(invoice: any) {
  try {
    const response = await fetch('FBR_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FBR_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Map invoice data to FBR format
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        buyer_ntn: invoice.buyer_ntn_cnic,
        total_amount: invoice.total_amount,
        // ... other required fields
      }),
    });

    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        fbr_invoice_number: data.fbr_invoice_number,
        message: 'Invoice validated successfully',
        verified_at: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        error: data.error_message,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
```

## User Interface

### Button Colors:
- **Blue**: Create new invoice
- **Green**: Print operations
- **Purple**: FBR validation operations
- **Orange**: Today's invoices print
- **Indigo**: Today's invoices validation
- **Gray**: Secondary actions (Clear, Deleted)

### Filter Section Layout:
- 3-column grid on large screens
- 2-column grid on medium screens
- 1-column on mobile
- Action buttons in header (Print/Validate filtered)

## Performance Considerations

1. **Debounced Search**: Search and buyer filters use 500ms debounce
2. **Pagination**: Default 10 items per page (configurable in settings)
3. **Bulk Operations**: Fetches all filtered IDs only when needed
4. **Progress Tracking**: Shows progress during bulk operations

## Security Notes

1. All operations require valid seller session
2. Company ID validation on all API calls
3. Only non-deleted invoices are processed
4. FBR validation requires proper authentication (to be implemented)

## Future Enhancements

1. Export filtered invoices to Excel/PDF
2. Save filter presets
3. Scheduled FBR validation
4. Email notifications for validation results
5. Batch invoice status updates
6. Advanced reporting on filtered data
