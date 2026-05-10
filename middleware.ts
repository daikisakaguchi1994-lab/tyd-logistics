import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes and login page are always accessible
  if (pathname.startsWith('/api') || pathname === '/login') {
    return NextResponse.next();
  }

  // Check auth cookie for dashboard routes
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    const authCookie = req.cookies.get('tyd_auth');
    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
};
