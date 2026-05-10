import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { APP_CONFIG } from '@/src/config';
import { rateLimit, getClientIP } from '@/lib/apiAuth';
import { apiBadRequest, apiUnauthorized } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';

const log = createLogger('api:auth');

/** タイミング攻撃を防ぐ定数時間パスワード比較 */
function verifyPassword(input: string, expected: string): boolean {
  const inputHash = crypto.createHash('sha256').update(input).digest();
  const expectedHash = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(inputHash, expectedHash);
}

export async function POST(req: NextRequest) {
  // ブルートフォース対策: 同一IPから5分に5回まで
  const limited = rateLimit(`auth:${getClientIP(req)}`, 5, 5 * 60_000);
  if (limited) return limited;

  const { password } = await req.json();

  if (!password || typeof password !== 'string') {
    return apiBadRequest('パスワードが必要です');
  }

  if (verifyPassword(password, APP_CONFIG.dashboardPassword)) {
    log.info('Login success', { ip: getClientIP(req) });
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

  log.warn('Login failed', { ip: getClientIP(req) });
  return apiUnauthorized('パスワードが正しくありません');
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(APP_CONFIG.authCookieName);
  return res;
}
