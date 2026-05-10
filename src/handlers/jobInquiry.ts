import type { HandlerContext } from '../types';
import { replyText } from '../services/line';
import { createLogger } from '@/lib/logger';

const log = createLogger('handler:jobInquiry');

export async function handleJobInquiry(ctx: HandlerContext) {
  log.info('Job inquiry received', { userId: ctx.userId });

  // TODO: Sheetsの案件シートから実データを取得する
  // 現時点では案件管理機能が未実装のため、準備中メッセージを返す
  await replyText(
    ctx.replyToken,
    [
      'ご確認ありがとうございます。',
      '',
      '案件確認機能は現在準備中です。',
      '案件の詳細については管理者にお問い合わせください。',
      '',
      '他にできること：',
      '  「今日120件配送しました」→ 日報記録',
      '  「今月の請求書」→ 請求書発行',
    ].join('\n')
  );
}
