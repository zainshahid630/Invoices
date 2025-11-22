# Bulk Invoice Printing Feature ✅

## Overview
Professional bulk invoice selection and printing functionality for `/seller/invoices` page. Now uses your selected template from settings for detailed printing!

## Features

### 1. Multi-Select Invoices
- **Checkbox Selection**: Each invoice row has a checkbox for individual selection
- **Select All**: Header checkbox to select/deselect all invoices on current page
- **Visual Feedback**: Selected rows are highlighted with blue background
- **Selection Counter**: Shows count of selected invoices in header and subtitle

### 2. Print Options

#### Option 1: Ledger View (Summary)
**Route**: `/seller/invoices/bulk-print/ledger`

**Features**:
- All invoices printed on single page as a table
- Compact ledger format for quick overview
- No item details included

**Columns**:
- Invoice Number
- Date
- Business Name
- NTN/CNIC
- FBR Invoice Number
- PO Number
- Subtotal
- Total Amount

**Use Case**: Quick reference, accounting records, summary reports

#### Option 2: Detailed View (Full Invoices)
**Route**: Loads individual `/seller/invoices/[id]/print` pages in hidden iframes

**Features**:
- Each invoice printed automatically one by one
- Uses your selected template from settings (Modern, Excel, Letterhead, or Classic)
- Full invoice template with all details
- Includes all line items
- Company letterhead and branding
- Professional formatting
- QR codes for FBR verification

**Smart Printing**:
- Stays on the same page - no new tabs
- Shows real-time progress overlay
- Displays current invoice being printed
- Progress bar with percentage
- Auto-triggers print dialog for each invoice
- 1 second delay between prints for smooth operation

**User Experience**:
- User stays on invoice list page
- Beautiful progress modal with animation
- Shows which invoice is currently printing
- Warning to not close window during printing
- Automatic cleanup after completion

**Use Case**: Customer copies, detailed records, official documentation

### 3. User Interface

#### Selection Mode
- Clear visual indication when invoices are selected
- Blue info banner showing selection count
- "Clear Selection" button to deselect all
- "Print Selected" button with count badge

#### Print Modal
- Professional modal with two clear options
- Icon-based visual distinction
- Descriptive text for each option
- Loading states during print preparation
- Cancel option

### 4. Workflow

1. **Select Invoices**
   - Click checkboxes next to desired invoices
   - Or use "Select All" for bulk selection
   - Selection count updates in real-time

2. **Initiate Print**
   - Click "Print Selected" button
   - Modal appears with two print options

3. **Choose Format**
   - Click "Print Ledger" for summary view
   - Click "Print Detailed" for full invoices

4. **Print Preview**
   - New tab opens with formatted invoices
   - Auto-triggers print dialog
   - Option to go back without printing

## Technical Implementation

### Components Created
1. `BulkPrintModal.tsx` - Print options modal
2. `bulk-print/ledger/page.tsx` - Ledger view page
3. Reuses existing `[id]/print/page.tsx` for detailed printing via hidden iframes
4. Progress overlay UI in invoices page

### State Management
```typescript
const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
const [showBulkPrintModal, setShowBulkPrintModal] = useState(false);
```

### Key Functions
- `handleSelectAll()` - Toggle all invoices
- `handleSelectInvoice()` - Toggle individual invoice
- `handleBulkPrint()` - Orchestrates bulk printing with progress
- `printInvoiceInIframe()` - Loads and prints individual invoice in hidden iframe

### Print Optimization
- CSS print media queries for clean output
- Page break controls for multi-page prints
- No-print classes for UI elements
- Auto-trigger print dialog

## User Experience

### Visual Feedback
✓ Selected rows highlighted in blue
✓ Checkbox states synchronized
✓ Real-time selection counter
✓ Loading spinners during operations
✓ Progress bar for detailed printing

### Professional Touch
✓ Clean, modern UI design
✓ Icon-based visual communication
✓ Smooth transitions and animations
✓ Responsive layout
✓ Print-optimized output

## Usage Tips

1. **Quick Ledger**: Select multiple invoices and print ledger for accounting
2. **Customer Copies**: Select specific invoices and print detailed for customers
3. **Batch Processing**: Use select all for end-of-month reporting
4. **Selective Printing**: Mix and match invoices from different dates/customers

## Browser Compatibility
- Works in all modern browsers
- Print dialog is browser-native
- Responsive design for different screen sizes
- Print preview available in all browsers
