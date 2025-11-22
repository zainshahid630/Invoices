import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import bcrypt from 'bcryptjs';

const supabase = getSupabaseServer();

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();
    const loginIdentifier = username || email; // Support both for backward compatibility

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username (stored in email field)
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('email', loginIdentifier)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact your administrator.' },
        { status: 403 }
      );
    }

    // Check if company is active
    if (!user.company.is_active) {
      return NextResponse.json(
        { error: 'Your company account is inactive. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Error in seller login:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

