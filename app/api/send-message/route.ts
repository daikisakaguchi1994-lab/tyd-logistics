import { NextRequest } from 'next/server';
import { pushMessage } from '@/src/services/line';
import { rateLimit, getClientIP } from '@/lib/apiAuth';
import { apiOk, apiBadRequest, apiServerError } from '@/lib/apiResponse';
import { createLogger } from '@/lib/logger';

const log = createLogger('api:send-message');

export async function POST(request: NextRequest) {
  // レート制限: 1分に10回まで（LINE Push APIのコスト保護）
  const limited = rateLimit(`send-msg:${getClientIP(request)}`, 10, 60_000);
  if (limited) return limited;

  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return apiBadRequest('userId and message are required');
    }

    if (typeof message !== 'string' || message.length > 2000) {
      return apiBadRequest('message must be a string under 2000 chars');
    }

    await pushMessage(userId, message);
    return apiOk({ success: true });
  } catch (error) {
    log.error('Send message failed', error);
    return apiServerError('メッセージの送信に失敗しました');
  }
}
