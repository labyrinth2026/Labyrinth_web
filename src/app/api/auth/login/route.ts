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
        // 1. Fetch user profile from Supabase (including the password hash column)
        const { data: profile, error: dbErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .maybeSingle();

        if (dbErr) throw dbErr;
        if (!profile) {
          return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
        }

        // 2. Verify password with bcrypt using the profiles table password column
        const passHash = profile.password || profile.password_hash || profile.passwordHash || '';
        const isMatch = bcrypt.compareSync(password, passHash);
        if (!isMatch) {
          return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
        }

        // 3. Map details
        userDetails = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name || profile.name || profile.email.split('@')[0],
          full_name: profile.full_name,
          role: profile.role,
          status: profile.status,
          firstLogin: profile.first_login,
          passwordChangedAt: profile.password_changed_at,
          createdBy: profile.created_by,
          lastLogin: profile.last_login,
          committeeId: profile.committee_id,
          verticalId: profile.vertical_id,
          phone: profile.phone,
          profilePhoto: profile.profile_photo,
          designation: profile.designation,
          department: profile.department
        };
      } catch (err: any) {
        console.error("[Login API] Supabase authentication error:", err);
        return NextResponse.json({ success: false, error: err.message || 'Authentication error.' }, { status: 500 });
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
