import type { HandlerContext } from '../types';
import { appendRow, nowJST } from '../services/sheets';
import { replyText } from '../services/line';
import { generateEmpatheticReply } from '../services/claude';

const FALLBACK_REPLY = 'ご連絡ありがとうございます。お大事になさってください。確認して対応いたします。';

export async function handleAbsence(ctx: HandlerContext) {
  // Determine type
  let type = '欠勤';
  if (/遅刻|遅れ/.test(ctx.text)) type = '遅刻';
  if (/トラブル|事故|故障/.test(ctx.text)) type = 'トラブル';

  // Generate empathetic reply with Claude, with timeout fallback
  let reply: string;
  try {
    reply = await Promise.race([
      generateEmpatheticReply(ctx.text),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);
  } catch {
    reply = FALLBACK_REPLY;
  }

  // Log to sheet
  await appendRow('欠勤・連絡', [
    nowJST(),
    ctx.displayName,
    ctx.userId,
    type,
    ctx.text,
    reply,
  ]);

  await replyText(ctx.replyToken, reply);
}
