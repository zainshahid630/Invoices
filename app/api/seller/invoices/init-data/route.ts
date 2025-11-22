import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// GET - Get all initialization data for invoice creation in ONE request
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company_id = searchParams.get('company_id');

    if (!company_id) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    // Execute all queries in parallel - SINGLE DATABASE ROUND TRIP
    const [customersResult, productsResult, settingsResult] = await Promise.all([
      supabase
        .from('customers')
        .select('*')
        .eq('company_id', company_id)
        .eq('is_active', true)
        .order('name', { ascending: true }),
      
      supabase
        .from('products')
        .select('*')
        .eq('company_id', company_id)
        .order('name', { ascending: true }),
      
      supabase
        .from('settings')
        .select('*')
        .eq('company_id', company_id)
        .single()
    ]);

    // Handle errors with detailed logging
    if (customersResult.error) {
      console.error('Error fetching customers:', {
        message: customersResult.error.message,
        details: customersResult.error.details,
        hint: customersResult.error.hint,
        code: customersResult.error.code
      });
      return NextResponse.json({ 
        error: 'Failed to fetch customers',
        details: customersResult.error.message 
      }, { status: 500 });
    }

    if (productsResult.error) {
      console.error('Error fetching products:', {
        message: productsResult.error.message,
        details: productsResult.error.details,
        hint: productsResult.error.hint,
        code: productsResult.error.code
      });
      return NextResponse.json({ 
        error: 'Failed to fetch products',
        details: productsResult.error.message 
      }, { status: 500 });
    }

    if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
      console.error('Error fetching settings:', {
        message: settingsResult.error.message,
        details: settingsResult.error.details,
        hint: settingsResult.error.hint,
        code: settingsResult.error.code
      });
      return NextResponse.json({ 
        error: 'Failed to fetch settings',
        details: settingsResult.error.message 
      }, { status: 500 });
    }

    // Generate next invoice number efficiently
    const settings = settingsResult.data || {
      invoice_prefix: 'INV',
      invoice_counter: 1,
      default_hs_code: '',
      default_sales_tax_rate: 18,
      default_further_tax_rate: 0,
      default_scenario: 'SN002',
      default_uom: 'Numbers, pieces, units'
    };

    const prefix = settings.invoice_prefix || 'INV';
    const counter = settings.invoice_counter || 1;

    // Get all used invoice numbers in ONE query
    const { data: usedInvoices } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('company_id', company_id)
      .like('invoice_number', `${prefix}%`)
      .is('deleted_at', null);

    // Extract numeric parts and find first available number
    const usedNumbers = new Set(
      (usedInvoices || [])
        .map(inv => {
          const numPart = inv.invoice_number.replace(prefix, '');
          return parseInt(numPart) || 0;
        })
        .filter(num => num > 0)
    );

    // Find next available number starting from counter
    let nextNum = counter;
    while (usedNumbers.has(nextNum) && nextNum < counter + 1000) {
      nextNum++;
    }

    const nextInvoiceNumber = `${prefix}${nextNum}`;

    // Return all data in single response
    return NextResponse.json({
      customers: customersResult.data || [],
      products: productsResult.data || [],
      nextInvoiceNumber,
      defaultHsCode: settings.default_hs_code || '',
      defaultSalesTaxRate: settings.default_sales_tax_rate || 18,
      defaultFurtherTaxRate: settings.default_further_tax_rate || 0,
      defaultScenario: settings.default_scenario || 'SN002',
      defaultUom: settings.default_uom || 'Numbers, pieces, units',
      invoicePrefix: prefix,
    });

  } catch (error: any) {
    console.error('Error in GET /api/seller/invoices/init-data:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
