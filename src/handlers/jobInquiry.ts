import type { HandlerContext } from '../types';
import { replyText } from '../services/line';

const MOCK_JOBS = [
  { time: '10:00', area: '港区', type: 'ヤマト便', pay: 3500 },
  { time: '14:00', area: '渋谷区', type: 'Amazon便', pay: 3200 },
  { time: '17:00', area: '新宿区', type: '企業配送', pay: 4000 },
];

export async function handleJobInquiry(ctx: HandlerContext) {
  const lines = MOCK_JOBS.map(
    (j) => `  ${j.time} ${j.area} / ${j.type} / ¥${j.pay.toLocaleString()}`
  );
  const total = MOCK_JOBS.reduce((s, j) => s + j.pay, 0);

  await replyText(
    ctx.replyToken,
    `明日の案件は${MOCK_JOBS.length}件あります：\n${lines.join('\n')}\n\n合計報酬：¥${total.toLocaleString()}\n\nご希望の案件があれば「1番受けます」のように返信してください。`
  );
}
