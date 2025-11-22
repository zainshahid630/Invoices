import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// Using Sandbox URL for now as per plan
const FBR_BASE_URL = 'https://gw.fbr.gov.pk/di_data/v1/di';
const supabase = getSupabaseServer();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { invoiceData, company_id } = body;

        if (!company_id) {
            return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
        }

        // Fetch FBR Token
        const { data: company, error } = await supabase
            .from('companies')
            .select('fbr_token')
            .eq('id', company_id)
            .single();

        if (error || !company?.fbr_token) {
            console.error('Error fetching FBR token:', error);
            return NextResponse.json({ error: 'FBR Token not found for this company' }, { status: 401 });
        }

        // The endpoint is validateinvoicedata_sb for sandbox
        const response = await fetch(`${FBR_BASE_URL}/validateinvoicedata`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${company.fbr_token}`
            },
            body: JSON.stringify(invoiceData)
        });

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error validating invoice:', error);
        return NextResponse.json(
            { error: 'Failed to validate invoice with FBR' },
            { status: 500 }
        );
    }
}
