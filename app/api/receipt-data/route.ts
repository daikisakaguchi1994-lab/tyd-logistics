import { NextRequest } from 'next/server';
import { readSheet } from '@/src/services/sheets';
import { verifyInvoiceToken } from '@/lib/apiAuth';
import { apiOk, apiBadRequest, apiForbidden, apiNotFound, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:receipt-data');

// 領収書シートからHMAC署名トークンで検索して返す
// このエンドポイントは認証不要（トークン自体がアクセス制御）
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return apiBadRequest('token required');
  }

  const receiptNumber = verifyInvoiceToken(token);
  if (!receiptNumber) {
    return apiForbidden('invalid or expired token');
  }

  try {
    const rows = await readSheet(SHEET_NAMES.receipt, 'A:G');
    // A列 = 領収書番号で検索
    const row = rows.find(r => r[0] === receiptNumber);
    if (!row) {
      return apiNotFound('領収書が見つかりませんでした');
    }

    // RCP: [番号, 日時, 名前, userId, 日付, 金額, 取引先]
    return apiOk({
      receiptNumber: row[0],
      issuedAt: row[1],
      driverName: row[2],
      date: row[4],
      amount: Number(row[5]),
      company: row[6],
    });
  } catch (err) {
    log.error('Receipt data fetch failed', err);
    return apiServerError('領収書データの取得に失敗しました');
  }
}
