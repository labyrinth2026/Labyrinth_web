import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../../utils/db';
import { signJWT } from '../../../../utils/jwt';

export async function POST(req: NextRequest) {
  try {
    const { email, password, portalType } = await req.json();

    if (!email || !password || !portalType) {
      return NextResponse.json({ success: false, error: 'Email, password, and portal type are required.' }, { status: 400 });
    }

    const db = getDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Your account is pending registration approval.' }, { status: 403 });
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    let committeeId: string | undefined = undefined;
    let verticalId: string | undefined = undefined;

    // Verify eligibility for the portal
    if (portalType === 'admin') {
      const allowedRoles = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json({ success: false, error: 'Access denied. You do not have an administrative role.' }, { status: 403 });
      }
    } else if (portalType === 'core') {
      if (user.role !== 'CORE_HEAD') {
        return NextResponse.json({ success: false, error: 'Access denied. You are not registered as a Core Committee Head.' }, { status: 403 });
      }
      const assignment = db.committeeAssignments.find(a => a.userId === user.id);
      if (!assignment) {
        return NextResponse.json({ success: false, error: 'Access denied. No assigned committee found for your account.' }, { status: 403 });
      }
      committeeId = assignment.committeeId;
    } else if (portalType === 'vertical') {
      if (user.role !== 'VERTICAL_HEAD') {
        return NextResponse.json({ success: false, error: 'Access denied. You are not registered as a Vertical Head.' }, { status: 403 });
      }
      const assignment = db.verticalAssignments.find(a => a.userId === user.id);
      if (!assignment) {
        return NextResponse.json({ success: false, error: 'Access denied. No assigned vertical found for your account.' }, { status: 403 });
      }
      verticalId = assignment.verticalId;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid portal type.' }, { status: 400 });
    }

    // Create session payload
    const sessionPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      committeeId,
      verticalId
    };

    // Sign token
    const token = await signJWT(sessionPayload);

    // Set cookie
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
    console.error('[API] Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 });
  }
}
