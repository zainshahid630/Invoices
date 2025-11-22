# Enhanced FBR Modal - Complete Guide

## Overview

The Enhanced FBR Modal provides a comprehensive, step-by-step process for validating and posting invoices to FBR with full transparency and control.

## Key Features

### 1. **Smart Filtering**
- Automatically skips invoices already posted to FBR
- Shows clear reason for skipped invoices
- Only processes eligible invoices

### 2. **Full Payload Preview**
- View complete FBR payload before sending
- Expandable JSON view for technical details
- Verify all data is correct

### 3. **Individual Confirmation**
- Confirm each invoice before processing
- Review invoice details
- Skip problematic invoices

### 4. **Error Handling**
- Continue processing after errors
- Skip failed invoices and proceed
- Stop processing at any time

### 5. **Progress Tracking**
- Real-time progress bar
- Current invoice indicator
- Success/failure counts

## User Flow

### Step 1: Loading
```
📊 Loading invoice details...
- Fetches all selected invoices
- Checks FBR posting status
- Filters out already-posted invoices (for post mode)
```

### Step 2: Review
```
📋 Ready to Process
- Shows list of invoices to process
- Displays skipped invoices (if any)
- "Start Processing" button
```

### Step 3: Confirm Each Invoice
```
Current Invoice Details:
- Invoice Number
- Date
- Buyer
- Amount

📄 FBR Payload Details (expandable)
- Full JSON payload
- All fields visible
- Verify before sending

Actions:
⏭️ Skip - Skip this invoice
⏹️ Stop - Stop processing all
✓ Confirm - Process this invoice
```

### Step 4: Processing
```
⏳ Processing with FBR
- Sends to FBR API
- Waits for response
- Moves to next invoice
```

### Step 5: Complete
```
✅ Processing Complete
- Total invoices
- Success count
- Failed count
- Skipped count
- Detailed results for each
```

## Usage Examples

### Example 1: Validate Selected Invoices

1. **Select Invoices**
   - Check boxes next to invoices
   - Or use "Select All" checkbox

2. **Click "Validate with FBR"**
   - Purple button appears when invoices selected

3. **Review List**
   - See all invoices to be validated
   - Click "Start Processing"

4. **Confirm Each**
   - Review invoice details
   - Expand payload to see FBR data
   - Click "✓ Confirm" to validate

5. **View Results**
   - See which invoices validated successfully
   - See any errors
   - Close when done

### Example 2: Post Selected Invoices

1. **Select Invoices**
   - Check boxes next to invoices

2. **Click "Post to FBR"**
   - Blue button appears when invoices selected

3. **Auto-Filter**
   - Already-posted invoices are skipped
   - Shows reason: "Already posted to FBR (FBR #: XXX)"

4. **Confirm Each**
   - Review invoice details
   - Verify FBR payload
   - Click "✓ Confirm" to post

5. **Get FBR Numbers**
   - Each successful post gets FBR invoice number
   - Saved to database automatically

### Example 3: Handle Errors

**Scenario:** One invoice fails validation

1. **Error Appears**
   ```
   ⚠️ Previous Invoice Failed
   Invalid Buyer NTN: NTN must have exactly 7 digits
   ```

2. **Choose Action**
   - **Skip**: Continue with next invoice
   - **Stop**: Stop all processing
   - **Confirm**: Try again (if you fixed the issue)

3. **Continue Processing**
   - Skipped invoice marked in results
   - Remaining invoices processed normally

## Button Locations

### Selected Invoices Actions
**Location:** Top of page (when invoices selected)

**Buttons:**
- 🖨️ **Print Selected** (Green)
- ✓ **Validate with FBR** (Purple) → Opens Enhanced Modal
- 📤 **Post to FBR** (Blue) → Opens Enhanced Modal

### Today's Invoices Actions
**Location:** Top of page (always visible)

**Buttons:**
- 🖨️ **Print Today's Invoices** (Orange)
- ✓ **Validate Today's with FBR** (Indigo)

## FBR Payload Structure

### What's Sent to FBR

```json
{
  "invoiceType": "Sale Invoice",
  "invoiceDate": "2025-01-19",
  "sellerNTNCNIC": "1234567",
  "sellerBusinessName": "Your Company",
  "sellerProvince": "Sindh",
  "sellerAddress": "Your Address",
  "buyerNTNCNIC": "0667440",
  "buyerBusinessName": "Customer Name",
  "buyerProvince": "Punjab",
  "buyerAddress": "Customer Address",
  "buyerRegistrationType": "Registered",
  "invoiceRefNo": "INV-001",
  "scenarioId": "SN001",
  "items": [
    {
      "hsCode": "0101.2100",
      "productDescription": "Product Name",
      "rate": "18%",
      "uoM": "Numbers, pieces, units",
      "quantity": 10,
      "totalValues": 1000,
      "valueSalesExcludingST": 1000,
      "salesTaxApplicable": 180,
      "furtherTax": 0,
      // ... other fields
    }
  ]
}
```

### NTN Normalization

**Automatic:** NTN numbers are normalized before sending

**Examples:**
- `066744-0` → `0667440` (6+1 digits)
- `1234567-8` → `1234567` (7 digits + check digit)
- `1234567` → `1234567` (already 7 digits)

## Skip Reasons

### Automatically Skipped

1. **Already Posted to FBR**
   ```
   Reason: Already posted to FBR (FBR #: 12345678)
   When: Post mode only
   Action: None needed, invoice already in FBR
   ```

### Manually Skipped

2. **User Skipped**
   ```
   Reason: Skipped by user
   When: User clicks "⏭️ Skip" button
   Action: Invoice not processed
   ```

3. **Processing Stopped**
   ```
   Reason: Processing stopped by user
   When: User clicks "⏹️ Stop" button
   Action: All remaining invoices skipped
   ```

## Error Messages

### Common Errors

1. **Invalid NTN**
   ```
   Error: Invalid Seller NTN: NTN must have exactly 7 digits
   Solution: Update company NTN in Settings
   ```

2. **Invalid Buyer NTN**
   ```
   Error: Invalid Buyer NTN: NTN must have 6 or 7 digits before hyphen
   Solution: Edit invoice and fix buyer NTN
   ```

3. **FBR API Error**
   ```
   Error: FBR validation failed with status 400
   Solution: Check FBR payload details, verify all fields
   ```

4. **Network Error**
   ```
   Error: Network error occurred
   Solution: Check internet connection, try again
   ```

## Progress Indicators

### Visual Feedback

1. **Progress Bar**
   ```
   Progress: 3 / 10
   [████████░░░░░░░░░░] 30%
   ```

2. **Current Invoice**
   ```
   Invoice 4 of 10
   INV-004 • Customer Name • Rs. 10,000
   ```

3. **Results Summary**
   ```
   Total: 10
   Success: 7
   Failed: 2
   Skipped: 1
   ```

## Best Practices

### Before Processing

1. **Review Invoices**
   - Check invoice details are correct
   - Verify NTN numbers are valid
   - Ensure all required fields filled

2. **Test First**
   - Use "Validate" before "Post"
   - Fix any validation errors
   - Then post to FBR

3. **Check Status**
   - Don't post already-posted invoices
   - System auto-filters, but good to check

### During Processing

1. **Review Payload**
   - Expand payload details
   - Verify all fields correct
   - Check NTN normalization

2. **Handle Errors**
   - Read error messages carefully
   - Skip problematic invoices
   - Fix issues later

3. **Don't Close**
   - Wait for processing to complete
   - Don't close browser/tab
   - Don't navigate away

### After Processing

1. **Review Results**
   - Check success count
   - Note failed invoices
   - Fix errors for failed ones

2. **Verify in System**
   - Check invoice status updated
   - Verify FBR numbers saved
   - Confirm in FBR portal

## Comparison: Old vs New Modal

### Old Modal (Bulk Validation)

❌ No payload preview
❌ No individual confirmation
❌ Can't skip invoices
❌ Can't stop mid-process
❌ No detailed error handling
✅ Fast for many invoices

### New Modal (Enhanced)

✅ Full payload preview
✅ Individual confirmation
✅ Skip problematic invoices
✅ Stop anytime
✅ Detailed error handling
✅ Better control and transparency
⚠️ Slower (requires confirmation)

## When to Use Each

### Use Old Modal (Bulk)
- Many invoices (50+)
- All invoices verified correct
- Quick batch processing
- Trust the data

### Use New Modal (Enhanced)
- Few invoices (< 20)
- Need to verify data
- First time posting
- Unsure about data quality
- Want full control

## Technical Details

### API Endpoints

1. **Get Payload Preview**
   ```
   GET /api/seller/invoices/[id]/fbr-payload?company_id=xxx
   Returns: FBR payload JSON
   ```

2. **Validate Invoice**
   ```
   POST /api/seller/invoices/[id]/validate-fbr?company_id=xxx
   Returns: Validation result
   ```

3. **Post Invoice**
   ```
   POST /api/seller/invoices/[id]/post-fbr?company_id=xxx
   Returns: FBR invoice number
   ```

### State Management

```typescript
States:
- loading: Fetching invoice details
- review: Showing invoice list
- confirm: Confirming current invoice
- processing: Sending to FBR
- complete: All done, showing results
```

### Data Flow

```
1. Load invoices → Filter → Review
2. For each invoice:
   - Load payload
   - Show confirmation
   - Wait for user action
   - Process if confirmed
   - Show result
3. Complete → Show summary
```

## Troubleshooting

### Issue: Modal Won't Open
**Cause:** No invoices selected
**Solution:** Select at least one invoice

### Issue: All Invoices Skipped
**Cause:** All already posted to FBR
**Solution:** Select different invoices

### Issue: Can't See Payload
**Cause:** Payload not loaded
**Solution:** Wait a moment, it loads automatically

### Issue: Processing Stuck
**Cause:** Network issue or FBR timeout
**Solution:** Close modal, check internet, try again

### Issue: Wrong Data in Payload
**Cause:** Invoice data incorrect
**Solution:** Close modal, edit invoice, try again

## Summary

The Enhanced FBR Modal provides:

✅ **Full Transparency** - See exactly what's sent to FBR
✅ **Complete Control** - Confirm, skip, or stop anytime
✅ **Error Handling** - Continue after errors
✅ **Smart Filtering** - Auto-skip already-posted invoices
✅ **Progress Tracking** - Know exactly where you are
✅ **Detailed Results** - See what happened to each invoice

Perfect for careful, controlled FBR processing with full visibility!
