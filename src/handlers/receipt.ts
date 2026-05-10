import type { HandlerContext } from '../types';
import { appendRow, nowJST, getNextDocNumber } from '../services/sheets';
import { replyText } from '../services/line';
import { generateInvoiceToken } from '@/lib/apiAuth';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '../config';

const log = createLogger('handler:receipt');

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function handleReceipt(ctx: HandlerContext) {
  const data = ctx.classified.extractedData || {};

  if (!data.amount) {
    await replyText(
      ctx.replyToken,
      '領収書を作成します。以下の形式で送信してください：\n\n領収書 5/15 15万円 ABC商事\n\n（日付・金額・取引先名を含めてください）'
    );
    return;
  }

  const docNumber = await getNextDocNumber(SHEET_NAMES.receipt, 'RCP');
  const date = (data.date as string) || nowJST().split(' ')[0];
  const amount = data.amount as number;
  const company = (data.company as string) || '（未指定）';

  await appendRow(SHEET_NAMES.receipt, [
    docNumber,
    nowJST(),
    ctx.displayName,
    ctx.userId,
    date,
    amount,
    company,
  ]);

  log.info('Receipt created', { docNumber, userId: ctx.userId, amount });

  const receiptToken = generateInvoiceToken(docNumber);
  const receiptUrl = `${getAppUrl()}/receipt/${encodeURIComponent(receiptToken)}`;

  await replyText(
    ctx.replyToken,
    [
      `領収書を作成しました`,
      '',
      `  領収書番号：${docNumber}`,
      `  日付：${date}`,
      `  金額：¥${amount.toLocaleString()}`,
      `  取引先：${company}`,
      '',
      '■ PDF領収書',
      receiptUrl,
      '',
      '領収書シートに記録済みです。',
    ].join('\n')
  );
}
