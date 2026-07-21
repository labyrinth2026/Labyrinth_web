import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from '@/utils/supabase';
import { dbGetUserByEmail, getLocalDb, dbUpdateLastLogin } from '@/utils/db';
import { signJWT } from '@/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    let userDetails: any = null;
    let localMode = false;

    if (isSupabaseConfigured() && supabase) {
      try {
        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase().trim(),
          password
        });

        if (authError) {
          if (authError.message === 'fetch failed' || authError.message.includes('fetch') || !authError.status) {
            throw authError;
          }
          localMode = true;
        } else if (!authData.user) {
          localMode = true;
        } else {
          // 2. Fetch profile role & status details
          userDetails = await dbGetUserByEmail(email);
          if (!userDetails) {
            localMode = true;
          }
        }
      } catch (err: any) {
        console.warn("[Login API] Supabase auth connection failed, falling back to local auth:", err);
        localMode = true;
      }
    } else {
      localMode = true;
    }

    if (localMode) {
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

    if (!userDetails) {
      return NextResponse.json({ success: false, error: 'User profile not found in database.' }, { status: 401 });
    }

    // Check approval/activation status
    if (userDetails.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Your account is deactivated or inactive.' }, { status: 403 });
    }

    // Only administrators can authenticate
    if (userDetails.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized Access' }, { status: 403 });
    }

    // Build session token
    const sessionPayload = {
      id: userDetails.id,
      email: userDetails.email,
      name: userDetails.name,
      role: userDetails.role,
      committeeId: userDetails.committeeId,
      verticalId: userDetails.verticalId,
      firstLogin: userDetails.firstLogin === true
    };

    const token = await signJWT(sessionPayload);

    // Update last login timestamp if not first time login
    if (!userDetails.firstLogin) {
      await dbUpdateLastLogin(userDetails.id);
    }

    // Build response and set HttpOnly session cookie
    const response = NextResponse.json({
      success: true,
      mustReset: userDetails.firstLogin === true,
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
