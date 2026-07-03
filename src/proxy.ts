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
    if (user.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    } else {
      return NextResponse.redirect(new URL('/access-denied', req.url));
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
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/reset-password'
  ]
};
