import { NextRequest } from 'next/server';
import { readSheet, updateRow } from '@/src/services/sheets';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:recruitment');

// 採用応募シート: A=datetime, B=displayName, C=userId, D=message, E=status, F=source

export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.recruitment, 'A:F');
    const leads = rows.slice(1).map((row, i) => ({
      index: i + 2,
      datetime: row[0] || '',
      displayName: row[1] || '',
      userId: row[2] || '',
      message: row[3] || '',
      status: row[4] || '新規',
      source: row[5] || 'LINE',
    }));
    return apiOk({ leads });
  } catch (error) {
    log.error('Failed to fetch recruitment leads', error);
    return apiServerError('採用応募データの取得に失敗しました');
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
    if (!status || typeof status !== 'string') {
      return apiBadRequest('status is required');
    }

    const validStatuses = ['新規', '連絡済み', '面談予定', '採用', '不採用', '辞退'];
    if (!validStatuses.includes(status)) {
      return apiBadRequest(`status must be one of: ${validStatuses.join(', ')}`);
    }

    const rows = await readSheet(SHEET_NAMES.recruitment, 'A:F');
    const existingRow = rows[index - 1];
    if (!existingRow) {
      return apiBadRequest('指定された行が見つかりません');
    }

    await updateRow(SHEET_NAMES.recruitment, index, [
      existingRow[0],
      existingRow[1],
      existingRow[2],
      existingRow[3],
      status,
      existingRow[5],
    ]);

    log.info('Recruitment status updated', { index, status });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update recruitment status', error);
    return apiServerError('ステータスの更新に失敗しました');
  }
}
