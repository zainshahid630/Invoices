// FBR Reference Data - Standard data that rarely changes
// These are the default values provided by FBR API
// Use the "Refresh FBR Reference Data" button to fetch latest from FBR if needed

export const FBR_PROVINCES = [
    { "stateProvinceCode": 2, "stateProvinceDesc": "BALOCHISTAN" },
    { "stateProvinceCode": 4, "stateProvinceDesc": "AZAD JAMMU AND KASHMIR" },
    { "stateProvinceCode": 5, "stateProvinceDesc": "CAPITAL TERRITORY" },
    { "stateProvinceCode": 6, "stateProvinceDesc": "KHYBER PAKHTUNKHWA" },
    { "stateProvinceCode": 7, "stateProvinceDesc": "PUNJAB" },
    { "stateProvinceCode": 8, "stateProvinceDesc": "SINDH" },
    { "stateProvinceCode": 9, "stateProvinceDesc": "GILGIT BALTISTAN" }
];

export const FBR_DOC_TYPES = [
    { "docTypeId": 9, "docDescription": "Debit Note" },
    { "docTypeId": 4, "docDescription": "Sale Invoice" }
];

export const FBR_TRANS_TYPES = [
    { "transactioN_TYPE_ID": 75, "transactioN_DESC": "Goods at standard rate (default)" },
    { "transactioN_TYPE_ID": 24, "transactioN_DESC": "Goods at Reduced Rate" },
    { "transactioN_TYPE_ID": 80, "transactioN_DESC": "Goods at zero-rate" },
    { "transactioN_TYPE_ID": 85, "transactioN_DESC": "Petroleum Products" },
    { "transactioN_TYPE_ID": 62, "transactioN_DESC": "Electricity Supply to Retailers" },
    { "transactioN_TYPE_ID": 129, "transactioN_DESC": "SIM" },
    { "transactioN_TYPE_ID": 77, "transactioN_DESC": "Gas to CNG stations" },
    { "transactioN_TYPE_ID": 122, "transactioN_DESC": "Mobile Phones" },
    { "transactioN_TYPE_ID": 25, "transactioN_DESC": "Processing/Conversion of Goods" },
    { "transactioN_TYPE_ID": 23, "transactioN_DESC": " 3rd Schedule Goods " },
    { "transactioN_TYPE_ID": 21, "transactioN_DESC": "Goods (FED in ST Mode)" },
    { "transactioN_TYPE_ID": 22, "transactioN_DESC": " Services (FED in ST Mode) " },
    { "transactioN_TYPE_ID": 18, "transactioN_DESC": " Services " },
    { "transactioN_TYPE_ID": 81, "transactioN_DESC": "Exempt goods" },
    { "transactioN_TYPE_ID": 82, "transactioN_DESC": "DTRE goods" },
    { "transactioN_TYPE_ID": 130, "transactioN_DESC": "Cotton ginners" },
    { "transactioN_TYPE_ID": 132, "transactioN_DESC": "Electric Vehicle" },
    { "transactioN_TYPE_ID": 134, "transactioN_DESC": "Cement /Concrete Block" },
    { "transactioN_TYPE_ID": 84, "transactioN_DESC": "Telecommunication services" },
    { "transactioN_TYPE_ID": 123, "transactioN_DESC": "Steel melting and re-rolling" },
    { "transactioN_TYPE_ID": 125, "transactioN_DESC": "Ship breaking" },
    { "transactioN_TYPE_ID": 115, "transactioN_DESC": "Potassium Chlorate" },
    { "transactioN_TYPE_ID": 178, "transactioN_DESC": "CNG Sales" },
    { "transactioN_TYPE_ID": 181, "transactioN_DESC": "Toll Manufacturing" },
    { "transactioN_TYPE_ID": 138, "transactioN_DESC": "Non-Adjustable Supplies" },
    { "transactioN_TYPE_ID": 139, "transactioN_DESC": "Goods as per SRO.297(|)/2023" }
];

export const FBR_UOMS = [
    { "uoM_ID": 3, "description": "MT" },
    { "uoM_ID": 4, "description": "Bill of lading" },
    { "uoM_ID": 5, "description": "SET" },
    { "uoM_ID": 6, "description": "KWH" },
    { "uoM_ID": 8, "description": "40KG" },
    { "uoM_ID": 9, "description": "Liter" },
    { "uoM_ID": 11, "description": "SqY" },
    { "uoM_ID": 12, "description": "Bag" },
    { "uoM_ID": 13, "description": "KG" },
    { "uoM_ID": 46, "description": "MMBTU" },
    { "uoM_ID": 48, "description": "Meter" },
    { "uoM_ID": 50, "description": "Pcs" },
    { "uoM_ID": 53, "description": "Carat" },
    { "uoM_ID": 55, "description": "Cubic Metre" },
    { "uoM_ID": 57, "description": "Dozen" },
    { "uoM_ID": 59, "description": "Gram" },
    { "uoM_ID": 61, "description": "Gallon" },
    { "uoM_ID": 63, "description": "Kilogram" },
    { "uoM_ID": 65, "description": "Pound" },
    { "uoM_ID": 67, "description": "Timber Logs" },
    { "uoM_ID": 69, "description": "Numbers, pieces, units" },
    { "uoM_ID": 71, "description": "Packs" },
    { "uoM_ID": 73, "description": "Pair" },
    { "uoM_ID": 75, "description": "Square Foot" },
    { "uoM_ID": 77, "description": "Square Metre" },
    { "uoM_ID": 79, "description": "Thousand Unit" },
    { "uoM_ID": 81, "description": "Mega Watt" },
    { "uoM_ID": 83, "description": "Foot" },
    { "uoM_ID": 85, "description": "Barrels" },
    { "uoM_ID": 87, "description": "NO" },
    { "uoM_ID": 118, "description": "Meter" },
    { "uoM_ID": 120, "description": "MT" },
    { "uoM_ID": 110, "description": "KWH" },
    { "uoM_ID": 112, "description": "Packs" },
    { "uoM_ID": 114, "description": "Meter" },
    { "uoM_ID": 116, "description": "Liter" },
    { "uoM_ID": 117, "description": "Bag" },
    { "uoM_ID": 98, "description": "MMBTU" },
    { "uoM_ID": 99, "description": "Numbers, pieces, units" },
    { "uoM_ID": 100, "description": "Square Foot" },
    { "uoM_ID": 101, "description": "Thousand Unit" },
    { "uoM_ID": 102, "description": "Barrels" },
    { "uoM_ID": 88, "description": "Others" },
    { "uoM_ID": 96, "description": "1000 kWh" }
];

export const FBR_SCENARIOS = [
    { value: 'SN001', label: 'SN001 – Goods at Standard Rate to Registered Buyers' },
    { value: 'SN002', label: 'SN002 – Goods at Standard Rate to Unregistered Buyers' },
    { value: 'SN003', label: 'SN003 – Steel Melting and Re-rolling' },
    { value: 'SN004', label: 'SN004 – Ship Breaking (Uses Reference Seller NTN)' },
    { value: 'SN005', label: 'SN005 – Reduced Rate Sale' },
    { value: 'SN006', label: 'SN006 – Exempt Goods Sale' },
    { value: 'SN007', label: 'SN007 – Zero Rated Sale' },
    { value: 'SN008', label: 'SN008 – Sale Invoice Scenario' },
    { value: 'SN009', label: 'SN009 – Cotton Ginners' },
    { value: 'SN010', label: 'SN010 – Telecommunication Services' },
    { value: 'SN011', label: 'SN011 – Toll Manufacturing' },
    { value: 'SN012', label: 'SN012 – Petroleum Products' },
    { value: 'SN013', label: 'SN013 – Electricity Supply to Retailers' },
    { value: 'SN014', label: 'SN014 – Gas to CNG Stations' },
    { value: 'SN015', label: 'SN015 – Mobile Phones (Ninth Schedule)' },
    { value: 'SN016', label: 'SN016 – Processing / Conversion of Goods' },
    { value: 'SN017', label: 'SN017 – Sale of Goods where FED is Charged in ST Mode' },
    { value: 'SN018', label: 'SN018 – Sale of Services where FED is Charged in ST Mode' },
    { value: 'SN019', label: 'SN019 – Sale of Services' },
    { value: 'SN020', label: 'SN020 – Electric Vehicle (1%)' },
    { value: 'SN021', label: 'SN021 – Scenario SN021' },
    { value: 'SN022', label: 'SN022 – Scenario SN022' },
    { value: 'SN023', label: 'SN023 – Scenario SN023' },
    { value: 'SN024', label: 'SN024 – Goods Sold that are Listed in SRO 297(1)/2023' },
    { value: 'SN025', label: 'SN025 – Scenario SN025' },
    { value: 'SN026', label: 'SN026 – Goods at Standard Rate to Registered Buyers' },
    { value: 'SN027', label: 'SN027 – 3rd Schedule Goods to Registered Buyers' },
    { value: 'SN028', label: 'SN028 – Goods at Reduced Rate' },
];

export interface FBRProvince {
    stateProvinceCode: number;
    stateProvinceDesc: string;
}

export interface FBRDocType {
    docTypeId: number;
    docDescription: string;
}

export interface FBRTransType {
    transactioN_TYPE_ID: number;
    transactioN_DESC: string;
}

export interface FBRUOM {
    uoM_ID: number;
    description: string;
}
