import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/utils/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const cookie = req.cookies.get('labyrinth_session');
  
  // 1. Admin Portal Route Checks
  if (pathname.startsWith('/admin')) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const user = await verifyJWT(cookie.value);
    const allowedAdminRoles = ['HOD', 'COORDINATOR', 'ASSOCIATE'];
    if (!user || !allowedAdminRoles.includes(user.role)) {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  // 2. Core Committee Portal Route Checks
  if (pathname.startsWith('/committee')) {
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const user = await verifyJWT(cookie.value);
    if (!user || user.role !== 'CORE_HEAD' || !user.committeeId) {
      // Return 403 Forbidden for authenticated but unauthorized users, or redirect
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('labyrinth_session');
      return response;
    }
  }

  // 3. Vertical Head Portal Route Checks
  if (pathname.startsWith('/vertical')) {
    // Avoid intercepting root /verticals public list
    if (pathname === '/verticals') {
      return NextResponse.next();
    }
    
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    const user = await verifyJWT(cookie.value);
    if (!user || user.role !== 'VERTICAL_HEAD' || !user.verticalId) {
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
    '/vertical/:path*'
  ]
};
