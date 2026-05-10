import { messagingApi } from '@line/bot-sdk';
import { validateEnv, env } from '@/lib/env';

validateEnv();

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: env('LINE_CHANNEL_ACCESS_TOKEN'),
});

export async function replyText(replyToken: string, text: string) {
  await client.replyMessage({
    replyToken,
    messages: [{ type: 'text', text }],
  });
}

export async function pushMessage(userId: string, text: string) {
  await client.pushMessage({
    to: userId,
    messages: [{ type: 'text', text }],
  });
}

export async function getDisplayName(userId: string): Promise<string> {
  try {
    const profile = await client.getProfile(userId);
    return profile.displayName;
  } catch {
    return 'Unknown';
  }
}
