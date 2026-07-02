import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/utils/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get('labyrinth_session');
  
  // 1. Admin Portal Route Checks
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    const user = await verifyJWT(cookie.value);
    const allowedAdminRoles = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
    if (!user || !allowedAdminRoles.includes(user.role)) {
      // Clear cookie and redirect to login if session invalid
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  // 2. Core Committee Portal Route Checks
  if (pathname.startsWith('/core-committee') && !pathname.startsWith('/core-committee/login')) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/core-committee/login', req.url));
    }
    const user = await verifyJWT(cookie.value);
    if (!user || user.role !== 'CORE_HEAD' || !user.committeeId) {
      const response = NextResponse.redirect(new URL('/core-committee/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  // 3. Vertical Head Portal Route Checks
  if (pathname.startsWith('/vertical-head') && !pathname.startsWith('/vertical-head/login')) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/vertical-head/login', req.url));
    }
    const user = await verifyJWT(cookie.value);
    if (!user || user.role !== 'VERTICAL_HEAD' || !user.verticalId) {
      const response = NextResponse.redirect(new URL('/vertical-head/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/core-committee/:path*',
    '/vertical-head/:path*'
  ]
};
