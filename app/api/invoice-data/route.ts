import { NextRequest } from 'next/server';
import { readSheet } from '@/src/services/sheets';
import { verifyInvoiceToken } from '@/lib/apiAuth';
import { apiOk, apiBadRequest, apiForbidden, apiNotFound, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:invoice-data');

// 請求書シートからHMAC署名トークンで検索して返す
// このエンドポイントは認証不要（トークン自体がアクセス制御）
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return apiBadRequest('token required');
  }

  // HMAC署名を検証（推測によるアクセスを防止）
  const invoiceNumber = verifyInvoiceToken(token);
  if (!invoiceNumber) {
    return apiForbidden('invalid or expired token');
  }

  try {
    const rows = await readSheet(SHEET_NAMES.invoice, 'A:K');
    // A列 = 請求書番号で検索
    const row = rows.find(r => r[0] === invoiceNumber);
    if (!row) {
      return apiNotFound('請求書が見つかりませんでした');
    }

    // PAY- (月次自動) か INV- (手動) かで形式が異なる
    const isMonthly = invoiceNumber.startsWith('PAY');

    if (isMonthly) {
      // PAY: [番号, 日時, 名前, userId, 対象月, 合計, 宛先, 件数, 単価, 小計, 消費税]
      return apiOk({
        type: 'monthly',
        invoiceNumber: row[0],
        issuedAt: row[1],
        driverName: row[2],
        period: row[4],
        total: Number(row[5]),
        to: row[6],
        count: Number(row[7]),
        rate: Number(row[8]),
        subtotal: Number(row[9]),
        tax: Number(row[10]),
      });
    } else {
      // INV: [番号, 日時, 名前, userId, 日付, 金額, 取引先]
      return apiOk({
        type: 'manual',
        invoiceNumber: row[0],
        issuedAt: row[1],
        driverName: row[2],
        date: row[4],
        amount: Number(row[5]),
        company: row[6],
      });
    }
  } catch (err) {
    log.error('Invoice data fetch failed', err);
    return apiServerError('請求書データの取得に失敗しました');
  }
}
