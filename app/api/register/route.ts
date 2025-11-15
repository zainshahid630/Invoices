import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Company details
      company_name,
      business_name,
      ntn_number,
      address,
      province,
      phone,
      email,
      // User details
      user_name,
      username,
      password,
    } = body;

    // Validation
    if (!company_name || !business_name || !user_name || !username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Company name, business name, your name, username, and password are required' 
        },
        { status: 400 }
      );
    }

    // Check if username already exists across all companies
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', username);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Username already exists. Please choose a different username.' },
        { status: 400 }
      );
    }

    // Check if NTN number already exists (if provided)
    if (ntn_number && ntn_number.trim() !== '') {
      const { data: existingCompanies } = await supabase
        .from('companies')
        .select('id, business_name')
        .eq('ntn_number', ntn_number.trim());

      if (existingCompanies && existingCompanies.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'This NTN number is already registered. Each company must have a unique NTN number.' 
          },
          { status: 400 }
        );
      }
    }

    // Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: company_name,
        business_name: business_name,
        address: address || '',
        ntn_number: ntn_number || '',
        gst_number: '',
        province: province || 'Sindh',
        phone: phone || '',
        email: email || '',
        is_active: true,
        fbr_token: '', // User will add this later in settings
      })
      .select()
      .single();

    if (companyError) {
      console.error('Error creating company:', companyError);
      return NextResponse.json(
        { success: false, error: 'Failed to create company. Please try again.' },
        { status: 500 }
      );
    }

    // Create default settings for the company
    await supabase.from('settings').insert({
      company_id: company.id,
      invoice_prefix: 'INV',
      invoice_counter: 1,
      default_sales_tax_rate: 18.0,
      default_further_tax_rate: 0.0,
      default_hs_code: '0000.0000',
    });

    // Create default feature toggles (all enabled for trial)
    const features = [
      'inventory_management',
      'customer_management',
      'invoice_creation',
      'fbr_integration',
      'payment_tracking',
      'whatsapp_integration',
      'email_integration',
    ];

    await supabase.from('feature_toggles').insert(
      features.map((feature) => ({
        company_id: company.id,
        feature_name: feature,
        is_enabled: true,
      }))
    );

    // Create subscription (7-day free trial)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days from now

    await supabase.from('subscriptions').insert({
      company_id: company.id,
      start_date: new Date().toISOString(),
      end_date: trialEndDate.toISOString(),
      status: 'active',
      payment_status: 'trial',
      amount: 0,
    });

    // Hash the password
    const password_hash = await hashPassword(password);

    // Create admin user for the company
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        company_id: company.id,
        email: username, // Store username in email field
        name: user_name,
        password_hash,
        role: 'admin', // First user is admin
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      // Rollback: delete the company if user creation fails
      await supabase.from('companies').delete().eq('id', company.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create user account. Please try again.' },
        { status: 500 }
      );
    }

    // Return success with user data (without password)
    const { password_hash: _, ...sanitizedUser } = newUser;

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! You can now login.',
      user: sanitizedUser,
      company: {
        id: company.id,
        name: company.name,
        business_name: company.business_name,
      },
      trial_end_date: trialEndDate.toISOString(),
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
