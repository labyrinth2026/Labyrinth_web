import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from './utils/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get('labyrinth_session');
  let user: any = null;

  if (cookie) {
    user = await verifyJWT(cookie.value);
  }

  const redirectToLogin = () => {
    const res = NextResponse.redirect(new URL('/admin/login', req.url));
    if (cookie) {
      res.cookies.delete('labyrinth_session');
    }
    return res;
  };

  const redirectToDashboard = () => {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  };

  const redirectToResetPassword = () => {
    return NextResponse.redirect(new URL('/auth/reset-password', req.url));
  };

  // Redirect legacy /login route to /admin/login
  if (pathname === '/login') {
    return redirectToLogin();
  }

  // 1. Handling Reset Password route
  if (pathname === '/auth/reset-password') {
    if (!user || user.role !== 'ADMIN') {
      return redirectToLogin();
    }
    if (user.firstLogin === false) {
      return redirectToDashboard();
    }
    return NextResponse.next();
  }

  // 2. Handling Login route
  if (pathname === '/admin/login') {
    if (user && user.role === 'ADMIN') {
      if (user.firstLogin === true) {
        return redirectToResetPassword();
      }
      return redirectToDashboard();
    }
    return NextResponse.next();
  }

  // 3. Handling Admin Portal routes
  if (pathname.startsWith('/admin')) {
    if (!user || user.role !== 'ADMIN') {
      return redirectToLogin();
    }
    if (user.firstLogin === true) {
      return redirectToResetPassword();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/auth/reset-password',
    '/login'
  ]
};
