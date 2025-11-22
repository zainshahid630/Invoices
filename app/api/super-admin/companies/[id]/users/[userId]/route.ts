import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { hashPassword } from '@/lib/auth';

const supabase = getSupabaseServer();

// GET - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const { id: companyId, userId } = params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password hash from response
    const { password_hash, ...sanitizedUser } = user;

    return NextResponse.json(sanitizedUser);
  } catch (error: any) {
    console.error('Error in GET /api/super-admin/companies/[id]/users/[userId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const { id: companyId, userId } = params;
    const body = await request.json();
    const { name, role, is_active, enable_login, password } = body;

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    
    // Handle is_active based on both is_active and enable_login
    if (is_active !== undefined || enable_login !== undefined) {
      const currentActive = is_active !== undefined ? is_active : true;
      const currentLogin = enable_login !== undefined ? enable_login : true;
      updateData.is_active = currentActive && currentLogin;
    }

    // If password is provided, hash it
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    // Update the user
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove password hash from response
    const { password_hash, ...sanitizedUser } = updatedUser;

    return NextResponse.json(sanitizedUser);
  } catch (error: any) {
    console.error('Error in PATCH /api/super-admin/companies/[id]/users/[userId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const { id: companyId, userId } = params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('company_id', companyId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/super-admin/companies/[id]/users/[userId]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

