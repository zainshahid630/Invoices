import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// POST - Adjust stock (in or out)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { change_type, quantity, reason, company_id } = body;

    // Validation
    if (!change_type || !quantity || !reason || !company_id) {
      return NextResponse.json(
        { error: 'Change type, quantity, reason, and company ID are required' },
        { status: 400 }
      );
    }

    if (change_type !== 'in' && change_type !== 'out') {
      return NextResponse.json(
        { error: 'Change type must be "in" or "out"' },
        { status: 400 }
      );
    }

    const qty = parseInt(quantity);
    if (qty <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }

    // Get current product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate new stock
    const previousStock = product.current_stock;
    let newStock = previousStock;

    if (change_type === 'in') {
      newStock = previousStock + qty;
    } else {
      newStock = previousStock - qty;
      if (newStock < 0) {
        return NextResponse.json(
          { error: 'Insufficient stock. Cannot reduce stock below 0.' },
          { status: 400 }
        );
      }
    }

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ current_stock: newStock })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating product stock:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create stock history entry
    const { data: historyEntry, error: historyError } = await supabase
      .from('stock_history')
      .insert({
        product_id: id,
        company_id,
        change_type,
        quantity: qty,
        reason,
        previous_stock: previousStock,
        new_stock: newStock,
      })
      .select()
      .single();

    if (historyError) {
      console.error('Error creating stock history:', historyError);
      return NextResponse.json({ error: historyError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      previous_stock: previousStock,
      new_stock: newStock,
      history: historyEntry,
    });
  } catch (error: any) {
    console.error('Error in POST /api/seller/products/[id]/stock:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

