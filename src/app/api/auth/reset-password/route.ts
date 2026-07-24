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

    // Simple length check: minimum 6 characters
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    let localMode = false;

    if (isSupabaseConfigured()) {
      // 1. Fetch user profile from Supabase (including the password hash column)
      const { data: profile, error: dbErr } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (dbErr) {
        return NextResponse.json({ success: false, error: dbErr.message }, { status: 500 });
      }
      if (!profile) {
        return NextResponse.json({ success: false, error: 'User profile not found.' }, { status: 404 });
      }

      // 2. Verify current password
      const isMatch = bcrypt.compareSync(currentPassword, profile.password || '');
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 401 });
      }

      // 3. Hash new password and update in public.profiles
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(newPassword, salt);

      const { error: profErr } = await supabase!.from('profiles').update({
        password: hash,
        first_login: false,
        password_changed_at: new Date().toISOString()
      }).eq('id', sessionUser.id);

      if (profErr) {
        console.error('Could not update profile fields:', profErr);
        return NextResponse.json({ success: false, error: profErr.message }, { status: 500 });
      }
    } else {
      localMode = true;
    }

    if (localMode) {
      const db = getLocalDb();
      const localUser = db.users.find(u => u.id === sessionUser.id || u.email.toLowerCase() === sessionUser.email.toLowerCase());
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
