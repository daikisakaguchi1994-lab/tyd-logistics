import crypto from 'crypto';
import { classify } from '@/src/router';
import { classifyWithAI } from '@/src/services/claude';
import { replyText, getDisplayName } from '@/src/services/line';
import { handleDailyReport } from '@/src/handlers/dailyReport';
import { handleAbsence } from '@/src/handlers/absence';
import { handleJobInquiry } from '@/src/handlers/jobInquiry';
import { handleInvoice } from '@/src/handlers/invoice';
import { handleReceipt } from '@/src/handlers/receipt';
import type { HandlerContext, Scenario } from '@/src/types';

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest('base64');
  return hash === signature;
}

const HELP_MESSAGE = `TYD管理Botです。以下のコマンドが使えます：

  「今日120件配送しました」→ 日報記録
  「休みます」→ 欠勤連絡
  「明日の案件は？」→ 案件確認

■ 請求書
  「今月の請求書」→ 月次請求書を自動発行
  「先月の請求書を発行」→ 先月分を発行
  「請求書 5/15 15万円 ABC商事」→ 手動作成

  「領収書 5/15 15万円 ABC商事」→ 領収書作成`;

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') || '';

  if (!verifySignature(rawBody, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const body = JSON.parse(rawBody);
  const events = body.events || [];

  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') {
      // Non-text messages: friendly response
      if (event.type === 'message' && event.replyToken) {
        await replyText(event.replyToken, 'テキストメッセージでお願いします！');
      }
      continue;
    }

    const text: string = event.message.text;
    const userId: string = event.source.userId;
    const replyToken: string = event.replyToken;

    try {
      const displayName = await getDisplayName(userId);
      let classified = classify(text);

      // If unknown, try Claude classification
      if (classified.scenario === 'unknown') {
        try {
          const aiResult = await Promise.race([
            classifyWithAI(text),
            new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
          ]);
          const validScenarios: Scenario[] = ['daily_report', 'absence', 'job_inquiry', 'invoice', 'receipt'];
          if (validScenarios.includes(aiResult as Scenario)) {
            classified = { scenario: aiResult as Scenario };
          }
        } catch {
          // Claude timeout or error, stay unknown
        }
      }

      const ctx: HandlerContext = { replyToken, userId, displayName, text, classified };

      switch (classified.scenario) {
        case 'daily_report':
          await handleDailyReport(ctx);
          break;
        case 'absence':
          await handleAbsence(ctx);
          break;
        case 'job_inquiry':
          await handleJobInquiry(ctx);
          break;
        case 'invoice':
          await handleInvoice(ctx);
          break;
        case 'receipt':
          await handleReceipt(ctx);
          break;
        default:
          await replyText(replyToken, HELP_MESSAGE);
      }
    } catch (error) {
      console.error('Handler error:', error);
      try {
        await replyText(replyToken, 'システムエラーが発生しました。もう一度お試しください。');
      } catch {
        // If even the error reply fails, nothing we can do
      }
    }
  }

  return new Response('OK', { status: 200 });
}
