import { NextRequest } from 'next/server';
import { readSheet, appendRow, updateRow } from '@/src/services/sheets';
import { pushMessage } from '@/src/services/line';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:jobs');

// 案件配信シート: A=datetime, B=title, C=area, D=date, E=count, F=rate, G=details, H=sentTo (JSON), I=status

/** 案件一覧取得 */
export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.jobs, 'A:I');
    const jobs = rows.slice(1).map((row, i) => ({
      index: i + 2,
      datetime: row[0] || '',
      title: row[1] || '',
      area: row[2] || '',
      date: row[3] || '',
      count: parseInt(row[4], 10) || 0,
      rate: parseInt(row[5], 10) || 0,
      details: row[6] || '',
      sentTo: row[7] ? JSON.parse(row[7]) : [],
      status: row[8] || '募集中',
    }));
    return apiOk({ jobs });
  } catch (error) {
    log.error('Failed to fetch jobs', error);
    return apiServerError('案件データの取得に失敗しました');
  }
}

/** 案件作成＋LINE配信 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, area, date, count, rate, details, drivers } = body;

    if (!title || typeof title !== 'string') {
      return apiBadRequest('title is required');
    }
    if (!drivers || !Array.isArray(drivers) || drivers.length === 0) {
      return apiBadRequest('drivers array is required');
    }

    // LINE メッセージ組み立て
    const lines = [
      `【案件のご案内】`,
      ``,
      `${title}`,
      ...(area ? [`エリア: ${area}`] : []),
      ...(date ? [`日程: ${date}`] : []),
      ...(count ? [`予定件数: ${count}件`] : []),
      ...(rate ? [`単価: ¥${rate}/件`] : []),
      ...(details ? [``, details] : []),
      ``,
      `対応可能な方はこのメッセージに返信してください。`,
    ];
    const message = lines.join('\n');

    // 各ドライバーに送信
    const sentTo: { name: string; userId: string }[] = [];
    const errors: string[] = [];

    for (const driver of drivers) {
      if (!driver.userId) continue;
      try {
        await pushMessage(driver.userId, message);
        sentTo.push({ name: driver.name, userId: driver.userId });
      } catch (err) {
        log.error(`Failed to send job to ${driver.name}`, err);
        errors.push(driver.name);
      }
    }

    // シートに記録
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    await appendRow(SHEET_NAMES.jobs, [
      now,
      title,
      area || '',
      date || '',
      count || 0,
      rate || 0,
      details || '',
      JSON.stringify(sentTo),
      '募集中',
    ]);

    log.info('Job broadcast sent', { title, sentCount: sentTo.length, errorCount: errors.length });
    return apiOk({
      success: true,
      sentCount: sentTo.length,
      errors: errors.length > 0 ? errors : undefined,
    }, 201);
  } catch (error) {
    log.error('Failed to create job', error);
    return apiServerError('案件配信に失敗しました');
  }
}

/** ステータス更新 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { index, status } = body;

    if (!index || typeof index !== 'number') {
      return apiBadRequest('index is required');
    }

    const rows = await readSheet(SHEET_NAMES.jobs, 'A:I');
    const existing = rows[index - 1];
    if (!existing) {
      return apiBadRequest('指定された案件が見つかりません');
    }

    await updateRow(SHEET_NAMES.jobs, index, [
      existing[0], existing[1], existing[2], existing[3],
      existing[4], existing[5], existing[6], existing[7],
      status ?? existing[8],
    ]);

    log.info('Job status updated', { index, status });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update job', error);
    return apiServerError('案件の更新に失敗しました');
  }
}
