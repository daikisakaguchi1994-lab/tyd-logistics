import type { HandlerContext } from '../types';
import { appendRow, nowJST } from '../services/sheets';
import { replyText } from '../services/line';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '../config';

const log = createLogger('handler:incident');

const TYPE_MAP: [RegExp, string][] = [
  [/事故|ぶつけ|接触/, '物損事故'],
  [/破損|壊れ/, '荷物破損'],
  [/クレーム/, '顧客クレーム'],
  [/紛失|誤配/, '誤配'],
  [/トラブル/, 'その他'],
];

function detectType(text: string): string {
  for (const [pattern, type] of TYPE_MAP) {
    if (pattern.test(text)) return type;
  }
  return 'その他';
}

function detectSeverity(text: string): string {
  if (/人身|怪我|救急|警察/.test(text)) return '重大';
  if (/事故|ぶつけ|大きな/.test(text)) return '中程度';
  return '軽微';
}

export async function handleIncident(ctx: HandlerContext) {
  const type = detectType(ctx.text);
  const severity = detectSeverity(ctx.text);

  await appendRow(SHEET_NAMES.incidents, [
    nowJST(),
    ctx.displayName,
    type,
    severity,
    ctx.text,
    '未対応',
    '',
    'LINE',
  ]);

  log.info('Incident reported via LINE', { userId: ctx.userId, type, severity });

  const message = [
    `${ctx.displayName}さん、報告ありがとうございます。`,
    '',
    `【記録内容】`,
    `種別: ${type}`,
    `深刻度: ${severity}`,
    '',
    severity === '重大'
      ? '⚠️ 重大案件として管理者に通知しました。安全を最優先に行動してください。'
      : '管理者に通知しました。追加情報があれば続けてメッセージしてください。',
  ].join('\n');

  await replyText(ctx.replyToken, message);
}
