import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { APP_CONFIG } from '@/src/config';

// ============================================================
// API認証: ダッシュボードのCookieで保護
// ============================================================

/**
 * APIルートでCookie認証を検証する。
 * 認証失敗時は401レスポンスを返す（nullではない）。
 * 成功時はnullを返す。
 *
 * 使い方:
 *   const denied = requireAuth(req);
 *   if (denied) return denied;
 */
export function requireAuth(req: NextRequest): NextResponse | null {
  const cookie = req.cookies.get(APP_CONFIG.authCookieName);
  if (cookie?.value === 'authenticated') return null;
  return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
}

// ============================================================
// 請求書トークン: HMAC署名で推測不可にする
// ============================================================

const INVOICE_SECRET = () => {
  const secret = process.env.INVOICE_TOKEN_SECRET || process.env.LINE_CHANNEL_SECRET;
  if (!secret) throw new Error('[SECURITY] Neither INVOICE_TOKEN_SECRET nor LINE_CHANNEL_SECRET is set');
  return secret;
};

/**
 * 請求書番号からHMAC署名付きトークンを生成。
 * 形式: {invoiceNumber}.{signature}
 */
export function generateInvoiceToken(invoiceNumber: string): string {
  const sig = crypto
    .createHmac('sha256', INVOICE_SECRET())
    .update(invoiceNumber)
    .digest('hex')
    .slice(0, 16); // 先頭16文字で十分
  return `${invoiceNumber}.${sig}`;
}

/**
 * トークンを検証し、有効なら請求書番号を返す。無効ならnull。
 */
export function verifyInvoiceToken(token: string): string | null {
  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return null;

  const invoiceNumber = token.slice(0, dotIndex);
  const providedSig = token.slice(dotIndex + 1);

  const expectedSig = crypto
    .createHmac('sha256', INVOICE_SECRET())
    .update(invoiceNumber)
    .digest('hex')
    .slice(0, 16);

  // タイミング攻撃防止
  if (providedSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) return null;

  return invoiceNumber;
}

// ============================================================
// レート制限: メモリベースの簡易実装
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// 定期的にストアをクリーンアップ（メモリリーク防止）
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
}, 60_000);

/**
 * 簡易レート制限。
 * @param key   識別キー（IPやエンドポイント名など）
 * @param limit ウィンドウ内の最大リクエスト数
 * @param windowMs ウィンドウのミリ秒
 * @returns 制限超過ならtrueレスポンス、許可ならnull
 */
export function rateLimit(key: string, limit: number, windowMs: number): NextResponse | null {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  entry.count++;
  if (entry.count > limit) {
    return NextResponse.json(
      { error: 'リクエスト制限を超えました。しばらく待ってからお試しください。' },
      { status: 429 }
    );
  }

  return null;
}

/**
 * リクエストからIPアドレスを取得（Vercel対応）
 */
export function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || 'unknown';
}
