import { generateEncouragement } from '@/src/services/claude';

export async function POST(request: Request) {
  try {
    const { driverName, context } = await request.json();

    if (!driverName) {
      return Response.json({ error: 'driverName is required' }, { status: 400 });
    }

    const message = await generateEncouragement(driverName, context || '');
    return Response.json({ message });
  } catch (error) {
    console.error('Generate message error:', error);
    // フォールバック: APIエラー時もメッセージを返す
    const name = (await request.clone().json().catch(() => ({}))).driverName || '';
    return Response.json({
      message: `${name}さん、いつもお疲れさまです！引き続きよろしくお願いします。`,
    });
  }
}
