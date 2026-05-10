import { NextRequest } from 'next/server';
import { readSheet, appendRow, updateRow } from '@/src/services/sheets';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:outsource');

// 外注シート: A=company, B=contactPerson, C=phone, D=area, E=rate, F=status, G=notes

export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.outsource, 'A:G');
    const outsources = rows.slice(1).map((row, i) => ({
      index: i + 2,
      company: row[0] || '',
      contactPerson: row[1] || '',
      phone: row[2] || '',
      area: row[3] || '',
      rate: parseInt(row[4], 10) || 0,
      status: row[5] || '取引中',
      notes: row[6] || '',
    }));
    return apiOk({ outsources });
  } catch (error) {
    log.error('Failed to fetch outsources', error);
    return apiServerError('外注データの取得に失敗しました');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, contactPerson, phone, area, rate, notes } = body;

    if (!company || typeof company !== 'string') {
      return apiBadRequest('company is required');
    }

    await appendRow(SHEET_NAMES.outsource, [
      company,
      contactPerson || '',
      phone || '',
      area || '',
      rate || 0,
      '取引中',
      notes || '',
    ]);

    log.info('Outsource added', { company });
    return apiOk({ success: true }, 201);
  } catch (error) {
    log.error('Failed to add outsource', error);
    return apiServerError('外注の追加に失敗しました');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { index, ...updates } = body;

    if (!index || typeof index !== 'number') {
      return apiBadRequest('index is required');
    }

    const rows = await readSheet(SHEET_NAMES.outsource, 'A:G');
    const existing = rows[index - 1];
    if (!existing) {
      return apiBadRequest('指定された外注先が見つかりません');
    }

    await updateRow(SHEET_NAMES.outsource, index, [
      updates.company ?? existing[0],
      updates.contactPerson ?? existing[1],
      updates.phone ?? existing[2],
      updates.area ?? existing[3],
      updates.rate ?? existing[4],
      updates.status ?? existing[5],
      updates.notes ?? existing[6],
    ]);

    log.info('Outsource updated', { index });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update outsource', error);
    return apiServerError('外注の更新に失敗しました');
  }
}
