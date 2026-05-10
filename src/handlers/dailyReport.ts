import type { HandlerContext } from '../types';
import { appendRow, updateRow, nowJST, readSheet } from '../services/sheets';
import { replyText } from '../services/line';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '../config';

const log = createLogger('handler:dailyReport');

const CORRECTION_KEYWORDS = /訂正|修正|間違|まちがい|すいません|すみません|ごめん|やり直/;

function isTodayJST(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const todayJST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return d.getFullYear() === todayJST.getFullYear()
    && d.getMonth() === todayJST.getMonth()
    && d.getDate() === todayJST.getDate();
}

export async function handleDailyReport(ctx: HandlerContext) {
  const count = ctx.classified.extractedData?.count as number ?? 0;
  const isCorrection = CORRECTION_KEYWORDS.test(ctx.text);

  let corrected = false;
  let oldCount = 0;

  if (isCorrection) {
    try {
      const rows = await readSheet(SHEET_NAMES.dailyReport, 'A:E');
      for (let i = rows.length - 1; i >= 1; i--) {
        if (rows[i][2] === ctx.userId && rows[i][0] && isTodayJST(rows[i][0])) {
          oldCount = parseInt(rows[i][3], 10) || 0;
          await updateRow(SHEET_NAMES.dailyReport, i + 1, [
            nowJST(),
            ctx.displayName,
            ctx.userId,
            count,
            `${ctx.text}（訂正前: ${oldCount}件）`,
          ]);
          corrected = true;
          log.info('Corrected daily report', { userId: ctx.userId, oldCount, newCount: count });
          break;
        }
      }
    } catch (err) {
      log.error('Failed to read sheet for correction, falling back to append', err);
    }
  }

  if (!corrected) {
    await appendRow(SHEET_NAMES.dailyReport, [
      nowJST(),
      ctx.displayName,
      ctx.userId,
      count,
      ctx.text,
    ]);
    log.info('Appended daily report', { userId: ctx.userId, count });
  }

  // 今月の累計
  let monthlyTotal = 0;
  try {
    const rows = await readSheet(SHEET_NAMES.dailyReport, 'A:D');
    const now = new Date();
    const todayJST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const currentMonth = todayJST.getMonth();
    const currentYear = todayJST.getFullYear();
    for (const row of rows.slice(1)) {
      if (row[2] === ctx.userId && row[0]) {
        const d = new Date(row[0]);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
          monthlyTotal += parseInt(row[3], 10) || 0;
        }
      }
    }
  } catch (err) {
    log.error('Failed to calculate monthly total', err);
    monthlyTotal = count;
  }

  const message = corrected
    ? `訂正しました！${oldCount}件 → ${count}件\n（今月の累計：${monthlyTotal}件）`
    : `${count}件、記録しました。お疲れさまでした！\n（今月の累計：${monthlyTotal}件）`;

  await replyText(ctx.replyToken, message);
}
