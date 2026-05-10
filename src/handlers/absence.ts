import type { HandlerContext } from '../types';
import { appendRow, nowJST } from '../services/sheets';
import { replyText } from '../services/line';
import { generateEmpatheticReply } from '../services/claude';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES, THRESHOLDS } from '../config';

const log = createLogger('handler:absence');

const FALLBACK_REPLY = 'ご連絡ありがとうございます。お大事になさってください。確認して対応いたします。';

export async function handleAbsence(ctx: HandlerContext) {
  let type = '欠勤';
  if (/遅刻|遅れ/.test(ctx.text)) type = '遅刻';
  if (/トラブル|事故|故障/.test(ctx.text)) type = 'トラブル';

  let reply: string;
  try {
    reply = await Promise.race([
      generateEmpatheticReply(ctx.text),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), THRESHOLDS.aiTimeoutMs)
      ),
    ]);
  } catch (err) {
    log.warn('AI reply failed, using fallback', err instanceof Error ? { error: err.message } : undefined);
    reply = FALLBACK_REPLY;
  }

  await appendRow(SHEET_NAMES.absence, [
    nowJST(),
    ctx.displayName,
    ctx.userId,
    type,
    ctx.text,
    reply,
  ]);

  log.info('Absence recorded', { userId: ctx.userId, type });
  await replyText(ctx.replyToken, reply);
}
