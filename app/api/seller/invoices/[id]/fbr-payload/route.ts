import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { normalizeNTN } from '@/lib/ntn-utils';

const supabase = getSupabaseServer();

// GET - Get FBR payload preview for an invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Get company details
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
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

    // Normalize NTN numbers
    const sellerNTN = normalizeNTN(company.ntn_number || '');
    const buyerNTN = normalizeNTN(invoice.buyer_ntn_cnic || '');

    // Build FBR payload
    const payload = {
      invoiceType: invoice.invoice_type || 'Sale Invoice',
      invoiceDate: invoice.invoice_date,
      sellerNTNCNIC: sellerNTN.normalized,
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
        const cleanValue = Number(parseFloat(item.line_total.toString()).toFixed(2));
        
        return {
          hsCode: item.hs_code || '0000.0000',
          productDescription: (item.item_name || '').replace(/"/g, "'"),
          rate: `${invoice.sales_tax_rate || 0}%`,
          uoM: item.uom || 'Numbers, pieces, units',
          quantity: Number(parseFloat(item.quantity.toString())) || 0,
          totalValues: cleanValue,
          valueSalesExcludingST: cleanValue,
          fixedNotifiedValueOrRetailPrice: 0,
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

    return NextResponse.json({
      payload,
      validation: {
        sellerNTN: sellerNTN.isValid ? 'Valid' : sellerNTN.error,
        buyerNTN: buyerNTN.isValid ? 'Valid' : buyerNTN.error,
      }
    });
  } catch (error: any) {
    console.error('Error generating FBR payload:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
