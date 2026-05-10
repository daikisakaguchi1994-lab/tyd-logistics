import type { HandlerContext } from '../types';
import { appendRow, nowJST, getNextDocNumber } from '../services/sheets';
import { replyText } from '../services/line';

export async function handleReceipt(ctx: HandlerContext) {
  const data = ctx.classified.extractedData || {};

  if (!data.amount) {
    await replyText(
      ctx.replyToken,
      '領収書を作成します。以下の形式で送信してください：\n\n領収書 5/15 15万円 ABC商事\n\n（日付・金額・取引先名を含めてください）'
    );
    return;
  }

  const docNumber = await getNextDocNumber('領収書', 'RCP');
  const date = (data.date as string) || nowJST().split(' ')[0];
  const amount = data.amount as number;
  const company = (data.company as string) || '（未指定）';

  await appendRow('領収書', [
    docNumber,
    nowJST(),
    ctx.displayName,
    ctx.userId,
    date,
    amount,
    company,
  ]);

  await replyText(
    ctx.replyToken,
    `領収書を作成しました\n\n  領収書番号：${docNumber}\n  日付：${date}\n  金額：¥${amount.toLocaleString()}\n  取引先：${company}\n\n領収書シートに記録済みです。`
  );
}
