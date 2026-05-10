import { NextRequest } from 'next/server';
import { readSheet, appendRow, updateRow } from '@/src/services/sheets';
import { apiOk, apiBadRequest, apiNotFound, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:drivers');

// プレイヤーデータシート: A=名前, B=userId, C=status, D=registeredDate, E=memo

/** ドライバー一覧取得 */
export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.players, 'A:E');
    const drivers = rows.slice(1).map((row, i) => ({
      index: i + 2, // シートの行番号（ヘッダー=1行目）
      name: row[0] || '',
      userId: row[1] || '',
      status: row[2] || 'active',
      registeredDate: row[3] || '',
      memo: row[4] || '',
    }));
    return apiOk({ drivers });
  } catch (error) {
    log.error('Failed to fetch drivers', error);
    return apiServerError('ドライバー一覧の取得に失敗しました');
  }
}

/** ドライバー追加 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, userId, memo } = body;

    if (!name || typeof name !== 'string') {
      return apiBadRequest('name is required');
    }

    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    await appendRow(SHEET_NAMES.players, [
      name,
      userId || '',
      'active',
      now,
      memo || '',
    ]);

    log.info('Driver added', { name });
    return apiOk({ success: true, name }, 201);
  } catch (error) {
    log.error('Failed to add driver', error);
    return apiServerError('ドライバーの追加に失敗しました');
  }
}

/** ドライバー更新 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { index, name, userId, status, memo } = body;

    if (!index || typeof index !== 'number') {
      return apiBadRequest('index (row number) is required');
    }

    // 既存データを確認
    const rows = await readSheet(SHEET_NAMES.players, 'A:E');
    const existingRow = rows[index - 1];
    if (!existingRow) {
      return apiNotFound('ドライバーが見つかりませんでした');
    }

    await updateRow(SHEET_NAMES.players, index, [
      name ?? existingRow[0],
      userId ?? existingRow[1],
      status ?? existingRow[2],
      existingRow[3], // registeredDate は変更しない
      memo ?? existingRow[4],
    ]);

    log.info('Driver updated', { index, name: name ?? existingRow[0] });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update driver', error);
    return apiServerError('ドライバーの更新に失敗しました');
  }
}
