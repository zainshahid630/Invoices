import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const FBR_BASE_URL = 'https://gw.fbr.gov.pk/pdi/v1';
const supabase = getSupabaseServer();

// Default fallback data - these are standard FBR reference data that don't change
const DEFAULT_PROVINCES = [
    { "stateProvinceCode": 2, "stateProvinceDesc": "BALOCHISTAN" },
    { "stateProvinceCode": 4, "stateProvinceDesc": "AZAD JAMMU AND KASHMIR" },
    { "stateProvinceCode": 5, "stateProvinceDesc": "CAPITAL TERRITORY" },
    { "stateProvinceCode": 6, "stateProvinceDesc": "KHYBER PAKHTUNKHWA" },
    { "stateProvinceCode": 7, "stateProvinceDesc": "PUNJAB" },
    { "stateProvinceCode": 8, "stateProvinceDesc": "SINDH" },
    { "stateProvinceCode": 9, "stateProvinceDesc": "GILGIT BALTISTAN" }
];

const DEFAULT_DOC_TYPES = [
    { "docTypeId": 9, "docDescription": "Debit Note" },
    { "docTypeId": 4, "docDescription": "Sale Invoice" }
];

const DEFAULT_TRANS_TYPES = [
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

const DEFAULT_UOMS = [
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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const companyId = searchParams.get('company_id');

    if (!type) {
        return NextResponse.json({ error: 'Type parameter is required' }, { status: 400 });
    }

    if (!companyId) {
        return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Fetch FBR Token
    const { data: company, error } = await supabase
        .from('companies')
        .select('fbr_token')
        .eq('id', companyId)
        .single();

    if (error || !company?.fbr_token) {
        console.error('Error fetching FBR token:', error);
        return NextResponse.json({ error: 'FBR Token not found for this company' }, { status: 401 });
    }

    let endpoint = '';
    let fallbackData: any[] = [];

    switch (type) {
        case 'provinces':
            endpoint = '/provinces';
            fallbackData = DEFAULT_PROVINCES;
            break;
        case 'doctypes':
            endpoint = '/doctypecode';
            fallbackData = DEFAULT_DOC_TYPES;
            break;
        case 'transtypes':
            endpoint = '/transtypecode';
            fallbackData = DEFAULT_TRANS_TYPES;
            break;
        case 'uoms':
            endpoint = '/uom';
            fallbackData = DEFAULT_UOMS;
            break;
        default:
            return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

    try {
        const response = await fetch(`${FBR_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${company.fbr_token}`
            },
        });

        if (!response.ok) {
            throw new Error(`FBR API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching FBR reference data, using fallback:', error);
        // Return fallback data instead of error
        return NextResponse.json(fallbackData);
    }
}
