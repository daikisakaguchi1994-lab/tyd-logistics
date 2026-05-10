import { NextRequest } from 'next/server';
import { readSheet } from '@/src/services/sheets';
import { pushMessage } from '@/src/services/line';
import { apiOk, apiUnauthorized, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('cron:daily-reminder');

/**
 * 日報未提出リマインダー
 * 毎日21:00 JST にVercel Cronで呼ばれる
 * 当日の日報を提出していないドライバーにLINE pushで通知
 */
export async function GET(req: NextRequest) {
  // Vercel Cron認証（CRON_SECRETヘッダーで検証）
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    log.warn('Unauthorized cron access attempt');
    return apiUnauthorized('Invalid cron secret');
  }

  try {
    // プレイヤーデータからアクティブなドライバーを取得
    const players = await readSheet(SHEET_NAMES.players, 'A:E');
    const activeDrivers = players.slice(1).filter(row => row[2] !== 'inactive');

    if (activeDrivers.length === 0) {
      log.info('No active drivers found');
      return apiOk({ message: 'No active drivers', notified: 0 });
    }

    // 今日の日報を取得
    const reports = await readSheet(SHEET_NAMES.dailyReport, 'A:D');
    const now = new Date();
    const todayJST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
    const todayStr = `${todayJST.getFullYear()}/${todayJST.getMonth() + 1}/${todayJST.getDate()}`;

    // 今日報告済みのuserIdを集める
    const reportedUserIds = new Set<string>();
    for (const row of reports.slice(1)) {
      if (row[0]) {
        const d = new Date(row[0]);
        const rowDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
        if (rowDate === todayStr && row[2]) {
          reportedUserIds.add(row[2]);
        }
      }
    }

    // 未提出のドライバーに通知
    let notified = 0;
    for (const driver of activeDrivers) {
      const userId = driver[1]; // B列 = userId
      const name = driver[0];  // A列 = 名前

      if (!userId || reportedUserIds.has(userId)) continue;

      try {
        await pushMessage(
          userId,
          [
            `${name}さん、お疲れさまです！`,
            '',
            '本日の日報がまだ届いていません。',
            '配送が完了していれば、件数を送信してください。',
            '',
            '例：「今日120件配送しました」',
          ].join('\n')
        );
        notified++;
        log.info('Reminder sent', { userId, name });
      } catch (err) {
        log.warn('Failed to send reminder', { userId, name, error: err instanceof Error ? err.message : 'unknown' });
      }
    }

    log.info('Daily reminder completed', { total: activeDrivers.length, reported: reportedUserIds.size, notified });
    return apiOk({ message: 'Reminders sent', notified, total: activeDrivers.length });
  } catch (error) {
    log.error('Daily reminder cron failed', error);
    return apiServerError('リマインダーの実行に失敗しました');
  }
}
