import { NextRequest } from 'next/server';
import { readSheet, appendRow, updateRow } from '@/src/services/sheets';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:incidents');

// 事故・トラブルシート: A=datetime, B=driverName, C=type, D=severity, E=description, F=status, G=resolution, H=reportedBy

export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.incidents, 'A:H');
    const incidents = rows.slice(1).map((row, i) => ({
      index: i + 2,
      datetime: row[0] || '',
      driverName: row[1] || '',
      type: row[2] || '',
      severity: row[3] || '軽微',
      description: row[4] || '',
      status: row[5] || '未対応',
      resolution: row[6] || '',
      reportedBy: row[7] || '',
    }));
    return apiOk({ incidents });
  } catch (error) {
    log.error('Failed to fetch incidents', error);
    return apiServerError('事故・トラブルデータの取得に失敗しました');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverName, type, severity, description } = body;

    if (!driverName || !type) {
      return apiBadRequest('driverName and type are required');
    }

    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    await appendRow(SHEET_NAMES.incidents, [
      now,
      driverName,
      type,
      severity || '軽微',
      description || '',
      '未対応',
      '',
      'dashboard',
    ]);

    log.info('Incident reported', { driverName, type, severity });
    return apiOk({ success: true }, 201);
  } catch (error) {
    log.error('Failed to report incident', error);
    return apiServerError('事故報告に失敗しました');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { index, ...updates } = body;

    if (!index || typeof index !== 'number') {
      return apiBadRequest('index is required');
    }

    const rows = await readSheet(SHEET_NAMES.incidents, 'A:H');
    const existing = rows[index - 1];
    if (!existing) {
      return apiBadRequest('指定された記録が見つかりません');
    }

    await updateRow(SHEET_NAMES.incidents, index, [
      existing[0],
      updates.driverName ?? existing[1],
      updates.type ?? existing[2],
      updates.severity ?? existing[3],
      updates.description ?? existing[4],
      updates.status ?? existing[5],
      updates.resolution ?? existing[6],
      existing[7],
    ]);

    log.info('Incident updated', { index });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update incident', error);
    return apiServerError('更新に失敗しました');
  }
}
