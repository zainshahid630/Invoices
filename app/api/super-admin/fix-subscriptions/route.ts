import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Fix missing subscriptions for all companies
export async function POST(request: NextRequest) {
  try {
    // Get all companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, business_name');

    if (companiesError) {
      console.error('Error fetching companies:', companiesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    const results = {
      total: companies.length,
      fixed: 0,
      alreadyHad: 0,
      errors: [] as string[],
    };

    // Check each company and add subscription if missing
    for (const company of companies) {
      try {
        // Check if subscription exists
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('company_id', company.id)
          .single();

        if (existingSubscription) {
          results.alreadyHad++;
          continue;
        }

        // Create 7-day trial subscription
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const { error: insertError} = await supabase
          .from('subscriptions')
          .insert({
            company_id: company.id,
            start_date: new Date().toISOString(),
            end_date: trialEndDate.toISOString(),
            status: 'active',
            payment_status: 'trial',
            amount: 0,
          });

        if (insertError) {
          console.error(`Error creating subscription for ${company.name}:`, insertError);
          results.errors.push(`${company.name}: ${insertError.message}`);
        } else {
          results.fixed++;
        }
      } catch (err: any) {
        console.error(`Error processing ${company.name}:`, err);
        results.errors.push(`${company.name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription fix completed',
      results,
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check which companies are missing subscriptions
export async function GET() {
  try {
    // Get all companies with their subscriptions
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        business_name,
        created_at,
        subscriptions (
          id,
          plan_name,
          status,
          payment_status,
          end_date
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching companies:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      );
    }

    const companiesWithoutSubscription = companies.filter(
      (c: any) => !c.subscriptions || c.subscriptions.length === 0
    );

    return NextResponse.json({
      success: true,
      total_companies: companies.length,
      companies_without_subscription: companiesWithoutSubscription.length,
      missing_subscriptions: companiesWithoutSubscription.map((c: any) => ({
        id: c.id,
        name: c.name,
        business_name: c.business_name,
        created_at: c.created_at,
      })),
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
