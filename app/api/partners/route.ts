import { NextRequest } from 'next/server';
import { readSheet, appendRow, updateRow } from '@/src/services/sheets';
import { apiOk, apiBadRequest, apiNotFound, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';
import { SHEET_NAMES } from '@/src/config';

const log = createLogger('api:partners');

// 取引先シート: A=name, B=contactPerson, C=phone, D=email, E=address, F=billingRate, G=paymentTerms, H=notes

export async function GET() {
  try {
    const rows = await readSheet(SHEET_NAMES.partners, 'A:H');
    const partners = rows.slice(1).map((row, i) => ({
      index: i + 2,
      name: row[0] || '',
      contactPerson: row[1] || '',
      phone: row[2] || '',
      email: row[3] || '',
      address: row[4] || '',
      billingRate: parseInt(row[5], 10) || 0,
      paymentTerms: row[6] || '',
      notes: row[7] || '',
    }));
    return apiOk({ partners });
  } catch (error) {
    log.error('Failed to fetch partners', error);
    return apiServerError('取引先の取得に失敗しました');
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, contactPerson, phone, email, address, billingRate, paymentTerms, notes } = body;

    if (!name || typeof name !== 'string') {
      return apiBadRequest('name is required');
    }

    await appendRow(SHEET_NAMES.partners, [
      name,
      contactPerson || '',
      phone || '',
      email || '',
      address || '',
      billingRate || 0,
      paymentTerms || '',
      notes || '',
    ]);

    log.info('Partner added', { name });
    return apiOk({ success: true, name }, 201);
  } catch (error) {
    log.error('Failed to add partner', error);
    return apiServerError('取引先の追加に失敗しました');
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { index, ...updates } = body;

    if (!index || typeof index !== 'number') {
      return apiBadRequest('index is required');
    }

    const rows = await readSheet(SHEET_NAMES.partners, 'A:H');
    const existing = rows[index - 1];
    if (!existing) {
      return apiNotFound('取引先が見つかりません');
    }

    await updateRow(SHEET_NAMES.partners, index, [
      updates.name ?? existing[0],
      updates.contactPerson ?? existing[1],
      updates.phone ?? existing[2],
      updates.email ?? existing[3],
      updates.address ?? existing[4],
      updates.billingRate ?? existing[5],
      updates.paymentTerms ?? existing[6],
      updates.notes ?? existing[7],
    ]);

    log.info('Partner updated', { index });
    return apiOk({ success: true });
  } catch (error) {
    log.error('Failed to update partner', error);
    return apiServerError('取引先の更新に失敗しました');
  }
}
