import bcrypt from 'bcryptjs';
import { getSupabaseServer } from './supabase-server';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'super_admin' | 'seller_admin' | 'seller_user';
    company_id?: string;
  };
  error?: string;
}

// Super Admin Login
export async function loginSuperAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // Use service role client to bypass RLS during login lookup
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('super_admins')
      .select('*')
      .eq('email', credentials.email)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValidPassword = await bcrypt.compare(credentials.password, data.password_hash);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: 'super_admin',
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Seller Login
export async function loginSeller(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // Use service role client to bypass RLS during login lookup
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from('users')
      .select('*, companies!inner(*)')
      .eq('email', credentials.email)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Check if company is active
    const company = (data as any).companies;
    if (!company || !company.is_active) {
      return { success: false, error: 'Your account is inactive. Please contact support.' };
    }

    const isValidPassword = await bcrypt.compare(credentials.password, data.password_hash);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    return {
      success: true,
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role === 'admin' ? 'seller_admin' : 'seller_user',
        company_id: data.company_id,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

