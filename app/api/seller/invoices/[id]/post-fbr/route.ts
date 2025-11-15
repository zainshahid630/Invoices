import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Post invoice to FBR and save response
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

    // Get invoice with items
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        customer:customers(id, name, business_name, ntn_cnic, address, province)
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

    // Build FBR payload (same as validation)
    // Remove dashes from NTN numbers for FBR submission
    const cleanSellerNTN = (company.ntn_number || '').replace(/-/g, '');
    const cleanBuyerNTN = (invoice.buyer_ntn_cnic || '').replace(/-/g, '');
    
    const fbrPayload = {
      invoiceType: invoice.invoice_type || 'Sale Invoice',
      invoiceDate: invoice.invoice_date,
      sellerNTNCNIC: cleanSellerNTN,
      sellerBusinessName: company.business_name || company.name || '',
      sellerProvince: company.province || 'Sindh',
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

    // Call FBR Post API
    const fbrResponse = await fetch('https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata', {
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
        error: 'FBR posting failed',
        details: fbrData,
        payload: fbrPayload
      }, { status: fbrResponse.status });
    }

    // Extract FBR invoice number from response
    let fbrInvoiceNumber = null;
    if (fbrData.validationResponse?.invoiceStatuses?.[0]?.invoiceNo) {
      fbrInvoiceNumber = fbrData.validationResponse.invoiceStatuses[0].invoiceNo;
    }

    // Save FBR response to invoice
    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'fbr_posted',
        fbr_posted_at: new Date().toISOString(),
        fbr_invoice_number: fbrInvoiceNumber,
        fbr_response: fbrData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('company_id', company_id);

    if (updateError) {
      console.error('Error updating invoice with FBR response:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to save FBR response to invoice',
        fbrResponse: fbrData
      }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Invoice posted to FBR successfully',
      fbrResponse: fbrData,
      fbrInvoiceNumber: fbrInvoiceNumber,
      payload: fbrPayload
    });

  } catch (error: any) {
    console.error('Error posting invoice to FBR:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error posting invoice to FBR'
    }, { status: 500 });
  }
}

