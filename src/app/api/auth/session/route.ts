import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '../../../../utils/jwt';

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get('labyrinth_session');
  if (!cookie) {
    return NextResponse.json({ success: false, error: 'No active session.' }, { status: 401 });
  }

  const payload = await verifyJWT(cookie.value);
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid or expired session.' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      committeeId: payload.committeeId,
      verticalId: payload.verticalId
    }
  });
}
