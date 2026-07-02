import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { dbGetUserByEmail, getLocalDb } from '@/utils/db';
import { signJWT } from '@/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    let userDetails: any = null;

    if (isSupabaseConfigured() && supabase) {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (authError || !authData.user) {
        return NextResponse.json({ success: false, error: authError?.message || 'Invalid email or password.' }, { status: 401 });
      }

      // 2. Fetch profile role & status details
      userDetails = await dbGetUserByEmail(email);
      if (!userDetails) {
        return NextResponse.json({ success: false, error: 'User profile not found in database.' }, { status: 401 });
      }
    } else {
      // Fallback local mode
      const db = getLocalDb();
      const localUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!localUser) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      const isMatch = bcrypt.compareSync(password, localUser.passwordHash || '');
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
      }

      userDetails = await dbGetUserByEmail(email);
    }

    // Check approval status
    if (userDetails.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Your account is pending registration approval.' }, { status: 403 });
    }

    // Build session token
    const sessionPayload = {
      id: userDetails.id,
      email: userDetails.email,
      name: userDetails.name,
      role: userDetails.role,
      committeeId: userDetails.committeeId,
      verticalId: userDetails.verticalId
    };

    const token = await signJWT(sessionPayload);

    // Build response and set HttpOnly session cookie
    const response = NextResponse.json({
      success: true,
      user: sessionPayload
    });

    response.cookies.set('labyrinth_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error: any) {
    console.error('[API] Unified login error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
