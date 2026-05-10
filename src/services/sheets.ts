import { google } from 'googleapis';
import { validateEnv, env } from '@/lib/env';
import { createLogger } from '@/lib/logger';

validateEnv();

const log = createLogger('service:sheets');

// 認証とSheetsクライアントをキャッシュ（毎回Base64デコードを防止）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedAuth: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedSheets: any = null;

function getAuth() {
  if (cachedAuth) return cachedAuth;
  const credentials = JSON.parse(
    Buffer.from(env('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64'), 'base64').toString()
  );
  cachedAuth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return cachedAuth;
}

function getSheets() {
  if (cachedSheets) return cachedSheets;
  cachedSheets = google.sheets({ version: 'v4', auth: getAuth() });
  return cachedSheets;
}

const SHEET_ID = () => env('GOOGLE_SPREADSHEET_ID');

/**
 * リトライ付きで関数を実行（指数バックオフ）
 * Google Sheets APIの一時的な429/503エラーに対応
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { code?: number })?.code;
      const isRetryable = status === 429 || status === 503 || status === 500;

      if (!isRetryable || attempt === maxRetries) {
        throw err;
      }

      const delay = Math.min(1000 * 2 ** attempt, 8000);
      log.warn(`Sheets API error ${status}, retrying in ${delay}ms`, { attempt: attempt + 1 });
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

export async function appendRow(sheetName: string, values: (string | number)[]) {
  const sheets = getSheets();
  await withRetry(() =>
    sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID(),
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })
  );
}

export async function readSheet(sheetName: string, range: string): Promise<string[][]> {
  const sheets = getSheets();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res: any = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID(),
      range: `${sheetName}!${range}`,
    })
  );
  return (res.data.values as string[][]) || [];
}

export async function getNextDocNumber(sheetName: string, prefix: string): Promise<string> {
  const rows = await readSheet(sheetName, 'A:A');
  const year = new Date().getFullYear();
  let maxNum = 0;
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);
  for (const row of rows) {
    if (row[0]) {
      const m = row[0].match(pattern);
      if (m) {
        maxNum = Math.max(maxNum, parseInt(m[1], 10));
      }
    }
  }
  return `${prefix}-${year}-${String(maxNum + 1).padStart(4, '0')}`;
}

export async function updateRow(sheetName: string, rowIndex: number, values: (string | number)[]) {
  const sheets = getSheets();
  await withRetry(() =>
    sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID(),
      range: `${sheetName}!A${rowIndex}:Z${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })
  );
}

export function nowJST(): string {
  return new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
}
