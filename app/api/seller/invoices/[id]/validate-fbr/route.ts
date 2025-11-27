import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { normalizeNTN } from '@/lib/ntn-utils';

// Helper function to sanitize description for JSON
function sanitizeDescription(input: string): string {
  if (!input) return "";

  return input
    .replace(/\\/g, "")          // remove backslashes
    .replace(/"/g, "″")          // replace inch " with unicode inch sign
    .replace(/\s+/g, " ")        // normalize spacing
    .trim();
}

// POST - Validate invoice with FBR
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get company details (including FBR token)
    const supabase = getSupabaseServer();
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (!company.fbr_token) {
      return NextResponse.json({ error: 'FBR token not configured. Please add FBR token in Settings.' }, { status: 400 });
    }

    // Get settings to check identifier type preference
    const { data: settings } = await supabase
      .from('settings')
      .select('fbr_identifier_type')
      .eq('company_id', company_id)
      .single();

    const identifierType = settings?.fbr_identifier_type || 'NTN';

    console.log('company.fbr_token', company.fbr_token)

    // Get invoice with items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, business_name, ntn_cnic, address, province,registration_type)
      `)
      .eq('id', params.id)
      .eq('company_id', company_id)
      .is('deleted_at', null)
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Get invoice items
    const { data: items, error: itemsError } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', params.id);

    if (itemsError) {
      return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
    }

    // Determine seller identifier
    let sellerIdentifier = '';
    
    if (identifierType === 'CNIC') {
      if (!company.cnic_number) {
        return NextResponse.json({
          error: 'CNIC is selected but not set in company settings. Please update in Settings.'
        }, { status: 400 });
      }
      const cnicDigits = company.cnic_number.replace(/-/g, '');
      if (cnicDigits.length !== 13 || !/^\d+$/.test(cnicDigits)) {
        return NextResponse.json({
          error: `Invalid Seller CNIC: Must be 13 digits. Current: ${cnicDigits.length} digits. Please update in Settings.`
        }, { status: 400 });
      }
      sellerIdentifier = cnicDigits;
    } else {
      const sellerNTN = normalizeNTN(company.ntn_number || '');
      if (!sellerNTN.isValid) {
        return NextResponse.json({
          error: `Invalid Seller NTN: ${sellerNTN.error}. Please update in Settings.`
        }, { status: 400 });
      }
      sellerIdentifier = sellerNTN.normalized;
    }

    const buyerNTN = normalizeNTN(invoice.buyer_ntn_cnic || '');
    if (!buyerNTN.isValid) {
      return NextResponse.json({
        error: `Invalid Buyer NTN: ${buyerNTN.error}. Please update the invoice.`
      }, { status: 400 });
    }

    // 🔥 CLEAN DECIMAL FIX HERE ONLY
    const fbrPayload = {
      invoiceType: invoice.invoice_type || 'Sale Invoice',
      invoiceDate: invoice.invoice_date,
      sellerNTNCNIC: sellerIdentifier,
      sellerBusinessName: company.business_name || company.name || '',
      sellerProvince: company.province || 'Sindh',
      sellerAddress: company.address || '',
      buyerNTNCNIC: buyerNTN.normalized,
      buyerBusinessName: invoice.buyer_business_name || invoice.buyer_name || '',
      buyerProvince: invoice.buyer_province || '',
      buyerAddress: invoice.buyer_address || '',
      buyerRegistrationType: invoice.buyer_registration_type || 'Unregistered',
      invoiceRefNo: invoice.invoice_number || '',
      scenarioId: invoice.scenario || 'SN000',
      items: items.map((item: any) => {

        // 🔥 FIX: Normalize line_total to avoid floating mismatch
        const cleanValue = Number(parseFloat(item.line_total.toString()).toFixed(2));

        return {
          hsCode: item.hs_code || '0000.0000',
          productDescription: sanitizeDescription(item.item_name || ''),
          rate: `${invoice.sales_tax_rate || 0}%`,
          uoM: item.uom || 'Numbers, pieces, units',
          quantity: Number(parseFloat(item.quantity.toString())) || 0,
          totalValues: cleanValue,
          valueSalesExcludingST: cleanValue,
          fixedNotifiedValueOrRetailPrice: 0,

          // 🔥 FIXED TAX FIELDS (FBR EXACT MATCH) - Use Math.round for proper rounding
          salesTaxApplicable: Math.round(
            (cleanValue * (invoice.sales_tax_rate || 0)) / 100 * 100
          ) / 100,

          salesTaxWithheldAtSource: 0,
          extraTax: '',

          furtherTax: Math.round(
            (cleanValue * (invoice.further_tax_rate || 0)) / 100 * 100
          ) / 100,

          sroScheduleNo: '',
          fedPayable: 0,
          discount: 0,
          saleType: 'Goods at standard rate (default)',
          sroItemSerialNo: ''
        };
      })
    };

    // Call FBR API
    const fbrResponse = await fetch('https://gw.fbr.gov.pk/di_data/v1/di/validateinvoicedata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${company.fbr_token}`
      },
      body: JSON.stringify(fbrPayload)
    });

    const fbrData = await fbrResponse.json();

    if (!fbrResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'FBR validation failed',
        details: fbrData,
        payload: fbrPayload
      }, { status: fbrResponse.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice validated successfully with FBR',
      fbrResponse: fbrData,
      payload: fbrPayload
    });

  } catch (error: any) {
    console.error('Error validating invoice with FBR:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error validating invoice with FBR'
    }, { status: 500 });
  }
}
