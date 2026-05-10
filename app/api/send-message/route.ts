import { pushMessage } from '@/src/services/line';

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return Response.json({ error: 'userId and message are required' }, { status: 400 });
    }

    await pushMessage(userId, message);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Send message error:', error);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
