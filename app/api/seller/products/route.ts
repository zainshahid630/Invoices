import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkSubscription } from '@/lib/subscription-check';

// GET - List all products for a company
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('Error in GET /api/seller/products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      name,
      hs_code,
      uom,
      unit_price,
      warranty_months,
      description,
      current_stock,
    } = body;

    // Validation
    if (!company_id || !name || !uom || unit_price === undefined) {
      return NextResponse.json(
        { error: 'Company ID, name, UOM, and unit price are required' },
        { status: 400 }
      );
    }

    // Check subscription status
    const subscriptionStatus = await checkSubscription(company_id);
    if (!subscriptionStatus.isActive) {
      return NextResponse.json(
        { 
          error: subscriptionStatus.message || 'Subscription expired',
          subscription_expired: true,
          subscription: subscriptionStatus.subscription
        },
        { status: 403 }
      );
    }

    // Create product
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        company_id,
        name,
        hs_code: hs_code || null,
        uom,
        unit_price: parseFloat(unit_price),
        warranty_months: warranty_months ? parseInt(warranty_months) : null,
        description: description || null,
        current_stock: current_stock ? parseInt(current_stock) : 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If initial stock > 0, create stock history entry
    if (current_stock && parseInt(current_stock) > 0) {
      await supabase.from('stock_history').insert({
        product_id: product.id,
        company_id,
        change_type: 'in',
        quantity: parseInt(current_stock),
        reason: 'Initial stock',
        previous_stock: 0,
        new_stock: parseInt(current_stock),
      });
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/seller/products:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

