import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/utils/jwt';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get('labyrinth_session');
  let user: any = null;

  if (cookie) {
    user = await verifyJWT(cookie.value);
  }

  // 1. First Login Redirection Flow
  if (user && user.firstLogin === true) {
    if (pathname !== '/auth/reset-password') {
      return NextResponse.redirect(new URL('/auth/reset-password', req.url));
    }
    return NextResponse.next();
  }

  // If user is logged in, but not firstLogin, block reset-password access
  if (user && user.firstLogin === false && pathname === '/auth/reset-password') {
    if (['HOD', 'COORDINATOR', 'ASSOCIATE'].includes(user.role)) {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else if (user.role === 'CORE_HEAD') {
      return NextResponse.redirect(new URL('/committee', req.url));
    } else if (user.role === 'VERTICAL_HEAD') {
      return NextResponse.redirect(new URL('/vertical', req.url));
    }
  }

  // Allow reset-password page access only if user is logged in
  if (!user && pathname === '/auth/reset-password') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 2. Admin Portal Route Checks
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const allowedAdminRoles = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
    if (!allowedAdminRoles.includes(user.role)) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  // 3. Core Committee Portal Route Checks
  if (pathname.startsWith('/committee')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (user.role !== 'CORE_HEAD' || !user.committeeId) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  // 4. Vertical Head Portal Route Checks
  if (pathname.startsWith('/vertical')) {
    if (pathname === '/verticals') {
      return NextResponse.next();
    }
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (user.role !== 'VERTICAL_HEAD' || !user.verticalId) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/committee/:path*',
    '/vertical/:path*',
    '/auth/reset-password'
  ]
};
