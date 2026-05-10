import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { classify } from '@/src/router';
import { classifyWithAI } from '@/src/services/claude';
import { replyText, getDisplayName } from '@/src/services/line';
import { getHandler, VALID_SCENARIOS } from '@/src/handlers';
import { rateLimit, getClientIP } from '@/lib/apiAuth';
import { createLogger } from '@/lib/logger';
import { validateEnv, env } from '@/lib/env';
import { THRESHOLDS } from '@/src/config';
import type { HandlerContext, Scenario } from '@/src/types';

validateEnv();

const log = createLogger('webhook');

function verifySignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', env('LINE_CHANNEL_SECRET'))
    .update(body)
    .digest('base64');

  // タイミング攻撃防止
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  } catch {
    return false;
  }
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

export async function POST(request: NextRequest) {
  const limited = rateLimit(`webhook:${getClientIP(request)}`, 50, 1_000);
  if (limited) return new Response('Too many requests', { status: 429 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-line-signature') || '';

  if (!verifySignature(rawBody, signature)) {
    log.warn('Invalid LINE signature');
    return new Response('Invalid signature', { status: 401 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    log.warn('Invalid JSON body');
    return new Response('Invalid JSON', { status: 400 });
  }
  const events = body.events || [];

  for (const event of events) {
    if (event.type !== 'message' || event.message.type !== 'text') {
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

      log.info('Message classified', { userId, scenario: classified.scenario, method: 'regex' });

      // If unknown, try Claude classification
      if (classified.scenario === 'unknown') {
        try {
          const aiResult = await Promise.race([
            classifyWithAI(text),
            new Promise<string>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), THRESHOLDS.aiTimeoutMs)
            ),
          ]);
          if (VALID_SCENARIOS.includes(aiResult as Scenario)) {
            classified = { scenario: aiResult as Scenario };
            log.info('AI reclassified', { userId, scenario: classified.scenario });
          }
        } catch (err) {
          log.warn('AI classification failed, staying unknown', err instanceof Error ? { error: err.message } : undefined);
        }
      }

      const ctx: HandlerContext = { replyToken, userId, displayName, text, classified };

      const handler = getHandler(classified.scenario);
      if (handler) {
        await handler(ctx);
        log.info('Handler completed', { scenario: classified.scenario, userId });
      } else {
        await replyText(replyToken, HELP_MESSAGE);
        log.info('Sent help message', { userId });
      }
    } catch (error) {
      log.error('Handler failed', error, { userId, text: text.slice(0, 50) });
      try {
        await replyText(replyToken, 'システムエラーが発生しました。もう一度お試しください。');
      } catch {
        // reply itself failed
      }
    }
  }

  return new Response('OK', { status: 200 });
}
