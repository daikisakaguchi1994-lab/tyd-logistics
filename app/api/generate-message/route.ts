import { NextRequest } from 'next/server';
import { generateEncouragement } from '@/src/services/claude';
import { rateLimit, getClientIP } from '@/lib/apiAuth';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';

const log = createLogger('api:generate-message');

export async function POST(request: NextRequest) {
  // レート制限: 1分に5回まで（Claude APIコスト保護）
  const limited = rateLimit(`gen-msg:${getClientIP(request)}`, 5, 60_000);
  if (limited) return limited;

  try {
    const { driverName, context } = await request.json();

    if (!driverName || typeof driverName !== 'string') {
      return apiBadRequest('driverName is required');
    }

    const message = await generateEncouragement(driverName, context || '');
    return apiOk({ message });
  } catch (error) {
    log.error('Generate message failed', error);
    return apiServerError('メッセージの生成に失敗しました。しばらく待ってからお試しください。');
  }
}
