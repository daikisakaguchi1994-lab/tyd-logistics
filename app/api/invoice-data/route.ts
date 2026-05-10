import { NextRequest, NextResponse } from 'next/server';
import { readSheet } from '@/src/services/sheets';

// 請求書シートからトークン（請求書番号）で検索して返す
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'token required' }, { status: 400 });
  }

  try {
    const rows = await readSheet('請求書', 'A:K');
    // A列 = 請求書番号で検索
    const row = rows.find(r => r[0] === token);
    if (!row) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    // PAY- (月次自動) か INV- (手動) かで形式が異なる
    const isMonthly = token.startsWith('PAY');

    if (isMonthly) {
      // PAY: [番号, 日時, 名前, userId, 対象月, 合計, 宛先, 件数, 単価, 小計, 消費税]
      return NextResponse.json({
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
      return NextResponse.json({
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
    console.error('Invoice data error:', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
