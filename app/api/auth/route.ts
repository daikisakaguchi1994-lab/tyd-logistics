import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/src/config';

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === APP_CONFIG.dashboardPassword) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(APP_CONFIG.authCookieName, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * APP_CONFIG.authCookieMaxAgeDays,
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ ok: false, error: 'パスワードが正しくありません' }, { status: 401 });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(APP_CONFIG.authCookieName);
  return res;
}
