import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

const FBR_BASE_URL = 'https://gw.fbr.gov.pk/dist/v1';
const supabase = getSupabaseServer();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, ntn, date, company_id } = body;

        if (!type || !ntn) {
            return NextResponse.json({ error: 'Type and NTN are required' }, { status: 400 });
        }

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

        let endpoint = '';
        let payload = {};

        if (type === 'reg_type') {
            endpoint = '/Get_Reg_Type';
            payload = { Registration_No: ntn };
        } else if (type === 'status') {
            endpoint = '/statl';
            const checkDate = date || new Date().toISOString().split('T')[0];
            payload = { regno: ntn, date: checkDate };
        } else {
            return NextResponse.json({ error: 'Invalid validation type' }, { status: 400 });
        }

        // Using POST as per previous decision, but with Authorization header now
        const response = await fetch(`${FBR_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${company.fbr_token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error validating buyer:', error);
        return NextResponse.json(
            { error: 'Failed to validate buyer with FBR' },
            { status: 500 }
        );
    }
}
