import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    console.log('company.fbr_token',company.fbr_token )

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

    // Build FBR validation payload
    // Remove dashes from NTN numbers for FBR submission
    const cleanSellerNTN = (company.ntn_number || '').replace(/-/g, '');
    const cleanBuyerNTN = (invoice.buyer_ntn_cnic || '').replace(/-/g, '');
    
    const fbrPayload = {
      invoiceType: invoice.invoice_type || 'Sale Invoice',
      invoiceDate: invoice.invoice_date,
      sellerNTNCNIC: cleanSellerNTN,
      sellerBusinessName: company.business_name || company.name || '',
      sellerProvince: company.province || 'Sindh', // Default to Sindh if not set
      sellerAddress: company.address || '',
      buyerNTNCNIC: cleanBuyerNTN,
      buyerBusinessName: invoice.buyer_business_name || invoice.buyer_name || '',
      buyerProvince: invoice.buyer_province || 'Sindh',
      buyerAddress: invoice.buyer_address || '',
      buyerRegistrationType: invoice.buyer_registration_type || 'Unregistered',
      invoiceRefNo: invoice.invoice_number || '',
      scenarioId: invoice.scenario || 'SN000',
      items: items.map((item: any) => ({
        hsCode: item.hs_code || '0000.0000',
        productDescription: item.item_name || '',
        rate: `${invoice.sales_tax_rate || 0}%`,
        uoM: item.uom || 'Numbers, pieces, units',
        quantity: parseFloat(item.quantity.toString()) || 0,
        totalValues: parseFloat(item.line_total.toString()) || 0,
        valueSalesExcludingST: parseFloat(item.line_total.toString()) || 0,
        fixedNotifiedValueOrRetailPrice: 0,
        salesTaxApplicable: parseFloat(((parseFloat(item.line_total.toString()) * (invoice.sales_tax_rate || 0)) / 100).toFixed(2)),
        salesTaxWithheldAtSource: 0,
        extraTax: '',
        furtherTax: parseFloat(((parseFloat(item.line_total.toString()) * (invoice.further_tax_rate || 0)) / 100).toFixed(2)),
        sroScheduleNo: '',
        fedPayable: 0,
        discount: 0,
        saleType: 'Goods at standard rate (default)',
        sroItemSerialNo: ''
      }))
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

    // Return success response
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

