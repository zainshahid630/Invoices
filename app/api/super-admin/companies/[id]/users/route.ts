import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

// GET - List all users for a company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove password hashes from response
    const sanitizedUsers = users.map(({ password_hash, ...user }) => user);

    return NextResponse.json(sanitizedUsers);
  } catch (error: any) {
    console.error('Error in GET /api/super-admin/companies/[id]/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new user for a company
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = params.id;
    const body = await request.json();
    const { username, email, name, password, role = 'user', is_active = true, enable_login = true } = body;

    // Validate required fields
    if (!username || !name || !password) {
      return NextResponse.json(
        { error: 'Username, name, and password are required' },
        { status: 400 }
      );
    }

    // Create email from username if not provided
    const userEmail = email || `${username}@company.local`;

    // Check if username already exists (check email field since we're storing username there)
    const { data: existingUsers } = await supabase
      .from('users')
      .select('id')
      .eq('email', username)
      .eq('company_id', companyId);

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'A user with this username already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const password_hash = await hashPassword(password);

    // Create the user (store username in email field for now)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        company_id: companyId,
        email: username, // Store username in email field
        name,
        password_hash,
        role,
        is_active: is_active && enable_login, // Only active if both are true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Remove password hash from response
    const { password_hash: _, ...sanitizedUser } = newUser;

    return NextResponse.json(sanitizedUser, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/super-admin/companies/[id]/users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

