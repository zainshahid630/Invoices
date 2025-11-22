# Customers Table Structure & Data Safety

## Database Schema

### Customers Table Structure
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  address TEXT,
  ntn_cnic VARCHAR(50),
  gst_number VARCHAR(50),
  phone VARCHAR(20),
  province VARCHAR(100),
  registration_type VARCHAR(50) DEFAULT 'Unregistered',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes for Performance
- `idx_customers_company` - Fast lookup by company_id
- `idx_customers_active` - Fast filtering by active status
- `idx_customers_registration_type` - Fast filtering by registration type
- `idx_customers_phone` - Fast search by phone number

## Data Safety Features

### 1. Company Isolation
- Each customer is linked to a specific `company_id`
- Customers from one company cannot be accessed by another company
- Enforced at API level with company_id validation

### 2. Duplicate Prevention
The system prevents duplicates at multiple levels:

#### During Single Customer Creation:
- **NTN/CNIC Uniqueness**: Checks if NTN already exists for the company
- **GST Number Uniqueness**: Checks if GST number already exists for the company
- Returns error with field name if duplicate found

#### During Bulk Import:
- **Existing Database Check**: Compares against all existing customers
- **Batch Deduplication**: Prevents duplicates within the import batch itself
- **Skips Duplicates**: Only skips the duplicate, continues importing valid customers

### 3. Referential Integrity
- **Cascade Delete**: When a company is deleted, all its customers are deleted
- **Invoice Protection**: Cannot delete customers with existing invoices
- **Soft Delete Alternative**: Can deactivate customers instead (is_active = false)

### 4. Data Validation

#### Required Fields:
- `company_id` - Must be valid UUID
- `name` - Customer name (required)

#### Optional Fields:
- `business_name` - Defaults to customer name if not provided
- `ntn_cnic` - NTN or CNIC number
- `gst_number` - GST registration number
- `phone` - Contact phone number
- `address` - Physical address
- `province` - Province/state
- `registration_type` - 'Registered' or 'Unregistered' (default)

## Import Process Flow

### Step 1: Data Parsing
```javascript
// Accepts multiple JSON formats:
// 1. Simple array: [{ name: "...", ... }]
// 2. PHPMyAdmin export: [{ type: "table", data: [...] }]
// 3. Nested object: { customers: [...] }
```

### Step 2: Duplicate Detection
```javascript
// Checks against:
1. Existing customers in database (by NTN, GST, Name)
2. Other customers in the same import batch
3. Case-insensitive name matching
```

### Step 3: Batch Processing
```javascript
// Processes in batches of 100 customers
// Continues even if one batch fails
// Returns detailed results:
{
  total: 100,
  imported: 85,
  skipped: 15,
  errors: [
    { row: 3, name: "ABC Corp", reason: "Duplicate NTN" },
    { row: 7, name: "XYZ Ltd", reason: "Duplicate GST" }
  ]
}
```

### Step 4: Result Reporting
- Success count
- Skipped count with reasons
- Error details for each skipped customer

## API Endpoints

### GET /api/seller/customers
- Lists all customers for a company
- Supports pagination (page, limit)
- Supports search (name, business_name, ntn_cnic, gst_number)
- Supports filtering (active, inactive, all)

### POST /api/seller/customers
- Creates a single customer
- Validates duplicates (NTN, GST)
- Checks subscription status

### GET /api/seller/customers/[id]
- Retrieves single customer details
- Validates company ownership

### PATCH /api/seller/customers/[id]
- Updates customer information
- Validates duplicates (excluding current customer)
- Updates updated_at timestamp

### DELETE /api/seller/customers/[id]
- Deletes customer if no invoices exist
- Returns error if customer has invoices
- Suggests deactivation instead

### POST /api/seller/customers/import
- Bulk imports customers from JSON
- Skips duplicates automatically
- Processes in batches of 100
- Returns detailed import results

## Security Features

### Row Level Security (RLS)
- Currently disabled for performance
- Can be enabled for additional security layer

### API Level Security
- All endpoints require company_id
- Validates company ownership on every request
- Prevents cross-company data access

### Subscription Checks
- Validates active subscription before creating customers
- Returns subscription status if expired

## Data Migration

### From Old System
1. Export customers as JSON from old system
2. Use import function on Customers page
3. System automatically:
   - Maps old field names (ntn_number → ntn_cnic)
   - Detects duplicates
   - Imports valid customers
   - Reports skipped customers

### Supported Import Formats
```json
// Format 1: Simple Array
[
  {
    "name": "Customer Name",
    "business_name": "Business Name",
    "ntn_number": "1234567-8",
    "gst_number": "01-23-4567-890-12",
    "address": "Address",
    "phone_number": "03001234567"
  }
]

// Format 2: PHPMyAdmin Export
[
  { "type": "header", "version": "5.2.2" },
  { "type": "database", "name": "db_name" },
  { 
    "type": "table", 
    "name": "customers",
    "data": [
      { "name": "...", ... }
    ]
  }
]
```

## Best Practices

### 1. Data Entry
- Always provide NTN/CNIC for registered customers
- Include GST number for tax-registered customers
- Add phone numbers for WhatsApp integration
- Use consistent naming conventions

### 2. Duplicate Management
- Check for existing customers before import
- Review skipped customers report after import
- Update existing customers instead of creating duplicates

### 3. Data Maintenance
- Deactivate instead of deleting customers with invoices
- Keep customer information up to date
- Regularly review inactive customers

### 4. Performance
- Use pagination for large customer lists
- Use search filters to find specific customers
- Import in batches (system handles automatically)

## Troubleshooting

### Import Issues
**Problem**: All customers skipped
- **Solution**: Check if customers already exist in database

**Problem**: Some customers skipped
- **Solution**: Review errors array in import results for specific reasons

**Problem**: Import fails completely
- **Solution**: Validate JSON format, check subscription status

### Duplicate Detection
**Problem**: False duplicate detection
- **Solution**: Check if NTN/GST/Name already exists (case-insensitive)

**Problem**: Duplicates not detected
- **Solution**: Ensure NTN/GST fields are populated correctly

## Database Maintenance

### Regular Tasks
1. Review inactive customers monthly
2. Clean up test data
3. Verify customer information accuracy
4. Update phone numbers for WhatsApp

### Backup Recommendations
- Regular database backups (handled by Supabase)
- Export customer list periodically
- Keep audit trail of changes

## Future Enhancements
- Customer groups/categories
- Credit limit tracking
- Payment terms
- Customer notes/history
- Email addresses
- Multiple contact persons
- Customer portal access
