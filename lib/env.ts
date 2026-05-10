// 必須環境変数のバリデーション
// アプリ起動時に呼び出し、未設定なら即エラーにする

const REQUIRED_VARS = [
  'LINE_CHANNEL_SECRET',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'ANTHROPIC_API_KEY',
  'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64',
  'GOOGLE_SPREADSHEET_ID',
  'DASHBOARD_PASSWORD',
] as const;

const OPTIONAL_VARS = [
  'INVOICE_TOKEN_SECRET',
  'ADMIN_LINE_USER_ID',
  'DEFAULT_DRIVER_RATE',
  'CLIENT_RATE',
  'NEXT_PUBLIC_APP_URL',
] as const;

let validated = false;

export function validateEnv(): void {
  if (validated) return;

  const missing: string[] = [];
  for (const key of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[ENV] Missing required environment variables:\n  ${missing.join('\n  ')}\n\nSet these in .env.local or Vercel dashboard.`
    );
  }

  // INVOICE_TOKEN_SECRET が未設定の場合、警告（LINE_CHANNEL_SECRETにフォールバックする）
  if (!process.env.INVOICE_TOKEN_SECRET) {
    console.warn('[ENV] INVOICE_TOKEN_SECRET is not set. Falling back to LINE_CHANNEL_SECRET for invoice token signing.');
  }

  validated = true;
}

/**
 * 型安全に環境変数を取得する。
 * 必須変数は validateEnv() 済みの前提で non-null 保証。
 */
export function env<K extends (typeof REQUIRED_VARS)[number]>(key: K): string {
  return process.env[key]!;
}
