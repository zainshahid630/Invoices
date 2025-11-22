# Customer Import - Update Behavior

## Overview
The customer import function now **intelligently updates existing customers** instead of skipping them when duplicates are found.

## How It Works

### 1. Matching Priority
When importing a customer, the system checks for existing customers in this order:

1. **NTN/CNIC Match** (Highest Priority)
   - If NTN matches, update that customer
   
2. **GST Number Match** (Second Priority)
   - If no NTN match but GST matches, update that customer
   
3. **Name Match** (Lowest Priority)
   - If no NTN or GST match but name matches (case-insensitive), update that customer

4. **No Match** (New Customer)
   - If no matches found, create a new customer

### 2. Update Process

When a match is found:
```javascript
// Existing customer data is UPDATED with new data:
{
  name: "New Name",                    // ✅ Updated
  business_name: "New Business Name",  // ✅ Updated
  ntn_cnic: "1234567-8",              // ✅ Updated
  gst_number: "01-23-4567-890-12",    // ✅ Updated
  address: "New Address",              // ✅ Updated
  phone: "03001234567",                // ✅ Updated
  province: null,                      // ✅ Updated
  registration_type: "Registered",     // ✅ Updated
  is_active: true,                     // ✅ Updated
  updated_at: "2025-01-19T..."        // ✅ Auto-updated
}
```

### 3. Import Results

The import now returns three categories:

```javascript
{
  total: 100,        // Total customers in import file
  imported: 60,      // New customers created
  updated: 35,       // Existing customers updated
  skipped: 5,        // Duplicates within batch or errors
  errors: [...]      // Details of skipped customers
}
```

## Examples

### Example 1: Update by NTN Match

**Existing Customer:**
```json
{
  "id": "abc-123",
  "name": "Old Company Name",
  "ntn_cnic": "1234567-8",
  "address": "Old Address",
  "phone": null
}
```

**Import Data:**
```json
{
  "name": "New Company Name",
  "ntn_number": "1234567-8",
  "address": "New Address",
  "phone_number": "03001234567"
}
```

**Result:** ✅ Customer updated with new data
```json
{
  "id": "abc-123",
  "name": "New Company Name",        // ✅ Updated
  "ntn_cnic": "1234567-8",          // Same
  "address": "New Address",          // ✅ Updated
  "phone": "03001234567"             // ✅ Updated
}
```

### Example 2: Update by GST Match (No NTN)

**Existing Customer:**
```json
{
  "id": "xyz-456",
  "name": "ABC Corp",
  "gst_number": "01-23-4567-890-12",
  "address": "Old Address"
}
```

**Import Data:**
```json
{
  "name": "ABC Corporation",
  "gst_number": "01-23-4567-890-12",
  "address": "New Corporate Office"
}
```

**Result:** ✅ Customer updated
```json
{
  "id": "xyz-456",
  "name": "ABC Corporation",         // ✅ Updated
  "gst_number": "01-23-4567-890-12", // Same
  "address": "New Corporate Office"  // ✅ Updated
}
```

### Example 3: Update by Name Match (No NTN or GST)

**Existing Customer:**
```json
{
  "id": "def-789",
  "name": "XYZ Traders",
  "address": "Old Location"
}
```

**Import Data:**
```json
{
  "name": "XYZ Traders",
  "address": "New Location",
  "phone_number": "03009876543"
}
```

**Result:** ✅ Customer updated
```json
{
  "id": "def-789",
  "name": "XYZ Traders",             // Same
  "address": "New Location",         // ✅ Updated
  "phone": "03009876543"             // ✅ Updated
}
```

### Example 4: New Customer (No Match)

**Import Data:**
```json
{
  "name": "Brand New Company",
  "ntn_number": "9999999-9",
  "address": "New Address"
}
```

**Result:** ✅ New customer created
```json
{
  "id": "new-uuid",
  "name": "Brand New Company",
  "ntn_cnic": "9999999-9",
  "address": "New Address",
  "is_active": true
}
```

### Example 5: Duplicate in Batch (Skipped)

**Import Data:**
```json
[
  {
    "name": "Company A",
    "ntn_number": "1111111-1"
  },
  {
    "name": "Company A Updated",
    "ntn_number": "1111111-1"  // Same NTN in same batch
  }
]
```

**Result:**
- First entry: ✅ Processed (created or updated)
- Second entry: ⚠️ Skipped (duplicate in batch)

## Benefits

### 1. Data Synchronization
- Keep customer data up-to-date from external systems
- Automatically sync changes from old system to new system

### 2. No Manual Cleanup
- No need to delete old customers before importing
- No need to manually update changed information

### 3. Safe Migration
- Import multiple times without creating duplicates
- Each import updates existing data with latest information

### 4. Flexible Matching
- Works even if NTN is missing (uses GST or Name)
- Handles various data quality scenarios

## Use Cases

### Use Case 1: Initial Migration
```
1. Export all customers from old system
2. Import to new system
3. Result: All customers created
```

### Use Case 2: Incremental Updates
```
1. Customer data changes in old system
2. Export updated customers
3. Import to new system
4. Result: Existing customers updated with new data
```

### Use Case 3: Data Correction
```
1. Find errors in customer data
2. Correct in spreadsheet/old system
3. Re-import corrected data
4. Result: Errors fixed automatically
```

### Use Case 4: Merge Data Sources
```
1. Have customers in multiple systems
2. Export from each system
3. Import all to new system
4. Result: Duplicates merged, all data consolidated
```

## Important Notes

### ⚠️ Data Overwrite
- **All fields are overwritten** with new data
- If a field is empty in import, it will be set to null
- Keep complete data in import file to avoid data loss

### ✅ Safe Fields
- `id` - Never changes (preserved)
- `company_id` - Never changes (preserved)
- `created_at` - Never changes (preserved)
- `updated_at` - Automatically updated to current time

### 🔍 Matching Logic
- NTN matching is **case-sensitive**
- GST matching is **case-sensitive**
- Name matching is **case-insensitive**
- Whitespace is trimmed before matching

### 📊 Batch Processing
- Processes in batches of 100 customers
- Updates are processed before inserts
- Continues even if some updates fail

## Best Practices

### 1. Complete Data
Always include all fields in import:
```json
{
  "name": "Company Name",
  "business_name": "Full Business Name",
  "ntn_number": "1234567-8",
  "gst_number": "01-23-4567-890-12",
  "address": "Complete Address",
  "phone_number": "03001234567"
}
```

### 2. Consistent Identifiers
- Always include NTN if available
- Use consistent NTN format
- Include GST for registered customers

### 3. Test First
- Test with small batch first
- Review update results
- Then import full dataset

### 4. Backup Before Import
- Export current customers before large import
- Keep backup of import file
- Can restore if needed

## Troubleshooting

### Issue: Customers Not Updating
**Cause:** NTN/GST/Name doesn't match exactly
**Solution:** Check for typos, extra spaces, or case differences

### Issue: Wrong Customer Updated
**Cause:** Multiple customers with same name but different NTN
**Solution:** Ensure NTN is included in import data

### Issue: Some Updates Failed
**Cause:** Database constraint violation or invalid data
**Solution:** Check error details in import results

### Issue: Duplicate in Batch Error
**Cause:** Same NTN appears multiple times in import file
**Solution:** Remove duplicates from import file before importing

## API Response Example

```json
{
  "success": true,
  "message": "Successfully processed: 60 imported, 35 updated, 5 skipped.",
  "results": {
    "total": 100,
    "imported": 60,
    "updated": 35,
    "skipped": 5,
    "errors": [
      {
        "row": 15,
        "name": "Duplicate Company",
        "reason": "Duplicate in import batch"
      },
      {
        "row": 23,
        "name": "",
        "reason": "Missing customer name"
      }
    ]
  }
}
```

## Summary

The new import behavior makes customer data management much easier:

✅ **Smart Updates**: Automatically updates existing customers
✅ **No Duplicates**: Prevents duplicate entries
✅ **Flexible Matching**: Works with NTN, GST, or Name
✅ **Safe Migration**: Import multiple times without issues
✅ **Detailed Results**: Know exactly what happened

This allows you to:
- Migrate from old systems easily
- Keep data synchronized
- Fix errors by re-importing
- Merge data from multiple sources
