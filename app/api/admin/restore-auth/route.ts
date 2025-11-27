import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

export async function POST() {
    try {
        const supabase = getSupabaseServer();
        const results = [];

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
        }

        // Test select
        // const { error: selectError } = await supabase.from('super_admins').select('count', { count: 'exact', head: true });
        // if (selectError) throw new Error(`Select Error: ${JSON.stringify(selectError)}`);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing');
        if (!supabaseAnonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');

        const { createClient } = require('@supabase/supabase-js');
        const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

        // Test select with anon
        const { error: anonError } = await supabaseAnon.from('super_admins').select('count', { count: 'exact', head: true });

        // Return debug info
        throw new Error(`Debug: URL=${supabaseUrl.substring(0, 10)}... AnonError=${JSON.stringify(anonError)}`);

        // 1. Super Admin
        const { error: adminError } = await supabase
            .from('super_admins')
            .upsert({
                email: 'admin@saas-invoices.com',
                password_hash: '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', // admin123
                name: 'Super Admin'
            }, { onConflict: 'email' });

        if (adminError) throw new Error(`Super Admin Error: ${JSON.stringify(adminError)}`);
        results.push('Super Admin restored');

        // 2. Companies
        const companies = [
            {
                id: '11111111-1111-1111-1111-111111111111',
                name: 'ABC Electronics',
                business_name: 'ABC Electronics Pvt Ltd',
                address: '123 Main Street, Karachi, Sindh',
                ntn_number: '1234567-8',
                gst_number: 'GST-123456',
                is_active: true
            },
            {
                id: '22222222-2222-2222-2222-222222222222',
                name: 'XYZ Traders',
                business_name: 'XYZ Trading Company',
                address: '456 Business Avenue, Lahore, Punjab',
                ntn_number: '9876543-2',
                gst_number: 'GST-987654',
                is_active: true
            }
        ];

        const { error: companiesError } = await supabase
            .from('companies')
            .upsert(companies, { onConflict: 'id' });

        if (companiesError) throw new Error(`Companies Error: ${companiesError?.message || 'Unknown error'}`);
        results.push('Companies restored');

        // 3. Users
        const users = [
            {
                id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
                company_id: '11111111-1111-1111-1111-111111111111',
                email: 'admin@abc-electronics.com',
                password_hash: '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', // seller123
                name: 'Ahmed Khan',
                role: 'admin',
                is_active: true
            },
            {
                id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                company_id: '11111111-1111-1111-1111-111111111111',
                email: 'user@abc-electronics.com',
                password_hash: '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', // seller123
                name: 'Sara Ali',
                role: 'user',
                is_active: true
            },
            {
                id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
                company_id: '22222222-2222-2222-2222-222222222222',
                email: 'admin@xyz-traders.com',
                password_hash: '$2a$10$rKZLvXZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', // seller123
                name: 'Hassan Ahmed',
                role: 'admin',
                is_active: true
            }
        ];

        const { error: usersError } = await supabase
            .from('users')
            .upsert(users, { onConflict: 'email' });

        if (usersError) throw new Error(`Users Error: ${usersError?.message || 'Unknown error'}`);
        results.push('Users restored');

        // 4. Settings
        const settings = [
            {
                company_id: '11111111-1111-1111-1111-111111111111',
                invoice_prefix: 'INV',
                invoice_counter: 1,
                default_sales_tax_rate: 18.00,
                default_further_tax_rate: 1.00
            },
            {
                company_id: '22222222-2222-2222-2222-222222222222',
                invoice_prefix: 'XYZ',
                invoice_counter: 1,
                default_sales_tax_rate: 18.00,
                default_further_tax_rate: 0.00
            }
        ];

        const { error: settingsError } = await supabase
            .from('settings')
            .upsert(settings, { onConflict: 'company_id' });

        if (settingsError) throw new Error(`Settings Error: ${settingsError?.message || 'Unknown error'}`);
        results.push('Settings restored');

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
