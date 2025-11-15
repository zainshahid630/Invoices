# FBR Digital Invoicing (DI) API - Complete Reference Summary

## Document Overview
**Title:** Technical Specification for DI API  
**Version:** 1.10  
**Organization:** Pakistan Revenue Automation (PVT.) LTD (PRAL)  
**Last Updated:** 24-May-2025  
**Purpose:** Facilitate Supply Chain Operators to integrate with FBR's Digital Invoicing System

---

## 1. System Architecture

### Data Sharing Mode
- **Real-time integration** using Web APIs
- **Data Format:** JSON
- **Security:** Bearer token authentication (5-year validity)
- **Platform:** PRAL ESP (Enterprise Service Platform)

### Integration Process
1. Register ERP/Software in FBR system
2. Obtain security token from PRAL
3. Integrate using provided API endpoints
4. Pass Bearer token in Authorization header

---

## 2. Main API Endpoints

### Base URL
`https://gw.fbr.gov.pk`

### 2.1 Post Invoice Data
**Endpoint (Sandbox):** `/di_data/v1/di/postinvoicedata_sb`  
**Endpoint (Production):** `/di_data/v1/di/postinvoicedata`  
**Method:** POST  
**Purpose:** Submit invoice data to FBR system

**Key Fields:**
- Invoice Type: "Sale Invoice" or "Debit Note"
- Invoice Date: YYYY-MM-DD format
- Seller Information (NTN/CNIC, Business Name, Province, Address)
- Buyer Information (NTN/CNIC, Business Name, Province, Address, Registration Type)
- Invoice Reference No (required for debit notes)
- Scenario ID (required for Sandbox only)

**Item Fields:**
- HS Code (required)
- Product Description
- Rate (e.g., "18%")
- UOM (Unit of Measurement)
- Quantity
- Value of Sales Excluding ST
- Sales Tax Applicable
- Sales Tax Withheld at Source
- Extra Tax, Further Tax (optional)
- SRO Schedule No (optional)
- FED Payable (optional)
- Discount (optional)
- Sale Type
- SRO Item Serial No (optional)

**Response Codes:**
- `00` - Valid
- `01` - Invalid

### 2.2 Validate Invoice Data
**Endpoint (Sandbox):** `/di_data/v1/di/validateinvoicedata_sb`  
**Endpoint (Production):** `/di_data/v1/di/validateinvoicedata`  
**Method:** POST  
**Purpose:** Validate invoice data without posting

Same request structure as Post Invoice, returns validation status.

---

## 3. Reference APIs

### 3.1 Province Code
**Endpoint:** `/pdi/v1/provinces`  
**Method:** GET  
Returns list of provinces with codes (e.g., Punjab=7, Sindh=8)

### 3.2 Document Type
**Endpoint:** `/pdi/v1/doctypecode`  
**Method:** GET  
Returns document types (Sale Invoice=4, Debit Note=9)

### 3.3 Item Code (HS Codes)
**Endpoint:** `/pdi/v1/itemdesccode`  
**Method:** GET  
Returns complete list of HS Codes with descriptions

### 3.4 SRO Item ID
**Endpoint:** `/pdi/v1/sroitemcode`  
**Method:** GET  
Returns SRO item IDs and descriptions

### 3.5 Transaction Type
**Endpoint:** `/pdi/v1/transtypecode`  
**Method:** GET  
Returns transaction types (DTRE goods, Special procedure, etc.)

### 3.6 Unit of Measurement (UOM)
**Endpoint:** `/pdi/v1/uom`  
**Method:** GET  
Returns UOM list (KG, Square Metre, etc.)

### 3.7 SRO Schedule
**Endpoint:** `/pdi/v1/SroSchedule?rate_id={id}&date={date}&origination_supplier_csv={province}`  
**Method:** GET  
Returns SRO schedules based on rate, date, and province

### 3.8 Sale Type to Rate
**Endpoint:** `/pdi/v2/SaleTypeToRate?date={date}&transTypeId={id}&originationSupplier={province}`  
**Method:** GET  
Returns applicable tax rates for sale types

### 3.9 HS Code with UOM
**Endpoint:** `/pdi/v2/HS_UOM?hs_code={code}&annexure_id={id}`  
**Method:** GET  
Returns valid UOMs for specific HS codes

### 3.10 SRO Item by Date
**Endpoint:** `/pdi/v2/SROItem?date={date}&sro_id={id}`  
**Method:** GET  
Returns SRO items for specific date and SRO ID

### 3.11 STATL (Status Check)
**Endpoint:** `/dist/v1/statl`  
**Method:** POST  
**Request:** `{"regno":"0788762","date":"2025-05-18"}`  
Returns registration status (Active/In-Active)

### 3.12 Registration Type
**Endpoint:** `/dist/v1/Get_Reg_Type`  
**Method:** POST  
**Request:** `{"Registration_No":"0788762"}`  
Returns registration type (Registered/Unregistered)

---

## 4. Error Codes

### Sales Error Codes (Selected Examples)

| Code | Description |
|------|-------------|
| 0001 | Seller not registered for sales tax |
| 0002 | Invalid Buyer Registration No or NTN |
| 0003 | Provide proper invoice type |
| 0005 | Invalid date format (use YYYY-MM-DD) |
| 0009 | Provide Buyer registration No |
| 0019 | Please provide HSCode |
| 0020 | Please provide Rate |
| 0023 | Please provide Sales Tax |
| 0026 | Invoice Reference No. required (for debit/credit notes) |
| 0027 | Reason required (for debit/credit notes) |
| 0034 | Debit/Credit note only allowed within 180 days |
| 0041 | Provide invoice No |
| 0042 | Provide invoice date |
| 0046 | Provide rate |
| 0052 | Invalid HS Code for sale type |
| 0088 | Alphanumeric invoice format required (e.g., Inv-001) |
| 0100 | Cotton Ginners allowed against registered buyers only |
| 0113 | Date format error (use YYYY-MM-DD) |
| 0300 | Invalid decimal value at field |

### Purchase Error Codes (Selected Examples)

| Code | Description |
|------|-------------|
| 0156 | Invalid NTN / Reg No. provided |
| 0157 | Buyer not registered for sales tax |
| 0159 | FTN holder as seller not allowed for purchases |
| 0162 | Provide Sale Type |
| 0169 | STWH only for GOV/FTN Holders |
| 0174 | Please provide Sales Tax |

---

## 5. Testing Scenarios

### Sandbox Testing Scenarios (28 scenarios)

**SN001-SN028** covering:
- Standard rate sales (registered/unregistered)
- Steel sector (melting, re-rolling, ship breaking, toll manufacturing)
- Reduced rate, exempt goods, zero-rated sales
- 3rd schedule goods
- Cotton Ginners (Textile)
- Telecom services
- Petroleum products
- Electricity supply
- Gas to CNG stations
- Mobile phones
- Processing/Conversion
- FED in ST mode (goods & services)
- Services
- Electric vehicles
- Cement/Concrete blocks
- Potassium Chlorate
- CNG Sales
- SRO goods
- Non-adjustable supplies
- Retail sales

### Business Activities Covered
- Manufacturer
- Importer
- Distributor
- Wholesaler
- Exporter
- Retailer
- Service Provider
- Other

### Sectors Covered
- All Other Sectors
- Steel
- FMCG
- Textile
- Telecom
- Petroleum
- Electricity Distribution
- Gas Distribution
- Services
- Automobile
- CNG Stations
- Pharmaceuticals
- Wholesale/Retail

---

## 6. Invoice Printing Requirements

### QR Code Specifications
- **Version:** 2.0 (25×25)
- **Dimensions:** 1.0 x 1.0 Inch
- Must include FBR Digital Invoicing System logo

### Required Elements
- Digital Invoicing System logo
- QR code containing invoice verification data

---

## 7. HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 401 | Unauthorized - Invalid/missing token |
| 500 | Internal Server Error - Contact Administrator |

---

## 8. Important Notes

### Date Format
- **Required Format:** YYYY-MM-DD
- **Example:** 2025-05-25
- **Invalid:** dd-MMM-yy, MM/DD/YYYY

### Invoice Number Format
- Alphanumeric with optional hyphen
- Hyphen must be between alphanumeric strings
- **Valid:** Inv-001, INV-2025-001
- **Invalid:** -INV001, INV001-

### Buyer Registration Type
- **Registered:** Full NTN/Registration required
- **Unregistered:** NTN/CNIC optional

### Debit/Credit Notes
- Must reference original invoice number
- Date must be >= original invoice date
- Only allowed within 180 days of original invoice
- Reason and remarks required
- Values cannot exceed original invoice values

### Sandbox vs Production
- Same API URLs for both environments
- Routing determined by security token
- Sandbox requires `scenarioId` field
- Production does not use `scenarioId`

---

## 9. Integration Checklist

✅ Obtain security token from PRAL  
✅ Configure Bearer token in API headers  
✅ Implement date validation (YYYY-MM-DD)  
✅ Validate HS Codes against reference API  
✅ Validate UOM against HS Code  
✅ Calculate sales tax correctly  
✅ Implement error handling for all error codes  
✅ Test all applicable scenarios in Sandbox  
✅ Implement QR code generation  
✅ Add FBR logo to invoices  
✅ Handle debit/credit note validations  
✅ Implement 180-day restriction for credit notes  
✅ Validate buyer registration status  
✅ Store FBR-issued invoice numbers  

---

## 10. Common Validation Rules

1. **Sales Tax Calculation:** Must match rate × value
2. **Further Tax:** Optional, calculated separately
3. **Extra Tax:** Optional, for specific scenarios
4. **Discount:** Optional, reduces taxable value
5. **FED Payable:** For goods with Federal Excise Duty
6. **ST Withheld:** Must be 0 or equal to sales tax (for specific types)
7. **HS Code:** Must match sale type
8. **UOM:** Must be valid for selected HS Code
9. **Rate:** Must be from reference API (5.8)
10. **Province Codes:** Must use official codes (7=Punjab, 8=Sindh, etc.)

---

## Contact Information
**PRAL Head Office**  
Software Technology Park-III  
Plot No. 156, Service Road (North)  
Industrial Area, I-9/3  
Islamabad, Pakistan

**Document Classification:** Confidential  
**Copyright:** PRAL © 2025 – All rights reserved


---

## Important HS Code Corrections (Verified)

### SN004 - Ship Breaking
- **Correct HS Code:** `7204.4910` (Turnings, shavings, chips, milling waste, sawdust, filings, trimmings and stampings)
- **Incorrect codes that don't work:** `7204.1010`, `7214.1010`
- **Sale Type:** "Ship breaking"
- **UOM:** MT (Metric Ton)
- **Rate:** 18%

### Sandbox vs Production Endpoints
- **Sandbox endpoints have `_sb` suffix:**
  - Validate: `/di_data/v1/di/validateinvoicedata_sb`
  - Post: `/di_data/v1/di/postinvoicedata_sb`
- **Production endpoints don't have suffix:**
  - Validate: `/di_data/v1/di/validateinvoicedata`
  - Post: `/di_data/v1/di/postinvoicedata`

### Key Learnings
1. The reference website may have outdated HS codes - always verify with FBR API
2. Seller NTN must be registered for specific business activities in sandbox
3. Some scenarios require specific test NTNs (like SN004 needs ship breaker NTN)
4. Empty fields should be `""` or `0`, not omitted
5. `buyerRegistrationType` field may cause validation errors in some scenarios
