import { NextRequest } from 'next/server';
import { readSheet, appendRow, updateRow } from '@/src/services/sheets';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:dispatch');

// 配車シート: A=date, B=driverName, C=area, D=estimatedCount, E=status, F=notes, G=createdAt

export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.dispatch, 'A:G');
    const dispatches = rows.slice(1).map((row, i) => ({
      index: i + 2,
      date: row[0] || '',
      driverName: row[1] || '',
      area: row[2] || '',
      estimatedCount: parseInt(row[3], 10) || 0,
      status: row[4] || '予定',
      notes: row[5] || '',
      createdAt: row[6] || '',
    }));
    return apiOk({ dispatches });
  } catch (error) {
    log.error('Failed to fetch dispatches', error);
    return apiServerError('配車データの取得に失敗しました');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, driverName, area, estimatedCount, notes } = body;

    if (!date || !driverName) {
      return apiBadRequest('date and driverName are required');
    }

    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    await appendRow(SHEET_NAMES.dispatch, [
      date,
      driverName,
      area || '',
      estimatedCount || 0,
      '予定',
      notes || '',
      now,
    ]);

    log.info('Dispatch created', { date, driverName, area });
    return apiOk({ success: true }, 201);
  } catch (error) {
    log.error('Failed to create dispatch', error);
    return apiServerError('配車の作成に失敗しました');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { index, ...updates } = body;

    if (!index || typeof index !== 'number') {
      return apiBadRequest('index is required');
    }

    const rows = await readSheet(SHEET_NAMES.dispatch, 'A:G');
    const existing = rows[index - 1];
    if (!existing) {
      return apiBadRequest('指定された配車が見つかりません');
    }

    await updateRow(SHEET_NAMES.dispatch, index, [
      updates.date ?? existing[0],
      updates.driverName ?? existing[1],
      updates.area ?? existing[2],
      updates.estimatedCount ?? existing[3],
      updates.status ?? existing[4],
      updates.notes ?? existing[5],
      existing[6],
    ]);

    log.info('Dispatch updated', { index });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update dispatch', error);
    return apiServerError('配車の更新に失敗しました');
  }
}
