# Default FBR Scenario Feature

## Overview

Added the ability to set a default FBR scenario in Settings that will be automatically selected when creating new invoices.

## What Changed

### 1. Settings Page
**Location:** `/seller/settings` → Tax Configuration Tab

**New Field:**
- **Default FBR Scenario** dropdown
- Lists all available FBR scenarios
- Default value: `SN002` (Goods at Standard Rate to Unregistered Buyers)
- Required field

### 2. New Invoice Page
**Location:** `/seller/invoices/new`

**Behavior:**
- Automatically loads default scenario from settings
- Pre-selects the scenario dropdown
- User can still change it if needed

### 3. Database
**Table:** `settings`

**New Column:**
- `default_scenario VARCHAR(10) DEFAULT 'SN002'`
- Stores the default FBR scenario code

## Available Scenarios

| Code | Description |
|------|-------------|
| SN002 | Goods at Standard Rate to Unregistered Buyers (Default) |
| SN001 | Goods at Standard Rate to Registered Buyers |
| SN005 | Reduced Rate Sale |
| SN006 | Exempt Goods Sale |
| SN007 | Zero Rated Sale |
| SN016 | Processing / Conversion of Goods |
| SN017 | Sale of Goods where FED is Charged in ST Mode |
| SN018 | Sale of Services where FED is Charged in ST Mode |
| SN019 | Sale of Services |
| SN024 | Goods Sold that are Listed in SRO 297(1)/2023 |

## How to Use

### Step 1: Set Default Scenario

1. Go to **Settings** (`/seller/settings`)
2. Click on **Tax Configuration** tab
3. Find **Default FBR Scenario** dropdown
4. Select your most commonly used scenario
5. Click **Save Settings**

### Step 2: Create New Invoice

1. Go to **Create Invoice** (`/seller/invoices/new`)
2. Notice the **Scenario ID** field is pre-filled
3. The selected scenario matches your default setting
4. Change it if needed for this specific invoice
5. Continue creating invoice as normal

## Benefits

### 1. Time Saving
- No need to select scenario every time
- One-click invoice creation
- Faster workflow

### 2. Consistency
- All invoices use same scenario by default
- Reduces errors
- Standardized process

### 3. Flexibility
- Can still change per invoice
- Not locked to default
- Override when needed

## Use Cases

### Use Case 1: Retail Business
**Scenario:** Mostly sell to unregistered buyers

**Setup:**
- Set default to `SN002` (Unregistered Buyers)
- 90% of invoices use this
- Only change for registered buyers

### Use Case 2: B2B Business
**Scenario:** Mostly sell to registered businesses

**Setup:**
- Set default to `SN001` (Registered Buyers)
- Most invoices use this
- Change for occasional retail sales

### Use Case 3: Service Provider
**Scenario:** Provide services, not goods

**Setup:**
- Set default to `SN019` (Sale of Services)
- All invoices use this
- Consistent service billing

## Technical Details

### Settings Interface
```typescript
interface Settings {
  // ... other fields
  default_scenario: string; // e.g., "SN002"
}
```

### API Response
```json
{
  "defaultScenario": "SN002",
  "defaultSalesTaxRate": 18,
  "defaultFurtherTaxRate": 0
}
```

### Form State
```typescript
const [formData, setFormData] = useState({
  scenario: 'SN002', // Auto-loaded from settings
  // ... other fields
});
```

## Migration

### Database Migration
Run the SQL migration:
```sql
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS default_scenario VARCHAR(10) DEFAULT 'SN002';
```

### Existing Users
- Default value: `SN002`
- No action required
- Can change in settings anytime

### New Users
- Automatically set to `SN002`
- Can customize during setup

## Settings Page UI

### Location in Settings
```
Settings
├── Company Information
├── Tax Configuration ← Here
│   ├── Default Sales Tax Rate
│   ├── Default Further Tax Rate
│   └── Default FBR Scenario ← New Field
├── Invoice Templates
└── Letterhead Settings
```

### Field Details
```
┌─────────────────────────────────────────────┐
│ Default FBR Scenario *                      │
├─────────────────────────────────────────────┤
│ [SN002 – Goods at Standard Rate to...    ▼]│
├─────────────────────────────────────────────┤
│ This scenario will be automatically         │
│ selected when creating new invoices         │
└─────────────────────────────────────────────┘
```

## New Invoice Page Behavior

### Before
```
1. Open new invoice page
2. Scenario dropdown is empty
3. User must select scenario
4. Continue with invoice
```

### After
```
1. Open new invoice page
2. Scenario dropdown pre-filled with default ✅
3. User can change if needed
4. Continue with invoice
```

## Example Workflow

### Daily Operations
```
Morning:
1. Set default scenario once in Settings
   → SN002 (Unregistered Buyers)

Throughout the day:
2. Create Invoice #1 → SN002 auto-selected ✅
3. Create Invoice #2 → SN002 auto-selected ✅
4. Create Invoice #3 → Change to SN001 (Registered)
5. Create Invoice #4 → SN002 auto-selected ✅
6. Create Invoice #5 → SN002 auto-selected ✅

Result: 4 out of 5 invoices used default
Time saved: ~30 seconds per invoice
```

## Troubleshooting

### Issue: Default not applied
**Cause:** Settings not saved
**Solution:** Go to Settings, verify default scenario, click Save

### Issue: Wrong scenario selected
**Cause:** Default scenario changed
**Solution:** Check Settings → Tax Configuration → Default FBR Scenario

### Issue: Can't change scenario
**Cause:** Not an issue - you can always change it
**Solution:** Just select different scenario in dropdown

## Best Practices

### 1. Set Realistic Default
- Choose your most common scenario
- Not the "ideal" scenario
- Based on actual usage

### 2. Review Periodically
- Check if default still makes sense
- Update if business changes
- Adjust as needed

### 3. Train Staff
- Show where default is set
- Explain when to change it
- Document exceptions

## Related Features

### Default Sales Tax Rate
- Also set in Tax Configuration
- Works together with default scenario
- Both auto-applied to new invoices

### Default Further Tax Rate
- Optional additional tax
- Also in Tax Configuration
- Applied automatically

### Invoice Templates
- Different setting
- Controls invoice appearance
- Not related to scenario

## Summary

✅ **Added:** Default FBR Scenario setting
✅ **Location:** Settings → Tax Configuration
✅ **Behavior:** Auto-selects scenario in new invoices
✅ **Default:** SN002 (Unregistered Buyers)
✅ **Flexible:** Can override per invoice
✅ **Time Saving:** No need to select every time

Perfect for businesses that use the same scenario for most invoices!
