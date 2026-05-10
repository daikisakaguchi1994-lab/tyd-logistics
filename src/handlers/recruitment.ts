import type { HandlerContext } from '../types';
import { appendRow, nowJST } from '../services/sheets';
import { replyText } from '../services/line';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '../config';

const log = createLogger('handler:recruitment');

// 採用応募シート: A=datetime, B=displayName, C=userId, D=message, E=status, F=source

export async function handleRecruitment(ctx: HandlerContext) {
  await appendRow(SHEET_NAMES.recruitment, [
    nowJST(),
    ctx.displayName,
    ctx.userId,
    ctx.text,
    '新規',
    'LINE',
  ]);

  log.info('Recruitment inquiry recorded', { userId: ctx.userId, displayName: ctx.displayName });

  const message = [
    `${ctx.displayName}さん、お問い合わせありがとうございます！`,
    '',
    'TYDロジスティクスでドライバーを募集しています。',
    '',
    '【必要条件】',
    '・普通運転免許（AT可）',
    '・軽バンでの配送業務',
    '・業務委託契約',
    '',
    '【報酬】',
    '・1個あたり 160円〜',
    '・月収例：25万〜35万円',
    '',
    '担当者から折り返しご連絡いたします。',
    'しばらくお待ちください。',
  ].join('\n');

  await replyText(ctx.replyToken, message);
}
