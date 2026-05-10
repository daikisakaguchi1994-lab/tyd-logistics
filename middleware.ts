import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- 常に公開するルート ---
  // /login          : ログイン画面
  // /api/webhook    : LINE Bot webhook（LINE署名で別途検証）
  // /api/auth       : 認証エンドポイント自体
  // /invoice/[token]: 請求書閲覧（HMAC署名トークンで別途検証）
  if (
    pathname === '/login' ||
    pathname === '/api/webhook' ||
    pathname === '/api/auth' ||
    pathname.startsWith('/invoice/') ||
    pathname.startsWith('/receipt/') ||
    pathname === '/api/invoice-data' ||
    pathname === '/api/receipt-data' ||
    pathname.startsWith('/api/cron/')
  ) {
    return NextResponse.next();
  }

  // --- 認証チェック ---
  const authCookie = req.cookies.get('tyd_auth');
  const isAuthenticated = authCookie?.value === 'authenticated';

  // ダッシュボード関連のAPI（/api/*）もCookieで保護
  if (pathname.startsWith('/api/')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ダッシュボードページ
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/api/:path*'],
};
