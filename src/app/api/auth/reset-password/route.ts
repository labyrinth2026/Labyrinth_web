import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured, getSupabaseAdmin } from '@/utils/supabase';
import { dbGetUserByEmail, getLocalDb, saveLocalDb } from '@/utils/db';
import { verifyJWT, signJWT } from '@/utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const cookie = req.cookies.get('labyrinth_session');
    if (!cookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Session missing.' }, { status: 401 });
    }

    const sessionUser = await verifyJWT(cookie.value);
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Current password and new password are required.' }, { status: 400 });
    }

    // Password validation regex check on server side
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ success: false, error: 'New password does not meet complexity requirements.' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const adminClient = getSupabaseAdmin();
      if (!adminClient) {
        return NextResponse.json({ success: false, error: 'Supabase admin client not configured.' }, { status: 500 });
      }

      // 1. Authenticate with current temporary credentials to verify currentPassword
      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email: sessionUser.email,
        password: currentPassword
      });

      if (authError || !authData.user) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
      }

      // 2. Change password in Supabase Auth
      const { error: resetErr } = await adminClient.auth.admin.updateUserById(sessionUser.id, {
        password: newPassword
      });

      if (resetErr) {
        return NextResponse.json({ success: false, error: resetErr.message }, { status: 500 });
      }

      // 3. Update public.profiles set first_login = false, password_changed_at = now()
      const { error: profErr } = await supabase!.from('profiles').update({
        first_login: false,
        password_changed_at: new Date().toISOString()
      }).eq('id', sessionUser.id);

      if (profErr) {
        console.warn('Could not update profile fields:', profErr);
      }
    } else {
      // Fallback local mode
      const db = getLocalDb();
      const localUser = db.users.find(u => u.id === sessionUser.id);
      if (!localUser) {
        return NextResponse.json({ success: false, error: 'User record not found.' }, { status: 404 });
      }

      const isMatch = bcrypt.compareSync(currentPassword, localUser.passwordHash || '');
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
      }

      const salt = bcrypt.genSaltSync(10);
      localUser.passwordHash = bcrypt.hashSync(newPassword, salt);
      localUser.firstLogin = false;
      localUser.passwordChangedAt = new Date().toISOString();

      saveLocalDb(db);
    }

    // 4. Issue a new session token without firstLogin required!
    const updatedPayload = {
      ...sessionUser,
      firstLogin: false
    };

    const token = await signJWT(updatedPayload);

    const response = NextResponse.json({
      success: true,
      user: updatedPayload
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
    console.error('[API] Reset password error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
