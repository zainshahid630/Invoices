import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const supabase = getSupabaseServer();

// DELETE - Permanently delete an invoice (hard delete from database)
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { company_id, invoice_id } = body;

        if (!company_id || !invoice_id) {
            return NextResponse.json(
                { error: 'Company ID and Invoice ID are required' },
                { status: 400 }
            );
        }

        // First, verify the invoice exists and is already soft-deleted
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('id, invoice_number, deleted_at')
            .eq('id', invoice_id)
            .eq('company_id', company_id)
            .single();

        if (fetchError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (!invoice.deleted_at) {
            return NextResponse.json(
                { error: 'Invoice must be soft-deleted first before permanent deletion' },
                { status: 400 }
            );
        }

        // Delete invoice items first (foreign key constraint)
        const { error: itemsError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', invoice_id);

        if (itemsError) {
            console.error('Error deleting invoice items:', itemsError);
            return NextResponse.json(
                { error: 'Failed to delete invoice items' },
                { status: 500 }
            );
        }

        // Now permanently delete the invoice
        const { error: deleteError } = await supabase
            .from('invoices')
            .delete()
            .eq('id', invoice_id)
            .eq('company_id', company_id);

        if (deleteError) {
            console.error('Error permanently deleting invoice:', deleteError);
            return NextResponse.json(
                { error: 'Failed to permanently delete invoice' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Invoice ${invoice.invoice_number} has been permanently deleted. The invoice number is now available for reuse.`,
        });
    } catch (error: any) {
        console.error('Error in permanent delete:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
